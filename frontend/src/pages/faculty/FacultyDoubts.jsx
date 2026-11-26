import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  CheckCircle2,
  EyeOff,
  Loader2,
  MessageCircleQuestion,
  Send,
  User,
} from 'lucide-react';
import { doubtsAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { EmptyState, PageHeader, SkeletonCard, StatusBadge } from '../../components/common/UI';

const TABS = ['All', 'Pending', 'Answered'];

export default function FacultyDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Map of doubt_id -> draft answer text
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  // Track answers just submitted in this session for immediate visual feedback
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await doubtsAPI.getAll();
      setDoubts(data?.doubts || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to fetch student doubts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const counts = useMemo(() => {
    const pending = doubts.filter((d) => d.status?.toLowerCase() === 'pending').length;
    const answered = doubts.filter((d) => d.status?.toLowerCase() === 'answered').length;
    return { All: doubts.length, Pending: pending, Answered: answered };
  }, [doubts]);

  const filteredDoubts = useMemo(() => {
    if (activeTab === 'All') return doubts;
    return doubts.filter((d) => d.status?.toLowerCase() === activeTab.toLowerCase());
  }, [doubts, activeTab]);

  const handleSubmitAnswer = async (e, doubtId) => {
    e.preventDefault();
    const answerText = (replyDrafts[doubtId] || '').trim();
    if (!answerText) {
      toast.error('Please write an answer before submitting.');
      return;
    }

    setSubmittingId(doubtId);
    try {
      const { data } = await doubtsAPI.answer(doubtId, answerText);
      toast.success(data?.message || 'Answer submitted successfully!');
      // Immediately update UI state to Answered
      setDoubts((prev) =>
        prev.map((d) => (d.doubt_id === doubtId ? { ...d, status: 'Answered' } : d))
      );
      setSubmittedAnswers((prev) => ({
        ...prev,
        [doubtId]: data?.answer?.answer_text || answerText,
      }));
      setReplyDrafts((prev) => ({ ...prev, [doubtId]: '' }));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit answer'));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Doubt Management"
        subtitle="Review student questions and publish clear explanations. Anonymous student identities remain protected."
      />

      {/* Filter Tabs */}
      <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#EBE9FE] shadow-card gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-[#13112B]/65 hover:text-[#13112B] hover:bg-[#F6F5FF]'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#F6F5FF] text-[#635BFF]'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Doubts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} lines={3} />
          ))}
        </div>
      ) : filteredDoubts.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title={`No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}doubts found`}
          description={
            activeTab === 'Pending'
              ? 'All student doubts have been answered!'
              : 'No student doubts match this filter right now.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const isAnonymous = doubt.is_anonymous || doubt.student_name === 'Anonymous';
            const isSubmitting = submittingId === doubt.doubt_id;
            const recentAnswer = submittedAnswers[doubt.doubt_id];

            return (
              <div
                key={doubt.doubt_id}
                className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-4"
              >
                {/* Header Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-[#635BFF] bg-[#F6F5FF] px-2.5 py-1 rounded-full border border-[#EBE9FE]">
                      #{doubt.doubt_id}
                    </span>
                    {isAnonymous ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#13112B] text-white">
                        <EyeOff className="w-3.5 h-3.5" />
                        Anonymous Student
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                        <User className="w-3.5 h-3.5" />
                        {doubt.student_name}
                      </span>
                    )}
                    <StatusBadge status={doubt.status} />
                  </div>

                  {doubt.created_at && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#13112B]/50">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(doubt.created_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <p className="text-base sm:text-lg font-semibold text-[#13112B] leading-snug">
                  {doubt.question}
                </p>

                {recentAnswer && (
                  <div className="rounded-xl bg-[#D1FAE5]/40 border border-[#A7F3D0] p-4 text-sm text-[#13112B]">
                    <p className="text-xs font-bold text-[#059669] flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Your Published Answer
                    </p>
                    <p className="whitespace-pre-line">{recentAnswer}</p>
                  </div>
                )}

                {/* Inline Reply Box */}
                <form
                  onSubmit={(e) => handleSubmitAnswer(e, doubt.doubt_id)}
                  className="pt-3 border-t border-[#EBE9FE] flex flex-col sm:flex-row gap-3"
                >
                  <textarea
                    rows={2}
                    value={replyDrafts[doubt.doubt_id] || ''}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [doubt.doubt_id]: e.target.value,
                      }))
                    }
                    placeholder={
                      doubt.status === 'Answered'
                        ? 'Add a follow-up explanation...'
                        : 'Write a clear, helpful explanation for the student...'
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/40 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="sm:self-end inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md shadow-[#635BFF]/20 hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer shrink-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </>
                    )}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
