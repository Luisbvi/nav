import StatsGrid from '@/components/dashboard/stats-grid';
import RecentProductsTable from '@/components/dashboard/recent-products-table';
import { createClient } from '@/utils/supabase/server';
import { getCategories } from '../actions/products';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch productos
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('info->>name', { ascending: true });

  if (!products) {
    throw new Error('Failed to fetch products');
  }

  const { categories, error: categoriesError } = await getCategories();

  if (!categories || categoriesError) {
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    throw new Error('Failed to fetch categories');
  }

  // Stats for dashboard
  const stats = {
    totalProducts: products.length,
    totalCategories: categories.length,
    lowStock: products.filter((p) => p.stock < 50).length,
    totalValue: products.reduce((sum, product) => sum + product.price * product.stock, 0),
  };

  return (
    <>
      <StatsGrid stats={stats} />
      <RecentProductsTable products={products || []} />
    </>
  );
}
