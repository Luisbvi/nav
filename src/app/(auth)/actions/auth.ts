'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/dist/server/request/headers';
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
    first_name: formData.get('first-name') as string,
    last_name: formData.get('last-name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    vessel_name: formData.get('vessel-name') as string,
    shipping_company: formData.get('shipping-company') as string,
    preferred_language: formData.get('preferred-language') as string,
  };

  const { error, data } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        first_name: credentials.first_name,
        last_name: credentials.last_name,
        vessel_name: credentials.vessel_name,
        shipping_company: credentials.shipping_company,
        email_verified: false,
        role: 'user',
        preferred_language: credentials.preferred_language,
        status: 'active',
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

  try {
    // 1. Authentication
    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    console.log('Attempting to sign in user:', credentials.email);
    const { error, data } = await supabase.auth.signInWithPassword(credentials);

    if (error || !data.user) {
      console.error('Authentication failed:', error?.message);
      return {
        status: error?.message || 'Authentication failed',
        user: null,
      };
    }

    console.log('Authentication successful for user:', data.user.email);

    // 2. Check for existing profile with detailed logging
    console.log('Checking for existing user profile...');
    const { data: existingUser, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', data.user.email)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking existing profile:', profileError);
    }

    // If no direct match, try case-insensitive search
    if (!existingUser) {
      console.log(
        'No exact match found, retrieving all profiles to find case-insensitive match...'
      );
      const { data: allProfiles } = await supabase.from('user_profiles').select('*');

      // Find a case-insensitive match
      const matchingProfile = allProfiles?.find(
        (profile) => profile.email?.toLowerCase() === data.user?.email?.toLowerCase()
      );

      console.log('Case-insensitive match found:', matchingProfile ? 'Yes' : 'No');

      if (matchingProfile) {
        // 3. Update using ID instead of email for found profile
        console.log('Updating last_login for user ID:', matchingProfile.id);

        const updateResult = await supabase
          .from('user_profiles')
          .update({
            last_login: new Date().toISOString(),
            email_verified: true,
            status: 'active',
          })
          .eq('id', matchingProfile.id) // Use ID instead of email
          .select();

        console.log('Update result:', updateResult);

        if (updateResult.error) {
          console.error('Error updating last login:', updateResult.error);
        } else {
          console.log('Last login updated successfully');
        }

        // Revalidate and return success
        console.log('Sign-in process completed successfully');
        revalidatePath('/', 'layout');
        return {
          status: 'success',
          user: data.user,
        };
      }

      // If no match at all, create new profile
      console.log('Creating new user profile for:', data.user.email);

      const newProfile = {
        email: data.user.email,
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name,
        vessel_name: data.user.user_metadata?.vessel_name,
        shipping_company: data.user.user_metadata?.shipping_company,
        last_login: new Date().toISOString(),
        email_verified: true,
        role: 'user',
        preferred_language: data.user.user_metadata?.preferred_language,
      };

      console.log('New profile data:', newProfile);

      const { data: insertedProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return {
          status: insertError.message,
          user: null,
        };
      }

      console.log('New profile created successfully:', insertedProfile);
    } else {
      // Profile exists with exact email match, update using ID
      console.log('Existing user profile found with ID:', existingUser.id);

      const updateResult = await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString(), email_verified: true, status: 'active' })
        .eq('id', existingUser.id)
        .select();

      console.log('Update result:', updateResult);

      if (updateResult.error) {
        console.error('Error updating last login:', updateResult.error);
      } else if (updateResult.data && updateResult.data.length === 0) {
        console.warn(
          'No rows were updated despite finding the profile. Check database constraints.'
        );
      } else {
        console.log('Last login updated successfully');
      }
    }

    // 4. Revalidate and return
    console.log('Sign-in process completed successfully');
    revalidatePath('/', 'layout');
    return {
      status: 'success',
      user: data.user,
    };
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    return {
      status: 'An unexpected error occurred',
      user: null,
    };
  }
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
