"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Filter, Search, SortDesc } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/product-card";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import type { Product, Category } from "@/utils/supabase/types";

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "All Categories";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "featured";
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 9;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);
  const [availability, setAvailability] = useState("all");

  const supabase = createClient();

  // Cargar categorías y productos
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Cargar categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("products")
          .select("category")
          .order("category");

        console.log({ categoriesData });

        if (categoriesError) throw categoriesError;

        // Contar productos por categoría
        const categoryCounts: Record<string, number> = {};
        categoriesData.forEach((item) => {
          if (categoryCounts[item.category]) {
            categoryCounts[item.category]++;
          } else {
            categoryCounts[item.category] = 1;
          }
        });

        // Convertir a array de Category
        const categoryList: Category[] = Object.entries(categoryCounts).map(
          ([name, count]) => ({
            name,
            count,
          }),
        );

        // Añadir "All Categories"
        const totalProducts = categoryList.reduce(
          (sum, cat) => sum + cat.count,
          0,
        );
        categoryList.unshift({
          name: "All Categories",
          count: totalProducts,
        });

        setCategories(categoryList);

        // Construir la consulta para productos
        let query = supabase.from("products").select("*", { count: "exact" });

        // Aplicar filtros
        if (category && category !== "All Categories") {
          query = query.eq("category", category);
        }

        if (search) {
          query = query.ilike("name", `%${search}%`);
        }

        if (minPrice) {
          query = query.gte("price", Number.parseFloat(minPrice));
        }

        if (maxPrice) {
          query = query.lte("price", Number.parseFloat(maxPrice));
        }

        if (availability === "in-stock") {
          query = query.gt("stock", 0);
        }

        // Aplicar ordenación
        switch (sort) {
          case "price-low":
            query = query.order("price", { ascending: true });
            break;
          case "price-high":
            query = query.order("price", { ascending: false });
            break;
          case "name-asc":
            query = query.order("name", { ascending: true });
            break;
          default:
            query = query.order("name", { ascending: true });
        }

        // Aplicar paginación
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        // Ejecutar la consulta
        const { data: productsData, error: productsError, count } = await query;

        if (productsError) throw productsError;

        setProducts(productsData);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [
    category,
    search,
    minPrice,
    maxPrice,
    sort,
    page,
    availability,
    supabase,
  ]);

  // Actualizar la URL con los parámetros de búsqueda
  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Resetear a la página 1 si cambian los filtros
    if (!params.hasOwnProperty("page")) {
      newParams.set("page", "1");
    }

    router.push(`/catalog?${newParams.toString()}`);
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (value: string) => {
    updateSearchParams({ category: value });
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    updateSearchParams({ search: searchValue });
  };

  // Manejar filtro de precio
  const handlePriceFilter = () => {
    updateSearchParams({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  };

  // Manejar cambio de disponibilidad
  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
    // No actualizamos los parámetros de URL para este filtro, solo el estado local
  };

  // Manejar ordenación
  const handleSortChange = (value: string) => {
    updateSearchParams({ sort: value });
  };

  // Manejar paginación
  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
  };

  // Limpiar filtros
  const clearFilters = () => {
    router.push("/catalog");
  };

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="px-12 py-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    min={0}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-blue-400 text-white hover:bg-blue-500 cursor-pointer mt-2"
                  onClick={handlePriceFilter}
                >
                  Apply Filters
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Availability</h3>
                <Select
                  value={availability}
                  onValueChange={handleAvailabilityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <div className="relative bg-[#0099ff] text-white rounded-xl overflow-hidden shadow-lg h-[650px]">
              <Image
                src="/images/BANNER.webp"
                alt="Support"
                fill
                className="object-cover object-[45%_55%]"
                priority
              />
              {/* Overlay oscuro para mejorar legibilidad */}
              <div className="absolute inset-0 from-black/50 to-transparent bg-gradient-to-t"></div>

              {/* Contenido superpuesto */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                <h3 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                  Optimize your supply
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h1 className="justify-center items-center text-3xl font-bold mb-6">
            Product Catalog
          </h1>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search products..."
                  className="pl-10"
                  defaultValue={search}
                />
                <button type="submit" className="sr-only">
                  Search
                </button>
              </form>

              <div className="flex gap-2 items-center">
                <SortDesc className="h-4 w-4" />
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Showing {products.length} of {totalCount} products
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    image: product.image_url || "/images/img-placeholder.webp",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                Try changing your search or filter criteria
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Mostrar páginas alrededor de la página actual
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant="outline"
                      className={
                        page === pageNum
                          ? "bg-blue-600 text-primary-foreground"
                          : ""
                      }
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
