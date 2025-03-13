import Link from "next/link";

import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function Home() {

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className=" bg-blue-400 text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Supply Management for Maritime Professionals
            </h2>
            <p className="text-xl mb-10">
              Order supplies for your vessel and crew anywhere, anytime.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/register">
                <Button
                  size="lg"
                  variant={"outline"}
                  className="border-white bg-white text-blue-500 hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-lg transition-all"
                >
                  Register Your Vessel
                </Button>
              </Link>
              <Link href="/catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className=" cursor-pointer border-white text-blue-500 hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-lg transition-all"
                >
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-800">1</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">
                  Register Your Vessel
                </h4>
                <p className="text-gray-600">
                  Create an account with your vessel details and crew
                  information.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-800">2</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">Select Products</h4>
                <p className="text-gray-600">
                  Browse our extensive catalog and select what you and your crew
                  need.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-800">3</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">Receive at Port</h4>
                <p className="text-gray-600">
                  Specify delivery location and receive your supplies at the
                  next port.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              Featured Categories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Food & Provisions",
                "Safety Equipment",
                "Medical Supplies",
                "Technical Parts",
              ].map((category) => (
                <div
                  key={category}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2">{category}</h4>
                    <Button variant="link" className="p-0">
                      Explore Products
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
