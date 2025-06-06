'use client';

import React from 'react';
import { useState, useCallback, useMemo, useReducer } from 'react';
import { PlusCircle } from 'lucide-react';
import type { FormData, Product, LanguageInfo } from '@/types';
import AddEditProductModal from './add-edit-product-modal';
import ProductTable from '../product-table';
import { createClient } from '@/utils/supabase/client';

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'hi', 'ru', 'zh', 'fil'] as const;

interface LanguageState {
  [key: string]: {
    name: string;
    description: string;
  };
}

type LanguageAction =
  | { type: 'SET_NAME'; lang: string; value: string }
  | { type: 'SET_DESCRIPTION'; lang: string; value: string }
  | { type: 'RESET' }
  | { type: 'SET_ALL'; data: LanguageState };

const initialLanguageState: LanguageState = {
  en: { name: '', description: '' },
  es: { name: '', description: '' },
  fr: { name: '', description: '' },
  hi: { name: '', description: '' },
  ru: { name: '', description: '' },
  zh: { name: '', description: '' },
  fil: { name: '', description: '' },
};

function languageReducer(state: LanguageState, action: LanguageAction): LanguageState {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        [action.lang]: {
          ...state[action.lang],
          name: action.value,
        },
      };
    case 'SET_DESCRIPTION':
      return {
        ...state,
        [action.lang]: {
          ...state[action.lang],
          description: action.value,
        },
      };
    case 'RESET':
      return initialLanguageState;
    case 'SET_ALL':
      return action.data;
    default:
      return state;
  }
}

interface ProductsDashboardProps {
  initialProducts: Product[];
  initialCategories: string[];
}

export default function ProductsDashboard({
  initialProducts,
  initialCategories,
}: ProductsDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Estados del formulario
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState(initialCategories[0] || '');
  const [unit, setUnit] = useState('KG');
  const [stock, setStock] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [languageState, dispatchLanguage] = useReducer(languageReducer, initialLanguageState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const supabase = createClient();

  // Handlers memoizados
  const createLanguageHandlers = useCallback(
    (lang: string) => ({
      handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatchLanguage({ type: 'SET_NAME', lang, value: e.target.value });
      },
      handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatchLanguage({ type: 'SET_DESCRIPTION', lang, value: e.target.value });
      },
      name: languageState[lang]?.name || '',
      description: languageState[lang]?.description || '',
    }),
    [languageState]
  );

  const languageHandlers = useMemo(() => {
    const handlers: Record<string, any> = {};
    SUPPORTED_LANGUAGES.forEach((lang) => {
      handlers[lang] = createLanguageHandlers(lang);
    });
    return handlers;
  }, [createLanguageHandlers]);

  const formData = useMemo((): FormData => {
    const info: Record<string, LanguageInfo> = {};
    SUPPORTED_LANGUAGES.forEach((lang) => {
      info[lang] = {
        name: languageState[lang]?.name || '',
        description: languageState[lang]?.description || '',
      };
    });

    return {
      price,
      category,
      unit,
      stock,
      discount,
      info,
    };
  }, [languageState, price, category, unit, stock, discount]);

  // Handlers para campos básicos
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number.parseFloat(e.target.value) || 0);
  }, []);

  const handleStockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStock(Number.parseFloat(e.target.value) || 0);
  }, []);

  const handleDiscountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscount(Number.parseFloat(e.target.value) || 0);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
  }, []);

  const handleUnitChange = useCallback((value: string) => {
    setUnit(value);
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSelectChange = useCallback((field: keyof FormData, value: string) => {
    if (field === 'category') {
      setCategory(value);
    } else if (field === 'unit') {
      setUnit(value);
    }
  }, []);

  const resetForm = useCallback(() => {
    setPrice(0);
    setCategory(initialCategories[0] || '');
    setUnit('KG');
    setStock(0);
    setDiscount(0);
    dispatchLanguage({ type: 'RESET' });
    setImageFile(null);
    setImagePreview('');
    setEditingProductId(null);
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(false);
  }, [initialCategories]);

  const handleEditProduct = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      setEditingProductId(id);
      setPrice(product.price);
      setCategory(product.category);
      setUnit(product.unit || 'KG');
      setStock(product.stock);
      setDiscount(product.discount || 0);

      const productInfo = product.info || {};
      const newLanguageState: LanguageState = {};

      SUPPORTED_LANGUAGES.forEach((lang) => {
        newLanguageState[lang] = {
          name: productInfo[lang]?.name || '',
          description: productInfo[lang]?.description || '',
        };
      });

      dispatchLanguage({ type: 'SET_ALL', data: newLanguageState });
      setImagePreview(product.image_url || '');
      setShowAddModal(true);
    },
    [products]
  );

  const handleDeleteProduct = useCallback(async (id: string) => {
    console.log('Deleting product with ID:', id);

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      setFormError(`Failed to delete product: ${error.message}`);
      return;
    }

    console.log('Product deleted successfully:', id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      try {
        // Validaciones requeridas
        if (!languageState.en?.name?.trim()) {
          setFormError('English name is required');
          return;
        }
        if (!languageState.en?.description?.trim()) {
          setFormError('English description is required');
          return;
        }

        if (!imageFile && !editingProductId) {
          setFormError('Image is required for new products');
          return;
        }

        const productData = {
          category,
          price,
          unit,
          stock,
          discount: discount || 0,
          info: {} as Record<string, LanguageInfo>,
        };

        // Construir información multilingüe
        SUPPORTED_LANGUAGES.forEach((lang) => {
          productData.info[lang] = {
            name: languageState[lang]?.name?.trim() || languageState.en.name.trim(),
            description:
              languageState[lang]?.description?.trim() || languageState.en.description.trim(),
          };
        });

        let result;
        let imageUrl = null;

        if (editingProductId) {
          // Verificar que el producto existe antes de actualizar
          const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('id')
            .eq('id', editingProductId)
            .single();

          if (checkError || !existingProduct) {
            throw new Error('Product not found or has been deleted');
          }

          // Actualización de producto existente
          const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProductId)
            .select()
            .single();

          if (error) {
            console.error('Update error:', error);
            throw new Error(`Failed to update product: ${error.message}`);
          }
          result = data;

          // Subir nueva imagen si se seleccionó una
          if (imageFile) {
            imageUrl = await uploadProductImage(editingProductId, imageFile);
            // Actualizar la URL de la imagen
            const { error: imageUpdateError } = await supabase
              .from('products')
              .update({ image_url: imageUrl })
              .eq('id', editingProductId);

            if (imageUpdateError) {
              console.error('Image update error:', imageUpdateError);
            }
          }
        } else {
          console.log('Creating new product with data:', productData);
          // Creación de nuevo producto - dejar que Supabase genere el ID
          const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

          if (error) {
            console.error('Insert error:', error);
            throw new Error(`Failed to create product: ${error.message}`);
          }
          result = data;

          // Subir imagen para nuevos productos
          if (imageFile && result?.id) {
            try {
              console.log('Uploading image for new product:', result.id);
              imageUrl = await uploadProductImage(result.id, imageFile);
              console.log('Image uploaded successfully:', imageUrl);

              if (!imageUrl) {
                console.warn('Image upload returned empty URL');
                // No lanzar error, continuar sin imagen
              } else {
                // Actualizar la URL de la imagen - usar update simple
                const { error: imageUpdateError } = await supabase
                  .from('products')
                  .update({ image_url: imageUrl })
                  .eq('id', result.id);

                if (imageUpdateError) {
                  console.error('Image update error:', imageUpdateError);
                  // No detener el proceso, solo advertir
                  console.warn('Product created successfully but image URL update failed');
                } else {
                  console.log('Image URL updated successfully for product:', result.id);
                  // Obtener el producto actualizado para tener los datos más recientes
                  const { data: updatedProduct } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', result.id)
                    .single();

                  if (updatedProduct) {
                    result = updatedProduct;
                  }
                }
              }
            } catch (imageError) {
              console.error('Image upload error:', imageError);
              // No detener el proceso, el producto ya fue creado exitosamente
              console.warn('Product created successfully but image processing failed');
            }
          }
        }

        // Refrescar lista de productos
        await refreshProductsList();

        setFormSuccess(
          editingProductId ? 'Product updated successfully!' : 'Product created successfully!'
        );

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
        }, 1500);
      } catch (error: unknown) {
        console.error('Submission error:', error);
        setFormError(
          error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [languageState, price, category, unit, stock, discount, imageFile, editingProductId, resetForm]
  );

  const uploadProductImage = async (productId: string, file: File): Promise<string> => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Only JPEG, PNG, and WebP images are allowed');
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFormError('Image must be smaller than 10MB');
      throw new Error('Image must be smaller than 10MB');
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${productId}.${fileExtension}`;

    console.log('Uploading image:', fileName, 'Size:', file.size, 'Type:', file.type);

    const { error: uploadError } = await supabase.storage
      .from('products-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      setFormError(`Failed to upload image: ${uploadError.message}`);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('products-images').getPublicUrl(fileName);

    return publicUrl;
  };

  // Función auxiliar para refrescar la lista de productos
  const refreshProductsList = async (): Promise<void> => {
    const { data: updatedProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to refresh products: ${fetchError.message}`);
    }

    setProducts(updatedProducts || []);
  };

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, [resetForm]);

  const handleInputChange = useCallback(() => {}, []);

  // Componente memoizado para evitar re-renders innecesarios
  const memoizedProductTable = useMemo(
    () => (
      <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
    ),
    [products, handleEditProduct, handleDeleteProduct]
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Listado de Productos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-[#0099ff] px-4 py-2 text-white transition-colors hover:bg-[#0088ee]"
          >
            <PlusCircle className="h-5 w-5" />
            Agregar Producto
          </button>
        </div>
      </div>

      {memoizedProductTable}

      {showAddModal && (
        <AddEditProductModal
          formData={formData}
          categories={initialCategories}
          imagePreview={imagePreview}
          isSubmitting={isSubmitting}
          formError={formError}
          formSuccess={formSuccess}
          editingProductId={editingProductId}
          supportedLanguages={SUPPORTED_LANGUAGES}
          languageHandlers={languageHandlers}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          onPriceChange={handlePriceChange}
          onStockChange={handleStockChange}
          onDiscountChange={handleDiscountChange}
          onCategoryChange={handleCategoryChange}
          onUnitChange={handleUnitChange}
        />
      )}
    </>
  );
}
