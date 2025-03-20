import {
  Mail,
  UserCircle,
  Ship,
  Building,
  Calendar,
  Clock,
  Shield,
  AlertCircle,
  Globe,
} from 'lucide-react';
import StatusBadge from '@/components/dashboard/customers/StatusBadge';
import { User } from '@/types';

export default function UserDetails({ selectedUser }: { selectedUser: User }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Mail className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{selectedUser.email}</p>
            <p className="mt-1 text-xs text-gray-500">
              {selectedUser.email_confirmed_at ? 'Verified' : 'Not verified'}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <UserCircle className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Full Name</p>
            <p className="text-sm text-gray-900">
              {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Ship className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Vessel Name</p>
            <p className="text-sm text-gray-900">{selectedUser.vesselName || '-'}</p>
          </div>
        </div>
        <div className="flex items-start">
          <Building className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Shipping Company</p>
            <p className="text-sm text-gray-900">{selectedUser.shippingCompany || '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Calendar className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Registration Date</p>
            <p className="text-sm text-gray-900">
              {selectedUser.created_at ? selectedUser.created_at : '-'}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Clock className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Last Login</p>
            <p className="text-sm text-gray-900">
              {selectedUser.last_login
                ? new Date(selectedUser.last_login).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Shield className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="text-sm text-gray-900">
              {selectedUser.role === 'admin'
                ? 'Administrator'
                : selectedUser.role === 'manager'
                  ? 'Manager'
                  : 'User'}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <AlertCircle className="mt-1 mr-2 text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={selectedUser.status || 'pending'} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <Globe className="mt-1 mr-2 text-gray-400" size={16} />
        <div>
          <p className="text-sm font-medium text-gray-500">Language</p>
          <p className="text-sm text-gray-900">
            {selectedUser.preferredLanguage === 'es'
              ? 'Spanish'
              : selectedUser.preferredLanguage === 'en'
                ? 'English'
                : selectedUser.preferredLanguage === 'fr'
                  ? 'French'
                  : selectedUser.preferredLanguage === 'de'
                    ? 'German'
                    : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
