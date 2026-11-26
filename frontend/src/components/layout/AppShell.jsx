import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/UI';

const NAV_BY_ROLE = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/resources', label: 'Resources Hub', icon: BookOpen },
    { to: '/student/doubts', label: 'Doubt Portal', icon: MessageCircleQuestion },
    { to: '/student/quizzes', label: 'Quizzes', icon: ClipboardCheck },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  faculty: [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/resources', label: 'Resources Hub', icon: BookOpen },
    { to: '/faculty/doubts', label: 'Doubt Queue', icon: MessageCircleQuestion },
    { to: '/faculty/quizzes', label: 'Quiz Studio', icon: ClipboardCheck },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: ShieldCheck },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/resources', label: 'Content Moderation', icon: BookOpen },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
};

const ROLE_CARD_COPY = {
  student: {
    title: 'Keep your streak alive!',
    body: 'Ask questions fearlessly and sharpen your skills with quick assessments.',
  },
  faculty: {
    title: 'Shape curious minds',
    body: 'Share curated resources, resolve student doubts, and craft interactive quizzes.',
  },
  admin: {
    title: 'Platform Governance',
    body: 'Monitor EduBridge AI service health, user activity, and academic content.',
  },
};

export function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'EB';
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const role = user?.role || 'student';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.student;
  const roleCopy = ROLE_CARD_COPY[role] || ROLE_CARD_COPY.student;
  const displayName = user?.full_name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
  const initials = getInitials(user?.full_name, user?.email);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (role === 'student') {
      navigate(`/student/resources?q=${encodeURIComponent(q)}`);
    } else if (role === 'faculty') {
      navigate(`/faculty/resources?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-navy-sidebar text-white w-[260px] select-none">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-[#635BFF]/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg tracking-tight text-white block leading-none">
              EduBridge <span className="text-[#A59BFF]">AI</span>
            </span>
            <span className="text-[11px] text-white/50 font-medium tracking-wide uppercase">
              {role} Portal
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-gradient text-white shadow-lg shadow-[#635BFF]/25'
                    : 'text-white/70 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Motivational / Role Card */}
      <div className="p-4">
        <div className="rounded-2xl bg-white/8 border border-white/10 p-4 mb-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#635BFF]/30 flex items-center justify-center text-[#C4B5FD]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">{roleCopy.title}</span>
          </div>
          <p className="text-xs text-white/65 leading-relaxed">{roleCopy.body}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/75 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F6F5FF]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-[260px]">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#13112B]/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EBE9FE]">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-8 h-16">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#13112B]/70 hover:text-[#13112B] hover:bg-[#F6F5FF] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <form onSubmit={handleGlobalSearch} className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#13112B]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search learning resources by title or subject..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#F6F5FF] border border-[#EBE9FE] rounded-xl text-[#13112B] placeholder:text-[#13112B]/40 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="relative p-2.5 rounded-xl bg-[#F6F5FF] border border-[#EBE9FE] text-[#13112B]/70 hover:text-[#635BFF] hover:border-[#635BFF]/40 transition-all cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#635BFF] ring-2 ring-white" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#EBE9FE] shadow-card-hover p-4 z-30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
                        Notifications
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-[#635BFF] font-medium"
                      >
                        Close
                      </button>
                    </div>
                    <div className="text-xs text-[#13112B]/75 bg-[#F6F5FF] rounded-xl p-3 border border-[#EBE9FE]">
                      Welcome to EduBridge AI! Your <span className="font-semibold capitalize">{role}</span>{' '}
                      workspace is connected to live academic services.
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-[#F6F5FF] border border-[#EBE9FE] hover:border-[#635BFF]/40 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[#13112B] leading-tight max-w-[140px] truncate">
                    {displayName}
                  </p>
                  <div className="mt-0.5">
                    <RoleBadge role={role} />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
