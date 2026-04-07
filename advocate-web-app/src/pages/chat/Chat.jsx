import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send, Paperclip, Search, Phone, Video, MoreVertical,
  CheckCheck, Clock, Circle,
} from 'lucide-react';
import { mockClients, mockChats, mockCases } from '../../data/mockData';

const ADVOCATE_ID = 'adv-001';

function timeFmt(ts) {
  const d = new Date(ts);
  const now = new Date('2026-04-07T12:00:00');
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const initialClient = searchParams.get('client');
  const [selectedClientId, setSelectedClientId] = useState(initialClient || 'cli-001');
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState(mockChats);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const activeClient = mockClients.find(c => c.id === selectedClientId);
  const messages = chats[selectedClientId] || [];
  const clientCases = mockCases.filter(c => c.clientId === selectedClientId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: ADVOCATE_ID,
      senderName: 'You',
      senderRole: 'advocate',
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setChats(prev => ({
      ...prev,
      [selectedClientId]: [...(prev[selectedClientId] || []), newMsg],
    }));
    setMessageText('');
  };

  const filteredClients = mockClients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q);
  });

  const getLastMessage = (clientId) => {
    const msgs = chats[clientId] || [];
    return msgs[msgs.length - 1];
  };

  const getUnreadCount = (clientId) => {
    return (chats[clientId] || []).filter(m => !m.read && m.senderRole === 'client').length;
  };

  return (
    <div className="-m-6 h-[calc(100vh-56px)] flex overflow-hidden">
      {/* Client list sidebar */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Messages</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="input pl-8 text-xs py-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.map(client => {
            const lastMsg = getLastMessage(client.id);
            const unread = getUnreadCount(client.id);
            const isActive = selectedClientId === client.id;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${isActive ? 'bg-navy-50' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${client.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-navy-900' : 'text-gray-900'}`}>
                      {client.name}
                    </p>
                    {lastMsg && <p className="text-xs text-gray-400 ml-1 flex-shrink-0">{timeFmt(lastMsg.timestamp)}</p>}
                  </div>
                  {lastMsg ? (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {lastMsg.senderRole === 'advocate' ? 'You: ' : ''}{lastMsg.text}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">No messages yet</p>
                  )}
                </div>
                {unread > 0 && (
                  <span className="bg-navy-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {activeClient ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {activeClient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{activeClient.name}</p>
                <p className="text-xs text-gray-500">
                  {clientCases.length > 0 ? `${clientCases.length} active case${clientCases.length > 1 ? 's' : ''}` : 'No active cases'}
                  {clientCases.length > 0 && ` · ${clientCases[0].title}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Call">
                  <Phone size={16} className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Video call">
                  <Video size={16} className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Case chips */}
            {clientCases.length > 0 && (
              <div className="bg-white border-b border-gray-50 px-5 py-2 flex gap-2 overflow-x-auto">
                {clientCases.map(c => (
                  <span key={c.id} className="badge bg-navy-50 text-navy-700 text-xs whitespace-nowrap">
                    {c.type}: {c.title.split(' vs ')[0]}
                  </span>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">💬</span>
                  </div>
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a conversation with {activeClient.name}</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isOwn = msg.senderRole === 'advocate';
                const showDate = idx === 0 || new Date(messages[idx - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(msg.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && (
                        <div className="w-7 h-7 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
                          <span className="text-white text-xs font-bold">
                            {activeClient.name[0]}
                          </span>
                        </div>
                      )}
                      <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-navy-700 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && <CheckCheck size={12} className={`${msg.read ? 'text-blue-400' : 'text-gray-300'}`} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-5 py-4">
              <div className="flex items-end gap-3">
                <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0">
                  <Paperclip size={18} className="text-gray-400" />
                </button>
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-4 py-2.5 flex items-end gap-2">
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={`Message ${activeClient.name}...`}
                    className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-28 text-gray-900 placeholder-gray-400"
                    rows={1}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                    messageText.trim()
                      ? 'bg-navy-700 hover:bg-navy-800 text-white'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Messages are encrypted and stored securely. Press Enter to send, Shift+Enter for new line.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Select a client to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
