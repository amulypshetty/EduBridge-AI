import { Download, ExternalLink, FileText, PlayCircle } from 'lucide-react';
import { Modal } from '../common/UI';
import {
  detectResourceType,
  getSafeResourceHref,
  getYouTubeEmbedUrl,
} from '../../utils/resourceMedia';

export function ResourceTypeBadge({ url }) {
  const type = detectResourceType(url);
  if (type === 'video') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
        <PlayCircle className="w-3.5 h-3.5" />
        Video Lecture
      </span>
    );
  }
  if (type === 'pdf') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
        <FileText className="w-3.5 h-3.5" />
        PDF Notes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
      <ExternalLink className="w-3.5 h-3.5" />
      Reference
    </span>
  );
}

export function ResourceViewerModal({ resource, onClose }) {
  if (!resource) return null;

  const type = detectResourceType(resource.resource_url);
  const safeHref = getSafeResourceHref(resource.resource_url);
  const embedUrl = type === 'video' ? getYouTubeEmbedUrl(resource.resource_url) : null;

  return (
    <Modal
      open={Boolean(resource)}
      onClose={onClose}
      title={resource.title}
      subtitle={`${resource.subject}${resource.faculty_name ? ` · Shared by ${resource.faculty_name}` : ''}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {type === 'video' && embedUrl ? (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#13112B] border border-[#EBE9FE]">
            <iframe
              src={embedUrl}
              title={resource.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : type === 'pdf' ? (
          <div className="w-full h-[65vh] rounded-2xl overflow-hidden bg-[#F8F7FF] border border-[#EBE9FE]">
            <iframe
              src={safeHref}
              title={resource.title}
              className="w-full h-full"
            />
          </div>
        ) : null}

        {resource.description && (
          <p className="text-sm text-[#13112B]/75 leading-relaxed">{resource.description}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EBE9FE]">
          <ResourceTypeBadge url={resource.resource_url} />

          <div className="flex flex-wrap items-center gap-2.5">
            {type === 'pdf' && (
              <a
                href={safeHref}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F6F5FF] hover:bg-[#EBE9FE] text-[#13112B] text-xs font-semibold border border-[#EBE9FE] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#635BFF]" />
                Download PDF
              </a>
            )}
            <a
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gradient text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
            >
              {type === 'video' ? 'Watch on YouTube' : 'Open in New Tab'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
