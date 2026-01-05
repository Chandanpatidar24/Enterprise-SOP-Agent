# OpsMind AI - Frontend (React + Vite) 🎨

This directory contains the React-based user interface for the OpsMind AI SOP Agent. It features a modern, Gemini-inspired dark theme and real-time interaction with the backend RAG pipeline.

## 🚀 Key Features
- **Dynamic Chat Interface**: Seamless communication with the AI assistant.
- **Admin Knowledge Base**: Manage uploaded documents and view indexing status.
- **Deep PDF Support**: High-performance UI for handling complex document structures.
- **Real-time Source Citations**: Interactive links to document pages for transparency.

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `Frontend` directory:
```env
VITE_API_URL=http://localhost:5001
```
> [!NOTE]
> During deployment (Vercel/Render), change this to your live backend URL.

### 3. Start Development Server
```bash
npm run dev
```

---

## 🏗️ Architecture Note
The frontend is built using **Vite** for optimized development and production builds. It uses **Tailwind CSS** for styling and **React** for enterprise-grade iconography.

---
*OpsMind AI – Empowering enterprise knowledge with AI*