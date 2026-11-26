import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock,
  EyeOff,
  MessageCircleQuestion,
  Plus,
  Sparkles,
} from 'lucide-react';
import { doubtsAPI, resourcesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getFacultyQuizzes } from '../../utils/storage';
import { EmptyState, SkeletonCard, StatusBadge } from '../../components/common/UI';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  const createdQuizzes = getFacultyQuizzes(user?.user_id);

  useEffect(() => {
    let active = true;
    async function loadFacultyOverview() {
      setLoading(true);
      try {
        const [resResp, doubtResp] = await Promise.all([
          resourcesAPI.getAll(),
          doubtsAPI.getAll(),
        ]);
        if (!active) return;
        setResources(resResp.data?.resources || []);
        setDoubts(doubtResp.data?.doubts || []);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load faculty overview'));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadFacultyOverview();
    return () => {
      active = false;
    };
  }, []);

  const pendingDoubts = doubts.filter((d) => d.status?.toLowerCase() === 'pending');
  const firstName = user?.full_name?.split(' ')[0] || 'Faculty';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#13112B] via-[#261E63] to-[#635BFF] p-7 sm:p-9 text-white shadow-card-hover relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-[#E0DCFF] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Faculty Teaching Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
              Curate high-impact study links, mentor students through their doubts, and build
              interactive quizzes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/faculty/doubts"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#13112B] text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all"
            >
              <MessageCircleQuestion className="w-4 h-4 text-[#635BFF]" />
              Review Pending Doubts ({pendingDoubts.length})
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Total Resources
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#635BFF] flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#13112B]">
            {loading ? '—' : resources.length}
          </p>
          <p className="text-xs text-[#13112B]/55 mt-1">Published across all subjects</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Total Doubts
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
              <MessageCircleQuestion className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#13112B]">{loading ? '—' : doubts.length}</p>
          <p className="text-xs text-[#13112B]/55 mt-1">Student questions submitted</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Pending Doubts
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#D97706]">
            {loading ? '—' : pendingDoubts.length}
          </p>
          <p className="text-xs text-[#13112B]/55 mt-1">Awaiting faculty answer</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
              Quizzes Created
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
              <ClipboardCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#13112B]">{createdQuizzes.length}</p>
          <p className="text-xs text-[#13112B]/55 mt-1">Authored in Quiz Studio</p>
        </div>
      </div>

      {/* Recent Pending Doubts + Quick Actions */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Pending Doubts Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#13112B]">Recent Pending Doubts</h2>
              <p className="text-xs text-[#13112B]/60">
                Questions waiting for your guidance
              </p>
            </div>
            <Link
              to="/faculty/doubts"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline"
            >
              Open Doubt Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </div>
          ) : pendingDoubts.length === 0 ? (
            <EmptyState
              icon={MessageCircleQuestion}
              title="All caught up!"
              description="There are no pending student doubts right now. Great job supporting your cohort."
            />
          ) : (
            <div className="space-y-3">
              {pendingDoubts.slice(0, 4).map((doubt) => (
                <div
                  key={doubt.doubt_id}
                  className="bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={doubt.status} />
                      {doubt.is_anonymous ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#13112B]/70 bg-[#F6F5FF] px-2.5 py-0.5 rounded-full border border-[#EBE9FE]">
                          <EyeOff className="w-3 h-3" /> Anonymous Student
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#13112B]/75">
                          {doubt.student_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#13112B] line-clamp-2">
                      {doubt.question}
                    </p>
                  </div>

                  <Link
                    to="/faculty/doubts"
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gradient text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    Answer <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-extrabold text-[#13112B]">Quick Actions</h2>
          <div className="bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card space-y-3">
            <Link
              to="/faculty/resources"
              className="flex items-center justify-between p-4 rounded-xl bg-[#F8F7FF] hover:bg-[#F3E8FF]/60 border border-[#EBE9FE] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#13112B]">Add Resource</p>
                  <p className="text-xs text-[#13112B]/60">Publish external study link</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/faculty/doubts"
              className="flex items-center justify-between p-4 rounded-xl bg-[#F8F7FF] hover:bg-[#FEF3C7]/40 border border-[#EBE9FE] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <MessageCircleQuestion className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#13112B]">Answer Doubts</p>
                  <p className="text-xs text-[#13112B]/60">Resolve pending questions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/faculty/quizzes"
              className="flex items-center justify-between p-4 rounded-xl bg-[#F8F7FF] hover:bg-[#D1FAE5]/40 border border-[#EBE9FE] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#13112B]">Create Quiz</p>
                  <p className="text-xs text-[#13112B]/60">Author MCQ assessments</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
