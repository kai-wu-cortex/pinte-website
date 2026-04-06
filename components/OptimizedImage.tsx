
import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  webP?: string;
}

/**
 * OptimizedImage Component - SEO-friendly responsive image component
 *
 * Features:
 * - Lazy loading by default (for non-priority images)
 * - Explicit width/height to prevent layout shifts
 * - WebP support with fallback
 * - Proper alt text requirement
 * - Sizes attribute for responsive images
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes,
  srcSet,
  webP,
}) => {
  // Priority images should load eagerly
  const effectiveLoading = priority ? 'eager' : loading;

  return (
    <picture>
      {/* WebP format if provided */}
      {webP && <source srcSet={webP} type="image/webp" />}

      {/* Fallback image (PNG/JPG) */}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={effectiveLoading}
        sizes={sizes}
        srcSet={srcSet}
        // Prevent layout shifts with aspect ratio if dimensions provided
        style={{
          ...(width && height ? { aspectRatio: `${width}/${height}` } : {}),
        }}
      />
    </picture>
  );
};

export default OptimizedImage;
