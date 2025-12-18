# OpsMind AI - Context-Aware Corporate Knowledge Brain

OpsMind AI is an intelligent Agentic RAG (Retrieval Augmented Generation) system designed for large corporations to manage and query Standard Operating Procedures (SOPs). It parses complex PDF documents, generates semantic vector embeddings, and provides accurate, source-cited answers to employee queries.

---

## 🚀 Project Overview

The goal of this project is to build a "Corporate Knowledge Brain" that prevents hallucinations and ensures all AI responses are grounded in official corporate documentation.

### Core Features
- **RAG Pipeline**: Advanced PDF ingestion, chunking, and vectorization.
- **Vector Search**: High-performance semantic retrieval using MongoDB Atlas Vector Search.
- **Source Citation**: Transparent AI responses with direct links to source documents.
- **Admin Knowledge Base**: Dedicated interface for managing corporate SOPs.

---

## 🛠️ Tech Stack (Backend)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Vector Search enabled)
- **AI Engine**: Google Gemini (Text Embeddings)
- **File Handling**: Multer & PDF-Parse

---

## 📈 Roadmap & Progress

### Week 1: Knowledge Ingestion ✅
- [x] Backend architecture setup.
- [x] PDF Upload service with Multer.
- [x] Document parsing and text chunking logic.
- [x] Integration with Google Gemini for Vector Embeddings.
- [x] Secure storage of vectors in MongoDB Atlas.

### Week 2: Retrieval Engine (Upcoming)
- [ ] Query embedding generation.
- [ ] MongoDB Atlas Vector Search aggregation pipeline.
- [ ] Context window construction for LLM.

---

## ⚙️ Setup & Installation

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   cd Backend
   npm install
   ```
3. **Environment Setup**:
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. **Run the server**:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing the API

- **Upload PDF**: `POST /api/upload` (form-data with key `pdf`)
- **Health Check**: `GET /`

---
