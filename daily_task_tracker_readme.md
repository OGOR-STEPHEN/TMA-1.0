# Daily Task Tracker

A clean, modern **task management web application** built with React and Firebase, designed with a strong focus on UX, performance, and real‑world application structure. This project demonstrates end‑to‑end product thinking — from authentication and state management to persistence, UI consistency, and scalability.

---

## ✨ Features

### 🔐 Authentication
- Secure user authentication using **Firebase Auth**
- Protected routes (dashboard, settings, profile)
- Automatic redirect handling (login ↔ app)

### 📋 Task Management
- Create, update, delete tasks
- Mark tasks as completed
- Real‑time task updates
- Loading states while fetching data
- Empty state messaging for better UX
- Disabled actions during async operations
- Delete confirmation for safety

### 🎨 UI / UX
- Clean dashboard layout
- Consistent color scheme across all pages
- Reusable components
- Lucide‑react icons
- Hover and interaction states
- Responsive layout

### ⚙️ Settings
- Theme toggle (light / dark mode)
- Task display preferences
- Data actions (clear completed tasks)
- Immediate application of changes

### 👤 Profile
- View and edit user profile information
- Firebase‑persisted user data
- Logout handling
- Clean, card‑based layout

---

## 🧠 Design Philosophy

This project prioritizes:
- **Clarity over complexity**
- **Realistic production patterns** (not demo‑only shortcuts)
- **User‑first UX decisions**
- **Maintainable component structure**

The UI follows a minimalist, soft‑contrast design with subtle shadows, spacing, and modern typography to keep the interface calm and focused.

---

## 🛠️ Tech Stack

- **Frontend:** React
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend / Services:** Firebase
  - Authentication
  - Firestore (data persistence)
- **State Management:** React hooks & context

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Dashboard, Settings, Profile, Auth
├── context/           # Global state (theme, auth, preferences)
├── services/          # Firebase configuration & helpers
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
└── App.jsx            # App entry point & routing
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Firebase project

### Installation

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore** database
4. Add your Firebase config to the project

```js
// firebase.js
export const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};
```

---

## 📌 Status

✅ **Phase 1 — Foundation:** Complete  
✅ **Phase 2 — Stability & Persistence:** Complete  
🧊 **Project Status:** Frozen

This project is considered feature‑complete and is no longer under active development.

---

## 🧪 What This Project Demonstrates

- Practical React architecture
- Firebase integration in a real app
- UX‑focused feature decisions
- Clean, readable code structure
- Product‑level thinking beyond tutorials

---

## 🧑‍💻 Author

**OGOR STEPHEN**  
Software Engineer

---

## 📄 License

This project is for educational and portfolio purposes.

