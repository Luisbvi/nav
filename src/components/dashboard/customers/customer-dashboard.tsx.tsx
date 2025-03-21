'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserCircle } from 'lucide-react';
import CustomerTable from './CustomerTable';
import UserDetailsModal from './UserDetailsModal';
import { User } from '@/types';

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
    role: '',
    preferred_language: '',
    status: '',
    email: '',
    email_confirmed_at: null,
    email_verified: false,
    created_at: '',
    updated_at: '',
    last_login: null,
  });

  // Verificar si el usuario es administrador al cargar los datos
  useEffect(() => {
    async function checkAdminRoles() {
      if (!initialCustomers || initialCustomers.length === 0) return;

      const updatedCustomers = [...initialCustomers];

      for (let i = 0; i < updatedCustomers.length; i++) {
        const user = updatedCustomers[i];
        // Verificar si el usuario está en la tabla admin_user
        const { data } = await supabase.from('admin_users').select('id').eq('id', user.id).single();

        // Si existe en admin_user, asignar role "admin"
        if (data) {
          updatedCustomers[i] = {
            ...user,
            role: 'admin',
          };
        } else if (!user.role) {
          // Si no existe y no tiene role definido, asignar "user"
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

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Handle changes in the edit form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save edit changes
  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          vessel_name: editForm.vessel_name,
          shipping_company: editForm.shipping_company,
          role: editForm.role,
          preferred_language: editForm.preferred_language,
          status: editForm.status,
        },
      });

      if (userError) {
        console.error('Error updating user:', userError);
        return;
      }

      // Update additional fields in the profile table
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

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }

      // Update local state
      setCustomers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                vessel_name: editForm.vessel_name,
                shipping_company: editForm.shipping_company,
                role: editForm.role,
                preferred_language: editForm.preferred_language,
                status: editForm.status,
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

  // Function to delete a customer
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      // Delete the user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) {
        console.error('Error deleting customer:', error);
        return;
      }

      // Update local state
      setCustomers(customers.filter((customer) => customer.id !== id));

      // If the modal is open and we're deleting the selected user, close it
      if (selectedUser && selectedUser.id === id) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center">
        <UserCircle className="mr-2 text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <Suspense fallback={<div>Loading customer table...</div>}>
        <CustomerTable
          customers={customers}
          openUserDetails={openUserDetails}
          handleDeleteCustomer={handleDeleteCustomer}
        />
      </Suspense>

      {isModalOpen && selectedUser && (
        <Suspense fallback={<div>Loading user details...</div>}>
          <UserDetailsModal
            selectedUser={selectedUser}
            isEditing={isEditing}
            editForm={editForm}
            handleEditChange={handleEditChange}
            toggleEditMode={toggleEditMode}
            handleSaveChanges={handleSaveChanges}
            handleDeleteCustomer={handleDeleteCustomer}
            closeModal={closeModal}
          />
        </Suspense>
      )}
    </div>
  );
}
