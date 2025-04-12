'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserCircle } from 'lucide-react';
import CustomerTable from './customer-table';
import UserDetailsModal from './user-details-modal';
import { User } from '@/types';
import DeleteConfirmationModal from './delete-confirmation-modal';

const supabase = createClient();

export default function CustomersDashboard({ initialCustomers }: { initialCustomers: User[] }) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<User>({
    id: '',
    first_name: '',
    last_name: '',
    vessel_name: '',
    shipping_company: '',
    role: 'user',
    preferred_language: '',
    status: '',
    email: '',
    email_confirmed_at: null,
    email_verified: false,
    created_at: '',
    updated_at: '',
    last_login: null,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name?: string } | null>(
    null
  );

  useEffect(() => {
    async function checkAdminRoles() {
      if (!initialCustomers || initialCustomers.length === 0) return;

      const updatedCustomers = [...initialCustomers];

      for (let i = 0; i < updatedCustomers.length; i++) {
        const user = updatedCustomers[i];
        const { data } = await supabase.from('admin_users').select('id').eq('id', user.id).single();

        if (data) {
          updatedCustomers[i] = {
            ...user,
            role: 'admin',
          };
        } else if (!user.role) {
          updatedCustomers[i] = {
            ...user,
            role: 'user',
          };
        }
      }

      setCustomers(updatedCustomers);
    }

    checkAdminRoles();
  }, [initialCustomers]);

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      vessel_name: user.vessel_name || '',
      shipping_company: user.shipping_company || '',
      role: user.role || 'user',
      preferred_language: user.preferred_language || 'es',
      status: user.status || 'pending',
      last_login: user.last_login,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setIsEditing(false);
    }, 300);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldMappings: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      vesselName: 'vessel_name',
      shippingCompany: 'shipping_company',
      preferredLanguage: 'preferred_language',
    };
    const stateProperty = fieldMappings[name] || name;
    setEditForm((prev) => ({ ...prev, [stateProperty]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          role: editForm.role,
          preferred_language: editForm.preferred_language,
          status: editForm.status,
          updated_at: new Date().toISOString(),
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          vessel_name: editForm.vessel_name,
          shipping_company: editForm.shipping_company,
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      setCustomers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                ...editForm,
                updated_at: new Date().toISOString(),
              }
            : user
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDeleteCustomer = (id: string, name?: string) => {
    setCustomerToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(customerToDelete.id);
      if (error) throw error;

      setCustomers(customers.filter((customer) => customer.id !== customerToDelete.id));
      if (selectedUser?.id === customerToDelete.id) closeModal();
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 dark:bg-gray-900">
      <div className="mb-6 flex items-center">
        <UserCircle className="mr-2 text-blue-600 dark:text-blue-400" size={28} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
      </div>

      <Suspense
        fallback={<div className="text-gray-700 dark:text-gray-300">Loading customer table...</div>}
      >
        <CustomerTable
          customers={customers}
          openUserDetails={openUserDetails}
          handleDeleteCustomer={handleDeleteCustomer}
        />
      </Suspense>

      {selectedUser && (
        <Suspense
          fallback={<div className="text-gray-700 dark:text-gray-300">Loading user details...</div>}
        >
          <UserDetailsModal
            selectedUser={selectedUser}
            isEditing={isEditing}
            editForm={editForm}
            handleEditChange={handleEditChange}
            toggleEditMode={toggleEditMode}
            handleSaveChanges={handleSaveChanges}
            handleDeleteCustomer={handleDeleteCustomer}
            closeModal={closeModal}
            isOpen={isModalOpen}
          />
        </Suspense>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        customerName={customerToDelete?.name}
      />
    </div>
  );
}
