import React, { useState, useEffect, useCallback } from 'react';
import { ListTodo, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { requireAuth, isLoggedIn } from '../lib/auth';
import { getTodos, toggleTodo, deleteTodo } from '../lib/api';
import Navbar from '../components/Navbar';
import TodoForm from '../components/TodoForm';
import Filters from '../components/Filters';
import TodoItem from '../components/TodoItem';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Todos() {
  const [isAuthenticated] = useState(() => isLoggedIn());
  const [todos, setTodos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    order: 'desc',
    limit: 10,
  });

  // Verify auth immediately
  useEffect(() => {
    requireAuth();
  }, []);

  // Fetch todos with current filters and pagination
  const fetchTodos = useCallback(async () => {
    if (!isLoggedIn()) return;
    setLoading(true);
    setError('');
    try {
      const res = await getTodos({
        ...filters,
        page,
      });
      setTodos(res?.todos || []);
      setTotal(res?.total || 0);
      setPages(res?.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [fetchTodos, isAuthenticated]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      sortBy: 'createdAt',
      order: 'desc',
      limit: 10,
    });
    setPage(1);
  }, []);

  const handleToggle = async (id) => {
    try {
      await toggleTodo(id);
      fetchTodos();
    } catch (err) {
      setError(err.message || 'Could not toggle todo');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setFeedbackMessage('Todo deleted successfully');
      setTimeout(() => setFeedbackMessage(''), 3000);
      fetchTodos();
    } catch (err) {
      setError(err.message || 'Could not delete todo');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  // Calculate quick stats
  const completedCount = todos.filter((t) => t.status === 'completed').length;
  const pendingCount = todos.filter((t) => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activePage="todos" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Tasks</span>
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your priorities, monitor deadlines, and stay organized.
            </p>
          </div>

          {/* Quick counters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{pendingCount} Pending</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{completedCount} Completed</span>
            </div>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedbackMessage && (
          <div className="mb-4 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
            {feedbackMessage}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {/* Add Todo Form */}
        <TodoForm onTodoCreated={fetchTodos} />

        {/* Search, Filters, and Sorting */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* List Content */}
        <div className="space-y-3">
          {loading && todos.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Spinner size="lg" className="text-indigo-600 mb-3" />
              <p className="text-sm font-medium text-slate-500">Loading your tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No tasks found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                {filters.search || filters.status || filters.priority
                  ? 'No tasks match your active filters. Try clearing or adjusting search criteria.'
                  : 'You have no tasks in your list yet. Click "Add New Task" above to get started!'}
              </p>
              {(filters.search || filters.status || filters.priority) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </main>
    </div>
  );
}
