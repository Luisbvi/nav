import { User } from '@/types';
import { UserCircle, Mail, Shield, Clock, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import UserRoleBadge from '@/components/dashboard/customers/UserRoleBadge';

export default function CustomerTable({
  customers,
  openUserDetails,
  handleDeleteCustomer,
}: {
  customers: User[];
  openUserDetails: (user: User) => void;
  handleDeleteCustomer: (id: string) => void;
}) {
  // Function to render the user status
  const renderStatus = (status: string) => {
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
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              <div className="flex items-center">ID</div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              <div className="flex items-center">
                <UserCircle className="mr-1 text-gray-400" size={16} />
                Name
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              <div className="flex items-center">
                <Mail className="mr-1 text-gray-400" size={16} />
                Email
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              <div className="flex items-center">
                <Shield className="mr-1 text-gray-400" size={16} />
                Role
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              <div className="flex items-center">
                <Clock className="mr-1 text-gray-400" size={16} />
                Status
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {customers && customers.length > 0 ? (
            customers.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => openUserDetails(user)}
              >
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                  {user.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {`${user.first_name || ''} ${user.last_name || ''}`}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {user.email}
                  {user.email_confirmed_at || user.email_verified ? (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      <Check size={10} className="mr-1" />
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {renderStatus(user.status || 'pending')}
                </td>
                <td
                  className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end space-x-2">
                    <button
                      className="flex items-center text-blue-600 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUserDetails(user);
                      }}
                    >
                      <Edit size={16} className="mr-1" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex items-center text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomer(user.id);
                      }}
                    >
                      <Trash2 size={16} className="mr-1" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                No customers to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
