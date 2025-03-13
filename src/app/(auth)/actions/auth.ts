'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const getUserSession = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return { status: error?.message, user: null };

  return { status: 'success', user: data?.user };
};

export const signUp = async (formData: FormData) => {
  const supabase = await createClient();

  const credentials = {
    firstName: formData.get('first-name') as string,
    lastName: formData.get('last-name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    vesselName: formData.get('vessel-name') as string,
    shippingCompany: formData.get('shipping-company') as string,
  };

  const { error, data } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        vesselName: credentials.vesselName,
        shippingCompany: credentials.shippingCompany,
      },
    },
  });

  if (error) {
    return {
      status: error?.message,
      user: null,
    };
  } else if (data.user?.identities?.length === 0) {
    return {
      status: 'User with this email already exist, please log in',
      user: null,
    };
  }
  revalidatePath('/', 'layout');
  return { status: 'success', user: data.user };
};

export const signIn = async (formData: FormData) => {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error, data } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return {
      status: error?.message,
      user: null,
    };
  }

  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', credentials.email)
    .limit(1)
    .single();

  if (!existingUser) {
    const { error: inserError } = await supabase.from('user_profiles').insert({
      email: data?.user.email,
      firstName: data?.user.user_metadata.firstName,
      lastName: data?.user.user_metadata.lastName,
      vesselName: data?.user.user_metadata.vesselName,
      shippingCompany: data?.user.user_metadata.shippingCompany,
    });

    if (inserError) {
      return {
        status: inserError?.message,
        user: null,
      };
    }
  }

  revalidatePath('/', 'layout');
  return { status: 'success', user: data.user };
};

export const signOut = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) redirect('/error');

  revalidatePath('/', 'layout');
  redirect('/');
};

export const forgotPassword = async (formData: FormData) => {
  const supabase = await createClient();

  const origin = (await headers()).get('origin');

  const { error } = await supabase.auth.resetPasswordForEmail(formData.get('email') as string, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { status: error.message };
  }

  return { status: 'success' };
};

export const resetPassword = async (formData: FormData, code: string) => {
  const supabase = await createClient();
  const { error: CodeError } = await supabase.auth.exchangeCodeForSession(code);

  if (CodeError) {
    return { status: CodeError?.message };
  }

  const { error } = await supabase.auth.updateUser({
    password: formData.get('password') as string,
  });

  if (error) {
    return {
      status: error?.message,
    };
  }

  return { status: 'success' };
};
