import About from '@/components/home/about';
import CategoryGrid from '@/components/home/categories';
import FeaturedProducts from '@/components/home/features';
import HeroSection from '@/components/home/hero';
import HomeBanner from '@/components/home/home-banner';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  const { data: categoriesData } = await supabase
    .from('products')
    .select('category')
    .eq('category', 'service');

  console.log('Category counts:', categoriesData);

  return (
    <>
      <HomeBanner />
      <About />
      <CategoryGrid />
      <HeroSection />
      <FeaturedProducts products={featuredProducts || []} />
    </>
  );
}
