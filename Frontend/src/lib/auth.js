// Authentication helpers using localStorage for Multi-Page Application (MPA)

const TOKEN_KEY = 'todo_app_token';
const USER_KEY = 'todo_app_user';

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return null;
  }
  return token;
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && raw !== 'undefined' && raw !== 'null' ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuth = (token, user = null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => {
  return Boolean(getToken());
};

// Route protection: call on protected pages
export const requireAuth = () => {
  if (!isLoggedIn()) {
    window.location.replace('/signin.html');
    return false;
  }
  return true;
};

// Redirect to dashboard if logged in
export const redirectIfLoggedIn = () => {
  if (isLoggedIn()) {
    window.location.replace('/index.html');
    return true;
  }
  return false;
};
