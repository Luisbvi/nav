import { signOut } from "@/app/(auth)/actions/auth";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user)
  return (
    <header className="flex ">
      <aside className="ml-24 rounded w-80">
        <Link href={"/"}>
          <div className="overflow-hidden relative w-auto h-48">
            {" "}
            {/* Aumenté la altura a h-32 */}
            <Image
              src="/images/logo-lg.png"
              alt="logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>
      </aside>
      {/* Navbar */}
      <nav
        className="flex-1  bg-blue-400 ml-36 flex justify-end rounded-bl-lg items-center px-12"
        style={{ height: "fit-content" }}
      >
        {" "}
        {/* Altura automática */}
        <div className="flex gap-2 py-2">
          {" "}
          {/* Padding interno del nav */}
          {user && (
            <div className="flex gap-x-2.5">
              <button className="bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                <Link href="/cart">Cart (0)</Link>
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
          {!user && (
            <button className="bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
              <Link href="/login">Login</Link>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
