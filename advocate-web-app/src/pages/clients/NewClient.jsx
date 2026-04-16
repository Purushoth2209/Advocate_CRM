import { Link } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';

export default function NewClient() {
  return (
    <div className="max-w-lg mx-auto card p-8 text-center space-y-4">
      <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center mx-auto">
        <Users className="text-navy-700" size={28} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">New client intake</h2>
      <p className="text-sm text-gray-500">
        Full client creation with validation and duplicate checks will connect to your API next.
        For now, browse existing records from the clients list.
      </p>
      <Link to="/clients" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Back to all clients
      </Link>
    </div>
  );
}
