import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { adminAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, RoleBadge, SkeletonCard } from '../../components/common/UI';

const ROLES = ['student', 'faculty', 'admin'];

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : 'EB';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // user object to confirm delete
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const { data } = await adminAPI.getUsers();
        if (active) setUsers(data?.users || []);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load users'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.user_id) {
      toast.error("You can't change your own role.");
      return;
    }
    setUpdatingId(userId);
    try {
      const { data } = await adminAPI.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: data?.user?.role || newRole } : u))
      );
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update role'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.user_id === currentUser?.user_id) {
      toast.error("You can't delete your own account.");
      setConfirmDelete(null);
      return;
    }
    setDeletingId(confirmDelete.user_id);
    try {
      await adminAPI.deleteUser(confirmDelete.user_id);
      setUsers((prev) => prev.filter((u) => u.user_id !== confirmDelete.user_id));
      toast.success(`User "${confirmDelete.full_name}" removed.`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete user'));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const roleCounts = {
    student: users.filter((u) => u.role === 'student').length,
    faculty: users.filter((u) => u.role === 'faculty').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        subtitle="View, search, promote or remove platform members in real time."
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-[#635BFF]', bg: 'bg-[#EEF2FF]' },
          { label: 'Students', value: roleCounts.student, color: 'text-[#059669]', bg: 'bg-[#D1FAE5]' },
          { label: 'Faculty', value: roleCounts.faculty, color: 'text-[#7C3AED]', bg: 'bg-[#F3E8FF]' },
          { label: 'Admins', value: roleCounts.admin, color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#EBE9FE] p-5 shadow-card">
            <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs text-[#13112B]/55 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-[#EBE9FE] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#EBE9FE]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#13112B]/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F8F7FF] border border-[#EBE9FE] rounded-xl text-[#13112B] placeholder:text-[#13112B]/35 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 focus:border-[#635BFF] transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'student', 'faculty', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterRole === r
                    ? 'bg-brand-gradient text-white border-transparent'
                    : 'bg-[#F8F7FF] text-[#13112B]/60 border-[#EBE9FE] hover:border-[#635BFF]/40'
                }`}
              >
                {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <SkeletonCard lines={5} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-[#13112B]/20 mb-3" />
              <p className="text-sm font-semibold text-[#13112B]/50">No users match your filter.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-[#13112B]/40 bg-[#F8F7FF] border-b border-[#EBE9FE]">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE9FE]">
                {filtered.map((u) => {
                  const isSelf = u.user_id === currentUser?.user_id;
                  const isUpdating = updatingId === u.user_id;
                  return (
                    <tr key={u.user_id} className="hover:bg-[#F8F7FF] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {getInitials(u.full_name, u.email)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#13112B] leading-tight">
                              {u.full_name || 'Unnamed'}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] font-bold text-[#635BFF] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#13112B]/50 sm:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#13112B]/60 hidden sm:table-cell">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                          disabled={isSelf || isUpdating}
                          className="text-xs font-semibold border border-[#EBE9FE] rounded-lg px-2 py-1 bg-[#F8F7FF] text-[#13112B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#13112B]/55 hidden md:table-cell">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={isSelf || deletingId === u.user_id}
                          onClick={() => setConfirmDelete(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#EBE9FE] text-xs text-[#13112B]/40">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13112B]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#EBE9FE] shadow-card-hover w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="p-2 rounded-xl text-[#13112B]/40 hover:text-[#13112B] hover:bg-[#F6F5FF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#13112B]">Remove User</h3>
              <p className="text-sm text-[#13112B]/60 mt-1">
                Are you sure you want to permanently remove{' '}
                <span className="font-semibold text-[#13112B]">{confirmDelete.full_name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#EBE9FE] text-sm font-semibold text-[#13112B]/70 hover:bg-[#F6F5FF] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingId === confirmDelete.user_id}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-bold hover:bg-[#B91C1C] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDelete.user_id ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
