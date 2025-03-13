import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { upload } from '@/utils/supabase/storage';

interface ImageUploaderProps {
  bucket: string;
  onUploadComplete: (url: string) => void;
  className?: string;
}

export default function ImageUploader({
  bucket,
  onUploadComplete,
  className = '',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño y tipo
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Subir archivo
      const { publicUrl } = await upload(file, bucket, fileName);
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {isUploading && <p className="mt-1 text-sm text-gray-500">Uploading image...</p>}
    </div>
  );
}
