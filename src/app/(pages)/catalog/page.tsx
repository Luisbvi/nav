import CatalogClient from '@/components/catalog/catalog-client';
import { createClient } from '@/utils/supabase/server';
import { Category } from '@/utils/supabase/types';

interface CatalogPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const CatalogPage = async ({ searchParams }: CatalogPageProps) => {
  // Params
  const searchParam = await searchParams;

  const supabase = await createClient();

  const category = typeof searchParam.category === 'string' ? searchParam.category : 'All';
  const search = typeof searchParam.search === 'string' ? searchParam.search : '';
  const sort = typeof searchParam.sort === 'string' ? searchParam.sort : 'featured';
  const minPrice = typeof searchParam.minPrice === 'string' ? searchParam.minPrice : '';
  const maxPrice = typeof searchParam.maxPrice === 'string' ? searchParam.maxPrice : '';
  const availability =
    typeof searchParam.availability === 'string' ? searchParam.availability : 'In Stock';
  const page = typeof searchParam.page === 'string' ? Number.parseInt(searchParam.page, 10) : 1;
  const pageSize = 9;

  const { data: categoriesData, error: categoryError } = await supabase
    .from('products')
    .select('category')
    .order('category');

  if (!categoriesData || categoryError) {
    console.error('Error fetching categories:', categoryError);
    return <div>Failed to load categories</div>;
  }

  const categoryCounts: Record<string, number> = {};
  categoriesData.forEach((item) => {
    const category = item.category;
    if (categoryCounts[category]) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }
  });

  const categoryList: Category[] = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const totalProducts = categoryList.reduce((acc, cat) => acc + cat.count, 0);

  categoryList.unshift({ name: 'All', count: totalProducts });

  let query = supabase.from('products').select('*', { count: 'exact' });

  if (category !== 'All') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (minPrice) {
    query = query.gte('price', Number.parseFloat(minPrice));
  }

  if (maxPrice) {
    query = query.lte('price', Number.parseFloat(maxPrice));
  }

  if (availability !== 'In Stock') {
    query = query.gt('stock', 0);
  }

  switch (sort) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;

    case 'price-high':
      query = query.order('price', { ascending: false });
      break;

    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;

    case 'name-desc':
      query = query.order('name', { ascending: false });
      break;

    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { count } = await query;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: products, error: productsError } = await query;

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return <div>Failed to load products</div>;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <CatalogClient
        initialProducts={products || []}
        categories={categoryList}
        totalCount={count || 0}
        totalPages={totalPages}
        currentPage={page}
        currentCategory={category}
        currentSearch={search}
        currentSort={sort}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentAvailability={availability}
      />
    </div>
  );
};

export default CatalogPage;
