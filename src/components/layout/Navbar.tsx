import { createClient } from '@/utils/supabase/server';
import Header from '@/components/layout/header';

const Navbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Header user={user} />;
};

export default Navbar;
