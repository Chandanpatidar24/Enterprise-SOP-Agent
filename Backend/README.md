# OpsMind AI - Enterprise Backend (Weeks 1-3)

A professional, enterprise-grade RAG (Retrieval-Augmented Generation) backend for managing and querying Standard Operating Procedures (SOPs).

## 🚀 Features

### **Week 1: Knowledge Ingestion**
- **PDF Repair & Parsing**: Automatic repair of malformed PDFs using `pdf-lib` and text extraction via `pdf-parse`.
- **Intelligent Chunking**: Splits documents into manageable segments (1000 chars) with overlap for context retention.
- **Vector Embeddings**: Uses Google Gemini (`text-embedding-004`) to generate 768-dimensional vectors.
- **Atlas Storage**: Persistent storage of text and vectors in MongoDB Atlas.

### **Week 2: Retrieval Engine**
- **Vector Search**: High-performance similarity search using MongoDB Atlas Vector Search ($vectorSearch).
- **Page-Aware Storage**: Chunks are mapped to specific PDF page numbers for precise source citation.
- **Metadata Management**: Optimized search scores and document tracking.

### **Week 3: Chat Agent & Admin**
- **RAG Chat**: Context-aware AI responses using Gemini 1.5 Flash.
- **Source Citation**: The AI explicitly cites its sources (e.g., "According to Policy.pdf, Page 4").
- **Hallucination Control**: Strict systemic rules to prevent the AI from making up information.
- **Admin API**: Endpoints to list all indexed documents and delete them to trigger re-indexing.

## 🛠️ Tech Stack
- **Runtime**: Node.js & Express
- **Database**: MongoDB Atlas (with Vector Search)
- **AI**: Google Generative AI (Gemini)
- **PDF**: pdf-parse, pdf-lib
- **Storage**: local ephemeral storage (with automatic cleanup)

## 🏁 Quick Start

### 1. Environment Variables
Create a `.env` file in the root:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## 📡 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Upload and index a PDF file |
| `POST` | `/api/search` | Search for relevant chunks |
| `POST` | `/api/chat` | Chat with the AI about SOPs |
| `GET` | `/api/admin/documents` | List all indexed SOP files |
| `DELETE` | `/api/admin/documents/:filename` | Delete an SOP from the library |

## 🧪 Testing
Check the `full_testing_walkthrough.md` in the documentation folder for detailed Postman instructions.
