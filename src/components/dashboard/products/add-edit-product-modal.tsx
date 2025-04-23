'use client';
import { X, AlertCircle, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';

import ImageUploader from '@/components/image-uploader';
import { FormEvent } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FormData {
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  image_url?: string;
}

interface AddEditProductModalProps {
  formData: FormData;
  categories: string[];
  imageUrl: string;
  isSubmitting: boolean;
  formError: string | null;
  formSuccess: string | null;
  editingProductId: string | null;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSelectChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onImageUploadComplete: (url: string) => void;
}

const AddEditProductModal = ({
  formData,
  categories,
  isSubmitting,
  formError,
  formSuccess,
  editingProductId,
  onInputChange,
  onSelectChange,
  onSubmit,
  onClose,
  onImageUploadComplete,
}: AddEditProductModalProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity dark:bg-black/40"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform rounded-xl bg-white p-6 shadow-xl transition-all dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold dark:text-white">
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{formError}</p>
                </div>
              </div>
            </div>
          )}

          {formSuccess && (
            <div className="mb-6 border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-200">{formSuccess}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="dark:text-gray-300">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    required
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="dark:text-gray-300">
                    Category *
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        value={
                          categories.includes(formData.category) ? formData.category : 'custom'
                        }
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            onSelectChange('category', '');
                          } else {
                            onSelectChange('category', value);
                          }
                        }}
                      >
                        <SelectTrigger className="dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="dark:border-gray-600 dark:bg-gray-700">
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="dark:text-white dark:hover:bg-gray-600"
                            >
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem
                            value="custom"
                            className="font-semibold dark:text-white dark:hover:bg-gray-600"
                          >
                            + Add Category
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.category === '' || !categories.includes(formData.category)) && (
                      <div className="flex-1">
                        <Input
                          id="customCategory"
                          name="category"
                          placeholder="Enter category name"
                          value={formData.category}
                          onChange={(e) => onSelectChange('category', e.target.value)}
                          required
                          className="dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="dark:text-gray-300">
                      Price *
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={onInputChange}
                      required
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit" className="dark:text-gray-300">
                      Unit
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => onSelectChange('unit', value)}
                    >
                      <SelectTrigger className="dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent className="dark:border-gray-600 dark:bg-gray-700">
                        <SelectItem value="KG" className="dark:text-white dark:hover:bg-gray-600">
                          KG
                        </SelectItem>
                        <SelectItem value="UNIT" className="dark:text-white dark:hover:bg-gray-600">
                          UNIT
                        </SelectItem>
                        <SelectItem
                          value="LITER"
                          className="dark:text-white dark:hover:bg-gray-600"
                        >
                          LITER
                        </SelectItem>
                        <SelectItem value="TON" className="dark:text-white dark:hover:bg-gray-600">
                          TON
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock" className="dark:text-gray-300">
                    Stock *
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={onInputChange}
                    required
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    rows={4}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-300">Product Image</Label>
                <ImageUploader
                  bucket="products"
                  onUploadComplete={(url) => {
                    onImageUploadComplete(url);
                  }}
                  className="mt-4"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Upload an image for the product. Maximum size: 5MB.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
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
  );
};

export default AddEditProductModal;
