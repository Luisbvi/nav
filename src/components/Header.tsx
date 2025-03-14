import { signOut } from '@/app/(auth)/actions/auth';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user);
  return (
    <header className="flex">
      <aside className="ml-24 w-80 rounded">
        <Link href={'/'}>
          <div className="relative h-48 w-auto overflow-hidden">
            {' '}
            {/* Aumenté la altura a h-32 */}
            <Image src="/images/logo-lg.png" alt="logo" fill className="object-contain" />
          </div>
        </Link>
      </aside>
      {/* Navbar */}
      <nav
        className="ml-36 flex flex-1 items-center justify-end rounded-bl-lg bg-blue-400 px-12"
        style={{ height: 'fit-content' }}
      >
        {' '}
        {/* Altura automática */}
        <div className="flex gap-2 py-2">
          {' '}
          {/* Padding interno del nav */}
          {user && (
            <div className="flex gap-x-2.5">
              <button className="rounded bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100">
                <Link href="/cart">Cart (0)</Link>
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
          {!user && (
            <button className="rounded bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100">
              <Link href="/login">Login</Link>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
