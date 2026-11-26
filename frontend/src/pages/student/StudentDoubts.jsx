import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  Hash,
  Loader2,
  MessageCircleQuestion,
  Send,
  Shield,
  UserCheck,
} from 'lucide-react';
import { doubtsAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getStudentDoubts, saveStudentDoubts } from '../../utils/storage';
import { EmptyState, PageHeader, StatusBadge } from '../../components/common/UI';

export default function StudentDoubts() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [doubts, setDoubts] = useState(() => getStudentDoubts(user?.user_id));
  const [expandedId, setExpandedId] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [loadingAnswersId, setLoadingAnswersId] = useState(null);

  // Optional lookup by public doubt ID
  const [lookupId, setLookupId] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const syncDoubtAnswers = useCallback(
    async (doubtId, silent = false) => {
      if (!doubtId) return null;
      setLoadingAnswersId(doubtId);
      try {
        const { data } = await doubtsAPI.getAnswers(doubtId);
        const fetchedAnswers = data?.answers || [];
        setAnswersMap((prev) => ({ ...prev, [doubtId]: fetchedAnswers }));
        if (fetchedAnswers.length > 0) {
          setDoubts((prev) => {
            const updated = prev.map((d) =>
              d.doubt_id === doubtId ? { ...d, status: 'Answered' } : d
            );
            saveStudentDoubts(user?.user_id, updated);
            return updated;
          });
        }
        return fetchedAnswers;
      } catch (err) {
        if (!silent) {
          toast.error(getErrorMessage(err, 'Could not load answers for this doubt'));
        }
        return null;
      } finally {
        setLoadingAnswersId(null);
      }
    },
    [user?.user_id]
  );

  // Check live status of student's stored doubts on mount
  useEffect(() => {
    const saved = getStudentDoubts(user?.user_id);
    setDoubts(saved);
    saved.forEach((d) => {
      syncDoubtAnswers(d.doubt_id, true);
    });
  }, [user?.user_id, syncDoubtAnswers]);

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter your question before posting.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await doubtsAPI.create({
        question: question.trim(),
        is_anonymous: isAnonymous,
      });
      const newDoubt = data?.doubt;
      toast.success(data?.message || 'Doubt posted successfully!');
      setQuestion('');
      if (newDoubt) {
        setDoubts((prev) => {
          const updated = [newDoubt, ...prev.filter((d) => d.doubt_id !== newDoubt.doubt_id)];
          saveStudentDoubts(user?.user_id, updated);
          return updated;
        });
        setExpandedId(newDoubt.doubt_id);
        setAnswersMap((prev) => ({ ...prev, [newDoubt.doubt_id]: [] }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to post doubt'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleExpand = async (doubtId) => {
    if (expandedId === doubtId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(doubtId);
    await syncDoubtAnswers(doubtId);
  };

  const handleLookupPublicDoubt = async (e) => {
    e.preventDefault();
    const numericId = Number(lookupId.trim());
    if (!numericId || numericId <= 0) {
      toast.error('Enter a valid numeric doubt ID.');
      return;
    }
    setLookingUp(true);
    try {
      const { data } = await doubtsAPI.getAnswers(numericId);
      const fetchedAnswers = data?.answers || [];
      setAnswersMap((prev) => ({ ...prev, [numericId]: fetchedAnswers }));
      setDoubts((prev) => {
        const exists = prev.some((d) => d.doubt_id === numericId);
        if (exists) {
          const updated = prev.map((d) =>
            d.doubt_id === numericId && fetchedAnswers.length > 0
              ? { ...d, status: 'Answered' }
              : d
          );
          saveStudentDoubts(user?.user_id, updated);
          return updated;
        }
        const entry = {
          doubt_id: numericId,
          question: `Public Doubt #${numericId}`,
          is_anonymous: false,
          status: fetchedAnswers.length > 0 ? 'Answered' : 'Pending',
          created_at: new Date().toISOString(),
        };
        const updated = [entry, ...prev];
        saveStudentDoubts(user?.user_id, updated);
        return updated;
      });
      setExpandedId(numericId);
      setLookupId('');
      toast.success(`Loaded answers for Doubt #${numericId}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Doubt not found or access denied'));
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Doubt Portal"
        subtitle="Ask academic questions freely—choose to share openly or post anonymously."
      />

      {/* Ask a Doubt Card */}
      <form
        onSubmit={handlePostDoubt}
        className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-sm">
              <MessageCircleQuestion className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#13112B]">Ask a Doubt</h2>
              <p className="text-xs text-[#13112B]/55">
                Faculty will review and publish answers directly to your thread.
              </p>
            </div>
          </div>

          {/* Post Anonymously Styled Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous((prev) => !prev)}
            className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
              isAnonymous
                ? 'bg-[#13112B] text-white border-[#13112B]'
                : 'bg-[#F8F7FF] text-[#13112B]/80 border-[#EBE9FE]'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span className="text-xs font-semibold">Post Anonymously</span>
            <span
              className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                isAnonymous ? 'bg-[#635BFF] justify-end' : 'bg-[#D8D4FE] justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </span>
          </button>
        </div>

        <textarea
          rows={3}
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Describe your concept or problem clearly (e.g., Why does deadlock happen in dining philosophers?)..."
          className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/40 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] resize-y"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#13112B]/60">
            <Shield className="w-4 h-4 text-[#635BFF]" />
            <span>
              {isAnonymous
                ? 'Your identity is hidden from faculty and peers.'
                : 'Your name will be shown alongside this question.'}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post Doubt
              </>
            )}
          </button>
        </div>
      </form>

      {/* Public Doubt Lookup Bar */}
      <form
        onSubmit={handleLookupPublicDoubt}
        className="bg-white rounded-2xl border border-[#EBE9FE] px-5 py-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="text-xs text-[#13112B]/70">
          <span className="font-semibold text-[#13112B]">Check a public doubt by ID:</span> Fetch
          live faculty answers for any non-anonymous doubt.
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-[#13112B]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min="1"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Doubt ID"
              className="w-32 pl-8 pr-3 py-2 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-xs text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25"
            />
          </div>
          <button
            type="submit"
            disabled={lookingUp}
            className="px-4 py-2 rounded-xl bg-[#F6F5FF] hover:bg-[#EBE9FE] text-[#635BFF] text-xs font-semibold border border-[#EBE9FE] transition-colors cursor-pointer"
          >
            {lookingUp ? 'Checking...' : 'Load Answers'}
          </button>
        </div>
      </form>

      {/* Doubt Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#13112B]">Your Doubt Threads</h2>

        {doubts.length === 0 ? (
          <EmptyState
            icon={MessageCircleQuestion}
            title="No doubts posted yet"
            description="Ask your first question above—toggle Post Anonymously whenever you want extra privacy."
          />
        ) : (
          doubts.map((doubt) => {
            const isExpanded = expandedId === doubt.doubt_id;
            const answers = answersMap[doubt.doubt_id] || [];
            const isLoadingAns = loadingAnswersId === doubt.doubt_id;

            return (
              <div
                key={doubt.doubt_id}
                className="bg-white rounded-2xl border border-[#EBE9FE] shadow-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => handleToggleExpand(doubt.doubt_id)}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-[#F8F7FF]/60 transition-colors cursor-pointer"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#635BFF] bg-[#F6F5FF] px-2.5 py-0.5 rounded-full border border-[#EBE9FE]">
                        #{doubt.doubt_id}
                      </span>
                      <StatusBadge status={doubt.status || 'Pending'} />
                      {doubt.is_anonymous && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#13112B] text-white">
                          <EyeOff className="w-3 h-3" /> Anonymous
                        </span>
                      )}
                      {doubt.created_at && (
                        <span className="text-xs text-[#13112B]/45">
                          {new Date(doubt.created_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-semibold text-[#13112B] leading-snug">
                      {doubt.question}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-[#635BFF] mt-1">
                    <span className="hidden sm:inline">
                      {isExpanded ? 'Hide Answers' : 'View Answers'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#EBE9FE] bg-[#F8F7FF]/70">
                    {isLoadingAns ? (
                      <div className="flex items-center gap-2 py-4 text-xs text-[#13112B]/60">
                        <Loader2 className="w-4 h-4 animate-spin text-[#635BFF]" />
                        Fetching faculty responses...
                      </div>
                    ) : answers.length === 0 ? (
                      <p className="py-3 text-xs text-[#13112B]/60">
                        No faculty answers yet. Status is currently <strong>Pending</strong>.
                      </p>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {answers.map((ans) => (
                          <div
                            key={ans.answer_id}
                            className="bg-white rounded-xl border border-[#EBE9FE] p-4 shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                                <UserCheck className="w-3.5 h-3.5" />
                                {ans.faculty_name || 'Faculty Response'}
                              </span>
                              {ans.created_at && (
                                <span className="text-[11px] text-[#13112B]/45">
                                  {new Date(ans.created_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#13112B]/85 leading-relaxed whitespace-pre-line">
                              {ans.answer_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
