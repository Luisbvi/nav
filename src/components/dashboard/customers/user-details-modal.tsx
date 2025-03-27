import { Edit, Trash2, X } from 'lucide-react';
import { User } from '@/types';
import UserDetails from '@/components/dashboard/customers/user-details';
import UserEditForm from '@/components/dashboard/customers/users-edit-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDetailsModal({
  selectedUser,
  isEditing,
  editForm,
  handleEditChange,
  toggleEditMode,
  handleSaveChanges,
  handleDeleteCustomer,
  closeModal,
  isOpen = true,
}: {
  selectedUser: User;
  isEditing: boolean;
  editForm: User;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  toggleEditMode: () => void;
  handleSaveChanges: () => void;
  handleDeleteCustomer: (id: string) => void;
  closeModal: () => void;
  isOpen?: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="pointer-events-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <motion.h2
                  className="text-xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  key={isEditing ? 'edit-title' : 'view-title'}
                >
                  {isEditing ? 'Edit User' : 'User Details'}
                </motion.h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenedor con altura fija */}
              <div className="relative h-[400px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isEditing ? 'edit-form' : 'view-details'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 space-y-4"
                  >
                    {isEditing ? (
                      <div className="user-edit-form">
                        <UserEditForm
                          editForm={editForm}
                          handleEditChange={handleEditChange}
                          selectedUser={selectedUser}
                        />
                      </div>
                    ) : (
                      <UserDetails selectedUser={selectedUser} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isEditing ? 'edit-actions' : 'view-actions'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 flex justify-end space-x-3"
                >
                  {isEditing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                        onClick={() => toggleEditMode()}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                        onClick={handleSaveChanges}
                      >
                        Save Changes
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                        onClick={toggleEditMode}
                      >
                        <Edit size={16} className="mr-1 inline" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
                        onClick={() => handleDeleteCustomer(selectedUser.id)}
                      >
                        <Trash2 size={16} className="mr-1 inline" />
                        Delete
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
