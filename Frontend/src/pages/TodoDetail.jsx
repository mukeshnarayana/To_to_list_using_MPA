import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Save,
  X,
  Share2,
} from 'lucide-react';
import { requireAuth, isLoggedIn } from '../lib/auth';
import { getTodo, updateTodo, toggleTodo, deleteTodo } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';

export default function TodoDetail() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    tags: '',
  });

  // Extract ID from URL
  const todoId = new URLSearchParams(window.location.search).get('id');
  const [isAuthenticated] = useState(() => isLoggedIn());

  useEffect(() => {
    requireAuth();
  }, []);

  const fetchTodoDetails = useCallback(async () => {
    if (!todoId) {
      setError('No task ID specified in the URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getTodo(todoId);
      setTodo(data);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
      });
    } catch (err) {
      setError(err.message || 'Task not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    fetchTodoDetails();
  }, [fetchTodoDetails]);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      const updated = await toggleTodo(todoId);
      setTodo(updated);
      setEditForm((prev) => ({ ...prev, status: updated.status }));
    } catch (err) {
      setError(err.message || 'Could not toggle task status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const updated = await updateTodo(todoId, { status: newStatus });
      setTodo(updated);
      setEditForm((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message || 'Could not update task status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
        status: editForm.status,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
        tags: editForm.tags
          ? editForm.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const updated = await updateTodo(todoId, payload);
      setTodo(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await deleteTodo(todoId);
      window.location.href = '/index.html';
    } catch (err) {
      setError(err.message || 'Could not delete task');
      setDeleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const isCompleted = todo?.status === 'completed';
  const isOverdue =
    todo?.dueDate &&
    !isCompleted &&
    new Date(todo.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const priorityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusStyles = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    'in-progress': 'bg-sky-50 text-sky-700 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activePage="todos" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation back */}
        <div className="mb-6">
          <a
            href="/index.html"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tasks</span>
          </a>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Spinner size="lg" className="text-indigo-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading task details...</p>
          </div>
        ) : !todo ? (
          /* Missing or 404 Error State */
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Task Not Found</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              The task you are looking for might have been removed or does not belong to your account.
            </p>
            <a
              href="/index.html"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              Return to Tasks Dashboard
            </a>
          </div>
        ) : isEditing ? (
          /* Edit Mode Form */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Edit Task</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="work, urgent, personal"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {actionLoading && <Spinner size="sm" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Mode Card */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {/* Header & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    statusStyles[todo.status] || statusStyles.pending
                  }`}
                >
                  Status: {todo.status}
                </span>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    priorityStyles[todo.priority] || priorityStyles.medium
                  }`}
                >
                  Priority: {todo.priority}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="py-6">
              <h1
                className={`text-2xl font-bold tracking-tight text-slate-900 ${
                  isCompleted ? 'line-through text-slate-400' : ''
                }`}
              >
                {todo.title}
              </h1>

              {todo.description ? (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  {todo.description}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-slate-400">No additional description provided.</p>
              )}
            </div>

            {/* Quick Actions (Toggle / Status Changer) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70 mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleToggle}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleted ? 'Completed (Click to Reopen)' : 'Mark as Completed'}</span>
                </button>
              </div>

              {/* Status Switcher Dropdown */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">Change Status:</span>
                <select
                  value={todo.status}
                  disabled={actionLoading}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Metadata (Due Date, Tags, Timestamps) */}
            <div className="space-y-4 pt-2">
              {/* Due Date & Overdue */}
              {todo.dueDate && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 w-24">Due Date:</span>
                  <div
                    className={`inline-flex items-center gap-1.5 font-medium px-2 py-1 rounded-md ${
                      isOverdue
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    <span>{new Date(todo.dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {isOverdue && <span className="text-[10px] uppercase tracking-wider font-bold">(Overdue)</span>}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 w-24 mt-1">Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(todo.tags) && todo.tags.length > 0 ? (
                    todo.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium text-xs"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </div>
              </div>

              {/* Created & Updated Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-4 border-t border-slate-100">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(todo.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(todo.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${todo?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
