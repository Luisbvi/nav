import CategoryGrid from '@/components/home/categories';
import FeaturedProducts from '@/components/home/features';
import HeroSection from '@/components/home/hero';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('products')
    .select('category')
    .order('category');

  // Count products per category
  const categoryCounts: Record<string, number> = {};
  categoriesData?.forEach((item) => {
    const category = item.category;
    if (categoryCounts[category]) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }
  });

  // Format categories for display
  const categories = Object.entries(categoryCounts || {})
    .map(([name, count]) => ({ name, count }))
    .slice(0, 4); // Limit to 4 categories

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={featuredProducts || []} />
      <CategoryGrid categories={categories} />
    </>
  );
}
