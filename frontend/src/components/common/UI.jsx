import { useEffect } from 'react';
import { X } from 'lucide-react';

export function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  let styles = 'bg-[#E0E7FF] text-[#4338CA] border-[#C7D2FE]';

  if (normalized === 'pending') {
    styles = 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
  } else if (normalized === 'answered') {
    styles = 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]';
  } else if (normalized === 'resolved') {
    styles = 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normalized === 'pending'
            ? 'bg-[#D97706]'
            : normalized === 'answered'
            ? 'bg-[#059669]'
            : 'bg-[#2563EB]'
        }`}
      />
      {status}
    </span>
  );
}

export function RoleBadge({ role }) {
  const normalized = (role || 'student').toLowerCase();
  const map = {
    student: 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]',
    faculty: 'bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]',
    admin: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
        map[normalized] || map.student
      }`}
    >
      {normalized}
    </span>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-24 bg-[#EBE9FE] rounded-full" />
        <div className="h-4 w-16 bg-[#F3F1FE] rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-[#EBE9FE] rounded-lg mb-3" />
      <div className="space-y-2 mb-5">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`h-3.5 bg-[#F3F1FE] rounded ${idx === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
      <div className="h-10 w-full bg-[#EBE9FE]/70 rounded-xl" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE9FE] p-10 text-center shadow-card">
      {Icon && (
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#F6F5FF] border border-[#EBE9FE] flex items-center justify-center text-[#635BFF]">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-lg font-bold text-[#13112B] mb-1.5">{title}</h3>
      <p className="text-sm text-[#13112B]/60 max-w-md mx-auto mb-5">{description}</p>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13112B]">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-[#13112B]/65 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13112B]/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-white rounded-2xl border border-[#EBE9FE] shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#EBE9FE]">
          <div>
            <h2 className="text-lg font-bold text-[#13112B]">{title}</h2>
            {subtitle && <p className="text-xs text-[#13112B]/60 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#13112B]/50 hover:text-[#13112B] hover:bg-[#F6F5FF] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
