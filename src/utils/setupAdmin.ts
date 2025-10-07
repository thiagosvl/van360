import { supabase } from '@/integrations/supabase/client';

export const createAdminAuthUser = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('adminCreateUser', {
      body: {
        email: 'thiago-svl@hotmail.com',
        role: 'admin',
        usuario_id: null
      }
    });

    if (error) {
      console.error('Error creating admin auth user:', error);
      return null;
    }

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

createAdminAuthUser();