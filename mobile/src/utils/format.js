export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    // Custom readable format: e.g. Jun 13, 2026, 9:02 AM
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateString;
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'reported':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' }; // Blue
    case 'verified':
      return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' }; // Purple
    case 'assigned':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' }; // Amber
    case 'in-progress':
      return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }; // Orange-ish Amber
    case 'resolved':
      return { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' }; // Emerald Green
    case 'closed':
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' }; // Gray
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'low':
      return { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' }; // Green
    case 'medium':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' }; // Amber
    case 'high':
      return { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' }; // Orange
    case 'critical':
      return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' }; // Red
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

export const getIncidentTypeLabel = (type) => {
  const mapping = {
    fire: 'Fire',
    flood: 'Flood',
    medical: 'Medical Emergency',
    accident: 'Accident',
    crowd: 'Crowd Hazard',
    rescue: 'Rescue Ops',
    other: 'Other'
  };
  return mapping[type?.toLowerCase()] || type || 'Other';
};
