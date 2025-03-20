import { Edit, Trash2, X } from 'lucide-react';
import { User } from '@/types';
import UserDetails from '@/components/dashboard/customers/UserDetails';
import UserEditForm from '@/components/dashboard/customers/UsersEditForm';

export default function UserDetailsModal({
  selectedUser,
  isEditing,
  editForm,
  handleEditChange,
  toggleEditMode,
  handleSaveChanges,
  handleDeleteCustomer,
  closeModal,
}: {
  selectedUser: User;
  isEditing: boolean;
  editForm: User;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  toggleEditMode: () => void;
  handleSaveChanges: () => void;
  handleDeleteCustomer: (id: string) => void;
  closeModal: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit User' : 'User Details'}</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <UserEditForm
              editForm={editForm}
              handleEditChange={handleEditChange}
              selectedUser={selectedUser}
            />
          ) : (
            <UserDetails selectedUser={selectedUser} />
          )}

          <div className="mt-6 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  onClick={() => toggleEditMode()}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  onClick={toggleEditMode}
                >
                  <Edit size={16} className="mr-1 inline" />
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                  onClick={() => handleDeleteCustomer(selectedUser.id)}
                >
                  <Trash2 size={16} className="mr-1 inline" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
