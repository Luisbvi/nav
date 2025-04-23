'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order, OrderStatus } from '@/types';
import { getStatusColor } from '@/utils/orders';

const supabase = createClient();

export default function OrdersDashboard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from('user_profiles').select('*');
      if (data) {
        const usersMap = data.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsers(usersMap);
      }
    };

    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) {
        const productsMap = data.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setProducts(productsMap);
      }
    };

    loadUsers();
    loadProducts();
  }, []);

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

  const handleEditOrder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const updateData: Partial<Order> = { status: newStatus };
      const currentDate = new Date().toISOString();

      // Asignar fechas según el nuevo estado
      switch (newStatus) {
        case 'processing':
          updateData.processing_date = currentDate;
          break;
        case 'shipped':
          updateData.shipped_date = currentDate;
          break;
        case 'delivered':
          updateData.delivered_date = currentDate;
          break;
        case 'cancelled':
          updateData.cancelled_date = currentDate;
          break;
      }

      if (newStatus === 'completed' && !selectedOrder?.payment_confirmation_date) {
        updateData.payment_confirmation_date = currentDate;
      }

      const { error, data } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        const updatedOrder = data[0];
        setOrders(orders.map((order) => (order.id === id ? updatedOrder : order)));

        if (selectedOrder?.id === id) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
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
              {orders.map((order) => {
                const user = users[order.user_id] || {};
                return (
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
                      {user.first_name || 'N/A'} {user.last_name || ''}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                      {user.email || 'N/A'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setDialogOpen(true);
                        }}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[800px] dark:bg-gray-800">
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
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <select
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as OrderStatus;
                      handleUpdateOrderStatus(selectedOrder.id, newStatus);
                    }}
                  >
                    {(
                      [
                        'pending',
                        'processing',
                        'shipped',
                        'delivered',
                        'cancelled',
                        'paid',
                      ] as const
                    ).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {users[selectedOrder.user_id]?.first_name || 'N/A'}{' '}
                    {users[selectedOrder.user_id]?.last_name || ''}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {users[selectedOrder.user_id]?.email || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Payment Method
                  </h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedOrder.payment_method || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>

                {selectedOrder.processing_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Processing Date
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedOrder.processing_date).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedOrder.shipped_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Shipped Date
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedOrder.shipped_date).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedOrder.delivered_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Delivered Date
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedOrder.delivered_date).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedOrder.cancelled_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cancelled Date
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedOrder.cancelled_date).toLocaleString()}
                    </p>
                  </div>
                )}
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Description
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
                      {selectedOrder.items?.map((item) => {
                        const product = products[item.id] || {};
                        const totalPrice = product.price * (item.quantity || 0);
                        return (
                          <tr key={`${item.id}-${item.quantity}`}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {product.name || 'Product'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {item.description || product.description || '-'}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                              {formatCurrency(product.price || 0)}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                              {formatCurrency(totalPrice)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                >
                  Delete Order
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
