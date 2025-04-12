import { User } from '@/types';

export default function UserEditForm({
  editForm,
  handleEditChange,
  selectedUser,
}: {
  editForm: User;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  selectedUser: User;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="first_name"
            value={editForm.first_name}
            onChange={handleEditChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="last_name"
            value={editForm.last_name}
            onChange={handleEditChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="vesselName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Vessel Name
          </label>
          <input
            type="text"
            id="vesselName"
            name="vessel_name"
            value={editForm.vessel_name}
            onChange={handleEditChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="shippingCompany"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Shipping Company
          </label>
          <input
            type="text"
            id="shippingCompany"
            name="shipping_company"
            value={editForm.shipping_company}
            onChange={handleEditChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={editForm.role}
            onChange={handleEditChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="preferredLanguage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Preferred Language
        </label>
        <select
          id="preferredLanguage"
          name="preferred_language"
          value={editForm.preferred_language}
          onChange={handleEditChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
        >
          <option value="es">Spanish</option>
          <option value="en">English</option>
          <option value="zh">中文 (Chinese)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
      </div>
    </div>
  );
}
