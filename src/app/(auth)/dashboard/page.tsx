"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShipIcon,
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
} from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@/utils/supabase/client";
import {
  addProduct,
  deleteProduct,
  updateProduct,
  getCategories,
} from "@/app/(auth)/actions/products";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploader from "@/components/imageUploader";

// Default categories if API fails
const defaultCategories = [
  "ESSENTIALS",
  "FOOD & PROVISIONS",
  "MEDICAL SUPPLIES",
  "SAFETY EQUIPMENT",
  "TECHNICAL PARTS",
  "CLOTHING",
  "MISCELLANEOUS",
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [importedData, setImportedData] = useState<Product[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add product form state
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: defaultCategories[0],
    customCategory: "",
    price: "",
    unit: "KG",
    stock: "",
    description: "",
    image: "",
  });

  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch products and categories on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch categories
        const result = await getCategories();
        if (result.categories && result.categories.length > 0) {
          setCategories(result.categories);
          setFormData((prev) => ({
            ...prev,
            category: result.categories[0],
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Stats for dashboard
  const stats = {
    totalProducts: products.length,
    totalCategories: categories.length,
    lowStock: products.filter((p) => p.stock < 50).length,
    totalValue: products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0,
    ),
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stock" ? Number.parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      const result = await deleteProduct(id);

      if (result.error) {
        console.error("Error deleting product:", result.error);
        return;
      }

      // Actualizar la lista de productos
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (!productsError && productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
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
        category: product.category,
        customCategory: "",
        price: product.price.toString(),
        unit: product.unit || "KG",
        stock: product.stock.toString(),
        description: product.description || "",
        image: product.image_url || "",
      });

      setImageUrl(product.image_url || "");
      setShowAddModal(true);
    } catch (error) {
      console.error("Error editing product:", error);
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
      submitData.append("name", formData.name);
      submitData.append("category", formData.category);
      submitData.append(
        "customCategory",
        useCustomCategory ? formData.customCategory : "",
      );
      submitData.append("price", formData.price.toString());
      submitData.append("unit", formData.unit);
      submitData.append("stock", formData.stock.toString());
      submitData.append("description", formData.description);
      submitData.append("imageUrl", imageUrl);

      // Submit the form
      const result = editingProductId
        ? await updateProduct(editingProductId, submitData)
        : await addProduct(submitData);

      if (result.error) {
        setFormError(result.error);
      } else {
        setFormSuccess(
          editingProductId
            ? "Product updated successfully!"
            : "Product added successfully!",
        );
        setShowAddModal(false);

        // Reset form
        setFormData({
          name: "",
          category: categories[0],
          customCategory: "",
          price: "",
          unit: "KG",
          stock: "",
          description: "",
          image: "",
        });
        setImageUrl("");
        setUseCustomCategory(false);
        setEditingProductId(null);

        // Fetch updated products list
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (!productsError && productsData) {
          setProducts(productsData);
        }
      }
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For this demo, we'll just use a placeholder
      setFormData({
        ...formData,
        image: URL.createObjectURL(file),
      });
    }
  };

  // Handle Excel file import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportErrors([]);
    setImportSuccess(false);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validate and transform the data
          const validData = jsonData
            .filter((row: any) => {
              if (!row.name || !row.category || !row.price || !row.stock) {
                setImportErrors((prev) => [
                  ...prev,
                  `Row ${jsonData.indexOf(row) + 2}: Missing required fields`,
                ]);
                return false;
              }
              if (isNaN(Number.parseFloat(row.price))) {
                setImportErrors((prev) => [
                  ...prev,
                  `Row ${jsonData.indexOf(row) + 2}: Invalid price`,
                ]);
                return false;
              }
              if (isNaN(Number.parseInt(row.stock))) {
                setImportErrors((prev) => [
                  ...prev,
                  `Row ${jsonData.indexOf(row) + 2}: Invalid stock`,
                ]);
                return false;
              }
              return true;
            })
            .map(
              (row: any): Product => ({
                id: crypto.randomUUID(),
                name: row.name,
                category: row.category,
                price: Number.parseFloat(row.price),
                unit: row.unit || "KG",
                stock: Number.parseInt(row.stock),
                description: row.description || "",
                image_url: row.image || "",
              }),
            );

          setImportedData(validData);
          setShowImportModal(true);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          setImportErrors([
            "Error processing Excel file. Make sure the format is correct.",
          ]);
          setShowImportModal(true);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Handle import confirmation
  const handleImportConfirm = async () => {
    if (importedData.length > 0) {
      try {
        // Insert products into database
        const { data, error } = await supabase
          .from("products")
          .insert(
            importedData.map((item) => ({
              name: item.name,
              category: item.category,
              price: item.price.toFixed(2),
              unit: item.unit || "KG",
              stock: item.stock,
              image_url: null,
            })),
          )
          .select();

        if (error) throw error;

        // Update local state
        setProducts([...products, ...(data || [])]);
        setImportSuccess(true);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error importing products:", error);
        setImportErrors(["Error importing products to database"]);
      }
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const template = [
      {
        name: "PRODUCT NAME",
        category: "CATEGORY",
        price: "0.00",
        unit: "KG",
        stock: "0",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "product_import_template.xlsx");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: categories[0],
      customCategory: "",
      price: "",
      unit: "KG",
      stock: "",
      description: "",
      image: "",
    });
    setImageUrl("");
    setUseCustomCategory(false);
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
      fileInputRef.current.value = "";
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
          <div className="relative h-32">
            <Image
              src="/images/logo-w-lg.png"
              alt="logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 p-2 rounded-md ${activeTab === "dashboard" ? "bg-white text-[#0099ff]" : "hover:bg-blue-600"}`}
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("products")}
                className={`w-full flex items-center gap-3 p-2 rounded-md ${activeTab === "products" ? "bg-white text-[#0099ff]" : "hover:bg-blue-600"}`}
              >
                <Package className="h-5 w-5" />
                Products
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 p-2 rounded-md ${activeTab === "orders" ? "bg-white text-[#0099ff]" : "hover:bg-blue-600"}`}
              >
                <Anchor className="h-5 w-5" />
                Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full flex items-center gap-3 p-2 rounded-md ${activeTab === "customers" ? "bg-white text-[#0099ff]" : "hover:bg-blue-600"}`}
              >
                <Users className="h-5 w-5" />
                Customers
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 p-2 rounded-md ${activeTab === "settings" ? "bg-white text-[#0099ff]" : "hover:bg-blue-600"}`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-blue-400">
            <Link
              href="/"
              className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white p-4 shadow flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "products" && "Product Management"}
            {activeTab === "orders" && "Order Management"}
            {activeTab === "customers" && "Customer Management"}
            {activeTab === "settings" && "Settings"}
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                <Image
                  src="/images/img-placeholder.webp"
                  alt="User"
                  width={32}
                  height={32}
                />
              </div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Total Products
                </h3>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-[#0099ff] mr-2" />
                  <span className="text-2xl font-bold">
                    {stats.totalProducts}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Categories
                </h3>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-[#0099ff] mr-2" />
                  <span className="text-2xl font-bold">
                    {stats.totalCategories}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Low Stock
                </h3>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-red-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.lowStock}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Total Value
                </h3>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">
                    ${stats.totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Recent Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image
                                src={
                                  product.image_url ||
                                  "/images/img-placeholder.webp"
                                }
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
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.stock > 50
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
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
        {activeTab === "products" && (
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h2 className="text-lg font-bold">Product List</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={() => {}}
                  />
                  <button
                    disabled={true}
                    onClick={() => fileInputRef.current?.click()}
                    className=" flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    Import Excel
                  </button>
                </div>
                <button
                  disabled={true}
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                >
                  <Download className="h-5 w-5" />
                  Download Template
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-[#0099ff] hover:bg-[#0088ee] text-white py-2 px-4 rounded-md"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image
                                src={
                                  product.image_url ||
                                  "/images/img-placeholder.webp"
                                }
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
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                            {product.unit && (
                              <span className="text-xs text-gray-500 ml-1">
                                / {product.unit}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.stock > 50
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
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
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs would go here */}
        {(activeTab === "orders" ||
          activeTab === "customers" ||
          activeTab === "settings") && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-400">
              Section under development
            </h2>
            <p className="text-gray-500 mt-2">
              This functionality will be available soon
            </p>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="category">Category *</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useCustomCategory"
                            checked={useCustomCategory}
                            onCheckedChange={(checked) =>
                              setUseCustomCategory(checked === true)
                            }
                          />
                          <label
                            htmlFor="useCustomCategory"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Create custom category
                          </label>
                        </div>
                      </div>

                      {useCustomCategory ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            id="customCategory"
                            name="customCategory"
                            value={formData.customCategory}
                            onChange={handleInputChange}
                            placeholder="Enter custom category name"
                            required={useCustomCategory}
                          />
                        </div>
                      ) : (
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            handleSelectChange("category", value)
                          }
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
                      )}
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
                          onValueChange={(value) =>
                            handleSelectChange("unit", value)
                          }
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
                      bucket="products-images"
                      path="images"
                      onUploadComplete={(url: string) => {
                        setImageUrl(url);
                        setFormData((prev) => ({ ...prev, image: url }));
                      }}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-2">
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
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Import Products from Excel
                </h2>
                <button
                  onClick={handleCloseImportModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {importSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Import Successful
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {importedData.length} products have been imported
                    successfully.
                  </p>
                  <button
                    onClick={handleCloseImportModal}
                    className="px-4 py-2 bg-[#0099ff] hover:bg-[#0088ee] text-white rounded-md"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {importErrors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800 mb-2">
                            {importErrors.length} errors found in the file
                          </h3>
                          <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                            {importErrors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {importErrors.length > 5 && (
                              <li>
                                And {importErrors.length - 5} more errors...
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {importedData.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Data preview ({importedData.length} products)
                        </h3>
                        <div className="overflow-x-auto max-h-80 border rounded-md">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Stock
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {importedData.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.category}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${item.price.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.unit || "KG"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleImportConfirm}
                          className="px-4 py-2 bg-[#0099ff] hover:bg-[#0088ee] text-white rounded-md"
                        >
                          Confirm Import
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        No valid data found to import. Please check the file
                        format.
                      </p>
                      <button
                        onClick={handleCloseImportModal}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
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

function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
