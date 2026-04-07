export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'Hearing Scheduled': { variant: 'blue', label: 'Hearing Scheduled' },
    'Judgment Pending': { variant: 'amber', label: 'Judgment Pending' },
    'Under Review': { variant: 'purple', label: 'Under Review' },
    'Filed': { variant: 'indigo', label: 'Filed' },
    'Closed': { variant: 'default', label: 'Closed' },
    'paid': { variant: 'green', label: 'Paid' },
    'pending': { variant: 'amber', label: 'Pending' },
    'overdue': { variant: 'red', label: 'Overdue' },
    'approved': { variant: 'green', label: 'Approved' },
    'disputed': { variant: 'red', label: 'Disputed' },
    'confirmed': { variant: 'green', label: 'Confirmed' },
    'due': { variant: 'amber', label: 'Due Soon' },
    'upcoming': { variant: 'default', label: 'Upcoming' },
  };
  const config = map[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
