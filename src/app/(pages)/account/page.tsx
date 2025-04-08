'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { Order, OrderStatus } from '@/types';
import type { User } from '@supabase/supabase-js';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CreditCard, Edit, LogOut, Package, Settings, UserIcon } from 'lucide-react';

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

  const handleSaveChanges = () => {};

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);

        // Get user session
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

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
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

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
        .from('user_profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) {
        console.log(updateError);
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
    <div className="container mx-auto min-h-screen space-y-8 bg-gray-50 py-6 dark:bg-gray-900">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your personal information and orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-gray-600"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-white md:col-span-1 dark:bg-gray-800">
          <CardHeader className="relative pb-0">
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit profile</span>
              </Button>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profile.avatar_url || '/images/user-placeholder.png'}
                    alt="Avatar"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar"
                  className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Change avatar</span>
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
              <div className="space-y-1 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name || profile.username}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
              <div className="flex items-center">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  Customer
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <UserIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>Member since {new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Package className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>{orders.length} orders placed</span>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Account Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                Addresses
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                Payments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-4 pt-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">My Orders</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    View your order history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">You have no orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-center dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                                <Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  Order #{order.id}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatOrderDate(order.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 md:hidden">
                              <Badge className={`${statusStyles[order.status].class}`}>
                                {statusStyles[order.status].label}
                              </Badge>
                              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                                ${order.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="hidden md:flex md:items-center md:gap-4">
                            <Badge className={`${statusStyles[order.status].class}`}>
                              {statusStyles[order.status].label}
                            </Badge>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.payment_method === 'card'
                                ? `$${order.total.toFixed(2)}`
                                : `Bs. ${order.total.toFixed(2)}`}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 dark:border-gray-600"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              View details
                            </Button>
                          </div>
                          <div className="md:hidden">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-gray-300 dark:border-gray-600"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                {orders.length > 0 && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-600"
                    >
                      View all orders
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="addresses" className="space-y-4 pt-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">My Addresses</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Manage your shipping and billing addresses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <Badge className="absolute top-4 right-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Default
                    </Badge>
                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                      <h3 className="font-medium">Shipping Address</h3>
                      <p>{profile.full_name}</p>
                      <p>123 Main Street</p>
                      <p>Anytown, CA 12345</p>
                      <p>United States</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Add New Address</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="payments" className="space-y-4 pt-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Payment Methods</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Manage your payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Visa ending in 4242
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expires: 04/2025</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Default
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveChanges}
                    className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                  >
                    Add Payment Method
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
