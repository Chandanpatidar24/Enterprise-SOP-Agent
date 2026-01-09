# OpsMind AI - Enterprise SOP Agent 🤖

An advanced, AI-powered knowledge management system for enterprise Standard Operating Procedures (SOPs). Transform your static PDFs into an interactive, conversational knowledge base with built-in security and scalability.

## 🚀 Key Features

*   **Premium Interactive UI**: Features a modern, Gemini-inspired dark mode with real-time cursor spotlight effects and high-end animations.
*   **Intelligent RAG Streaming**: Near-instant "typing" responses powered by Google Gemini and a high-performance Vector Search pipeline.
*   **Usage Policy Enforcement**: Automated limits for Free Trial users (max 3 users, 3 PDFs) to manage scalability.
*   **Security-First Auth**: Comprehensive JWT-based authentication with Role-Based Access Control (RBAC) and **manual password** override for admins.
*   **Modular Admin Dashboard**: Extracted component architecture for users and SOP management with instant permission toggles.
*   **Multi-Model Support**: Seamlessly switch between **OpsMind 4.0** (Gemini Pro), **4.2** (GPT-4), and **5.0** (Claude 3) capabilities.
*   **Cross-Org Isolation**: Strict data multi-tenancy ensures companies never see each other's private SOPs.
*   **Production Ready**: Fully containerized with Docker and Nginx, optimized for cloud deployment.


## 🛠️ Technology Stack

### Frontend
*   **React 19** (Vite + Architecture 2.0 with Custom Hooks)
*   **Tailwind CSS** + **Lucide Icons**
*   **Nginx** (Production server for optimized performance)

### Backend
*   **Node.js & Express v5**
*   **MongoDB Atlas** (Vector Search & Persistent Storage)
*   **Google Gemini AI** (Embeddings & Inference)
*   **JWT & Bcrypt** (Secure Authentication)

## 📦 Getting Started

### Option 1: Docker (Recommended)
The easiest way to run the entire stack:
1.  Ensure **Docker Desktop** is running.
2.  Run: `docker-compose up --build`
3.  Frontend: `http://localhost` | Backend: `http://localhost:5000`

### Option 2: Local Development
1.  **Backend**:
    ```bash
    cd Backend && npm install
    npm run dev # Port 5000
    ```
2.  **Frontend**:
    ```bash
    cd Frontend && npm install
    npm run dev # Port 5173
    ```

## 🌐 Live Preview
Visit the live application: [Enterprise SOP Agent on Render](https://enterprise-sop-agent-frontend.onrender.com/)

---
**Version**: 1.2.0 | *OpsMind AI – Empowering enterprise knowledge*

