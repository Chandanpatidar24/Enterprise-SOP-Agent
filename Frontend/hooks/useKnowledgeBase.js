import { useState, useEffect } from 'react';

export const useKnowledgeBase = (token, user, t) => {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    // Fetch documents (authorized only)
    const fetchDocuments = async () => {
        if (!user?.role || !token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sop/documents?userRole=${user.role}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) setDocuments(data.documents);
        } catch (err) {
            console.error('Error fetching docs:', err);
        }
    };

    const handleFileChange = async (event, view) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('accessLevel', 'employee'); // Default

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setUploadStatus('success');
                setTimeout(() => setUploadStatus(null), 3000);
                if (view === 'admin') fetchDocuments();
                return true;
            } else {
                alert(data.message || t.uploadFailed);
                return false;
            }
        } catch (err) {
            alert(t.uploadFailed);
            return false;
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const deleteDoc = async (filename) => {
        if (!confirm(`${t.deleteConfirm} ${filename}?`)) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchDocuments();
                return true;
            }
            return false;
        } catch (err) {
            alert(t.deleteFailed);
            return false;
        }
    };

    return {
        documents,
        setDocuments,
        uploading,
        uploadStatus,
        fetchDocuments,
        handleFileChange,
        deleteDoc
    };
};
