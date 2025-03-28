import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import Banner from '@/components/layout/Banner';
import Logo from '@/components/Logo';
import { FilterProvider } from '@/components/catalog/filter-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FilterProvider>
      <Layout>{children}</Layout>
    </FilterProvider>
  );
}

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Header para móvil (logo + navbar) */}
        <Logo />

        {/* Contenedor lateral para md+ */}
        <div className="hidden w-auto flex-col items-center px-8 md:flex">
          {/* Logo */}
          <div className="flex w-full justify-center py-4">
            <Link href="/">
              <Image
                src="/images/logo-lg.png"
                alt="logo"
                width={200}
                height={200}
                className="block object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo-w-lg.png"
                alt="logo"
                width={200}
                height={200}
                className="hidden object-contain dark:block"
                priority
              />
            </Link>
          </div>

          {/* Filtros en md+ (solo en la ruta /catalog) */}
          <div className="w-full" id="desktop-filters-container"></div>

          {/* Banner */}
          <Banner />
        </div>

        <div className="flex flex-1 flex-col">
          {/* Navbar solo visible en md+ */}
          <div className="hidden md:block">
            <Navbar />
          </div>
          <main className="flex-1 overflow-y-auto py-4 pr-8 pl-8 md:pl-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
};
