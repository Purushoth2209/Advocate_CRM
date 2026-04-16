import { useState, useEffect } from 'react';
import { Upload, Users, Lock, X } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const CATEGORIES = ['Petition', 'Evidence', 'Court Notice', 'Court Order', 'Identity', 'Notes', 'Research'];

function inferType(name) {
  const lower = (name || '').toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(lower)) return 'image';
  if (/\.pdf$/i.test(lower)) return 'pdf';
  return 'doc';
}

export default function DocumentFormModal({
  open,
  onClose,
  title,
  submitLabel,
  clientId,
  caseOptions,
  initial,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Evidence');
  const [caseId, setCaseId] = useState('');
  const [visibility, setVisibility] = useState('shared');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name || '');
      setCategory(initial.category || 'Evidence');
      setCaseId(initial.caseId || '');
      setVisibility(initial.visibility || 'shared');
      setDescription(initial.description || '');
    } else {
      setName('');
      setCategory('Evidence');
      setCaseId(caseOptions?.[0]?.id || '');
      setVisibility('shared');
      setDescription('');
    }
  }, [open, initial, caseOptions]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category,
      caseId: caseId || null,
      clientId,
      visibility,
      description: description.trim(),
      type: inferType(name.trim()),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Metadata is stored locally for this demo.</p>
          </div>
          <Tooltip content="Close" side="bottom">
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </Tooltip>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload size={22} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Name the file below — binary upload would connect to storage in production.</p>
          </div>
          <div>
            <label className="label">Document name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Affidavit.pdf"
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Linked case</label>
              <select value={caseId} onChange={e => setCaseId(e.target.value)} className="input">
                <option value="">None</option>
                {caseOptions?.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${visibility === 'shared' ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="vis" checked={visibility === 'shared'} onChange={() => setVisibility('shared')} className="hidden" />
                <Users size={18} className="text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Shared</p>
                  <p className="text-xs text-gray-500">Client can see</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${visibility === 'private' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                <input type="radio" name="vis" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="hidden" />
                <Lock size={18} className="text-orange-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Private</p>
                  <p className="text-xs text-gray-500">Advocate only</p>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes"
              rows={2}
              className="input min-h-[72px] resize-y"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" title="Close without saving" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" title="Save document metadata" className="btn-primary flex-1 justify-center">
              <Upload size={15} /> {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
