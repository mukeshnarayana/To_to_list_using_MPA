import React, { useState } from 'react';
import { Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { signin, getMe } from '../lib/api';
import { setAuth, getUser, isLoggedIn } from '../lib/auth';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Signin() {
  const searchParams = new URLSearchParams(window.location.search);
  const isRegisteredSuccess = searchParams.get('registered') === 'true';
  const prefillEmail = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: prefillEmail,
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = getUser();
  const alreadyLoggedIn = isLoggedIn();

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const res = await signin({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = res?.token;
      if (!token) {
        throw new Error('Authentication succeeded but no token was provided.');
      }

      setAuth(token);

      // Fetch user profile to cache in localStorage
      try {
        const profileRes = await getMe();
        if (profileRes?.user) {
          setAuth(token, profileRes.user);
        }
      } catch {
        // Continue even if profile caching has minor network hiccup
      }

      // Redirect to main todos dashboard
      window.location.href = '/index.html';
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to access your todos and stay productive</p>
        </div>

        {/* Existing Session Notice */}
        {alreadyLoggedIn && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700 flex items-center justify-between">
            <span>Signed in as <strong>{currentUser?.name || 'current user'}</strong></span>
            <a href="/index.html" className="font-semibold underline hover:text-indigo-900">
              Go to Dashboard →
            </a>
          </div>
        )}

        {/* Registration Success Banner */}
        {isRegisteredSuccess && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Account created successfully! Please sign in with your credentials.</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          {apiError && (
            <div className="mb-6">
              <ErrorMessage message={apiError} onDismiss={() => setApiError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.password ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <a href="/signup.html" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
