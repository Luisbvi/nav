'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Order, OrderStatus } from '@/types';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    username: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  }>({
    username: '',
    full_name: '',
    email: '',
    avatar_url: null,
  });

  const statusStyles: Record<OrderStatus, { class: string; label: string }> = {
    pending: {
      class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      label: 'Pending',
    },
    paid: {
      class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: 'Paid',
    },
    processing: {
      class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      label: 'Processing',
    },
    completed: {
      class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: 'Completed',
    },
    cancelled: {
      class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      label: 'Cancelled',
    },
    shipped: {
      class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      label: 'Shipped',
    },
    delivered: {
      class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      label: 'Delivered',
    },
  };

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        const { user } = session;
        setUser(user);

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          setProfile({
            username: profileData.username || '',
            full_name: profileData.first_name + ' ' + profileData.last_name || '',
            email: user.email || '',
            avatar_url: profileData.avatar_url,
          });
        }

        // Get orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderError) {
          throw orderError;
        }

        if (orderData) {
          setOrders(orderData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        alert('Error loading user data!');
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [router, supabase]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      alert('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setProfile({
        ...profile,
        avatar_url: data.publicUrl,
      });

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      alert('Avatar updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-2 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>

          <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                  <span className="text-2xl text-gray-500 dark:text-gray-300">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <label
                htmlFor="avatar"
                className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Uploading image...</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 md:w-auto dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">My Orders</h2>

          {orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">You have no orders yet</p>
            </div>
          ) : (
            <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-md border p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="w-[100px] truncate font-medium text-gray-900 dark:text-white">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${statusStyles[order.status].class}`}
                    >
                      {statusStyles[order.status].label}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-2">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
