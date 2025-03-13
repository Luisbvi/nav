"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { uploadImageClient } from "@/utils/supabase/storage";

interface ImageUploaderProps {
  bucket: string;
  path: string;
  initialImage?: string;
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export default function ImageUploader({
  bucket,
  path,
  initialImage,
  onUploadComplete,
  className = "",
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const storage = uploadImageClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    // Validate file size (maximum 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must not exceed 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      // Upload the image
      const { publicUrl } = await storage.upload(file, bucket, fileName, {
        upsert: true,
      });

      // Update state
      setImage(publicUrl);
      setSuccess(true);

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
        {image ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <Image
              src={image || "/placeholder.svg"}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setSuccess(false);
                if (onUploadComplete) onUploadComplete("");
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {isUploading ? "Uploading..." : "Click to upload an image"}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {success && !isUploading && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <Check className="h-4 w-4 mr-1" />
          <span>Image uploaded successfully</span>
        </div>
      )}
    </div>
  );
}
