import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Zap,
} from 'lucide-react';
import { getDashboardPath, useAuth } from '../../context/AuthContext';

const PORTALS = [
  {
    id: 'student',
    label: 'Student',
    icon: Users,
    color: 'from-[#635BFF] to-[#7C3AED]',
    badge: 'bg-[#EEF2FF] text-[#635BFF]',
    description: 'Browse notes & video lectures, ask doubts, attempt quizzes.',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: UserCog,
    color: 'from-[#7C3AED] to-[#A855F7]',
    badge: 'bg-[#F3E8FF] text-[#7C3AED]',
    description: 'Upload teaching materials, answer doubts, and create quizzes.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    color: 'from-[#059669] to-[#10B981]',
    badge: 'bg-[#D1FAE5] text-[#059669]',
    description: 'Manage users, roles, and platform content moderation.',
  },
];

const DEMO_CREDS = {
  student: { email: 'student@example.com', password: 'Student@123' },
  faculty: { email: 'faculty@edubridge.com', password: 'Faculty@123' },
  admin: { email: 'admin@edubridge.com', password: 'Admin@123' },
};

const PORTAL_RBAC_LABEL = {
  student: 'Student',
  faculty: 'Faculty / Instructor',
  admin: 'Administrator',
};

export default function AuthPage({ defaultTab = 'login' }) {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get('role');
  const [activePortal, setActivePortal] = useState(
    PORTALS.find((p) => p.id === roleParam) ? roleParam : 'student'
  );
  const [tab, setTab] = useState(defaultTab); // 'login' | 'register'

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [rbacError, setRbacError] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regRole, setRegRole] = useState('student');
  const [facultyCode, setFacultyCode] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // If already authenticated, go to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Sync activePortal when URL param changes
  useEffect(() => {
    if (roleParam && PORTALS.find((p) => p.id === roleParam)) {
      setActivePortal(roleParam);
    }
  }, [roleParam]);

  const currentPortal = PORTALS.find((p) => p.id === activePortal);

  const fillDemoCredentials = (portalId) => {
    const creds = DEMO_CREDS[portalId];
    if (creds) {
      setLoginEmail(creds.email);
      setLoginPassword(creds.password);
      setActivePortal(portalId);
      setRbacError('');
      toast.success(`Demo credentials filled for ${PORTAL_RBAC_LABEL[portalId]} portal`, {
        icon: '⚡',
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setRbacError('');
    setLoginLoading(true);
    try {
      const data = await login(loginEmail, loginPassword);
      const returnedRole = data?.user?.role;
      // RBAC portal mismatch check
      if (returnedRole !== activePortal) {
        // Clear auth state — login() already set it; we must revert
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('edubridge:unauthorized'));
        const correctPortalLabel = PORTAL_RBAC_LABEL[returnedRole] || returnedRole;
        const selectedLabel = PORTAL_RBAC_LABEL[activePortal];
        setRbacError(
          `Access Denied: Your account does not have ${selectedLabel} privileges. Please use the ${correctPortalLabel} Portal.`
        );
        return;
      }
      toast.success(`Welcome back! Redirecting to your ${returnedRole} dashboard…`);
      navigate(getDashboardPath(returnedRole), { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (regRole === 'faculty' && !facultyCode.trim()) {
      toast.error('Please enter the Faculty Institutional Code.');
      return;
    }
    setRegLoading(true);
    try {
      const data = await register(
        regName,
        regEmail,
        regPassword,
        regRole,
        regRole === 'faculty' ? facultyCode : undefined
      );
      if (data?.token && data?.user) {
        toast.success(`Account created! Welcome, ${data.user.full_name}!`);
        navigate(getDashboardPath(data.user.role), { replace: true });
      } else {
        toast.success('Account created! Please log in.');
        setTab('login');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5FF] flex flex-col">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-[#13112B] tracking-tight">
            EduBridge <span className="text-[#635BFF]">AI</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-sm text-[#13112B]/60 hover:text-[#635BFF] font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Login / Register Tab switcher */}
          <div className="flex bg-white border border-[#EBE9FE] rounded-2xl p-1 mb-6 shadow-card">
            <button
              type="button"
              onClick={() => { setTab('login'); setRbacError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-[#13112B]/60 hover:text-[#13112B]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setRbacError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-[#13112B]/60 hover:text-[#13112B]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#EBE9FE] shadow-card-hover overflow-hidden">
            {/* Portal Role Tabs (login only) */}
            {tab === 'login' && (
              <div className="px-6 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#13112B]/40 mb-3">
                  Select Portal
                </p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {PORTALS.map((portal) => {
                    const Icon = portal.icon;
                    return (
                      <button
                        key={portal.id}
                        type="button"
                        onClick={() => { setActivePortal(portal.id); setRbacError(''); }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                          activePortal === portal.id
                            ? 'border-[#635BFF] bg-[#EEF2FF] text-[#635BFF]'
                            : 'border-[#EBE9FE] text-[#13112B]/60 hover:border-[#635BFF]/40 hover:bg-[#F6F5FF]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {portal.label}
                      </button>
                    );
                  })}
                </div>

                {/* Portal description */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F6F5FF] border border-[#EBE9FE] mb-4 text-xs text-[#13112B]/70">
                  <Sparkles className="w-3.5 h-3.5 text-[#635BFF] mt-0.5 shrink-0" />
                  <span>{currentPortal?.description}</span>
                </div>
              </div>
            )}

            <div className="px-6 pb-6 pt-2">
              {tab === 'login' ? (
                <>
                  <h1 className="font-heading text-xl font-extrabold text-[#13112B] mb-1">
                    EduBridge AI — {PORTAL_RBAC_LABEL[activePortal]} Portal
                  </h1>
                  <p className="text-xs text-[#13112B]/55 mb-5">
                    Sign in to access your dedicated workspace.
                  </p>

                  {/* RBAC mismatch error */}
                  {rbacError && (
                    <div className="mb-4 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#DC2626] flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                      {rbacError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#13112B]/70 mb-1.5 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@edubridge.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/35 bg-[#F8F7FF] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#13112B]/70 mb-1.5 block">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPw ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/35 bg-[#F8F7FF] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#13112B]/40 hover:text-[#635BFF]"
                        >
                          {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 rounded-xl bg-brand-gradient text-white text-sm font-bold shadow-md hover:shadow-[#635BFF]/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {loginLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Signing in…
                        </span>
                      ) : (
                        <>
                          Sign in to {PORTAL_RBAC_LABEL[activePortal]} Portal
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Quick Demo Fill */}
                  <div className="mt-5 pt-4 border-t border-[#EBE9FE]">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-3.5 h-3.5 text-[#635BFF]" />
                      <p className="text-xs font-bold text-[#13112B]/50 uppercase tracking-wider">
                        Quick Demo Login
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {PORTALS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => fillDemoCredentials(p.id)}
                          className="py-2 px-2 rounded-xl text-xs font-semibold border border-[#EBE9FE] text-[#13112B]/70 bg-[#F8F7FF] hover:bg-[#EEF2FF] hover:border-[#635BFF]/40 hover:text-[#635BFF] transition-all"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#13112B]/40 mt-2 text-center">
                      Fills credentials · then click Sign In
                    </p>
                  </div>

                  <p className="text-center text-xs text-[#13112B]/55 mt-5">
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="text-[#635BFF] font-semibold hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-heading text-xl font-extrabold text-[#13112B] mb-1 mt-2">
                    Join EduBridge AI
                  </h1>
                  <p className="text-xs text-[#13112B]/55 mb-5">
                    Create your account to get started.
                  </p>

                  {/* Role toggle */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[#13112B]/70 mb-2">I am a…</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('student')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          regRole === 'student'
                            ? 'border-[#635BFF] bg-[#EEF2FF] text-[#635BFF]'
                            : 'border-[#EBE9FE] text-[#13112B]/60 hover:border-[#635BFF]/40'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('faculty')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          regRole === 'faculty'
                            ? 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED]'
                            : 'border-[#EBE9FE] text-[#13112B]/60 hover:border-[#7C3AED]/40'
                        }`}
                      >
                        <UserCog className="w-4 h-4" />
                        Faculty
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#13112B]/70 mb-1.5 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Dr. Ananya Sharma"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/35 bg-[#F8F7FF] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#13112B]/70 mb-1.5 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@edubridge.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/35 bg-[#F8F7FF] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#13112B]/70 mb-1.5 block">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPw ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#EBE9FE] text-sm text-[#13112B] placeholder:text-[#13112B]/35 bg-[#F8F7FF] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#13112B]/40 hover:text-[#635BFF]"
                        >
                          {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Faculty Code field — only visible for faculty */}
                    {regRole === 'faculty' && (
                      <div>
                        <label className="text-xs font-semibold text-[#7C3AED] mb-1.5 block flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          Faculty Institutional Code
                        </label>
                        <input
                          type="text"
                          required={regRole === 'faculty'}
                          value={facultyCode}
                          onChange={(e) => setFacultyCode(e.target.value)}
                          placeholder="Hint: EDUBRIDGE-FACULTY"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E9D5FF] text-sm text-[#13112B] placeholder:text-[#13112B]/35 bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] transition-all font-mono"
                        />
                        <p className="text-[10px] text-[#7C3AED]/70 mt-1">
                          Obtain this code from your institution's administrator.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 rounded-xl bg-brand-gradient text-white text-sm font-bold shadow-md hover:shadow-[#635BFF]/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Creating account…
                        </span>
                      ) : (
                        <>
                          Create {regRole === 'faculty' ? 'Faculty' : 'Student'} Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-xs text-[#13112B]/55 mt-5">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-[#635BFF] font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
