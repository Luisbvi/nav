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
    .order('category');

  const categoryCounts: Record<string, number> = {};
  categoriesData?.forEach((item) => {
    const category = item.category;
    if (categoryCounts[category]) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }
  });

  console.log('Category counts:', categoriesData);

  // Separar la categoría "services" del resto
  const servicesEntry = Object.entries(categoryCounts).find(([name]) => name === 'SERVICES');
  const otherEntries = Object.entries(categoryCounts).filter(([name]) => name !== 'SERVICES');

  // Combinar "services" con las otras categorías (limitando a 3 para que en total sean 4)
  const categories = [
    ...(servicesEntry ? [{ name: servicesEntry[0], count: servicesEntry[1] }] : []),
    ...otherEntries.map(([name, count]) => ({ name, count })).slice(0, 3), // Tomamos solo 3 para que con "services" sean 4 en total
  ];

  return (
    <>
      <HomeBanner />
      <About />
      <CategoryGrid categories={categories} />
      <HeroSection />
      <FeaturedProducts products={featuredProducts || []} />
    </>
  );
}
