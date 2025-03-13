import Link from 'next/link';

import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-blue-400 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">
              Supply Management for Maritime Professionals
            </h2>
            <p className="mb-10 text-xl">
              Order supplies for your vessel and crew anywhere, anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  variant={'outline'}
                  className="border-white bg-white text-blue-500 shadow-sm transition-all hover:bg-blue-500 hover:text-white hover:shadow-lg"
                >
                  Register Your Vessel
                </Button>
              </Link>
              <Link href="/catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer border-white text-blue-500 shadow-sm transition-all hover:bg-blue-500 hover:text-white hover:shadow-lg"
                >
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <h3 className="mb-12 text-center text-3xl font-bold">How It Works</h3>
            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl font-bold text-blue-800">1</span>
                </div>
                <h4 className="mb-3 text-xl font-semibold">Register Your Vessel</h4>
                <p className="text-gray-600">
                  Create an account with your vessel details and crew information.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl font-bold text-blue-800">2</span>
                </div>
                <h4 className="mb-3 text-xl font-semibold">Select Products</h4>
                <p className="text-gray-600">
                  Browse our extensive catalog and select what you and your crew need.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl font-bold text-blue-800">3</span>
                </div>
                <h4 className="mb-3 text-xl font-semibold">Receive at Port</h4>
                <p className="text-gray-600">
                  Specify delivery location and receive your supplies at the next port.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <h3 className="mb-12 text-center text-3xl font-bold">Featured Categories</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {['Food & Provisions', 'Safety Equipment', 'Medical Supplies', 'Technical Parts'].map(
                (category) => (
                  <div
                    key={category}
                    className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <h4 className="mb-2 text-lg font-semibold">{category}</h4>
                      <Button variant="link" className="p-0">
                        Explore Products
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
