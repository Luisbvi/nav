'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { Order, User } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Edit, Package, UserIcon, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getStatusColor, getStatusIcon } from '@/utils/orders';

export default function ProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user] = useState<User>();
  const [editMode, setEditMode] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState<{
    id: string;
    first_name: string;
    createdAt: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    imo: string;
  }>({
    id: '',
    createdAt: '',
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: null,
    imo: '',
  });

  const [originalProfile, setOriginalProfile] = useState<{
    id: string;
    createdAt: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    imo: string;
  }>({
    id: '',
    createdAt: '',
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: null,
    imo: '',
  });

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

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          const profileInfo = {
            id: profileData.id || '',
            createdAt: profileData.created_at || '',
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: user.email || '',
            avatar_url: profileData.avatar_url,
            imo: profileData.imo || '',
          };

          setProfile(profileInfo);
          setOriginalProfile(profileInfo);
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
          imo: profile.imo,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (error) throw error;
      setOriginalProfile({ ...profile });
      setEditMode(false);
      alert(t('profile_updated') || 'Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('error_updating_profile') || 'Error updating profile!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile({ ...originalProfile });
    setEditMode(false);
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
      setOriginalProfile({ ...originalProfile, avatar_url: data.publicUrl });
      alert(t('avatar_updated') || 'Avatar updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(t('error_uploading_avatar') || 'Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');
      setPasswordLoading(true);

      // Validate password match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError(t('passwords_do_not_match') || 'New passwords do not match');
        return;
      }

      // Validate password length
      if (passwordForm.newPassword.length < 8) {
        setPasswordError(t('password_too_short') || 'Password must be at least 8 characters');
        return;
      }

      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      // Clear form and show success message
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordSuccess(t('password_updated') || 'Password updated successfully!');

      // Close dialog after a short delay
      setTimeout(() => {
        setIsPasswordDialogOpen(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(
        t('error_updating_password') || 'Error updating password. Please try again.'
      );
    } finally {
      setPasswordLoading(false);
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
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          ></motion.div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {t('loading_profile') || 'Loading profile...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto min-h-screen bg-gray-50 px-4 py-6 sm:px-6 xl:px-8 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        className="mb-6 flex flex-col gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
            {t('my_profile') || 'My Profile'}
          </h1>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            {t('manage_profile_info') || 'Manage your personal information and orders'}
          </p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div
          className="xl:col-span-1"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full bg-white dark:bg-gray-800">
            <CardHeader className="relative pb-0">
              <div className="absolute top-4 right-4">
                {editMode ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">{t('cancel') || 'Cancel'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUpdateProfile}
                      className="text-green-600 dark:text-green-400"
                    >
                      <Save className="h-4 w-4" />
                      <span className="sr-only">{t('save') || 'Save'}</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditMode(true)}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">{t('edit_profile') || 'Edit profile'}</span>
                  </Button>
                )}
              </div>
              <div className="flex flex-col items-center space-y-3">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage
                      src={profile.avatar_url || '/images/user-placeholder.png'}
                      alt={t('avatar') || 'Avatar'}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                      {profile.first_name.charAt(0).toUpperCase()}
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
                </motion.div>
                {uploading && (
                  <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                    {t('uploading_image') || 'Uploading image...'}
                  </p>
                )}
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {profile.first_name} {profile.last_name}
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
                    {user?.role}
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
                    {new Date(profile.createdAt).toLocaleDateString()}
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
                      htmlFor="first_name"
                      className="text-sm text-gray-700 sm:text-base dark:text-gray-300"
                    >
                      {t('first_name') || 'First Name'}
                    </Label>
                    <AnimatePresence mode="wait">
                      {editMode ? (
                        <motion.div
                          key="edit-firstname"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="first_name"
                            value={profile.first_name}
                            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="view-firstname"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {profile.first_name}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="last_name"
                      className="text-sm text-gray-700 sm:text-base dark:text-gray-300"
                    >
                      {t('last_name') || 'Last Name'}
                    </Label>
                    <AnimatePresence mode="wait">
                      {editMode ? (
                        <motion.div
                          key="edit-lastname"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="last_name"
                            value={profile.last_name}
                            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="view-lastname"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {profile.last_name}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="imo"
                      className="text-sm text-gray-700 sm:text-base dark:text-gray-300"
                    >
                      {t('imo') || 'IMO'}
                    </Label>
                    <AnimatePresence mode="wait">
                      {editMode ? (
                        <motion.div
                          key="edit-imo"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="imo"
                            value={profile.imo}
                            onChange={(e) => setProfile({ ...profile, imo: e.target.value })}
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="view-imo"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {profile.imo}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <AnimatePresence mode="wait">
                {editMode ? (
                  <motion.div
                    className="grid w-full grid-cols-2 gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      {t('cancel') || 'Cancel'}
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                      onClick={handleUpdateProfile}
                      disabled={loading}
                    >
                      {loading
                        ? t('saving') + '...' || 'Saving...'
                        : t('save_changes') || 'Save Changes'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Button
                      className="mb-2 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                      onClick={() => setEditMode(true)}
                    >
                      {t('edit_profile') || 'Edit Profile'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="outline"
                className="flex w-full items-center gap-2 border-gray-300 dark:border-gray-600"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Lock className="h-4 w-4" />
                {t('change_password') || 'Change Password'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-6 xl:col-span-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="orders"
                className="py-2 text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 sm:text-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                {t('orders') || 'Orders'}
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
                    <motion.div
                      className="py-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('no_orders_yet') || 'You have no orders yet'}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.01 }}
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
                                <div
                                  className={`flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                                >
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 capitalize">{t(order.status)}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="hidden items-center justify-between gap-4 sm:flex">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                              >
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{t(order.status)}</span>
                              </div>
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
                        </motion.div>
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

            {/* *<TabsContent value="addresses" className="space-y-4 pt-4">
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
                  <motion.div
                    className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Badge className="absolute top-3 right-3 bg-green-100 text-xs text-green-800 sm:text-sm dark:bg-green-900 dark:text-green-200">
                      {t('default') || 'Default'}
                    </Badge>
                    <div className="space-y-1 text-sm text-gray-700 sm:text-base dark:text-gray-300">
                      <h3 className="font-medium">{t('shipping_address') || 'Shipping Address'}</h3>
                      <p>
                        {profile.first_name} {profile.last_name}
                      </p>
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
                  </motion.div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600">
                    {t('add_new_address') || 'Add New Address'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent> Addresses Tab */}
          </Tabs>
        </motion.div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t('change_password') || 'Change Password'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('password_change_description') || 'Update your password to secure your account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm sm:text-base">
                {t('current_password') || 'Current Password'}
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm sm:text-base">
                {t('new_password') || 'New Password'}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm sm:text-base">
                {t('confirm_password') || 'Confirm Password'}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {passwordError && (
              <motion.div
                className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {passwordError}
              </motion.div>
            )}

            {passwordSuccess && (
              <motion.div
                className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {passwordSuccess}
              </motion.div>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              className="mb-2 sm:mb-0"
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {passwordLoading
                ? (t('updating') || 'Updating') + '...'
                : t('update_password') || 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
