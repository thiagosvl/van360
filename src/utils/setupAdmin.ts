import { supabase } from '@/integrations/supabase/client';

// Create admin auth user via edge function
export const createAdminAuthUser = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('adminCreateUser', {
      body: {
        email: 'thiago-svl@hotmail.com',
        role: 'admin',
        motorista_id: null
      }
    });

    if (error) {
      console.error('Error creating admin auth user:', error);
      return null;
    }

    // Update usuarios table with auth_uid
    await supabase
      .from('usuarios')
      .update({ auth_uid: data.auth_uid })
      .eq('email', 'thiago-svl@hotmail.com');

    console.log('Admin auth user created with password:', data.senha);
    return data;
  } catch (error) {
    console.error('Error in createAdminAuthUser:', error);
    return null;
  }
};

// Call this function to create admin user
createAdminAuthUser();