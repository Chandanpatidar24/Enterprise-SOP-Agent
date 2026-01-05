# Enterprise SOP Agent 🤖

An advanced, AI-powered knowledge management system for enterprise Standard Operating Procedures (SOPs). This agent allows employees to query internal documents using natural language, receiving accurate, context-aware answers guarded by strict Role-Based Access Control (RBAC).

## 🚀 Key Features

*   **Intelligent RAG Chat**: Ask questions and get answers derived *only* from your uploaded documents.
*   **Role-Based Security**: 
    *   **Employees**: Access general policies.
    *   **Managers**: Access to management protocols.
    *   **Admins**: Full system visibility.
    *   *Note: Detailed vector-level filtering ensures users never retrieve data they aren't authorized to see.*
*   **System Admin Panel**:
    *   **User Management**: create users and assign roles.
    *   **SOP Management**: Upload PDFs, set Categories, Versions, and Access Levels easily.
    *   **Live Updates**: Changes to document access reflect immediately in the search.
*   **Multi-Model Support**: Switch between **Gemini Pro**, **GPT-4**, and **Claude 3 Opus** for different reasoning capabilities.
*   **Auditability**: "Explain Sources" mode shows exactly which page and document generated the answer.

## 🛠️ Technology Stack

### Frontend
*   **React 19** (Vite)
*   **Tailwind CSS v4** + **Lucide Icons**
*   **Features/Components**:
    *   `AdminPanel`: Full CRUD for Documents & Users.
    *   `ChatView`: Real-time streaming chat interface.
    *   `KnowledgeBaseView`: Browse accessible documents.

### Backend
*   **Node.js & Express v5**
*   **MongoDB Atlas** (Vector Search)
*   **Google Gemini AI** (Embeddings & Inference)
*   **PDF Processing**: `pdf-parse` for text extraction and chunking.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account (Cluster with Vector Search enabled)
*   Google Cloud API Key (Gemini)

### 1. Backend Setup
```bash
cd Backend
npm install

# Create .env file
echo "PORT=5001
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_api_key
JWT_SECRET=your_jwt_secret" > .env

# Run Server
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5001" > .env

# Run Client
npm run dev
```

## 📚 Usage Guide

1.  **Login**: Use default admin credentials (check seeding script) or register a new user.
2.  **Admin Panel**:
    *   Go to `/admin` or click "Admin Panel" in the sidebar.
    *   **Upload SOP**: Click "Upload SOP", select a PDF, choose the Role (e.g., 'Manager'), and Upload.
    *   **Manage Access**: Click the Check/Cross icons in the table to toggle access instantly.
    *   **Delete**: Remove outdated documents with the Trash icon.
3.  **Chat**:
    *   Go to "New Chat".
    *   Select your Model:
        *   **OpsMind 4.0** (Gemini Pro) - *Default*
        *   **OpsMind 4.2** (GPT-4) - *Advanced Reasoning*
        *   **OpsMind 5.0** (Claude 3 Opus) - *Expert Analysis*
    *   Ask: "What is the policy on remote work?"
    *   Review sources if needed.

## 🔒 Security Note
This system uses a **Security-First RAG** approach. The Backend validates the user's role and strictly filters the Vector Search query. It is impossible for a user to semantically search for limited-access content.

---
**Version**: 1.0.0
