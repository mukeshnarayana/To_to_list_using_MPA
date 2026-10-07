import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl shadow-xs ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div className="flex-1 font-medium">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
