import { Package } from 'lucide-react';

interface StatsGridProps {
  stats: {
    totalProducts: number;
    totalCategories: number;
    lowStock: number;
    totalValue: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon={<Package className="h-8 w-8 text-[#0099ff] dark:text-blue-400" />}
      />
      <StatCard
        title="Categories"
        value={stats.totalCategories}
        icon={<Package className="h-8 w-8 text-[#0099ff] dark:text-blue-400" />}
      />
      <StatCard
        title="Low Stock"
        value={stats.lowStock}
        icon={<Package className="h-8 w-8 text-red-500 dark:text-red-400" />}
        alert
      />
      <StatCard
        title="Total Value"
        value={`$${stats.totalValue.toFixed(2)}`}
        icon={<Package className="h-8 w-8 text-green-500 dark:text-green-400" />}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  alert?: boolean;
}

function StatCard({ title, value, icon, alert = false }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-700">
      <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="flex items-center gap-3">
        <div className={alert ? 'text-red-500 dark:text-red-400' : ''}>{icon}</div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
    </div>
  );
}
