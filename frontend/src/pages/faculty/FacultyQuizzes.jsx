import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  Loader2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { quizzesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getFacultyQuizzes, saveFacultyQuizzes } from '../../utils/storage';
import { EmptyState, PageHeader } from '../../components/common/UI';

const OPTIONS = ['A', 'B', 'C', 'D'];

export default function FacultyQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState(() => getFacultyQuizzes(user?.user_id));
  const [activeQuizId, setActiveQuizId] = useState(() => {
    const saved = getFacultyQuizzes(user?.user_id);
    return saved.length > 0 ? saved[0].quiz_id : null;
  });

  // Create Quiz Form
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  // Add Question Form
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [addingQuestion, setAddingQuestion] = useState(false);

  const activeQuiz = quizzes.find((q) => q.quiz_id === activeQuizId) || null;

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim() || !quizSubject.trim()) {
      toast.error('Quiz title and subject are required.');
      return;
    }

    setCreatingQuiz(true);
    try {
      const { data } = await quizzesAPI.create({
        title: quizTitle.trim(),
        subject: quizSubject.trim(),
      });
      const created = data?.quiz;
      toast.success(data?.message || 'Quiz created! Now add questions below.');
      if (created) {
        const entry = { ...created, questions: [] };
        setQuizzes((prev) => {
          const updated = [entry, ...prev];
          saveFacultyQuizzes(user?.user_id, updated);
          return updated;
        });
        setActiveQuizId(created.quiz_id);
      }
      setQuizTitle('');
      setQuizSubject('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create quiz'));
    } finally {
      setCreatingQuiz(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!activeQuiz) {
      toast.error('Create or select a quiz first.');
      return;
    }
    if (
      !questionText.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      toast.error('Please fill in the question and all four options.');
      return;
    }

    setAddingQuestion(true);
    try {
      const { data } = await quizzesAPI.addQuestion(activeQuiz.quiz_id, {
        question_text: questionText.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_option: correctOption,
      });

      const savedQuestion = data?.question;
      toast.success(data?.message || 'Question added to quiz!');

      if (savedQuestion) {
        setQuizzes((prev) => {
          const updated = prev.map((q) =>
            q.quiz_id === activeQuiz.quiz_id
              ? { ...q, questions: [...(q.questions || []), savedQuestion] }
              : q
          );
          saveFacultyQuizzes(user?.user_id, updated);
          return updated;
        });
      }

      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption('A');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add question'));
    } finally {
      setAddingQuestion(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz Studio"
        subtitle="Create subject assessments and populate multiple-choice questions for your students."
      />

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Create Quiz + Quiz List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Create Quiz Card */}
          <form
            onSubmit={handleCreateQuiz}
            className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
                <Plus className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#13112B]">Create New Quiz</h2>
                <p className="text-xs text-[#13112B]/55">Step 1 of 2</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g., Data Structures Midterm Check"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={quizSubject}
                onChange={(e) => setQuizSubject(e.target.value)}
                placeholder="e.g., Algorithms"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF]"
              />
            </div>

            <button
              type="submit"
              disabled={creatingQuiz}
              className="w-full py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md shadow-[#635BFF]/20 hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {creatingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Quiz
                </>
              )}
            </button>
          </form>

          {/* Your Created Quizzes */}
          <div className="bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-[#13112B] uppercase tracking-wider">
              Your Quizzes ({quizzes.length})
            </h3>
            {quizzes.length === 0 ? (
              <p className="text-xs text-[#13112B]/60">
                Create your first quiz above to start adding questions.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {quizzes.map((q) => {
                  const isSelected = q.quiz_id === activeQuizId;
                  return (
                    <button
                      key={q.quiz_id}
                      type="button"
                      onClick={() => setActiveQuizId(q.quiz_id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F6F5FF] border-[#635BFF] shadow-xs'
                          : 'bg-white border-[#EBE9FE] hover:bg-[#F8F7FF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold text-[#635BFF]">{q.subject}</span>
                        <span className="text-[11px] font-semibold text-[#13112B]/55">
                          {(q.questions || []).length} Qs
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#13112B] line-clamp-1">{q.title}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Question Builder + Live Question List */}
        <div className="lg:col-span-8 space-y-6">
          {!activeQuiz ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No quiz selected"
              description="Create a new quiz on the left panel or select an existing quiz to start adding multiple-choice questions."
            />
          ) : (
            <>
              {/* Add Question Form */}
              <form
                onSubmit={handleAddQuestion}
                className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#EBE9FE]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">
                      Adding Questions To
                    </span>
                    <h2 className="text-xl font-extrabold text-[#13112B] mt-0.5">
                      {activeQuiz.title}{' '}
                      <span className="text-sm font-semibold text-[#13112B]/50">
                        · {activeQuiz.subject}
                      </span>
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F6F5FF] text-[#635BFF] border border-[#EBE9FE]">
                    Quiz ID #{activeQuiz.quiz_id}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
                    Question Text *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your multiple-choice question..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Option A', value: optionA, setter: setOptionA },
                    { label: 'Option B', value: optionB, setter: setOptionB },
                    { label: 'Option C', value: optionC, setter: setOptionC },
                    { label: 'Option D', value: optionD, setter: setOptionD },
                  ].map((opt) => (
                    <div key={opt.label}>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-1.5">
                        {opt.label} *
                      </label>
                      <input
                        type="text"
                        required
                        value={opt.value}
                        onChange={(e) => opt.setter(e.target.value)}
                        placeholder={`Enter ${opt.label}`}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] text-sm text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF]"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Option Radio Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#13112B]/70 mb-2">
                    Correct Option *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {OPTIONS.map((opt) => {
                      const active = correctOption === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold cursor-pointer transition-all ${
                            active
                              ? 'border-[#059669] bg-[#D1FAE5]/40 text-[#059669]'
                              : 'border-[#EBE9FE] bg-[#F8F7FF] text-[#13112B]/70 hover:border-[#C7C2FE]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="correct_option"
                            value={opt}
                            checked={active}
                            onChange={() => setCorrectOption(opt)}
                            className="sr-only"
                          />
                          {active && <CheckCircle2 className="w-4 h-4" />}
                          <span>Option {opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={addingQuestion}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md shadow-[#635BFF]/20 hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {addingQuestion ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Question...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Question to Quiz
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Live List of Added Questions */}
              <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-[#635BFF]" />
                  <h3 className="text-base font-bold text-[#13112B]">
                    Added Questions ({(activeQuiz.questions || []).length})
                  </h3>
                </div>

                {(activeQuiz.questions || []).length === 0 ? (
                  <p className="text-sm text-[#13112B]/60 py-2">
                    No questions added to this quiz yet. Use the form above to add your first
                    question.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeQuiz.questions.map((q, index) => (
                      <div
                        key={q.question_id || index}
                        className="rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-[#13112B]">
                            Q{index + 1}. {q.question_text}
                          </p>
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669]">
                            Answer: {q.correct_option}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          {[
                            { k: 'A', v: q.option_a },
                            { k: 'B', v: q.option_b },
                            { k: 'C', v: q.option_c },
                            { k: 'D', v: q.option_d },
                          ].map((item) => (
                            <div
                              key={item.k}
                              className={`px-3 py-2 rounded-lg border ${
                                q.correct_option === item.k
                                  ? 'bg-[#D1FAE5]/40 border-[#A7F3D0] text-[#065F46] font-semibold'
                                  : 'bg-white border-[#EBE9FE] text-[#13112B]/75'
                              }`}
                            >
                              <span className="font-bold mr-1.5">{item.k}.</span>
                              {item.v}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
