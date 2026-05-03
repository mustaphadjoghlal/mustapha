import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  loading = "lazy",
  fetchPriority = "auto"
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center p-4">
          <p className="text-sm">صورة غير متوفرة</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading={loading}
      // @ts-ignore
      fetchpriority={fetchPriority}
    />
  );
}
