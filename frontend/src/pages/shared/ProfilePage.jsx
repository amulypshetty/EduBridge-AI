import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, Hash, LogOut, Mail, Shield, User } from 'lucide-react';
import { authAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../components/layout/AppShell';
import { PageHeader, RoleBadge } from '../../components/common/UI';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const { data } = await authAPI.getProfile();
        if (active && data?.user) {
          setProfileData((prev) => ({ ...prev, ...data.user }));
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to verify profile'));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const displayName = profileData?.full_name || 'EduBridge Member';
  const initials = getInitials(profileData?.full_name, profileData?.email);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Account Profile"
        subtitle="Your verified EduBridge AI identity and active role permissions."
      />

      <div className="bg-white rounded-3xl border border-[#EBE9FE] shadow-card overflow-hidden">
        {/* Top Banner */}
        <div className="h-28 bg-gradient-to-r from-[#13112B] via-[#31247A] to-[#635BFF]" />

        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-brand-gradient border-4 border-white shadow-lg flex items-center justify-center text-white font-heading font-extrabold text-2xl">
                {initials}
              </div>
              <div className="pb-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#13112B]">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={profileData?.role} />
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#059669]">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {loading ? 'Verifying session...' : 'Verified JWT Session'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-[#EBE9FE]">
            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#EBE9FE] flex items-start gap-3">
              <User className="w-5 h-5 text-[#635BFF] mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#13112B]/45">
                  Full Name
                </p>
                <p className="text-sm font-semibold text-[#13112B] mt-0.5">{displayName}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#EBE9FE] flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#635BFF] mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#13112B]/45">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-[#13112B] mt-0.5">
                  {profileData?.email || 'Not provided in token'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#EBE9FE] flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#635BFF] mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#13112B]/45">
                  Assigned Role
                </p>
                <p className="text-sm font-semibold text-[#13112B] capitalize mt-0.5">
                  {profileData?.role || '—'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#EBE9FE] flex items-start gap-3">
              <Hash className="w-5 h-5 text-[#635BFF] mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#13112B]/45">
                  Account ID
                </p>
                <p className="text-sm font-semibold text-[#13112B] mt-0.5">
                  #{profileData?.user_id || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
