import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Briefcase, FileText,
  CalendarDays, MessageSquare, Edit2, Trash2, Plus, Scale,
  ChevronRight, Download,
} from 'lucide-react';
import { mockClients, mockAppointments, mockAdvocates } from '../../data/mockData';
import { useCases } from '../../context/CasesContext';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentsContext';
import DocumentFormModal from '../../components/documents/DocumentFormModal';
import Tooltip from '../../components/ui/Tooltip';
import { downloadDocumentPlaceholder } from '../../utils/documentDownload';

const statusColors = {
  'Hearing Scheduled': 'bg-blue-100 text-blue-700',
  'Judgment Pending': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Active': 'bg-green-100 text-green-700',
  'Discovery Phase': 'bg-indigo-100 text-indigo-700',
};

const TABS = ['Overview', 'Cases', 'Documents', 'Appointments', 'Notes'];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, addDocument, updateDocument, deleteDocument } = useDocuments();
  const { cases: allCases } = useCases();
  const [activeTab, setActiveTab] = useState('Overview');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const client = mockClients.find(c => c.id === id);
  if (!client) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Client not found.</p>
      <Link to="/clients" className="btn-primary mt-4 inline-flex">Back to Clients</Link>
    </div>
  );

  const advocate = mockAdvocates.find(a => a.id === client.assignedAdvocateId);
  const cases = allCases.filter(c => c.clientId === client.id);
  const docs = documents.filter(d => d.clientId === client.id);
  const appointments = mockAppointments.filter(a => a.clientId === client.id);

  const caseOptions = cases.map(c => ({ id: c.id, title: c.title }));

  const handleDocumentSave = (payload) => {
    if (editingDoc) {
      updateDocument(editingDoc.id, {
        name: payload.name,
        category: payload.category,
        caseId: payload.caseId,
        visibility: payload.visibility,
        description: payload.description,
        type: payload.type,
      });
    } else {
      addDocument({
        ...payload,
        uploadedBy: user.id,
        uploadedByName: user.name,
        size: '0.1 MB',
      });
    }
    setEditingDoc(null);
  };

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Tooltip content="Go back to the previous page" side="bottom">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary px-3 py-2"
          >
            <ArrowLeft size={16} />
          </button>
        </Tooltip>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">{client.name}</h2>
            <span className={`badge text-xs ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {client.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{client.occupation} · {client.city}</p>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Edit client profile (coming soon)" side="bottom">
            <button type="button" className="btn-secondary">
              <Edit2 size={15} /> Edit
            </button>
          </Tooltip>
          <Tooltip content="Open chat with this client" side="bottom">
            <Link to={`/chat?client=${client.id}`} className="btn-primary">
              <MessageSquare size={15} /> Message
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Profile + stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Profile card */}
        <div className="card p-5 lg:col-span-1">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-navy-600 to-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">
                {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{client.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{client.occupation}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone size={13} className="text-gray-400 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
            {client.alternatePhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone size={13} className="text-gray-400 flex-shrink-0" />
                <span>{client.alternatePhone} (Alt)</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <MapPin size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{client.address}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">ID Type</span>
              <span className="text-gray-700 font-medium">{client.idType}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">ID Number</span>
              <span className="text-gray-700 font-medium font-mono">{client.idNumber}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Client Since</span>
              <span className="text-gray-700 font-medium">{new Date(client.joinedDate).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          {advocate && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-2">Assigned Advocate</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-700 text-xs font-bold">
                    {advocate.name.replace('Adv. ', '')[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{advocate.name}</p>
                  <p className="text-xs text-gray-500">{advocate.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Cases</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{docs.length}</p>
              <p className="text-xs text-gray-500 mt-1">Documents</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              <p className="text-xs text-gray-500 mt-1">Appointments</p>
            </div>
          </div>

          {/* Tags */}
          <div className="card p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Practice Areas</p>
            <div className="flex gap-2 flex-wrap">
              {client.tags.map(tag => (
                <span key={tag} className="badge bg-navy-50 text-navy-700">{tag}</span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="card p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Internal Notes</p>
              <p className="text-sm text-gray-700">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-100 px-5">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-navy-700 text-navy-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Cases tab */}
          {activeTab === 'Cases' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Tooltip content="Open new case for this client" side="bottom">
                  <Link to={`/cases/new?client=${client.id}`} className="btn-primary text-xs">
                    <Plus size={14} /> New Case
                  </Link>
                </Tooltip>
              </div>
              {cases.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No cases found.</p>}
              {cases.map(c => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scale size={18} className="text-navy-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.type} · {c.court}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`badge text-xs ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                    <p className="text-xs text-gray-400 mt-1">
                      {c.nextHearing ? `Next: ${new Date(c.nextHearing).toLocaleDateString('en-IN')}` : 'No hearing'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Documents tab */}
          {activeTab === 'Documents' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Tooltip content="Add a document to this client's file" side="bottom">
                  <button
                    type="button"
                    onClick={() => { setEditingDoc(null); setDocModalOpen(true); }}
                    className="btn-primary text-xs"
                  >
                    <Plus size={14} /> Upload Document
                  </button>
                </Tooltip>
              </div>
              {docs.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No documents uploaded.</p>}
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    doc.type === 'pdf' ? 'bg-red-100' : doc.type === 'image' ? 'bg-blue-100' : 'bg-indigo-100'
                  }`}>
                    <FileText size={16} className={
                      doc.type === 'pdf' ? 'text-red-600' : doc.type === 'image' ? 'text-blue-600' : 'text-indigo-600'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.category} · {doc.size} · {doc.uploadedByName}</p>
                    {doc.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{doc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`badge text-xs ${doc.visibility === 'shared' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {doc.visibility === 'shared' ? 'Shared' : 'Private'}
                    </span>
                    <Tooltip content="Download sample file (demo)" side="bottom">
                      <button
                        type="button"
                        onClick={() => downloadDocumentPlaceholder(doc)}
                        className="p-1.5 rounded-lg hover:bg-white text-gray-500"
                      >
                        <Download size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Edit document details" side="bottom">
                      <button
                        type="button"
                        onClick={() => { setEditingDoc(doc); setDocModalOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-white text-gray-500"
                      >
                        <Edit2 size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Remove from list" side="bottom">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-white text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}

              <DocumentFormModal
                open={docModalOpen}
                onClose={() => { setDocModalOpen(false); setEditingDoc(null); }}
                title={editingDoc ? 'Edit document' : 'Upload document'}
                submitLabel={editingDoc ? 'Save' : 'Add'}
                clientId={client.id}
                caseOptions={caseOptions}
                initial={editingDoc}
                onSubmit={handleDocumentSave}
              />

              {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
                  <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                    <p className="text-sm font-medium text-gray-900">Delete this document?</p>
                    <p className="text-xs text-gray-500 mt-1">This cannot be undone in the demo.</p>
                    <div className="flex gap-2 mt-4 justify-end">
                      <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={() => setDeleteConfirmId(null)}>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary bg-red-600 hover:bg-red-700 border-red-600"
                        onClick={() => {
                          deleteDocument(deleteConfirmId);
                          setDeleteConfirmId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appointments tab */}
          {activeTab === 'Appointments' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Tooltip content="Book an appointment with this client" side="bottom">
                  <Link to={`/appointments/new?client=${client.id}`} className="btn-primary text-xs">
                    <Plus size={14} /> Schedule Appointment
                  </Link>
                </Tooltip>
              </div>
              {appointments.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No appointments scheduled.</p>}
              {appointments.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={16} className="text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{a.purpose}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(a.date).toLocaleDateString('en-IN')} · {a.time} · {a.duration} min · {a.type}
                    </p>
                    <p className="text-xs text-gray-500">{a.location}</p>
                  </div>
                  <span className={`badge text-xs ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Overview tab */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Cases</h4>
                <div className="space-y-2">
                  {cases.slice(0, 3).map(c => (
                    <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <Scale size={14} className="text-navy-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1 truncate">{c.title}</span>
                      <span className={`badge text-xs ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                    </Link>
                  ))}
                  {cases.length === 0 && <p className="text-sm text-gray-400">No cases yet.</p>}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming Appointments</h4>
                <div className="space-y-2">
                  {appointments.filter(a => a.status !== 'completed').slice(0, 3).map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg">
                      <CalendarDays size={14} className="text-amber-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{a.purpose}</p>
                        <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-IN')} · {a.time}</p>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-sm text-gray-400">No appointments yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Notes tab */}
          {activeTab === 'Notes' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Tooltip content="Add a note row (demo)" side="bottom">
                  <button type="button" className="btn-primary text-xs">
                    <Plus size={14} /> Add Note
                  </button>
                </Tooltip>
              </div>
              <textarea
                defaultValue={client.notes}
                className="input min-h-32 resize-none"
                placeholder="Add internal notes about this client..."
              />
              <Tooltip content="Save notes locally (demo)" side="bottom">
                <button type="button" className="btn-primary text-xs">
                  Save Notes
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
