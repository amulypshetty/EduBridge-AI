import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  PlayCircle,
  Plus,
  Search,
  UserCheck,
} from 'lucide-react';
import { resourcesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  detectResourceType,
  getSafeResourceHref,
  getYouTubeThumbnailUrl,
  isExamplePlaceholderUrl,
  isValidResourceUrl,
} from '../../utils/resourceMedia';
import { EmptyState, Modal, PageHeader, SkeletonCard } from '../../components/common/UI';
import {
  ResourceTypeBadge,
  ResourceViewerModal,
} from '../../components/resources/ResourceMediaModals';

const CORE_SUBJECTS = [
  'DBMS',
  'Data Structures',
  'Operating Systems',
  'Computer Networks',
  'Mathematics',
  'Electronics',
];

const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Video Lectures' },
  { id: 'pdf', label: 'PDF Notes' },
];

export default function ResourcesHub() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isFaculty = user?.role === 'faculty';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Viewer Modal state (Embedded YouTube or Built-in PDF viewer)
  const [activeViewerResource, setActiveViewerResource] = useState(null);

  // Add Resource Modal (Faculty)
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await resourcesAPI.getAll();
      setResources(data?.resources || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to fetch learning resources'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const typeCounts = useMemo(() => {
    const counts = { all: resources.length, video: 0, pdf: 0 };
    resources.forEach((res) => {
      const t = detectResourceType(res.resource_url);
      if (t === 'video') counts.video += 1;
      if (t === 'pdf') counts.pdf += 1;
    });
    return counts;
  }, [resources]);

  const subjects = useMemo(() => {
    const fromData = resources.map((r) => r.subject?.trim()).filter(Boolean);
    const merged = Array.from(new Set([...CORE_SUBJECTS, ...fromData]));
    return ['All', ...merged];
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const resType = detectResourceType(res.resource_url);
      const matchesType = selectedType === 'all' || resType === selectedType;
      const matchesSubject =
        selectedSubject === 'All' ||
        res.subject?.toLowerCase() === selectedSubject.toLowerCase();
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        res.title?.toLowerCase().includes(q) ||
        res.subject?.toLowerCase().includes(q) ||
        res.description?.toLowerCase().includes(q) ||
        res.faculty_name?.toLowerCase().includes(q);
      return matchesType && matchesSubject && matchesSearch;
    });
  }, [resources, selectedType, selectedSubject, searchTerm]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleUrlInputChange = (val) => {
    setResourceUrl(val);
    if (isExamplePlaceholderUrl(val)) {
      setUrlError(
        'Placeholder example.com URLs are not allowed. Paste a real YouTube lecture, website, or /pdfs/ file path.'
      );
    } else {
      setUrlError('');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    const trimmedUrl = resourceUrl.trim();
    if (!title.trim() || !subject.trim() || !trimmedUrl) {
      toast.error('Title, subject, and resource URL are required.');
      return;
    }
    if (isExamplePlaceholderUrl(trimmedUrl)) {
      const msg =
        'Placeholder example.com URLs are not allowed. Please enter a real YouTube link, PDF path, or educational website.';
      setUrlError(msg);
      toast.error(msg);
      return;
    }
    if (!isValidResourceUrl(trimmedUrl)) {
      const msg = 'Enter a valid http(s):// URL or a local PDF path like /pdfs/DBMS-Notes.pdf.';
      setUrlError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await resourcesAPI.create({
        title: title.trim(),
        subject: subject.trim(),
        resource_url: trimmedUrl,
        description: description.trim(),
      });
      toast.success(data?.message || 'Resource published successfully!');
      setModalOpen(false);
      setTitle('');
      setSubject('');
      setResourceUrl('');
      setDescription('');
      setUrlError('');
      await fetchResources();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create resource'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Learning Resources Hub"
        subtitle={
          isFaculty
            ? 'Share cross-department teaching videos, lecture PDFs, and study references.'
            : 'Watch faculty teaching lectures and read subject PDF notes across departments.'
        }
        action={
          isFaculty && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          )
        }
      />

      {/* Filter Controls: Type Tabs + Search + Subject Pills */}
      <div className="bg-white rounded-2xl border border-[#EBE9FE] p-4 sm:p-5 shadow-card mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Resource Type Filter Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-[#F6F5FF] border border-[#EBE9FE] gap-1 self-start">
            {TYPE_TABS.map((tab) => {
              const active = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-brand-gradient text-white shadow-sm'
                      : 'text-[#13112B]/70 hover:text-[#13112B]'
                  }`}
                >
                  {tab.id === 'video' && <PlayCircle className="w-3.5 h-3.5" />}
                  {tab.id === 'pdf' && <FileText className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-white text-[#635BFF]'
                    }`}
                  >
                    {typeCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4.5 h-4.5 text-[#13112B]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, subject, or faculty..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/40 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
            />
          </div>
        </div>

        {/* Department / Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EBE9FE]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#13112B]/45 mr-1">
            Department / Subject:
          </span>
          {subjects.map((sub) => {
            const active = selectedSubject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#13112B] text-white shadow-xs'
                    : 'bg-[#F6F5FF] text-[#13112B]/70 border border-[#EBE9FE] hover:border-[#635BFF]/40 hover:text-[#635BFF]'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} lines={3} />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={resources.length === 0 ? 'No learning resources yet' : 'No matching resources'}
          description={
            resources.length === 0
              ? isFaculty
                ? 'Start building your library by adding a YouTube teaching video or PDF notes.'
                : 'Faculty haven’t published any learning resources yet. Check back soon!'
              : 'Try switching resource type tabs, clearing your search, or selecting another subject.'
          }
          action={
            isFaculty && resources.length === 0 ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Resource
              </button>
            ) : (
              resources.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleSearchChange('');
                    setSelectedSubject('All');
                    setSelectedType('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F6F5FF] text-[#635BFF] text-xs font-semibold border border-[#EBE9FE] cursor-pointer"
                >
                  Reset All Filters
                </button>
              )
            )
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const type = detectResourceType(res.resource_url);
            const thumb = type === 'video' ? getYouTubeThumbnailUrl(res.resource_url) : null;
            const safeHref = getSafeResourceHref(res.resource_url);

            return (
              <article
                key={res.resource_id}
                className="bg-white rounded-2xl border border-[#EBE9FE] overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                {/* Optional Video Thumbnail Banner */}
                {thumb && (
                  <button
                    type="button"
                    onClick={() => setActiveViewerResource(res)}
                    className="relative h-40 w-full bg-[#13112B] overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={thumb}
                      alt={res.title}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-[#13112B]/30 group-hover:bg-[#13112B]/15 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-[#635BFF] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-7 h-7" />
                      </div>
                    </div>
                  </button>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F6F5FF] text-[#13112B] border border-[#EBE9FE]">
                        {res.subject}
                      </span>
                      <ResourceTypeBadge url={res.resource_url} />
                    </div>
                    {res.created_at && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#13112B]/45">
                        <Calendar className="w-3 h-3" />
                        {new Date(res.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#13112B] mb-2 line-clamp-2">
                    {res.title}
                  </h3>

                  <p className="text-sm text-[#13112B]/65 leading-relaxed mb-5 flex-1 line-clamp-3">
                    {res.description || 'Curated academic material shared by faculty.'}
                  </p>

                  <div className="pt-4 border-t border-[#EBE9FE] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#F6F5FF] border border-[#EBE9FE] flex items-center justify-center text-[#635BFF] shrink-0">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-[#13112B]/70 truncate">
                        {res.faculty_name || 'Faculty'}
                      </span>
                    </div>

                    {type === 'video' ? (
                      <button
                        type="button"
                        onClick={() => setActiveViewerResource(res)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-semibold shadow-sm shadow-[#635BFF]/20 hover:shadow-md transition-all shrink-0 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Watch Lecture
                      </button>
                    ) : type === 'pdf' ? (
                      <button
                        type="button"
                        onClick={() => setActiveViewerResource(res)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#13112B] hover:bg-[#261E63] text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Read / Download PDF
                      </button>
                    ) : (
                      <a
                        href={safeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-semibold shadow-sm shadow-[#635BFF]/20 hover:shadow-md transition-all shrink-0"
                      >
                        Open Resource
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Embedded YouTube / Built-in PDF Viewer Modal */}
      <ResourceViewerModal
        resource={activeViewerResource}
        onClose={() => setActiveViewerResource(null)}
      />

      {/* Faculty Add Resource Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Learning Resource"
        subtitle="Share a YouTube teaching lecture, PDF notes link, or verified educational reference."
      >
        <form onSubmit={handleCreateResource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Operating Systems — Deadlock Handling Lecture"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
              Department / Subject *
            </label>
            <input
              type="text"
              required
              list="edubridge-subjects"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., DBMS, Data Structures, Operating Systems"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF]"
            />
            <datalist id="edubridge-subjects">
              {CORE_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70">
                Video / PDF / Resource URL *
              </label>
              {resourceUrl.trim() && !urlError && <ResourceTypeBadge url={resourceUrl} />}
            </div>
            <div className="relative">
              <Link2 className="w-4 h-4 text-[#13112B]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={resourceUrl}
                onChange={(e) => handleUrlInputChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or /pdfs/notes.pdf"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F7FF] border text-sm text-[#13112B] focus:outline-none focus:ring-2 ${
                  urlError
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-[#EBE9FE] focus:ring-[#635BFF]/25 focus:border-[#635BFF]'
                }`}
              />
            </div>
            {urlError ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{urlError}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-[#13112B]/55">
                YouTube links automatically render as playable Video Lectures; <code>.pdf</code>{' '}
                links render as PDF Notes.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what students will learn from this lecture or notes..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#13112B]/70 hover:bg-[#F6F5FF] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Boolean(urlError)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/25 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Resource'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
