import { Shield, UserCircle, UserCheck } from 'lucide-react';

export default function UserRoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
        <Shield size={12} className="mr-1" />
        Admin
      </span>
    );
  } else if (role === 'customer') {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        <UserCheck size={12} className="mr-1" />
        Customer
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
        <UserCircle size={12} className="mr-1" />
        User
      </span>
    );
  }
}
