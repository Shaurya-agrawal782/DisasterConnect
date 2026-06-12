import React from 'react';

export default function MetricCard({ 
  label, 
  value, 
  helperText, 
  icon: iconName, 
  accentStyle = 'text-primary', 
  iconBgStyle = 'bg-primary-container/10 text-primary' 
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex items-start justify-between hover:border-outline transition duration-200">
      <div className="flex-1 min-w-0 text-left">
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider truncate">{label}</p>
        <h3 className={`font-headline-lg text-headline-lg mt-1 font-bold truncate ${accentStyle}`}>
          {value !== undefined ? value : '0'}
        </h3>
        {helperText && (
          <p className="text-xxs text-on-surface-variant mt-1.5 truncate">
            {helperText}
          </p>
        )}
      </div>
      {iconName && (
        <div className={`p-2 rounded shrink-0 flex items-center justify-center ${iconBgStyle}`}>
          <span className="material-symbols-outlined text-[24px]">{iconName}</span>
        </div>
      )}
    </div>
  );
}
