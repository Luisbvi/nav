'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { Order, OrderStatus } from '@/types';
import type { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/language-context';

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
  const { t } = useLanguage();
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
      label: t('status_pending') || 'Pending',
    },
    paid: {
      class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: t('status_paid') || 'Paid',
    },
    processing: {
      class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      label: t('status_processing') || 'Processing',
    },
    completed: {
      class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: t('status_completed') || 'Completed',
    },
    cancelled: {
      class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      label: t('status_cancelled') || 'Cancelled',
    },
    shipped: {
      class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      label: t('status_shipped') || 'Shipped',
    },
    delivered: {
      class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      label: t('status_delivered') || 'Delivered',
    },
  };

  const handleSaveChanges = () => {};

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile({
            username: profileData.username || '',
            full_name: profileData.first_name + ' ' + profileData.last_name || '',
            email: user.email || '',
            avatar_url: profileData.avatar_url,
          });
        }

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;
        if (orderData) setOrders(orderData);
      } catch (error) {
        console.error('Error loading user data:', error);
        alert(t('error_loading_profile') || 'Error loading user data!');
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [router, supabase, t]);

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
      alert(t('profile_updated') || 'Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('error_updating_profile') || 'Error updating profile!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error(t('select_image_to_upload') || 'You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile({ ...profile, avatar_url: data.publicUrl });

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      alert(t('avatar_updated') || 'Avatar updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(t('error_uploading_avatar') || 'Error uploading avatar!');
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
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {t('loading_profile') || 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen bg-gray-50 px-4 py-6 sm:px-6 xl:px-8 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
            {t('my_profile') || 'My Profile'}
          </h1>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            {t('manage_profile_info') || 'Manage your personal information and orders'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 sm:flex-none dark:border-gray-600"
          >
            <Bell className="mr-2 h-4 w-4" />
            <span className="sr-only sm:not-sr-only">{t('notifications') || 'Notifications'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 sm:flex-none dark:border-gray-600"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span className="sr-only sm:not-sr-only">{t('settings') || 'Settings'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 sm:flex-none dark:border-gray-600"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="sr-only sm:not-sr-only">{t('sign_out') || 'Sign Out'}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <Card className="h-full bg-white dark:bg-gray-800">
            <CardHeader className="relative pb-0">
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">{t('edit_profile') || 'Edit profile'}</span>
                </Button>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage
                      src={profile.avatar_url || '/images/user-placeholder.png'}
                      alt={t('avatar') || 'Avatar'}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar"
                    className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700 sm:p-2"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="sr-only">{t('change_avatar') || 'Change avatar'}</span>
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
                  <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                    {t('uploading_image') || 'Uploading image...'}
                  </p>
                )}
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {profile.full_name || profile.username}
                  </h2>
                  <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                    {profile.email}
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {t('customer') || 'Customer'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-700 sm:text-base dark:text-gray-300">
                  <UserIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>
                    {t('member_since') || 'Member since'}{' '}
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-700 sm:text-base dark:text-gray-300">
                  <Package className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>
                    {orders.length} {t('orders_placed') || 'orders placed'}
                  </span>
                </div>
                <Separator className="bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t('account_information') || 'Account Information'}
                  </h3>
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm text-gray-700 sm:text-base dark:text-gray-300"
                    >
                      {t('username') || 'Username'}
                    </Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="full_name"
                      className="text-sm text-gray-700 sm:text-base dark:text-gray-300"
                    >
                      {t('full_name') || 'Full Name'}
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
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? t('saving') + '...' || 'Saving...' : t('save_changes') || 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="orders"
                className="py-2 text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 sm:text-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                {t('orders') || 'Orders'}
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="py-2 text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 sm:text-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                {t('addresses') || 'Addresses'}
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="py-2 text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 sm:text-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                {t('payments') || 'Payments'}
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4 pt-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 sm:text-xl dark:text-white">
                    {t('my_orders') || 'My Orders'}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                    {t('view_order_history') || 'View your order history'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('no_orders_yet') || 'You have no orders yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-gray-100 sm:h-12 sm:w-12 dark:bg-gray-700">
                              <Package className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                                {t('order') || 'Order'} #{order.id}
                              </h4>
                              <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                {formatOrderDate(order.created_at)}
                              </p>
                              <div className="mt-1 flex items-center gap-2 sm:hidden">
                                <Badge className={`text-xs ${statusStyles[order.status].class}`}>
                                  {statusStyles[order.status].label}
                                </Badge>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="hidden items-center justify-between gap-4 sm:flex">
                            <div className="flex items-center gap-4">
                              <Badge className={`${statusStyles[order.status].class}`}>
                                {statusStyles[order.status].label}
                              </Badge>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.payment_method === 'card'
                                  ? `$${order.total.toFixed(2)}`
                                  : `Bs. ${order.total.toFixed(2)}`}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 dark:border-gray-600"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              {t('view_details') || 'View details'}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-300 sm:hidden dark:border-gray-600"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            {t('view_details') || 'View details'}
                          </Button>
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
                      {t('view_all_orders') || 'View all orders'}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-4 pt-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 sm:text-xl dark:text-white">
                    {t('my_addresses') || 'My Addresses'}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                    {t('manage_shipping_addresses') || 'Manage your shipping and billing addresses'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <Badge className="absolute top-3 right-3 bg-green-100 text-xs text-green-800 sm:text-sm dark:bg-green-900 dark:text-green-200">
                      {t('default') || 'Default'}
                    </Badge>
                    <div className="space-y-1 text-sm text-gray-700 sm:text-base dark:text-gray-300">
                      <h3 className="font-medium">{t('shipping_address') || 'Shipping Address'}</h3>
                      <p>{profile.full_name}</p>
                      <p>123 Main Street</p>
                      <p>Anytown, CA 12345</p>
                      <p>{t('united_states') || 'United States'}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-xs sm:text-sm dark:border-gray-600"
                      >
                        {t('edit') || 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-xs sm:text-sm dark:border-gray-600"
                      >
                        {t('delete') || 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t('add_new_address') || 'Add New Address'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4 pt-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 sm:text-xl dark:text-white">
                    {t('payment_methods') || 'Payment Methods'}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                    {t('manage_payment_methods') || 'Manage your payment methods'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-700 sm:h-6 sm:w-6 dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                          {t('visa_ending_in') || 'Visa ending in'} 4242
                        </p>
                        <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                          {t('expires') || 'Expires'}: 04/2025
                        </p>
                      </div>
                    </div>
                    <Badge className="self-start bg-green-100 text-green-800 sm:self-center dark:bg-green-900 dark:text-green-200">
                      {t('default') || 'Default'}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveChanges}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                  >
                    {t('add_payment_method') || 'Add Payment Method'}
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
