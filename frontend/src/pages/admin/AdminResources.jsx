import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  FileText,
  Search,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { adminAPI, resourcesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { PageHeader, SkeletonCard } from '../../components/common/UI';
import { detectResourceType, getSafeResourceHref } from '../../utils/resourceMedia';

const SUBJECTS = ['All', 'DBMS', 'Data Structures', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Electronics'];

function TypeBadge({ url }) {
  const type = detectResourceType(url);
  if (type === 'video') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
        <Video className="w-3 h-3" />
        Video
      </span>
    );
  }
  if (type === 'pdf') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2FF] text-[#635BFF]">
        <FileText className="w-3 h-3" />
        PDF
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3F4F6] text-[#6B7280]">
      <ExternalLink className="w-3 h-3" />
      Link
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterType, setFilterType] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const { data } = await resourcesAPI.getAll();
        if (active) setResources(data?.resources || []);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load resources'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.resource_id);
    try {
      await adminAPI.deleteResource(confirmDelete.resource_id);
      setResources((prev) => prev.filter((r) => r.resource_id !== confirmDelete.resource_id));
      toast.success(`Resource "${confirmDelete.title}" removed.`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete resource'));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const filtered = resources.filter((r) => {
    const matchSubject = filterSubject === 'All' || r.subject === filterSubject;
    const type = detectResourceType(r.resource_url);
    const matchType =
      filterType === 'all' ||
      (filterType === 'video' && type === 'video') ||
      (filterType === 'pdf' && type === 'pdf') ||
      (filterType === 'link' && type === 'link');
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.title?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q) ||
      r.faculty_name?.toLowerCase().includes(q);
    return matchSubject && matchType && matchSearch;
  });

  const typeCounts = {
    video: resources.filter((r) => detectResourceType(r.resource_url) === 'video').length,
    pdf: resources.filter((r) => detectResourceType(r.resource_url) === 'pdf').length,
    link: resources.filter((r) => detectResourceType(r.resource_url) === 'link').length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Moderation"
        subtitle="Review, inspect, and remove platform resources. All changes are permanent."
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: resources.length, color: 'text-[#635BFF]' },
          { label: 'Video Lectures', value: typeCounts.video, color: 'text-[#D97706]' },
          { label: 'PDF Notes', value: typeCounts.pdf, color: 'text-[#7C3AED]' },
          { label: 'Other Links', value: typeCounts.link, color: 'text-[#059669]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card">
            <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs text-[#13112B]/55 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE9FE] shadow-card">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-[#EBE9FE]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#13112B]/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, faculty…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F8F7FF] border border-[#EBE9FE] rounded-xl text-[#13112B] placeholder:text-[#13112B]/35 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'video', 'pdf', 'link'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterType === t
                    ? 'bg-brand-gradient text-white border-transparent'
                    : 'bg-[#F8F7FF] text-[#13112B]/60 border-[#EBE9FE] hover:border-[#635BFF]/40'
                }`}
              >
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Subject filter scroll */}
        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-[#EBE9FE] scrollbar-none">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterSubject(s)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                filterSubject === s
                  ? 'border-[#635BFF] bg-[#EEF2FF] text-[#635BFF]'
                  : 'border-[#EBE9FE] text-[#13112B]/55 hover:border-[#635BFF]/40 bg-[#F8F7FF]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <SkeletonCard lines={5} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-10 h-10 text-[#13112B]/20 mb-3" />
              <p className="text-sm font-semibold text-[#13112B]/50">
                No resources match your filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-[#13112B]/40 bg-[#F8F7FF] border-b border-[#EBE9FE]">
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Subject</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">Faculty</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE9FE]">
                {filtered.map((r) => (
                  <tr key={r.resource_id} className="hover:bg-[#F8F7FF] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#13112B] max-w-[220px] truncate">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-[#13112B]/50 mt-0.5 max-w-[220px] truncate">
                          {r.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#13112B]/60 hidden sm:table-cell">
                      {r.subject || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <TypeBadge url={r.resource_url} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#13112B]/60 hidden lg:table-cell">
                      {r.faculty_name || 'Faculty'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#13112B]/55 hidden md:table-cell">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={getSafeResourceHref(r.resource_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#635BFF] bg-[#EEF2FF] border border-[#C7D2FE] hover:bg-[#EEF2FF]/80 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(r)}
                          disabled={deletingId === r.resource_id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#EBE9FE] text-xs text-[#13112B]/40">
            Showing {filtered.length} of {resources.length} resources
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13112B]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#EBE9FE] shadow-card-hover w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="p-2 rounded-xl text-[#13112B]/40 hover:text-[#13112B] hover:bg-[#F6F5FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#13112B]">Remove Resource</h3>
              <p className="text-sm text-[#13112B]/60 mt-1">
                Permanently remove{' '}
                <span className="font-semibold text-[#13112B]">"{confirmDelete.title}"</span>?
                Students and faculty will lose access to this resource immediately.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#EBE9FE] text-sm font-semibold text-[#13112B]/70 hover:bg-[#F6F5FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId === confirmDelete.resource_id}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-bold hover:bg-[#B91C1C] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDelete.resource_id ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
