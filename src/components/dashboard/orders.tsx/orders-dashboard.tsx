'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order, OrderStatus, User } from '@/types';

const supabase = createClient();

export default function OrdersDashboard({
  initialOrders,
  user,
}: {
  initialOrders: Order[];
  user: User;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDeleteOrder = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!confirm('Are you sure you want to delete this order?')) return;

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Error deleting order:', error);
    } else {
      setOrders(orders.filter((order) => order.id !== id));
      if (dialogOpen) setDialogOpen(false);
    }
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleEditOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Edit order with ID: ${id}`);
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    const { error, data } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating order status:', error);
    } else if (data) {
      setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="bg-white p-4 dark:bg-gray-900">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
      {orders.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No orders found</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => handleOpenOrderDetails(order)}
                >
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className="max-w-[120px] truncate">{order.id}</span>
                      <button
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(order.id);
                        }}
                      >
                        {copiedText === order.id ? (
                          <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <button
                      className="mr-3 flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={(e) => handleEditOrder(order.id, e)}
                    >
                      <Edit size={16} className="mr-1" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => handleDeleteOrder(order.id, e)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white sm:max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                    <span className="mr-2 max-w-[180px] truncate">{selectedOrder.id}</span>
                    <button
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => copyToClipboard(selectedOrder.id)}
                    >
                      {copiedText === selectedOrder.id ? (
                        <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Payment ID
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                    <span className="mr-2 max-w-[180px] truncate">{selectedOrder.id}</span>
                    <button
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => copyToClipboard(selectedOrder.id)}
                    >
                      {copiedText === selectedOrder.id ? (
                        <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                    <span className="mr-2 max-w-[180px] truncate">{selectedOrder.user_id}</span>
                    <button
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => copyToClipboard(selectedOrder.user_id)}
                    >
                      {copiedText === selectedOrder.user_id ? (
                        <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Items</h3>
                <div className="mt-2 max-h-60 overflow-y-auto rounded border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Product
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
                      {selectedOrder.items?.map(async (item) => {
                        const { data: product } = await supabase
                          .from('products')
                          .select('*')
                          .eq('id', item.id);

                        const description = item.description || 'Product';

                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {description}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                              {product || 0}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                              {'formatCurrency(totalPrice)'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <select
                  className="rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paid">Paid</option>
                </select>
                <button
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
