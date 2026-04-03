import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Calendar, Upload, Clock, CheckCircle, Circle, Send, Tag, Download } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockCases } from '../../data/mockData';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const tabs = ['Overview', 'Timeline', 'Documents', 'Chat', 'Hearings'];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [message, setMessage] = useState('');

  const caseData = mockCases.find(c => c.id === id);
  if (!caseData) return <div className="p-4 text-center text-gray-500">Case not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title={caseData.title} showBack />

      {/* Case Header Card */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={caseData.status} />
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{caseData.type}</span>
        </div>
        <p className="text-xs text-gray-500">{caseData.court}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
          <span>CNR: <span className="font-mono text-gray-600">{caseData.cnr}</span></span>
          <span>Filed: {formatDate(caseData.filedDate)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
              {caseData.advocate.split(' ').pop()[0]}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">{caseData.advocate}</p>
              <p className="text-[10px] text-gray-400">Your Advocate</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/cases/book-appointment')}
            className="text-xs bg-primary-50 text-primary-600 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <Calendar size={12} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <Card>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Case Details</h4>
              {[
                { label: 'Case Type', value: caseData.type },
                { label: 'Court', value: caseData.court },
                { label: 'Filed Date', value: formatDate(caseData.filedDate) },
                { label: 'Next Hearing', value: formatDate(caseData.nextHearing) },
                { label: 'Last Updated', value: formatDate(caseData.lastUpdated) },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className="text-xs font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
            </Card>
            <Card className="bg-amber-50 border-amber-100">
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Hearing in {Math.ceil((new Date(caseData.nextHearing) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                  <p className="text-xs text-amber-600 mt-0.5">{formatDate(caseData.nextHearing)} · {caseData.court}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'Timeline' && (
          <div className="space-y-0">
            <p className="text-xs text-gray-500 mb-4">Complete history of your case</p>
            {caseData.timeline.map((event, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.type === 'upcoming' ? 'bg-blue-100' : 'bg-primary-100'
                  }`}>
                    {event.type === 'upcoming'
                      ? <Circle size={14} className="text-blue-500" />
                      : <CheckCircle size={14} className="text-primary-600" />
                    }
                  </div>
                  {idx < caseData.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 my-1 min-h-[20px]" />
                  )}
                </div>
                <div className="pb-5 flex-1">
                  <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{event.event}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  {event.type === 'upcoming' && (
                    <Badge variant="blue" size="xs" className="mt-1">Upcoming</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'Documents' && (
          <div className="space-y-3">
            <Button variant="outline" size="sm" fullWidth>
              <Upload size={14} />
              Upload Document
            </Button>
            {caseData.documents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents yet</p>
              </div>
            ) : (
              caseData.documents.map(doc => (
                <Card key={doc.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.uploadedBy === 'You' ? (
                          <span className="text-primary-600 font-medium">You</span>
                        ) : doc.uploadedBy} · {formatDate(doc.uploadedAt)} · {doc.size}
                      </p>
                      <Badge variant="default" size="xs">{doc.category}</Badge>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <Download size={14} className="text-gray-400" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'Chat' && (
          <div className="flex flex-col h-[calc(100vh-280px)]">
            <div className="flex-1 overflow-y-auto space-y-3 pb-2">
              {caseData.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'client' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.isInstruction && (
                      <div className="flex items-center gap-1 mb-1">
                        <Tag size={10} className="text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-medium">Instruction</span>
                      </div>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'client'
                        ? `${msg.isInstruction ? 'bg-amber-500' : 'bg-primary-600'} text-white rounded-br-sm`
                        : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 mx-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border-t border-gray-100 pt-3 flex items-center gap-2">
              <button className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                <Tag size={16} />
              </button>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message or instruction..."
                className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-100"
              />
              <button className="p-2.5 bg-primary-600 rounded-xl text-white hover:bg-primary-700">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* HEARINGS TAB */}
        {activeTab === 'Hearings' && (
          <div className="space-y-3">
            <Card className="bg-blue-50 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-800">Next Hearing</p>
                  <p className="text-base font-bold text-blue-900 mt-0.5">{formatDate(caseData.nextHearing)}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{caseData.court}</p>
                </div>
                <Calendar size={32} className="text-blue-300" />
              </div>
            </Card>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hearing History</p>
              {caseData.timeline
                .filter(e => e.type === 'hearing' || e.type === 'filed' || e.type === 'update')
                .map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {new Date(event.date).getDate()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{event.event}</p>
                      <p className="text-xs text-gray-500">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
