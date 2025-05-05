import { createClient } from '@/utils/supabase/client';
import { getCategories } from '@/app/(private)/actions/products';
import ProductsDashboard from '@/components/dashboard/products/products-dashboard';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = createClient();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('info->>name', { ascending: true });

  const { categories, error: categoriesError } = await getCategories();

  if (productsError || categoriesError || !products || !categories) {
    throw new Error('Error al obtener los datos');
  }

  return <ProductsDashboard initialProducts={products} initialCategories={categories} />;
}
