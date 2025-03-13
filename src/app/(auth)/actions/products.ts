"use server";

import { createClient } from "@/utils/supabase/server";
import { Product } from "@/utils/supabase/types";
import { revalidatePath } from "next/cache";

// Define el tipo para la respuesta de addProduct
interface AddProductResponse {
  status: "success" | "error";
  message: string;
  product?: Product; // Opcional porque solo está presente en caso de éxito
}

// Define el tipo para la respuesta de getCategories
interface GetCategoriesResponse {
  status: "success" | "error";
  message?: string; // Opcional porque solo está presente en caso de error
  categories: string[];
}

export async function addProduct(
  formData: FormData,
): Promise<AddProductResponse> {
  try {
    const supabase = await createClient();

    // Extraer datos del formulario
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const customCategory = formData.get("customCategory") as string;
    const price = Number.parseFloat(formData.get("price") as string);
    const unit = formData.get("unit") as string;
    const stock = Number.parseInt(formData.get("stock") as string);
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;

    // Usar la categoría personalizada si se proporciona, de lo contrario usar la categoría seleccionada
    const finalCategory = customCategory ? customCategory : category;

    // Validar datos
    if (!name || !finalCategory || isNaN(price) || isNaN(stock)) {
      return {
        status: "error",
        message: "Please fill all required fields with valid data",
      };
    }

    // Insertar producto en la base de datos
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

    // Revalidar la página del catálogo para mostrar el nuevo producto
    revalidatePath("/catalog");
    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Product added successfully",
      product: data as Product, // Asegurar que data sea del tipo Product
    };
  } catch (error: any) {
    console.error("Error in addProduct:", error);
    return {
      status: "error",
      message: error.message || "An error occurred while adding the product",
    };
  }
}

export async function getCategories(): Promise<GetCategoriesResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("category")
      .order("category");

    if (error) {
      throw error;
    }

    // Extraer categorías únicas
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
