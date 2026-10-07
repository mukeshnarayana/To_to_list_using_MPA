# 📋 TaskFlow - Multi-Page Application (MPA) Frontend

A modern, fast, and responsive frontend for the To-Do List Application built as a **Multi-Page Application (MPA)** using **React 18**, **Vite**, and **Tailwind CSS**.

---

## ⚡ Tech Stack & Architecture

- **React 18**: Component-based UI for each page.
- **Vite Multi-Page Build**: Configured via `build.rollupOptions.input` with 5 distinct HTML entry points.
- **Tailwind CSS**: Modern utility-first styling with custom indigo theme and responsive design.
- **Lucide React**: Clean SVG icon system.
- **No SPA / No React Router**: True multi-page navigation using real page loads (`<a href="/signin.html">`, `window.location.href`).
- **Native Fetch**: Lightweight universal API layer using native `fetch` (no Axios).

---

## 📁 Multi-Page Project Structure

```text
Frontend/
├── index.html            # Main Tasks Dashboard (protected)
├── signup.html           # Account registration
├── signin.html           # Authentication & login
├── todo.html             # Single task detail & editor (?id=<todoId>)
├── profile.html          # User profile & task analytics
├── vite.config.js        # Multi-page configuration with Rollup inputs
├── tailwind.config.js    # Tailwind color palette & content paths
├── postcss.config.js     # PostCSS loader
├── .env.example          # Environment variables template
├── .env                  # Local environment file (VITE_API_URL)
└── src/
    ├── index.css         # Tailwind base, components, and utilities
    ├── main-index.jsx    # React root for index.html
    ├── main-signup.jsx   # React root for signup.html
    ├── main-signin.jsx   # React root for signin.html
    ├── main-todo.jsx     # React root for todo.html
    ├── main-profile.jsx  # React root for profile.html
    ├── pages/
    │   ├── Todos.jsx      # Main list, search, filter, pagination
    │   ├── Signup.jsx     # User registration with validations
    │   ├── Signin.jsx     # User login with JWT caching
    │   ├── TodoDetail.jsx # View, edit, toggle, and delete single task
    │   └── Profile.jsx    # User details and status breakdown
    ├── components/
    │   ├── Navbar.jsx       # Responsive header with active link indicators
    │   ├── TodoForm.jsx     # Collapsible task creation card
    │   ├── TodoItem.jsx     # Task card with checkboxes, badges, and modals
    │   ├── Filters.jsx      # 400ms debounced search, status, priority, sorting
    │   ├── Pagination.jsx   # Page controls & item indicators
    │   ├── Spinner.jsx      # Accessible SVG loading indicator
    │   ├── ErrorMessage.jsx # Dismissible alert banner
    │   └── ConfirmModal.jsx # Accessible delete confirmation modal
    └── lib/
        ├── auth.js          # LocalStorage token, session guards & redirection
        └── api.js           # Universal fetch wrapper with Bearer token injection
```

---

## ⚙️ Environment Configuration

Ensure `VITE_API_URL` points to your backend server:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```powershell
cd Frontend
npm install
```

### 2. Start Development Server
```powershell
npm run dev
```
Open **`http://localhost:3000/index.html`** in your browser.

> **Note on MPA Navigation**: Vite serves all HTML pages directly:
> - Dashboard: `http://localhost:3000/index.html`
> - Sign In: `http://localhost:3000/signin.html`
> - Sign Up: `http://localhost:3000/signup.html`
> - Task Detail: `http://localhost:3000/todo.html?id=<task_id>`
> - Profile: `http://localhost:3000/profile.html`

### 3. Production Build
```powershell
npm run build
```
This compiles all 5 HTML pages and assets into the `dist/` directory using Vite's Rollup multi-page bundler.
