'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Users,
  Anchor,
  BarChart3,
  Settings,
  LogOut,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@/utils/supabase/client';
import {
  addProduct,
  deleteProduct,
  updateProduct,
  getCategories,
} from '@/app/(auth)/actions/server-actions';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUploader from '@/components/imageUploader';

// Default categories if API fails
const defaultCategories = [
  'ESSENTIALS',
  'FOOD & PROVISIONS',
  'MEDICAL SUPPLIES',
  'SAFETY EQUIPMENT',
  'TECHNICAL PARTS',
  'CLOTHING',
  'MISCELLANEOUS',
];

// Define el tipo Product
interface Product {
  image_url: string;
  id: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  stock: number;
  description?: string;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  image_url?: string;
}


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [importedData, setImportedData] = useState<Product[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add product form state
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    category: defaultCategories[0],
    unit: 'KG',
    stock: 0,
    status: 'active',
  });

  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch categories
        const result = await getCategories();
        const fetchedCategories = result.categories || defaultCategories;
        if (fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
          setFormData((prev) => ({
            ...prev,
            category: fetchedCategories[0],
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [supabase]);

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats for dashboard
  const stats = {
    totalProducts: products.length,
    totalCategories: categories.length,
    lowStock: products.filter((p) => p.stock < 50).length,
    totalValue: products.reduce((sum, product) => sum + product.price * product.stock, 0),
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? Number.parseFloat(value) : value,
    });
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const result = await deleteProduct(id);

      if (result.error) {
        console.error('Error deleting product:', result.error);
        return;
      }

      // Actualizar la lista de productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (!productsError && productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Handle edit product
  const handleEditProduct = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      setEditingProductId(id);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        unit: product.unit || 'KG',
        stock: product.stock,
        status: 'active',
      });

      setImageUrl(product.image_url || '');
      setShowAddModal(true);
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  // Handle form submission for adding/editing a product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price.toString());
      submitData.append('category', formData.category);
      submitData.append('unit', formData.unit);
      submitData.append('stock', formData.stock.toString());
      submitData.append('imageUrl', imageUrl);

      // Submit the form
      const result = editingProductId
        ? await updateProduct(editingProductId, submitData)
        : await addProduct(submitData);

      if (result.error) {
        setFormError(result.error);
      } else {
        setFormSuccess(
          editingProductId ? 'Product updated successfully!' : 'Product added successfully!'
        );
        setShowAddModal(false);

        // Reset form
        setFormData({
          name: '',
          description: '',
          price: 0,
          category: categories[0],
          unit: 'KG',
          stock: 0,
          status: 'active',
        });
        setImageUrl('');
        setEditingProductId(null);

        // Fetch updated products list
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (!productsError && productsData) {
          setProducts(productsData);
        }
      }
    } catch (error: Error | unknown) {
      setFormError(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const template = [
      {
        name: 'PRODUCT NAME',
        category: 'CATEGORY',
        price: '0.00',
        unit: 'KG',
        stock: '0',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'product_import_template.xlsx');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories[0],
      unit: 'KG',
      stock: 0,
      status: 'active',
    });
    setImageUrl('');
    setEditingProductId(null);
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(false);
  };

  const handleCloseModal = () => {
    resetForm();
    setShowAddModal(false);
  };

  const resetImportModal = () => {
    setImportedData([]);
    setImportErrors([]);
    setImportSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseImportModal = () => {
    resetImportModal();
    setShowImportModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#0099ff] text-white">
        <Link href="/" className="w-60">
          <div className="relative h-[40px] w-[120px]">
            <Image 
              src="/images/logo-w-lg.png" 
              alt="logo" 
              fill 
              className="object-contain"
              sizes="120px"
            />
          </div>
        </Link>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex w-full items-center gap-3 rounded-md p-2 ${activeTab === 'dashboard' ? 'bg-white text-[#0099ff]' : 'hover:bg-blue-600'}`}
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex w-full items-center gap-3 rounded-md p-2 ${activeTab === 'products' ? 'bg-white text-[#0099ff]' : 'hover:bg-blue-600'}`}
              >
                <Package className="h-5 w-5" />
                Products
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex w-full items-center gap-3 rounded-md p-2 ${activeTab === 'orders' ? 'bg-white text-[#0099ff]' : 'hover:bg-blue-600'}`}
              >
                <Anchor className="h-5 w-5" />
                Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex w-full items-center gap-3 rounded-md p-2 ${activeTab === 'customers' ? 'bg-white text-[#0099ff]' : 'hover:bg-blue-600'}`}
              >
                <Users className="h-5 w-5" />
                Customers
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex w-full items-center gap-3 rounded-md p-2 ${activeTab === 'settings' ? 'bg-white text-[#0099ff]' : 'hover:bg-blue-600'}`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
            </li>
          </ul>

          <div className="mt-8 border-t border-blue-400 pt-4">
            <Link href="/" className="flex items-center gap-3 rounded-md p-2 hover:bg-blue-600">
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between bg-white p-4 shadow">
          <h1 className="text-xl font-bold">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'products' && 'Product Management'}
            {activeTab === 'orders' && 'Order Management'}
            {activeTab === 'customers' && 'Customer Management'}
            {activeTab === 'settings' && 'Settings'}
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="rounded-md border py-2 pr-4 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                <Image src="/images/img-placeholder.webp" alt="User" width={32} height={32} />
              </div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Total Products</h3>
                <div className="flex items-center">
                  <Package className="mr-2 h-8 w-8 text-[#0099ff]" />
                  <span className="text-2xl font-bold">{stats.totalProducts}</span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Categories</h3>
                <div className="flex items-center">
                  <Package className="mr-2 h-8 w-8 text-[#0099ff]" />
                  <span className="text-2xl font-bold">{stats.totalCategories}</span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Low Stock</h3>
                <div className="flex items-center">
                  <Package className="mr-2 h-8 w-8 text-red-500" />
                  <span className="text-2xl font-bold">{stats.lowStock}</span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Total Value</h3>
                <div className="flex items-center">
                  <Package className="mr-2 h-8 w-8 text-green-500" />
                  <span className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-bold">Recent Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <Image
                                src={product.image_url || '/images/img-placeholder.webp'}
                                alt={product.name}
                                fill
                                className="rounded-md object-contain"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                              product.stock > 50
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Content */}
        {activeTab === 'products' && (
          <div className="p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Product List</h2>
              <div className="flex gap-2">
                <button
                  disabled={true}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Import Excel
                </button>
                <button
                  disabled={true}
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Download Template
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 rounded-md bg-[#0099ff] px-4 py-2 text-white hover:bg-[#0088ee]"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <Image
                                src={product.image_url || '/images/img-placeholder.webp'}
                                alt={product.name}
                                fill
                                className="rounded-md object-contain"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                            {product.unit && (
                              <span className="ml-1 text-xs text-gray-500">/ {product.unit}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                              product.stock > 50
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="mr-4 text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs would go here */}
        {(activeTab === 'orders' || activeTab === 'customers' || activeTab === 'settings') && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-400">Section under development</h2>
            <p className="mt-2 text-gray-500">This functionality will be available soon</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop con desenfoque */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl transform rounded-xl bg-white p-6 shadow-xl transition-all">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {editingProductId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="mb-6 border-l-4 border-green-500 bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{formSuccess}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddProduct}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) => handleSelectChange('unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="UNIT">UNIT</SelectItem>
                            <SelectItem value="LITER">LITER</SelectItem>
                            <SelectItem value="NONE">NONE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Product Image</Label>
                    <ImageUploader
                      bucket="products"
                      onUploadComplete={(url) => {
                        setImageUrl(url);
                        setFormSuccess('Image uploaded successfully!');
                      }}
                      className="mt-4"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload an image for the product. Maximum size: 5MB.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop con desenfoque */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={handleCloseImportModal}
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl transform rounded-xl bg-white p-6 shadow-xl transition-all">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Import Products from Excel</h2>
                <button
                  onClick={handleCloseImportModal}
                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {importSuccess ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Import Successful</h3>
                  <p className="mb-6 text-gray-500">
                    {importedData.length} products have been imported successfully.
                  </p>
                  <button
                    onClick={handleCloseImportModal}
                    className="rounded-md bg-[#0099ff] px-4 py-2 text-white hover:bg-[#0088ee]"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {importErrors.length > 0 && (
                    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start">
                        <AlertCircle className="mt-0.5 mr-2 h-5 w-5 text-red-500" />
                        <div>
                          <h3 className="mb-2 text-sm font-medium text-red-800">
                            {importErrors.length} errors found in the file
                          </h3>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                            {importErrors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {importErrors.length > 5 && (
                              <li>And {importErrors.length - 5} more errors...</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {importedData.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <h3 className="mb-2 font-medium text-gray-700">
                          Data preview ({importedData.length} products)
                        </h3>
                        <div className="max-h-80 overflow-x-auto rounded-md border">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                  Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                  Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                  Unit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                  Stock
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {importedData.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {item.category}
                                  </td>
                                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                    ${item.price.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {item.unit || 'KG'}
                                  </td>
                                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                    {item.stock}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCloseImportModal}
                          className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {}}
                          className="rounded-md bg-[#0099ff] px-4 py-2 text-white hover:bg-[#0088ee]"
                        >
                          Confirm Import
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="mb-4 text-gray-500">
                        No valid data found to import. Please check the file format.
                      </p>
                      <button
                        onClick={handleCloseImportModal}
                        className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
