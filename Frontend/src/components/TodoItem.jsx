import React, { useState } from 'react';
import { Check, Calendar, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import Spinner from './Spinner';

export default function TodoItem({ todo, onToggle, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isCompleted = todo.status === 'completed';

  // Check if task is overdue
  const isOverdue =
    todo.dueDate &&
    !isCompleted &&
    new Date(todo.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  // Format due date nicely
  const formattedDueDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year:
          new Date(todo.dueDate).getFullYear() !== new Date().getFullYear()
            ? 'numeric'
            : undefined,
      })
    : null;

  // Priority color badges
  const priorityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  // Status color badges
  const statusStyles = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    'in-progress': 'bg-sky-50 text-sky-700 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const handleToggleClick = async () => {
    setIsToggling(true);
    try {
      await onToggle(todo._id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo._id);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`group flex items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border transition-all duration-150 ${
          isCompleted
            ? 'border-slate-200/60 bg-slate-50/50'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Custom Checkbox */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={isToggling}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            className={`mt-0.5 sm:mt-0 flex items-center justify-center w-5 h-5 rounded-lg border transition-all shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-indigo-500 bg-white'
            }`}
          >
            {isToggling ? (
              <Spinner size="sm" className="text-indigo-600" />
            ) : isCompleted ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : null}
          </button>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/todo.html?id=${todo._id}`}
                className={`text-sm font-semibold hover:text-indigo-600 transition-colors truncate max-w-xs sm:max-w-md ${
                  isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {todo.title}
              </a>

              {/* Priority badge */}
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  priorityStyles[todo.priority] || priorityStyles.medium
                }`}
              >
                {todo.priority}
              </span>

              {/* Status badge */}
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  statusStyles[todo.status] || statusStyles.pending
                }`}
              >
                {todo.status}
              </span>
            </div>

            {/* Description preview */}
            {todo.description && (
              <p
                className={`mt-1 text-xs line-clamp-1 ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-slate-500'
                }`}
              >
                {todo.description}
              </p>
            )}

            {/* Meta Row (Due Date + Tags) */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs">
              {/* Due Date */}
              {formattedDueDate && (
                <div
                  className={`inline-flex items-center gap-1 font-medium ${
                    isOverdue
                      ? 'text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200'
                      : 'text-slate-500'
                  }`}
                  title={isOverdue ? 'This task is overdue!' : 'Due Date'}
                >
                  {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  <span>{formattedDueDate}</span>
                  {isOverdue && <span className="font-bold text-[10px] uppercase tracking-wider">(Overdue)</span>}
                </div>
              )}

              {/* Tags */}
              {Array.isArray(todo.tags) &&
                todo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 self-start sm:self-center shrink-0">
          <a
            href={`/todo.html?id=${todo._id}`}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            title="Delete task"
            aria-label="Delete task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${todo.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
