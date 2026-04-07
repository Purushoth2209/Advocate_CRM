import { useState } from 'react';
import {
  FolderOpen, Search, Upload, Eye, EyeOff, Filter,
  FileText, Image, File, Download, Trash2, Share2,
  Lock, Users, Briefcase, ChevronDown, Plus,
} from 'lucide-react';
import { mockDocuments, mockClients, mockCases } from '../../data/mockData';

const fileIcon = (type) => {
  if (type === 'pdf') return { icon: FileText, bg: 'bg-red-50', color: 'text-red-500' };
  if (type === 'image') return { icon: Image, bg: 'bg-blue-50', color: 'text-blue-500' };
  return { icon: File, bg: 'bg-indigo-50', color: 'text-indigo-500' };
};

const categoryColors = {
  Petition: 'bg-blue-100 text-blue-700',
  Evidence: 'bg-green-100 text-green-700',
  'Court Notice': 'bg-amber-100 text-amber-700',
  'Court Order': 'bg-purple-100 text-purple-700',
  Identity: 'bg-gray-100 text-gray-700',
  Notes: 'bg-orange-100 text-orange-700',
  Research: 'bg-indigo-100 text-indigo-700',
};

export default function DocumentVault() {
  const [search, setSearch] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [filterCase, setFilterCase] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploadModal, setUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Evidence', caseId: '', visibility: 'shared', description: '' });

  const categories = [...new Set(mockDocuments.map(d => d.category))];

  const filtered = mockDocuments.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchVis = filterVisibility === 'all' || d.visibility === filterVisibility;
    const matchCase = filterCase === 'all' || d.caseId === filterCase;
    const matchCat = filterCategory === 'all' || d.category === filterCategory;
    return matchSearch && matchVis && matchCase && matchCat;
  });

  const shared = filtered.filter(d => d.visibility === 'shared');
  const privateOnly = filtered.filter(d => d.visibility === 'private');

  const handleUpload = (e) => {
    e.preventDefault();
    setUploadModal(false);
    setNewDoc({ name: '', category: 'Evidence', caseId: '', visibility: 'shared', description: '' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Document Vault</h2>
          <p className="text-sm text-gray-500 mt-0.5">{mockDocuments.length} documents · {mockDocuments.filter(d => d.visibility === 'shared').length} shared · {mockDocuments.filter(d => d.visibility === 'private').length} private</p>
        </div>
        <button onClick={() => setUploadModal(true)} className="btn-primary">
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
            <Users size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{mockDocuments.filter(d => d.visibility === 'shared').length}</p>
            <p className="text-xs text-gray-500">Shared with Client</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
            <Lock size={18} className="text-orange-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{mockDocuments.filter(d => d.visibility === 'private').length}</p>
            <p className="text-xs text-gray-500">Private (Advocate Only)</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <Briefcase size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{[...new Set(mockDocuments.map(d => d.caseId))].length}</p>
            <p className="text-xs text-gray-500">Cases with Docs</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <FolderOpen size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{categories.length}</p>
            <p className="text-xs text-gray-500">Categories</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="input pl-9"
          />
        </div>
        <select value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)} className="input w-auto">
          <option value="all">All Visibility</option>
          <option value="shared">Shared with Client</option>
          <option value="private">Private (Advocate Only)</option>
        </select>
        <select value={filterCase} onChange={e => setFilterCase(e.target.value)} className="input w-auto">
          <option value="all">All Cases</option>
          {mockCases.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input w-auto">
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Shared Documents Section */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Users size={16} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shared Documents</h3>
            <p className="text-xs text-gray-500">Visible to both advocate and client</p>
          </div>
          <span className="ml-auto badge bg-green-100 text-green-700">{shared.length} files</span>
        </div>
        <div className="divide-y divide-gray-50">
          {shared.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No shared documents.</div>
          )}
          {shared.map(doc => {
            const { icon: Icon, bg, color } = fileIcon(doc.type);
            const relatedCase = mockCases.find(c => c.id === doc.caseId);
            const relatedClient = mockClients.find(c => c.id === doc.clientId);
            return (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {relatedClient?.name} · {relatedCase?.title} · {doc.size}
                  </p>
                  <p className="text-xs text-gray-400">Uploaded by {doc.uploadedByName} on {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`badge text-xs hidden sm:inline-flex ${categoryColors[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                  {doc.category}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Download">
                    <Download size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-orange-50 rounded text-gray-500 hover:text-orange-600" title="Make Private">
                    <Lock size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Private Documents Section */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Lock size={16} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Private Documents</h3>
            <p className="text-xs text-gray-500">Advocate eyes only — not shared with clients</p>
          </div>
          <span className="ml-auto badge bg-orange-100 text-orange-700">{privateOnly.length} files</span>
        </div>
        <div className="divide-y divide-gray-50">
          {privateOnly.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No private documents.</div>
          )}
          {privateOnly.map(doc => {
            const { icon: Icon, bg, color } = fileIcon(doc.type);
            const relatedCase = mockCases.find(c => c.id === doc.caseId);
            const relatedClient = mockClients.find(c => c.id === doc.clientId);
            return (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <Lock size={12} className="text-orange-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {relatedClient?.name} · {relatedCase?.title} · {doc.size}
                  </p>
                  <p className="text-xs text-gray-400">Uploaded by {doc.uploadedByName} on {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`badge text-xs hidden sm:inline-flex ${categoryColors[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                  {doc.category}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Download">
                    <Download size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-green-50 rounded text-gray-500 hover:text-green-600" title="Share with Client">
                    <Share2 size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Upload Document</h3>
              <p className="text-xs text-gray-500 mt-0.5">Upload a document to a case — choose visibility carefully.</p>
            </div>
            <form onSubmit={handleUpload} className="px-6 py-5 space-y-4">
              {/* File drop zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-navy-400 transition-colors cursor-pointer">
                <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to browse or drag & drop files</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG — Max 25MB</p>
              </div>
              <div>
                <label className="label">Document Name</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Property Sale Deed.pdf"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={newDoc.category}
                    onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                    className="input"
                  >
                    {['Petition', 'Evidence', 'Court Notice', 'Court Order', 'Identity', 'Notes', 'Research'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Linked Case</label>
                  <select
                    value={newDoc.caseId}
                    onChange={e => setNewDoc({ ...newDoc, caseId: e.target.value })}
                    className="input"
                  >
                    <option value="">Select case...</option>
                    {mockCases.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${newDoc.visibility === 'shared' ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                    <input type="radio" name="visibility" value="shared" checked={newDoc.visibility === 'shared'} onChange={e => setNewDoc({ ...newDoc, visibility: e.target.value })} className="hidden" />
                    <Users size={18} className="text-green-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Shared</p>
                      <p className="text-xs text-gray-500">Client can see</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${newDoc.visibility === 'private' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" name="visibility" value="private" checked={newDoc.visibility === 'private'} onChange={e => setNewDoc({ ...newDoc, visibility: e.target.value })} className="hidden" />
                    <Lock size={18} className="text-orange-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Private</p>
                      <p className="text-xs text-gray-500">Advocate only</p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setUploadModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  <Upload size={15} /> Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
