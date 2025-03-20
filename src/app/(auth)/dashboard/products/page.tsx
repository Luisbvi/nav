import { createClient } from '@/utils/supabase/client';
import { getCategories } from '@/app/(auth)/actions/products';
import ProductsDashboard from '@/components/dashboard/products/ProductsDashboard';

// Add this export to mark the page as dynamic
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = createClient();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('name');

  const { categories, error: categoriesError } = await getCategories();

  if (productsError || categoriesError || !products || !categories) {
    throw new Error('Error al obtener los datos');
  }

  return <ProductsDashboard initialProducts={products} initialCategories={categories} />;
}
