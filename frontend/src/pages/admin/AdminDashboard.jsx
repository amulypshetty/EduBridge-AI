import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  MessageCircleQuestion,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { adminAPI, resourcesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { getSafeResourceHref } from '../../utils/resourceMedia';
import { PageHeader, RoleBadge, SkeletonCard } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';

const PLATFORM_SERVICES = [
  { name: 'JWT Authentication & RBAC', status: 'Operational' },
  { name: 'Learning Resources Hub API', status: 'Operational' },
  { name: 'Anonymous Doubt Resolution Engine', status: 'Operational' },
  { name: 'Assessment & Scoring Engine', status: 'Operational' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAdminData() {
      setLoading(true);
      try {
        const [statsResp, resResp] = await Promise.all([
          adminAPI.getStats(),
          resourcesAPI.getAll(),
        ]);
        if (!active) return;
        setStats(statsResp.data?.stats || null);
        setRecentResources((resResp.data?.resources || []).slice(0, 5));
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load admin overview'));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAdminData();
    return () => { active = false; };
  }, []);

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers,
      sub: `${stats?.totalStudents ?? '—'} Students · ${stats?.totalFaculty ?? '—'} Faculty · ${stats?.totalAdmins ?? '—'} Admins`,
      icon: Users,
      iconBg: 'bg-[#EEF2FF]',
      iconColor: 'text-[#635BFF]',
    },
    {
      label: 'Learning Resources',
      value: stats?.totalResources,
      sub: 'Verified links across platform',
      icon: BookOpen,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#7C3AED]',
    },
    {
      label: 'Student Doubts',
      value: stats?.totalDoubts,
      sub: `${stats?.pendingDoubts ?? '—'} Pending · ${stats?.answeredDoubts ?? '—'} Answered`,
      icon: MessageCircleQuestion,
      iconBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#059669]',
    },
    {
      label: 'Quizzes Created',
      value: stats?.totalQuizzes,
      sub: 'Faculty-authored assessments',
      icon: ClipboardCheck,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Executive Overview"
        subtitle="Real-time platform health, user metrics, and academic catalog governance."
      />

      {/* Executive Summary Banner */}
      <div className="rounded-3xl bg-navy-sidebar p-7 sm:p-8 text-white shadow-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#C4B5FD]">
            <ShieldCheck className="w-4 h-4" />
            Administrator Session Verified
          </div>
          <h2 className="text-2xl font-extrabold text-white">EduBridge AI Platform Control</h2>
          <p className="text-sm text-white/70">
            Account ID #{user?.user_id || '—'} · Active Role:{' '}
            <span className="capitalize font-semibold text-white">{user?.role || 'admin'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-3.5">
          <Activity className="w-5 h-5 text-emerald-300" />
          <div>
            <p className="text-xs text-white/60">API Connection</p>
            <p className="text-sm font-bold text-emerald-300">All Systems Healthy</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#13112B]">
                {loading ? '—' : (card.value ?? '—')}
              </p>
              <p className="text-xs text-[#13112B]/55 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="flex items-center gap-4 bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#635BFF] flex items-center justify-center group-hover:bg-brand-gradient group-hover:text-white transition-all">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-[#13112B]">User Management</p>
            <p className="text-xs text-[#13112B]/55 mt-0.5">Search, promote, or remove platform users</p>
          </div>
        </Link>
        <Link
          to="/admin/resources"
          className="flex items-center gap-4 bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#7C3AED] group-hover:to-[#A855F7] group-hover:text-white transition-all">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-[#13112B]">Content Moderation</p>
            <p className="text-xs text-[#13112B]/55 mt-0.5">Review and remove platform resources</p>
          </div>
        </Link>
      </div>

      {/* System Health + Recent Resources */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-4">
          <h3 className="text-lg font-bold text-[#13112B]">Platform Service Health</h3>
          <div className="space-y-3">
            {PLATFORM_SERVICES.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE]"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#13112B]">{svc.name}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] bg-[#D1FAE5] px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE] flex items-center gap-3">
            <Server className="w-4 h-4 text-[#635BFF]" />
            <span className="text-xs text-[#13112B]/60">
              Backend · <span className="font-semibold text-[#13112B]">http://localhost:5000</span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#13112B]">Recent Platform Resources</h3>
            <RoleBadge role="admin" />
          </div>

          {loading ? (
            <SkeletonCard lines={3} />
          ) : recentResources.length === 0 ? (
            <p className="text-sm text-[#13112B]/60 py-6 text-center">
              No resources published on the platform yet.
            </p>
          ) : (
            <div className="divide-y divide-[#EBE9FE]">
              {recentResources.map((res) => (
                <div
                  key={res.resource_id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#13112B] truncate">{res.title}</p>
                    <p className="text-xs text-[#13112B]/55 mt-0.5">
                      {res.subject} · Shared by {res.faculty_name || 'Faculty'}
                    </p>
                  </div>
                  <a
                    href={getSafeResourceHref(res.resource_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline"
                  >
                    Inspect <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/admin/resources"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline"
          >
            View all resources <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
