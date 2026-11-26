import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ExternalLink,
  FileText,
  MessageCircleQuestion,
  PlayCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { quizzesAPI, resourcesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getStudentDoubts } from '../../utils/storage';
import { detectResourceType, getSafeResourceHref } from '../../utils/resourceMedia';
import { EmptyState, SkeletonCard } from '../../components/common/UI';
import {
  ResourceTypeBadge,
  ResourceViewerModal,
} from '../../components/resources/ResourceMediaModals';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerResource, setViewerResource] = useState(null);

  const studentDoubts = getStudentDoubts(user?.user_id);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      try {
        const [resResp, quizResp] = await Promise.all([
          resourcesAPI.getAll(),
          quizzesAPI.getAll(),
        ]);

        if (!active) return;
        const fetchedResources = resResp.data?.resources || [];
        const fetchedQuizzes = quizResp.data?.quizzes || [];
        setResources(fetchedResources);
        setQuizzes(fetchedQuizzes);

        if (fetchedQuizzes.length > 0) {
          const resultCalls = await Promise.allSettled(
            fetchedQuizzes.slice(0, 10).map((q) => quizzesAPI.getResults(q.quiz_id))
          );
          if (!active) return;
          const allAttempts = [];
          resultCalls.forEach((r) => {
            if (r.status === 'fulfilled') {
              const items = r.value.data?.results || [];
              allAttempts.push(...items);
            }
          });
          if (allAttempts.length > 0) {
            const pctSum = allAttempts.reduce((acc, item) => {
              const total = item.total_questions || 1;
              return acc + (item.score / total) * 100;
            }, 0);
            setAvgScore(Math.round(pctSum / allAttempts.length));
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load dashboard data'));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#13112B] via-[#31247A] to-[#635BFF] p-7 sm:p-9 text-white shadow-card-hover relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-[#E0DCFF] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Student Learning Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {firstName}! 👋 Keep exploring and learning!
            </h1>
            <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
              Review curated faculty guides, watch lecture videos, ask questions anonymously, and
              sharpen your recall with quick quizzes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/student/doubts"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#13112B] text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all"
            >
              <MessageCircleQuestion className="w-4 h-4 text-[#635BFF]" />
              Ask a Doubt
            </Link>
            <Link
              to="/student/quizzes"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all"
            >
              <ClipboardCheck className="w-4 h-4" />
              Take a Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* 3 KPI Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Available Resources
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#635BFF] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#13112B]">
            {loading ? '—' : resources.length}
          </p>
          <Link
            to="/student/resources"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] mt-3 hover:underline"
          >
            Browse videos & PDFs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Doubts Posted
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#13112B]">{studentDoubts.length}</p>
          <Link
            to="/student/doubts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] mt-3 hover:underline"
          >
            Open Doubt Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Quizzes & Avg Score
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-extrabold text-[#13112B]">
              {loading ? '—' : quizzes.length}
            </p>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F6F5FF] text-[#635BFF] border border-[#EBE9FE]">
              {avgScore !== null ? `Avg ${avgScore}%` : 'No attempts yet'}
            </span>
          </div>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] mt-3 hover:underline"
          >
            Go to Quiz Lobby <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Learning Resources Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#13112B]">Recent Learning Resources</h2>
            <p className="text-xs text-[#13112B]/60 mt-0.5">
              Latest PDF notes and teaching videos added by faculty
            </p>
          </div>
          <Link
            to="/student/resources"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#635BFF] hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <SkeletonCard key={n} lines={2} />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No learning resources available yet"
            description="Once faculty publish study guides or lecture videos, they will appear right here."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.slice(0, 3).map((res) => {
              const type = detectResourceType(res.resource_url);
              const safeHref = getSafeResourceHref(res.resource_url);
              return (
                <div
                  key={res.resource_id}
                  className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col"
                >
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F6F5FF] text-[#13112B] border border-[#EBE9FE]">
                      {res.subject}
                    </span>
                    <ResourceTypeBadge url={res.resource_url} />
                  </div>
                  <h3 className="text-base font-bold text-[#13112B] mb-2 line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-xs text-[#13112B]/65 mb-4 flex-1 line-clamp-2">
                    {res.description || 'Curated academic guide'}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#EBE9FE]">
                    <span className="text-xs font-medium text-[#13112B]/60">
                      By {res.faculty_name || 'Faculty'}
                    </span>
                    {type === 'video' ? (
                      <button
                        type="button"
                        onClick={() => setViewerResource(res)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Watch
                      </button>
                    ) : type === 'pdf' ? (
                      <button
                        type="button"
                        onClick={() => setViewerResource(res)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Open PDF
                      </button>
                    ) : (
                      <a
                        href={safeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ResourceViewerModal resource={viewerResource} onClose={() => setViewerResource(null)} />
    </div>
  );
}
