import { createClient } from '@/utils/supabase/server';
import Header from '@/components/layout/header';

const Navbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return <Header user={userData} />;
};

export default Navbar;
