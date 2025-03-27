'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProductGalleryProps {
  imageUrl: string | null;
  productName: string;
  additionalImages?: string[];
}

const ProductGallery = ({ imageUrl, productName, additionalImages = [] }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(imageUrl);
  const allImages = [imageUrl || '/images/img-placeholder.webp', ...additionalImages];

  const displayImages =
    allImages.length > 1
      ? allImages
      : [
          imageUrl || '/images/img-placeholder.webp',
          '/images/img-placeholder.webp',
          '/images/img-placeholder.webp',
        ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-4 not-dark:shadow dark:bg-gray-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          <Image
            src={selectedImage || '/images/img-placeholder.webp'}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            priority
          />
        </motion.div>
      </div>

      {/* Other imgs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3">
          {displayImages.map((img, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setSelectedImage(img)}
              className={`relative aspect-square size-20 cursor-pointer overflow-hidden rounded-md border-2 ${selectedImage === img ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Image
                src={img || '/images/img-placeholder.webp'}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductGallery;
