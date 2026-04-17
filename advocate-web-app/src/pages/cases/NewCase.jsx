import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { mockClients, mockAdvocates, caseStatusOptions, caseTypeOptions } from '../../data/mockData';
import { useCases } from '../../context/CasesContext';

export default function NewCase() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preClient = searchParams.get('client') || '';
  const { addCase } = useCases();

  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [cnr, setCnr] = useState('');
  const [type, setType] = useState(caseTypeOptions[0]);
  const [court, setCourt] = useState('');
  const [clientId, setClientId] = useState(preClient);
  const [assignedAdvocateId, setAssignedAdvocateId] = useState('');
  const [status, setStatus] = useState('Active');
  const [priority, setPriority] = useState('medium');
  const [filedDate, setFiledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [nextHearing, setNextHearing] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const defaultAdvocate = useMemo(() => {
    if (!clientId) return '';
    const c = mockClients.find((cl) => cl.id === clientId);
    return c?.assignedAdvocateId || '';
  }, [clientId]);

  function handleClientChange(id) {
    setClientId(id);
    const c = mockClients.find((cl) => cl.id === id);
    if (c?.assignedAdvocateId) setAssignedAdvocateId(c.assignedAdvocateId);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Enter a case title.');
      return;
    }
    if (!clientId) {
      setError('Select a client.');
      return;
    }
    const advId = assignedAdvocateId || defaultAdvocate;
    if (!advId) {
      setError('Select an advocate.');
      return;
    }
    const created = addCase({
      title,
      caseNumber,
      cnr,
      type,
      court,
      clientId,
      assignedAdvocateId: advId,
      status,
      priority,
      filedDate,
      nextHearing: nextHearing || null,
      description,
    });
    navigate(`/cases/${created.id}`, { replace: true });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/cases" className="btn-secondary px-3 py-2" title="Back to cases">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">New case</h2>
          <p className="text-sm text-gray-500">Register a matter and open its case file.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
            <Scale size={20} className="text-navy-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Matter details</p>
            <p className="text-xs text-gray-500">Stored locally in this browser (demo).</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Case title *</label>
          <input
            className="input w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kumar vs State of Tamil Nadu"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Case number (optional)</label>
            <input
              className="input w-full text-sm"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g. OS 123/2024, diary no."
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">CNR (optional)</label>
            <input
              className="input w-full font-mono text-sm"
              value={cnr}
              onChange={(e) => setCnr(e.target.value)}
              placeholder="National case number if known"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Case type</label>
            <select className="input w-full" value={type} onChange={(e) => setType(e.target.value)}>
              {caseTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Court</label>
          <input
            className="input w-full"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            placeholder="e.g. City Civil Court, Chennai"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Client *</label>
            <select className="input w-full" value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
              <option value="">Select client</option>
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Assigned advocate *</label>
            <select
              className="input w-full"
              value={assignedAdvocateId || defaultAdvocate}
              onChange={(e) => setAssignedAdvocateId(e.target.value)}
            >
              <option value="">Select advocate</option>
              {mockAdvocates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
            <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              {caseStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
            <select className="input w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Filed date</label>
            <input
              type="date"
              className="input w-full"
              value={filedDate}
              onChange={(e) => setFiledDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Next hearing (optional)</label>
          <input
            type="date"
            className="input w-full max-w-xs"
            value={nextHearing}
            onChange={(e) => setNextHearing(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
          <textarea
            className="input w-full min-h-[88px] py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of the dispute…"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className="btn-primary">
            Create case & open
          </button>
          <Link to="/cases" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
