"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
  try {
    const supabase = await createClient();

    // Extract data from form
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const customCategory = formData.get("customCategory") as string;
    const price = Number.parseFloat(formData.get("price") as string);
    const unit = formData.get("unit") as string;
    const stock = Number.parseInt(formData.get("stock") as string);
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;

    // Use custom category if provided, otherwise use selected category
    const finalCategory = customCategory ? customCategory : category;

    // Validate data
    if (!name || !finalCategory || isNaN(price) || isNaN(stock)) {
      return {
        status: "error",
        message: "Please fill all required fields with valid data",
      };
    }

    // Insert product into database
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        category: finalCategory,
        price,
        unit: unit || null,
        stock,
        description: description || null,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      return {
        status: "error",
        message: error.message,
      };
    }

    // Revalidate the catalog page to show the new product
    revalidatePath("/catalog");
    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Product added successfully",
      product: data,
    };
  } catch (error: any) {
    console.error("Error in addProduct:", error);
    return {
      status: "error",
      message: error.message || "An error occurred while adding the product",
    };
  }
}

export async function getCategories() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("category")
      .order("category");

    if (error) {
      throw error;
    }

    // Extract unique categories
    const uniqueCategories = [...new Set(data.map((item) => item.category))];

    return {
      status: "success",
      categories: uniqueCategories,
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return {
      status: "error",
      message: error.message || "An error occurred while fetching categories",
      categories: [],
    };
  }
}
