import { OrderStatus } from '@/types';
import { CheckCircle, Clock, Package, Truck, XCircle, CreditCard, Loader2 } from 'lucide-react';

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    case 'delivered':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

export const banks = [
  { code: '0001', name: 'Banco Central de Venezuela' },
  { code: '0102', name: 'Banco de Venezuela, S.A. Banco Universal' },
  { code: '0104', name: 'Banco Venezolano de Crédito, S.A. Banco Universal' },
  { code: '0105', name: 'Banco Mercantil C.A., Banco Universal' },
  { code: '0108', name: 'Banco Provincial, S.A. Banco Universal' },
  { code: '0114', name: 'Banco del Caribe C.A., Banco Universal' },
  { code: '0115', name: 'Banco Exterior C.A., Banco Universal' },
  { code: '0128', name: 'Banco Caroní C.A., Banco Universal' },
  { code: '0134', name: 'Banesco Banco Universal, C.A.' },
  { code: '0137', name: 'Banco Sofitasa Banco Universal, C.A.' },
  { code: '0138', name: 'Banco Plaza, Banco universal' },
  { code: '0146', name: 'Banco de la Gente Emprendedora C.A.' },
  { code: '0151', name: 'Banco Fondo Común, C.A Banco Universal' },
  { code: '0156', name: '100% Banco, Banco Comercial, C.A' },
  { code: '0157', name: 'DelSur, Banco Universal C.A.' },
  { code: '0163', name: 'Banco del Tesoro C.A., Banco Universal' },
  { code: '0166', name: 'Banco Agrícola de Venezuela C.A., Banco Universal' },
  { code: '0168', name: 'Bancrecer S.A., Banco Microfinanciero' },
  { code: '0169', name: 'Mi Banco, Banco Microfinanciero, C.A.' },
  { code: '0171', name: 'Banco Activo C.A., Banco Universal' },
  { code: '0172', name: 'Bancamiga Banco Universal, C.A.' },
  { code: '0173', name: 'Banco Internacional de Desarrollo C.A., Banco Universal' },
  { code: '0174', name: 'Banplus Banco Universal, C.A.' },
  { code: '0175', name: 'Banco Bicentenario del Pueblo, Banco Universal C.A.' },
  { code: '0177', name: 'Banco de la Fuerza Armada Nacional Bolivariana, B.U.' },
  { code: '0178', name: 'N58 Banco Digital, Banco Microfinanciero' },
  { code: '0191', name: 'Banco Nacional de Crédito C.A., Banco Universal' },
  { code: '0601', name: 'Instituto Municipal de Crédito Popular' },
];

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'paid':
      return <CreditCard className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'processing':
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    case 'shipped':
      return <Truck className="h-5 w-5 text-purple-500" />;
    case 'delivered':
      return <Package className="h-5 w-5 text-indigo-500" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};
