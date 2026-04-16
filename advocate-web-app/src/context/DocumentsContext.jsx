import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { mockDocuments } from '../data/mockData';

const STORAGE_KEY = 'lexdesk-documents';

function cloneSeed() {
  return mockDocuments.map(d => ({ ...d }));
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return cloneSeed();
}

let idCounter = 0;
function nextDocId() {
  idCounter += 1;
  return `doc-${Date.now()}-${idCounter}`;
}

const DocumentsContext = createContext(null);

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocument = useCallback((payload) => {
    const doc = {
      id: nextDocId(),
      caseId: payload.caseId || null,
      clientId: payload.clientId,
      name: payload.name.trim(),
      type: payload.type || 'pdf',
      category: payload.category,
      uploadedBy: payload.uploadedBy,
      uploadedByName: payload.uploadedByName,
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: payload.size || '0.1 MB',
      visibility: payload.visibility,
      description: payload.description?.trim() || '',
    };
    setDocuments(prev => [...prev, doc]);
    return doc;
  }, []);

  const updateDocument = useCallback((id, patch) => {
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, ...patch } : d))
    );
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const toggleVisibility = useCallback((id) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, visibility: d.visibility === 'shared' ? 'private' : 'shared' }
          : d
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      toggleVisibility,
    }),
    [documents, addDocument, updateDocument, deleteDocument, toggleVisibility]
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentsProvider');
  return ctx;
}
