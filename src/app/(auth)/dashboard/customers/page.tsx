import CustomersDashboard from '@/components/dashboard/customers/customer-dashboard.tsx';
import { User } from '@/types';
import { createClient } from '@/utils/supabase/client';

export default async function CustomersPage() {
  const supabase = createClient();

  const { data: customers, error } = await supabase.from('user_profiles').select('*');

  if (error || !customers) {
    console.error('Error al obtener los clientes:', error);
  }

  return (
    <div>
      <CustomersDashboard initialCustomers={(customers as User[]) || []} />
    </div>
  );
}
