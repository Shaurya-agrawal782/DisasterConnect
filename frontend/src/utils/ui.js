/**
 * Reusable utility helpers for MERN frontend UI layout and styling checks.
 */

/**
 * Combines conditional class names into a single string.
 * @param  {...any} classes - Class strings or falsy values
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Maps operational/resource status keys to standard MERN CSS badge configurations.
 * @param {string} status - status code
 * @returns {string} tailwind classes
 */
export function getStatusBadgeVariant(status) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'reported':
      return 'bg-surface-container-low text-on-surface-variant border border-outline-variant';
    case 'verified':
      return 'bg-primary-container/10 text-primary border border-primary/20';
    case 'assigned':
      return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
    case 'in-progress':
    case 'active':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'resolved':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'closed':
      return 'bg-surface-dim text-on-surface-variant border border-outline-variant';
    
    // Resource Statuses
    case 'available':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'busy':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'maintenance':
      return 'bg-orange-100 text-orange-800 border border-orange-200'; // fallback
    case 'offline':
      return 'bg-surface-dim text-on-surface-variant border border-outline-variant';
    default:
      return 'bg-surface-container text-on-surface border border-outline-variant';
  }
}

/**
 * Maps severity values to tailwind classes.
 * @param {string} severity - severity rating
 * @returns {string} tailwind classes
 */
export function getSeverityBadgeVariant(severity) {
  const s = (severity || '').toLowerCase();
  switch (s) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'critical':
      return 'bg-error-container text-on-error-container border border-error/20 font-bold animate-pulse';
    default:
      return 'bg-surface-container text-on-surface border border-outline-variant';
  }
}

/**
 * Maps alert priorities to tailwind classes.
 * @param {string} priority - priority value
 * @returns {string} tailwind classes
 */
export function getPriorityBadgeVariant(priority) {
  return getSeverityBadgeVariant(priority);
}
