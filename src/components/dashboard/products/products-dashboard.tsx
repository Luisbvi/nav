'use client';

import { useState, useRef } from 'react';
import { FileSpreadsheet, PlusCircle } from 'lucide-react';
import { type FormData, Product } from '@/types';
import ProductTable from '@/components/dashboard/product-table';
import { createClient } from '@/utils/supabase/client';
import { deleteProduct, updateProduct, addProduct } from '@/app/(private)/actions/products';
import AddEditProductModal from './add-edit-product-modal';
import ImportExcelModal from './import-excel-modal';

interface ProductsDashboardProps {
  initialProducts: Product[];
  initialCategories: string[];
}

const supabase = createClient();

export default function ProductsDashboard({
  initialProducts,
  initialCategories,
}: ProductsDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<string[]>(initialCategories);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState<Product[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    category: categories[0] || '',
    unit: 'KG',
    stock: 0,
    status: 'active',
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Manejo de inputs
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

  // Función para eliminar producto
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const result = await deleteProduct(id);

      if (result.error) {
        console.error('Error deleting product:', result.error);
        return;
      }
      // Actualizar lista de productos
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

  // editar producto
  const handleEditProduct = (id: string) => {
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
  };

  // agregar producto
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price.toString());
      submitData.append('category', formData.category);
      submitData.append('unit', formData.unit);
      submitData.append('stock', formData.stock.toString());
      submitData.append('imageUrl', imageUrl);

      if (!formData.category) {
        setFormError('Category is required');
        return;
      }

      const result = editingProductId
        ? await updateProduct(editingProductId, submitData)
        : await addProduct(submitData);

      if (result.error) {
        setFormError(result.error);
      } else {
        setFormSuccess(
          editingProductId
            ? 'Producto actualizado correctamente!'
            : 'Producto agregado correctamente!'
        );
        setShowAddModal(false);
        resetForm();

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('name');
        if (!productsError && productsData) {
          setProducts(productsData);
        }
      }
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Fallo al agregar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para reiniciar el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories[0] || '',
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

  // Funciones para manejar el modal de importación
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
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Listado de Productos</h2>
        <div className="flex gap-2">
          <button
            disabled={true}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-5 w-5" />
            Importar Excel
          </button>
          <button
            disabled={true}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <FileSpreadsheet className="h-5 w-5" />
            Descargar Template
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-[#0099ff] px-4 py-2 text-white hover:bg-[#0088ee]"
          >
            <PlusCircle className="h-5 w-5" />
            Agregar Producto
          </button>
        </div>
      </div>

      <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />

      {showAddModal && (
        <AddEditProductModal
          formData={formData}
          categories={categories}
          imageUrl={imageUrl}
          isSubmitting={isSubmitting}
          formError={formError}
          formSuccess={formSuccess}
          editingProductId={editingProductId}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleAddProduct}
          onClose={() => {
            resetForm();
            setShowAddModal(false);
          }}
          onImageUploadComplete={(url) => {
            setImageUrl(url);
            setFormSuccess('Imagen subida correctamente!');
          }}
        />
      )}

      {showImportModal && (
        <ImportExcelModal
          importedData={importedData}
          importErrors={importErrors}
          importSuccess={importSuccess}
          onClose={handleCloseImportModal}
          onConfirmImport={() => {
            //TODO: Implementar la lógica para importar los datos
          }}
        />
      )}
    </>
  );
}
