import { getToken, clearAuth } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Universal fetch wrapper for API communication
 * - Appends Authorization: Bearer <token> if token exists
 * - Sets JSON headers automatically
 * - Handles 401 Unauthorized by clearing session and redirecting to /signin.html
 * - Throws errors formatted with backend message
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch {
    throw new Error('Unable to connect to server. Please check if backend is running.');
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    clearAuth();
    // Redirect if we are on a protected page
    if (!window.location.pathname.includes('signin.html') && !window.location.pathname.includes('signup.html')) {
      window.location.replace('/signin.html');
    }
  }

  // Parse JSON response
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || (typeof data === 'string' ? data : `Error ${response.status}: ${response.statusText}`);
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth APIs
export const signup = (payload) => {
  return request('/api/auth/signup', {
    method: 'POST',
    body: payload,
  });
};

export const signin = (payload) => {
  return request('/api/auth/signin', {
    method: 'POST',
    body: payload,
  });
};

export const getMe = () => {
  return request('/api/auth/me', {
    method: 'GET',
  });
};

// Todo APIs
export const getTodos = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return request(`/api/todos${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};

export const getTodo = (id) => {
  return request(`/api/todos/${id}`, {
    method: 'GET',
  });
};

export const createTodo = (todoData) => {
  return request('/api/todos', {
    method: 'POST',
    body: todoData,
  });
};

export const updateTodo = (id, todoData) => {
  return request(`/api/todos/${id}`, {
    method: 'PUT',
    body: todoData,
  });
};

export const toggleTodo = (id) => {
  return request(`/api/todos/${id}/toggle`, {
    method: 'PATCH',
  });
};

export const deleteTodo = (id) => {
  return request(`/api/todos/${id}`, {
    method: 'DELETE',
  });
};
