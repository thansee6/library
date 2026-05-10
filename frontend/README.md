# Library Management System — Frontend

A responsive React-based frontend for the Library Management System. Built with Vite, Tailwind CSS, and Socket.IO for real-time features.

## Features

- **User Authentication** — Register, login, profile management
- **Book Catalog** — Browse, search, filter, and favorite books
- **Borrowing System** — Borrow and return books with real-time status updates
- **Subscription Payments** — Razorpay-integrated subscription management
- **Admin Dashboard** — Inventory, user, and borrowing management
- **Real-Time Chat** — Socket.IO powered support chat between users and admins
- **Responsive Design** — Mobile-first layout using Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

The development server will start at `http://localhost:5173`.

## Environment

The frontend connects to the backend API at `http://localhost:5000/api` by default. This can be configured in `src/utils/api.js`.
