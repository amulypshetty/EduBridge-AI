import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Lock,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { getDashboardPath, useAuth } from '../../context/AuthContext';

const FEATURE_CARDS = [
  {
    title: '3 Distinct Roles',
    description: 'Dedicated experiences tailored for Students, Faculty, and Platform Admins.',
    icon: Users,
    accent: 'from-[#635BFF] to-[#7C3AED]',
  },
  {
    title: 'Curated Resources',
    description: 'Verified videos, lecture notes, and reference links organized by subject.',
    icon: BookOpen,
    accent: 'from-[#4F46E5] to-[#635BFF]',
  },
  {
    title: 'Anonymous Doubt Support',
    description: 'Ask any question privately or openly—never hesitate in front of peers.',
    icon: MessageCircleQuestion,
    accent: 'from-[#7C3AED] to-[#A855F7]',
  },
  {
    title: 'Interactive Quizzes',
    description: 'Distraction-free timed assessments with instant scoring and attempt history.',
    icon: ClipboardCheck,
    accent: 'from-[#059669] to-[#10B981]',
  },
];

const WHY_ITEMS = [
  {
    title: 'Psychological Safety in Learning',
    description:
      'Toggle "Post Anonymously" anytime so every student feels empowered to clear foundational concepts without fear of judgment.',
    icon: Lock,
  },
  {
    title: 'Direct Faculty Mentorship',
    description:
      'Faculty manage a unified doubt queue and publish authoritative answers that update student status to Answered immediately.',
    icon: Award,
  },
  {
    title: 'Instant Knowledge Verification',
    description:
      'Move seamlessly from studying curated subject resources to taking faculty-built MCQ quizzes with instant feedback.',
    icon: Zap,
  },
  {
    title: 'Enterprise-Grade Access Control',
    description:
      'Role-based JWT authorization ensures students, faculty, and admins see precisely the workflows designed for them.',
    icon: ShieldCheck,
  },
];

const ROLES_SHOWCASE = [
  {
    role: 'Students',
    tagline: 'Explore, Ask & Assess',
    points: [
      'Browse faculty-curated learning resources by subject',
      'Post academic doubts openly or anonymously',
      'Take distraction-free quizzes and track past scores',
    ],
  },
  {
    role: 'Faculty',
    tagline: 'Teach, Mentor & Evaluate',
    points: [
      'Publish curated external study URLs & lecture guides',
      'Filter and answer pending student doubts in real time',
      'Build multi-question MCQ assessments in Quiz Studio',
    ],
  },
  {
    role: 'Admins',
    tagline: 'Oversee & Empower',
    points: [
      'Monitor platform health and academic resource growth',
      'Ensure seamless role-based governance across cohorts',
      'Maintain a secure, reliable campus learning bridge',
    ],
  },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F6F5FF] text-[#13112B] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#EBE9FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-[#635BFF]/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-[#13112B]">
              EduBridge <span className="text-[#635BFF]">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#13112B]/75">
            <a href="#features" className="hover:text-[#635BFF] transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-[#635BFF] transition-colors">
              Roles
            </a>
            <a href="#how-it-works" className="hover:text-[#635BFF] transition-colors">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath(user?.role)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#13112B] hover:bg-[#EBE9FE]/60 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Split Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Soft Lavender Wave Backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-0 h-[560px] bg-gradient-to-b from-[#EDE9FE]/70 via-[#F6F5FF] to-transparent pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#635BFF]/12 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-40 -left-24 w-80 h-80 rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE9FE] shadow-sm text-xs font-semibold text-[#635BFF]">
                <Sparkles className="w-3.5 h-3.5" />
                Modern Academic Intelligence Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#13112B] leading-[1.08]">
                Learn Without Limits.{' '}
                <span className="bg-gradient-to-r from-[#635BFF] to-[#7C3AED] bg-clip-text text-transparent">
                  Ask Without Fear.
                </span>{' '}
                Grow Together.
              </h1>

              <p className="text-base sm:text-lg text-[#13112B]/70 leading-relaxed max-w-xl">
                EduBridge AI unites curated faculty resources, anonymous doubt resolution, and
                interactive assessments in one serene, purpose-built learning workspace.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? getDashboardPath(user?.role) : '/register'}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-gradient text-white text-sm sm:text-base font-semibold shadow-lg shadow-[#635BFF]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  {isAuthenticated ? 'Open My Workspace' : 'Start Learning Free'}
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#13112B] text-sm sm:text-base font-semibold border border-[#EBE9FE] shadow-card hover:border-[#635BFF]/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Faculty & Student Login
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm text-[#13112B]/65 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Anonymous Doubts
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Instant Quiz Scoring
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Faculty-Curated Links
                </span>
              </div>
            </div>

            {/* Glassmorphic 3D-Style EdTech Hero Graphic */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Decorative gradient halo */}
                <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-[#635BFF]/20 via-[#7C3AED]/15 to-[#A59BFF]/20 blur-2xl" />

                <div className="relative rounded-[28px] bg-gradient-to-br from-[#13112B] via-[#1A173B] to-[#2B2464] p-6 sm:p-8 text-white shadow-2xl border border-white/15">
                  {/* Mock Window Top */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                      <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-[#C4B5FD]">
                      Live Student Workspace
                    </span>
                  </div>

                  {/* Floating Glass Cards */}
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full mb-2">
                          <Lock className="w-3 h-3" /> Anonymous Doubt
                        </span>
                        <p className="text-sm font-medium text-white/95">
                          “How does JWT middleware validate role permissions across routes?”
                        </p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Answered
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center mb-3">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs text-white/60">Curated Hub</p>
                        <p className="text-base font-bold text-white mt-0.5">CS & AI Modules</p>
                      </div>

                      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-white/60">Latest Quiz Score</p>
                        <p className="text-base font-bold text-white mt-0.5">92% · Passed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Choose Your Portal Section ── */}
      <section id="portals" className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#635BFF]">
              We also provide
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13112B] mt-2">
              Separate Access for Every Role
            </h2>
            <p className="text-sm sm:text-base text-[#13112B]/60 mt-3 leading-relaxed">
              Choose your dedicated portal and log in to a workspace built exactly for your role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Portal */}
            <div className="bg-white rounded-3xl border border-[#EBE9FE] p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#7C3AED] flex items-center justify-center text-white mb-5 shadow-lg shadow-[#635BFF]/25">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#635BFF] mb-2">Student Portal</span>
              <h3 className="text-xl font-extrabold text-[#13112B] mb-3">Explore, Ask &amp; Assess</h3>
              <p className="text-sm text-[#13112B]/65 leading-relaxed flex-1">
                Browse notes &amp; video lectures, ask anonymous doubts, and attempt self-assessment quizzes curated by faculty.
              </p>
              <Link
                to="/login?role=student"
                className="mt-6 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md hover:shadow-[#635BFF]/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Login as Student
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Faculty Portal */}
            <div className="bg-white rounded-3xl border border-[#EBE9FE] p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col relative">
              <div className="absolute top-5 right-5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7C3AED]">
                  Institutional Code Required
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white mb-5 shadow-lg shadow-[#7C3AED]/25">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-2">Faculty Portal</span>
              <h3 className="text-xl font-extrabold text-[#13112B] mb-3">Teach, Mentor &amp; Evaluate</h3>
              <p className="text-sm text-[#13112B]/65 leading-relaxed flex-1">
                Upload teaching videos &amp; PDFs, answer student doubts in the queue, and create department quizzes.
              </p>
              <Link
                to="/login?role=faculty"
                className="mt-6 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-[#7C3AED] text-[#7C3AED] text-sm font-semibold hover:bg-[#F3E8FF] transition-all duration-200"
              >
                Login as Faculty
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Administrator Portal */}
            <div className="bg-navy-sidebar rounded-3xl border border-white/10 p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col text-white">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 mb-5">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-2">Administrator Portal</span>
              <h3 className="text-xl font-extrabold text-white mb-3">Oversee &amp; Govern</h3>
              <p className="text-sm text-white/65 leading-relaxed flex-1">
                Manage users, assign roles, monitor platform activity, and moderate academic resources.
              </p>
              <Link
                to="/login?role=admin"
                className="mt-6 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all duration-200"
              >
                Login as Admin
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Card Feature Strip */}
      <section id="features" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white mb-4 shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#13112B] mb-2">{card.title}</h3>
                  <p className="text-sm text-[#13112B]/65 leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose EduBridge AI Grid */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#635BFF]">
              Why Choose EduBridge AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13112B] mt-2">
              Designed for Clarity, Speed, and Confidence
            </h2>
            <p className="text-sm sm:text-base text-[#13112B]/65 mt-3">
              Every workflow eliminates friction between asking a question, mastering materials, and
              proving comprehension.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {WHY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-[#EBE9FE] p-7 shadow-card flex gap-5 items-start"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F6F5FF] border border-[#EBE9FE] flex items-center justify-center text-[#635BFF] shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#13112B] mb-1.5">{item.title}</h3>
                    <p className="text-sm text-[#13112B]/65 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Showcase */}
      <section id="roles" className="py-16 bg-white/70 border-y border-[#EBE9FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#635BFF]">
              Built for Every Campus Role
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13112B] mt-2">
              One Connected Ecosystem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ROLES_SHOWCASE.map((item) => (
              <div
                key={item.role}
                className="bg-white rounded-2xl border border-[#EBE9FE] p-7 shadow-card flex flex-col"
              >
                <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-bold bg-[#F6F5FF] text-[#635BFF] border border-[#EBE9FE] mb-3">
                  {item.role}
                </span>
                <h3 className="text-xl font-bold text-[#13112B] mb-4">{item.tagline}</h3>
                <ul className="space-y-3 text-sm text-[#13112B]/70 flex-1">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-navy-sidebar text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#635BFF]/30 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Ready to bridge the gap in your learning journey?
                </h2>
                <p className="text-sm sm:text-base text-white/70 mt-2">
                  Create your Student account in seconds or sign in with your institutional Faculty
                  or Admin credentials.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/30 hover:-translate-y-0.5 transition-all"
                >
                  Create Student Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EBE9FE] bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#13112B]/60">
          <div className="flex items-center gap-2 font-semibold text-[#13112B]">
            <GraduationCap className="w-4 h-4 text-[#635BFF]" />
            <span>EduBridge AI</span>
          </div>
          <p>© {new Date().getFullYear()} EduBridge AI. Empowering Students, Faculty & Admins.</p>
        </div>
      </footer>
    </div>
  );
}
