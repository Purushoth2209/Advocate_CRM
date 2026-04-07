export const mockCases = [
  {
    id: 'case-001',
    cnr: 'TNCH010012342024',
    title: 'Kumar vs State of Tamil Nadu',
    type: 'Criminal Appeal',
    court: 'City Civil Court, Chennai',
    advocate: 'Adv. Priya Sharma',
    advocateId: 'adv-001',
    status: 'Hearing Scheduled',
    statusColor: 'blue',
    nextHearing: '2026-04-10',
    filedDate: '2024-03-15',
    lastUpdated: '2026-04-01T10:30:00',
    description: 'Property dispute regarding ancestral land at Adyar.',
    timeline: [
      { date: '2024-03-15', event: 'Case Filed', description: 'Petition submitted to Chennai Civil Court', type: 'filed' },
      { date: '2024-04-01', event: 'Case Admitted', description: 'Court admitted the case and issued notice', type: 'update' },
      { date: '2024-05-15', event: 'First Hearing', description: 'Arguments heard, case adjourned', type: 'hearing' },
      { date: '2024-08-20', event: 'Evidence Submission', description: 'Both parties submitted documentary evidence', type: 'update' },
      { date: '2025-01-10', event: 'Arguments', description: 'Partial arguments heard by bench', type: 'hearing' },
      { date: '2026-04-10', event: 'Next Hearing', description: 'Final arguments scheduled', type: 'upcoming' },
    ],
    documents: [
      { id: 'doc-001', name: 'Original Petition.pdf', type: 'PDF', uploadedBy: 'Adv. Priya Sharma', uploadedAt: '2024-03-15', size: '2.4 MB', category: 'Petition' },
      { id: 'doc-002', name: 'Property Documents.pdf', type: 'PDF', uploadedBy: 'You', uploadedAt: '2024-03-20', size: '5.1 MB', category: 'Evidence' },
      { id: 'doc-003', name: 'Court Notice.pdf', type: 'PDF', uploadedBy: 'Adv. Priya Sharma', uploadedAt: '2024-04-02', size: '0.8 MB', category: 'Court Notice' },
      { id: 'doc-004', name: 'Aadhaar Card.jpg', type: 'Image', uploadedBy: 'You', uploadedAt: '2024-04-05', size: '1.2 MB', category: 'Identity' },
    ],
    messages: [
      { id: 'msg-001', sender: 'advocate', text: 'I have filed the petition. Next hearing is on April 10.', timestamp: '2024-03-15T14:30:00', isInstruction: false },
      { id: 'msg-002', sender: 'client', text: 'Please file for a stay order before April 10.', timestamp: '2024-03-16T09:00:00', isInstruction: true },
      { id: 'msg-003', sender: 'advocate', text: 'Noted. I will file the stay application by March 25.', timestamp: '2024-03-16T11:00:00', isInstruction: false },
      { id: 'msg-004', sender: 'client', text: 'Thank you. Please keep me updated.', timestamp: '2024-03-16T11:30:00', isInstruction: false },
      { id: 'msg-005', sender: 'advocate', text: 'Stay application filed today. Court will hear it on April 1.', timestamp: '2024-03-25T16:00:00', isInstruction: false },
    ],
    appointments: [
      { id: 'apt-001', date: '2026-04-08', time: '3:00 PM', purpose: 'Discuss final arguments strategy', status: 'confirmed' },
    ],
  },
  {
    id: 'case-002',
    cnr: 'DLHC020056782023',
    title: 'Sharma Family vs Municipal Corporation',
    type: 'Writ Petition',
    court: 'Delhi High Court',
    advocate: 'Adv. Rajesh Verma',
    advocateId: 'adv-002',
    status: 'Judgment Pending',
    statusColor: 'amber',
    nextHearing: '2026-04-22',
    filedDate: '2023-07-10',
    lastUpdated: '2026-03-28T15:00:00',
    description: 'Writ petition challenging illegal demolition notice.',
    timeline: [
      { date: '2023-07-10', event: 'Writ Filed', description: 'Writ petition filed before Delhi HC', type: 'filed' },
      { date: '2023-07-15', event: 'Interim Stay', description: 'Court granted interim stay on demolition', type: 'update' },
      { date: '2024-02-20', event: 'Arguments Complete', description: 'Full arguments heard by Division Bench', type: 'hearing' },
      { date: '2026-04-22', event: 'Judgment Reserved', description: 'Court to pronounce judgment', type: 'upcoming' },
    ],
    documents: [
      { id: 'doc-005', name: 'Writ Petition.pdf', type: 'PDF', uploadedBy: 'Adv. Rajesh Verma', uploadedAt: '2023-07-10', size: '3.2 MB', category: 'Petition' },
      { id: 'doc-006', name: 'Demolition Notice.pdf', type: 'PDF', uploadedBy: 'You', uploadedAt: '2023-07-11', size: '0.5 MB', category: 'Evidence' },
    ],
    messages: [
      { id: 'msg-006', sender: 'advocate', text: 'Great news! Court has granted interim stay.', timestamp: '2023-07-15T17:00:00', isInstruction: false },
      { id: 'msg-007', sender: 'client', text: 'That is a relief. When is the next date?', timestamp: '2023-07-15T18:00:00', isInstruction: false },
    ],
    appointments: [],
  },
  {
    id: 'case-003',
    cnr: 'MHHC030089102025',
    title: 'Kumar vs ABC Insurance Ltd.',
    type: 'Consumer Case',
    court: 'Bombay High Court',
    advocate: 'Adv. Priya Sharma',
    advocateId: 'adv-001',
    status: 'Under Review',
    statusColor: 'purple',
    nextHearing: '2026-05-05',
    filedDate: '2025-01-20',
    lastUpdated: '2026-03-15T09:00:00',
    description: 'Insurance claim wrongfully rejected by ABC Insurance.',
    timeline: [
      { date: '2025-01-20', event: 'Case Filed', description: 'Complaint filed before Consumer Forum', type: 'filed' },
      { date: '2025-02-10', event: 'Notice Issued', description: 'Court issued notice to insurance company', type: 'update' },
      { date: '2026-05-05', event: 'Next Hearing', description: 'Reply from respondent expected', type: 'upcoming' },
    ],
    documents: [],
    messages: [],
    appointments: [],
  },
];

/** Client profile + advocate links (mirrors CRM client–advocate mapping) */
export const mockClientProfile = {
  displayName: 'Ramesh Kumar',
  phone: '+91 98765 43210',
  clientRef: 'CLT-2024-001',
  firmLabel: 'Sharma & Associates',
  advocateLinks: [
    {
      advocateId: 'adv-001',
      name: 'Adv. Priya Sharma',
      city: 'Chennai',
      court: 'Madras High Court',
      relationship: 'retained',
      since: '2024-03-01',
      source: 'invite',
    },
    {
      advocateId: 'adv-002',
      name: 'Adv. Rajesh Verma',
      city: 'Delhi',
      court: 'Delhi High Court',
      relationship: 'retained',
      since: '2023-08-12',
      source: 'directory',
    },
  ],
};

export const mockAdvocates = [
  {
    id: 'adv-001',
    name: 'Adv. Priya Sharma',
    specialization: ['Criminal Law', 'Property Law', 'Consumer Law'],
    city: 'Chennai',
    court: 'Madras High Court',
    experience: 12,
    enrollmentRef: 'TN/1234/2014',
    languages: ['English', 'Tamil', 'Hindi'],
    bio: 'Practices before Madras High Court and subordinate courts. Areas include criminal, property, and consumer matters.',
    available: true,
  },
  {
    id: 'adv-002',
    name: 'Adv. Rajesh Verma',
    specialization: ['Constitutional Law', 'Writ Petitions', 'Civil Law'],
    city: 'Delhi',
    court: 'Delhi High Court',
    experience: 18,
    enrollmentRef: 'D/5678/2008',
    languages: ['English', 'Hindi'],
    bio: 'Practices before Delhi High Court. Areas include constitutional matters, writ jurisdiction, and civil disputes.',
    available: true,
  },
  {
    id: 'adv-003',
    name: 'Adv. Meera Pillai',
    specialization: ['Family Law', 'Divorce', 'Child Custody'],
    city: 'Bangalore',
    court: 'Karnataka High Court',
    experience: 8,
    enrollmentRef: 'KA/9012/2018',
    languages: ['English', 'Kannada', 'Tamil', 'Malayalam'],
    bio: 'Practices before Karnataka High Court. Areas include matrimonial, custody, and maintenance-related proceedings.',
    available: false,
  },
  {
    id: 'adv-004',
    name: 'Adv. Suresh Nair',
    specialization: ['Corporate Law', 'Insolvency', 'Commercial Disputes'],
    city: 'Mumbai',
    court: 'Bombay High Court',
    experience: 15,
    enrollmentRef: 'MH/3456/2011',
    languages: ['English', 'Hindi', 'Marathi'],
    bio: 'Practices before Bombay High Court and NCLT benches. Areas include company law, insolvency, and commercial litigation.',
    available: true,
  },
];

export const mockNotifications = [
  { id: 'notif-001', type: 'hearing', title: 'Hearing Tomorrow', message: 'Your hearing for Kumar vs State of TN is tomorrow at 11:00 AM, Chennai Civil Court.', time: '2 hours ago', read: false, caseId: 'case-001' },
  { id: 'notif-002', type: 'billing', title: 'Fee statement shared', message: 'A fee statement for Kumar vs State of TN was shared. Coordinate with your advocate outside the app.', time: '5 hours ago', read: false, caseId: 'case-001' },
  { id: 'notif-003', type: 'update', title: 'Case Status Updated', message: 'Adv. Priya Sharma updated your case status to "Hearing Scheduled".', time: '1 day ago', read: true, caseId: 'case-001' },
  { id: 'notif-004', type: 'message', title: 'New Message', message: 'Adv. Priya Sharma sent you a message regarding Kumar vs State of TN.', time: '2 days ago', read: true, caseId: 'case-001' },
  { id: 'notif-005', type: 'document', title: 'Document Uploaded', message: 'Adv. Rajesh Verma uploaded "Court Notice.pdf" to Sharma vs MCD.', time: '3 days ago', read: true, caseId: 'case-002' },
  { id: 'notif-006', type: 'billing', title: 'Follow up on fees', message: 'Your advocate may follow up on Sharma vs MCD fee matters directly.', time: '3 days ago', read: false, caseId: 'case-002' },
];

/** Fresh-user preview: no cases, no linked advocates (empty states + onboarding-style copy) */
export const mockClientProfileFresh = {
  displayName: 'You',
  phone: 'Add phone in profile',
  clientRef: '—',
  firmLabel: null,
  advocateLinks: [],
};

export const mockCasesFresh = [];

export const mockNotificationsFresh = [
  {
    id: 'notif-welcome',
    type: 'update',
    title: 'Welcome to LexDesk Client',
    message: 'Discover an advocate or enter a code from your lawyer to link your account and see cases here.',
    time: 'Just now',
    read: false,
  },
];
