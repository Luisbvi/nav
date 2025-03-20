import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <Check size={12} className="mr-1" />
          Active
        </span>
      );
    case 'suspended':
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <X size={12} className="mr-1" />
          Suspended
        </span>
      );
    case 'inactive':
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          <Clock size={12} className="mr-1" />
          Inactive
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          <AlertCircle size={12} className="mr-1" />
          Pending
        </span>
      );
  }
}
