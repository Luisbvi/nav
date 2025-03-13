import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MinusCircle, PlusCircle, ShieldCheck, Truck } from "lucide-react";
import { getProductById } from "@/utils/supabase/products";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Mock specifications if not available in the database
  const specifications = [
    { name: "Category", value: product.category },
    { name: "Stock", value: `${product.stock} units` },
    { name: "Unit", value: product.unit || "N/A" },
    { name: "ID", value: product.id },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-primary">
            Catalog
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-700">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-4 rounded-md shadow">
            <div className="relative aspect-square overflow-hidden rounded">
              <Image
                src={
                  product.image_url || "/placeholder.svg?height=400&width=400"
                }
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-sm text-gray-500 mb-4">
              Category:{" "}
              <Link
                href={`/catalog?category=${encodeURIComponent(product.category)}`}
                className="text-primary hover:underline"
              >
                {product.category}
              </Link>
            </div>

            <div className="text-2xl font-bold mb-6">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-700 mb-6">
              {product.description ||
                "No description available for this product."}
            </p>

            <div className="flex items-center gap-2 text-green-600 mb-6">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center">
                <Button variant="outline" size="icon">
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="mx-4">1</span>
                <Button variant="outline" size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <Button className="bg-blue-500 hover:bg-blue-600 px-8">
                Add to Cart
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Delivery to Port</h3>
                  <p className="text-sm text-gray-500">
                    Available for delivery to most major ports
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Quality Guarantee</h3>
                  <p className="text-sm text-gray-500">
                    All products meet maritime standards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="mb-6">
              <TabsTrigger className="cursor-pointer" value="details">
                Product Details
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="specs">
                Specifications
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="shipping">
                Shipping Information
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="details"
              className="bg-white p-6 rounded-md shadow"
            >
              <h2 className="text-xl font-bold mb-4">Product Details</h2>
              <p className="mb-4">
                {product.description ||
                  "No detailed description available for this product."}
              </p>
              <p>
                This product is ideal for maritime vessels requiring
                high-quality supplies during long journeys. All our products are
                sourced from trusted suppliers and meet international maritime
                standards.
              </p>
            </TabsContent>

            <TabsContent
              value="specs"
              className="bg-white p-6 rounded-md shadow"
            >
              <h2 className="text-xl font-bold mb-4">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="border-b pb-2">
                    <span className="font-medium">{spec.name}: </span>
                    <span className="text-gray-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="shipping"
              className="bg-white p-6 rounded-md shadow"
            >
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <p className="mb-4">
                We deliver to most major ports worldwide. Shipping times vary
                depending on your vessel's location and port of call.
              </p>
              <h3 className="font-medium mb-2">Delivery Options:</h3>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Port Pickup: Available at no additional cost</li>
                <li>Direct to Vessel: Additional fees may apply</li>
                <li>Express Delivery: Available for urgent orders</li>
              </ul>
              <p>
                Contact our logistics team for specific delivery arrangements
                and schedules.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
