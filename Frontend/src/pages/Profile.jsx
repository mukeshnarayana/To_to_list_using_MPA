import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, CheckCircle2, Clock, Activity, LogOut, ArrowRight } from 'lucide-react';
import { requireAuth, clearAuth, setAuth, isLoggedIn } from '../lib/auth';
import { getMe, getTodos } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAuthenticated] = useState(() => isLoggedIn());

  useEffect(() => {
    requireAuth();

    if (!isLoggedIn()) return;

    const loadProfileData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch current user details
        const meRes = await getMe();
        if (meRes?.user) {
          setProfile(meRes.user);
          // Keep cached user current
          setAuth(null, meRes.user);
        }

        // Fetch user tasks for status breakdown
        const todosRes = await getTodos({ limit: 1000 });
        const allTodos = todosRes?.todos || [];

        const completed = allTodos.filter((t) => t.status === 'completed').length;
        const inProgress = allTodos.filter((t) => t.status === 'in-progress').length;
        const pending = allTodos.filter((t) => t.status === 'pending').length;

        setStats({
          total: todosRes?.total || allTodos.length,
          completed,
          inProgress,
          pending,
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/signin.html';
  };

  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Initials for avatar
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const memberSinceFormatted = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
      })
    : 'Recently';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activePage="profile" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
          <p className="mt-1 text-sm text-slate-500">View your account information and task performance</p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Spinner size="lg" className="text-indigo-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-md shadow-indigo-100">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{profile?.name || 'User'}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Member since {memberSinceFormatted}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Productivity Analytics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Tasks Summary</span>
                </h3>
                <a
                  href="/index.html"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Go to tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700">Completion Rate</span>
                  <span className="text-indigo-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Total Tasks</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
                  <div className="text-xs font-medium text-emerald-600 mt-1">Completed</div>
                </div>

                <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-center">
                  <div className="text-2xl font-bold text-sky-700">{stats.inProgress}</div>
                  <div className="text-xs font-medium text-sky-600 mt-1">In Progress</div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                  <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
                  <div className="text-xs font-medium text-amber-600 mt-1">Pending</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
