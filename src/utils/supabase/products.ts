import { createClient } from "@/utils/supabase/server";
import type { Product, Category } from "./types";

export async function getProducts(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase.from("products").select("*");

  // Apply filters if provided
  if (options?.category && options.category !== "All categories") {
    // Extract the English part of the category (before the dash)
    const categoryPrefix = options.category.split(" - ")[0];
    query = query.ilike("category", `${categoryPrefix}%`);
  }

  if (options?.search) {
    query = query.ilike("name", `%${options.search}%`);
  }

  if (options?.minPrice !== undefined) {
    query = query.gte("price", options.minPrice);
  }

  if (options?.maxPrice !== undefined) {
    query = query.lte("price", options.maxPrice);
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error } = await query.order("name");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as Product;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("category")
    .order("category");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Count products per category and deduplicate
  const categoryCounts: Record<string, number> = {};
  data.forEach((item) => {
    if (categoryCounts[item.category]) {
      categoryCounts[item.category]++;
    } else {
      categoryCounts[item.category] = 1;
    }
  });

  // Convert to array of Category objects
  const categories: Category[] = Object.entries(categoryCounts).map(
    ([name, count]) => ({
      name,
      count,
    })
  );

  // Add "All Categories" option
  const totalProducts = categories.reduce(
    (sum, category) => sum + category.count,
    0
  );
  categories.unshift({
    name: "All categories",
    count: totalProducts,
  });

  return categories;
}

export async function getProductCount(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<number> {
  const supabase = await createClient();

  let query = supabase.from("products").select("id", { count: "exact" });

  // Apply filters if provided
  if (options?.category && options.category !== "All categories") {
    const categoryPrefix = options.category.split(" - ")[0];
    query = query.ilike("category", `${categoryPrefix}%`);
  }

  if (options?.search) {
    query = query.ilike("name", `%${options.search}%`);
  }

  if (options?.minPrice !== undefined) {
    query = query.gte("price", options.minPrice);
  }

  if (options?.maxPrice !== undefined) {
    query = query.lte("price", options.maxPrice);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting products:", error);
    return 0;
  }

  return count || 0;
}
