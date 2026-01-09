# OpsMind AI - Enterprise Backend 🧠

The backbone of the OpsMind RAG system. Handles secure document processing, vector embeddings, and real-time AI inference.

## 🚀 Key Features

### **Security & Auth**
- **JWT Authentication**: Full user lifecycle management with encrypted sessions.
- **RBAC (Role Based Access Control)**: Strict filtering at the database layer to prevent unauthorized information retrieval.
- **Enterprise Multi-tenancy**: Support for organizational logic and tiered plans with strict data isolation.
- **Usage Limiting**: Dynamic enforcement of user and document caps based on organization plan (Free Trial: 3 Users/3 PDFs).


### **RAG Engine (Knowledge Hub)**
- **Intelligent Chunking**: Splits PDFs into optimized segments for pinpoint accuracy.
- **Vector Embeddings**: Integrated with Google Gemini `text-embedding-004`.
- **Streaming API**: High-performance SSE (Server-Sent Events) for real-time AI responses.
- **Automatic PDF Repair**: Handles malformed documents seamlessly using `pdf-lib`.
- **Centralized Logic**: Logic-less controllers with dedicated `Config` and `Utility` layers for limits and security.


## 🛠️ Tech Stack
- **API**: Node.js & Express v5
- **Database**: MongoDB Atlas (Vector Search enabled)
- **AI Models**: Google Gemini (Flash & Pro)
- **Containerization**: Docker (Node:20-slim)

## 📡 API Reference

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and get JWT | Public |
| `POST` | `/api/upload` | Upload and index a PDF | Admin/Manager |
| `POST` | `/api/sop/ask-stream` | **Streaming** RAG Chat | User/Admin |
| `DELETE` | `/api/admin/documents/:id` | Remove SOP from index | Admin |

## 🏁 Setup
1. `npm install`
2. Create `.env`: 
   `PORT=5000`, `MONGODB_URI=...`, `GEMINI_API_KEY=...`, `JWT_SECRET=...`
3. `npm run dev`

