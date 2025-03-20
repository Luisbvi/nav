'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

interface OrdersDashboardProps {
  initialOrders: Order[];
}

const supabase = createClient();

export default function OrdersDashboard({ initialOrders }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Función para eliminar una orden
  const handleDeleteOrder = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta orden?')) return;

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar la orden:', error);
    } else {
      setOrders(orders.filter((order) => order.id !== id));
    }
  };

  // Función para actualizar el estado de una orden
  const handleUpdateOrderStatus = async (
    id: string,
    newStatus: 'pending' | 'completed' | 'cancelled'
  ) => {
    const { error, data } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar el estado de la orden:', error);
    } else if (data) {
      setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Órdenes</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{order.id}</td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {order.customerName}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {new Date(order.orderDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                ${order.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{order.status}</td>
              <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <button
                  className="mr-2 text-blue-600 hover:text-blue-900"
                  onClick={() =>
                    handleUpdateOrderStatus(
                      order.id,
                      order.status === 'pending' ? 'completed' : 'pending'
                    )
                  }
                >
                  {order.status === 'pending' ? 'Completar' : 'Marcar como pendiente'}
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
