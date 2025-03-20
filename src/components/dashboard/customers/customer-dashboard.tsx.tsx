'use client';

import { useState, useEffect } from 'react';
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
    firstName: '',
    lastName: '',
    vesselName: '',
    shippingCompany: '',
    role: '',
    preferredLanguage: '',
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
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      vesselName: user.vesselName || '',
      shippingCompany: user.shippingCompany || '',
      role: user.role || 'user',
      preferredLanguage: user.preferredLanguage || 'es',
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
      // Update user_metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          vesselName: editForm.vesselName,
          shippingCompany: editForm.shippingCompany,
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
          preferred_language: editForm.preferredLanguage,
          status: editForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }

      // Actualizar role en admin_user si es necesario
      if (editForm.role === 'admin') {
        // Verificar si ya existe en admin_user
        const { data: existingAdmin } = await supabase
          .from('admin_user')
          .select('id')
          .eq('id', selectedUser.id)
          .single();

        if (!existingAdmin) {
          // Si no existe, insertarlo
          await supabase.from('admin_user').insert({ id: selectedUser.id });
        }
      } else {
        // Si ya no es admin, eliminarlo de admin_user
        await supabase.from('admin_user').delete().eq('id', selectedUser.id);
      }

      // Update local state
      setCustomers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                vesselName: editForm.vesselName,
                shippingCompany: editForm.shippingCompany,
                role: editForm.role,
                preferred_language: editForm.preferredLanguage,
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

      <CustomerTable
        customers={customers}
        openUserDetails={openUserDetails}
        handleDeleteCustomer={handleDeleteCustomer}
      />

      {isModalOpen && selectedUser && (
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
      )}
    </div>
  );
}
