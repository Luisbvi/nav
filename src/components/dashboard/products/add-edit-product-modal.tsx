'use client';

import React from 'react';
import { useState, useMemo } from 'react';
import { X, Upload, Loader2, Globe, Trash2 } from 'lucide-react';
import type { FormData } from '@/types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LanguageHandlers {
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  description: string;
}

interface AddEditProductModalProps {
  formData: FormData;
  categories: string[];
  imagePreview: string;
  isSubmitting: boolean;
  formError: string | null;
  formSuccess: string | null;
  editingProductId: string | null;
  supportedLanguages: readonly string[];
  languageHandlers: Record<string, LanguageHandlers>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSelectChange: (field: keyof FormData, value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStockChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string) => void;
  onUnitChange: (value: string) => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  ru: 'Русский',
  zh: '中文',
  fil: 'Filipino',
};
const UNITS = ['KG', 'UNIT', 'TIN', 'SERVICE', 'PKT', 'PCS', 'LTS', 'TN', 'CM³'] as const;

const LanguageForm = React.memo(
  ({
    lang,
    handlers,
    isRequired,
  }: {
    lang: string;
    handlers: LanguageHandlers;
    isRequired: boolean;
  }) => {
    return (
      <div className="grid gap-4">
        <div>
          <Label
            htmlFor={`name-${lang}`}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Product Name
          </Label>
          <Input
            id={`name-${lang}`}
            name="name"
            value={handlers.name}
            onChange={handlers.handleNameChange}
            placeholder={`Name in ${LANGUAGE_NAMES[lang] || lang}`}
            required={isRequired}
            className="mt-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
          />
        </div>

        <div>
          <Label
            htmlFor={`description-${lang}`}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </Label>
          <Textarea
            id={`description-${lang}`}
            name="description"
            value={handlers.description}
            onChange={handlers.handleDescriptionChange}
            placeholder={`Description in ${LANGUAGE_NAMES[lang] || lang}`}
            rows={3}
            className="mt-1 resize-none border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
          />
        </div>
      </div>
    );
  }
);

LanguageForm.displayName = 'LanguageForm';

export default function AddEditProductModal({
  formData,
  categories,
  imagePreview,
  isSubmitting,
  formError,
  formSuccess,
  editingProductId,
  supportedLanguages,
  languageHandlers,
  onImageChange,
  onSubmit,
  onClose,
  onPriceChange,
  onStockChange,
  onDiscountChange,
  onCategoryChange,
  onUnitChange,
}: AddEditProductModalProps) {
  const [activeLang, setActiveLang] = useState('en');
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editingProductId);
  const modalTitle = isEditing ? 'Edit Product' : 'Add Product';
  const modalDescription = isEditing
    ? 'Modify the existing product information'
    : 'Complete the information to create a new product';
  const submitButtonText = isEditing ? 'Update' : 'Add';

  const tabsGridCols = useMemo(() => {
    const langCount = supportedLanguages.length;
    return langCount <= 4 ? 'grid-cols-4' : 'lg:grid-cols-7';
  }, [supportedLanguages.length]);

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 pb-4 dark:border-gray-700">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-gray-100">
                <Globe className="h-5 w-5" />
                {modalTitle}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {modalDescription}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <form onSubmit={onSubmit}>
            <CardContent className="space-y-6 bg-white p-6 dark:bg-gray-800">
              {/* Language Tabs */}
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Multilingual Information
                </Label>
                <Tabs value={activeLang} onValueChange={setActiveLang} className="mt-2">
                  <TabsList
                    className={`grid w-full ${tabsGridCols} border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700`}
                  >
                    {supportedLanguages.map((lang) => (
                      <TabsTrigger
                        key={lang}
                        value={lang}
                        className="text-xs text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 data-[state=active]:dark:bg-gray-600 data-[state=active]:dark:text-gray-100"
                      >
                        {lang.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {supportedLanguages.map((lang) => (
                    <TabsContent key={lang} value={lang} className="mt-4 space-y-4">
                      <div className="mb-4 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {LANGUAGE_NAMES[lang] || lang.toUpperCase()}
                        </Badge>
                        {lang === 'en' && (
                          <Badge
                            variant="default"
                            className="bg-blue-600 text-white dark:bg-blue-700"
                          >
                            Required
                          </Badge>
                        )}
                      </div>

                      <LanguageForm
                        lang={lang}
                        handlers={languageHandlers[lang]}
                        isRequired={lang === 'en'}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Product Details */}
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Product Details
                </Label>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Price
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price || 0}
                      onChange={onPriceChange}
                      step="1"
                      min="1"
                      placeholder="1"
                      required
                      className="mt-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={onCategoryChange}>
                      <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="unit"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Unit
                    </Label>
                    <Select value={formData.unit} onValueChange={onUnitChange}>
                      <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                        {UNITS.map((unit) => (
                          <SelectItem
                            key={unit}
                            value={unit}
                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-600"
                          >
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="stock"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Stock
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      step={1}
                      type="number"
                      value={formData.stock || 0}
                      onChange={onStockChange}
                      min="1"
                      placeholder="1"
                      required
                      className="mt-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label
                      htmlFor="discount"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Discount (%)
                    </Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      value={formData.discount || 0}
                      onChange={onDiscountChange}
                      min="0"
                      max="100"
                      placeholder="0"
                      className="mt-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Image Upload */}
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Product Image
                </Label>
                <div className="mt-4">
                  {!imagePreview ? (
                    <div className="flex w-full items-center justify-center">
                      <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="mb-2 h-8 w-8 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onImageChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div
                        className="relative h-64 w-64 overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                        onMouseEnter={() => setIsHoveringImage(true)}
                        onMouseLeave={() => setIsHoveringImage(false)}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />
                        {isHoveringImage && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={handleRemoveImage}
                              className="h-10 w-10 rounded-full"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={triggerFileInput}
                          className="text-sm"
                        >
                          Change Image
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onImageChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error/Success Messages */}
              {formError && (
                <Alert
                  variant="destructive"
                  className="border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                >
                  <AlertDescription className="!text-red-800 dark:!text-red-200">
                    {formError}
                  </AlertDescription>
                </Alert>
              )}

              {formSuccess && (
                <Alert className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
                  <AlertDescription className="!text-green-800 dark:!text-green-200">
                    {formSuccess}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px] bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Processing...' : submitButtonText}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
