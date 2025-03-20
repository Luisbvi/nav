import { signOut } from '@/app/(auth)/actions/auth';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { UserMenu } from './user-menu';
import { MobileMenu } from './mobile-menu';

const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  return (
    <header className="flex">
      <aside className="ml-24 w-80 rounded">
        <Link href={'/'}>
          <div className="relative h-48 w-auto overflow-hidden">
            {' '}
            <Image src="/images/logo-lg.png" alt="logo" fill className="object-contain" />
          </div>
        </Link>
      </aside>

      <nav
        className="ml-24 flex flex-1 items-center justify-end rounded-bl-lg bg-blue-400 px-12"
        style={{ height: 'fit-content' }}
      >
        <div className="hidden gap-4 py-4 md:flex">
          <UserMenu user={user} role={userProfile?.role || 'user'} signOutAction={signOut} />
        </div>
        <div className="flex gap-2 py-4 md:hidden">
          <MobileMenu user={user} signOutAction={signOut} />
        </div>
      </nav>
    </header>
  );
};

export default Header;
