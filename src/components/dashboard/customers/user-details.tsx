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
  Check,
  X,
} from 'lucide-react';
import StatusBadge from '@/components/dashboard/customers/status-badge';
import { User } from '@/types';

export default function UserDetails({ selectedUser }: { selectedUser: User }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Mail className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedUser.email_verified ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  <Check size={10} className="mr-1" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  <X size={10} className="mr-1" />
                  Not verified
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <UserCircle className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Ship className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vessel Name</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {selectedUser.vessel_name || '-'}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Building className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping Company</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {selectedUser.shipping_company || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Calendar className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Registration Date
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : '-'}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Clock className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Shield className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
            <p className="text-sm text-gray-900 dark:text-white">{selectedUser.role}</p>
          </div>
        </div>
        <div className="flex items-start">
          <AlertCircle className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">
              <StatusBadge status={selectedUser.status || 'pending'} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <Globe className="mt-1 mr-2 text-gray-400 dark:text-gray-500" size={16} />
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {selectedUser.preferred_language === 'es'
              ? 'Spanish'
              : selectedUser.preferred_language === 'en'
                ? 'English'
                : selectedUser.preferred_language === 'zh'
                  ? '中文 (Chinese)'
                  : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
