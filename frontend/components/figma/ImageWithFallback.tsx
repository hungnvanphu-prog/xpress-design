"use client";

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Ảnh tối ưu qua next/image với fallback khi lỗi.
 * - Nếu parent có width/height cụ thể (thường qua className + aspect), dùng `fill`.
 * - Tự động chuyển sang AVIF/WebP, lazy load, responsive srcset.
 */
export function ImageWithFallback(props: Props) {
  const [didError, setDidError] = useState(false);
  const { src, alt = '', style, className, fill, width, height, sizes, priority, ...rest } = props;

  if (!src || didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ERROR_IMG_SRC} alt="Error loading image" data-original-url={src} />
        </div>
      </div>
    );
  }

  // Mặc định dùng `fill` để tương thích với code hiện tại (chỉ có className, không có width/height)
  const useFill = fill ?? (width === undefined && height === undefined);
  const unoptimized = typeof src === 'string' && src.includes('/uploads/');

  if (useFill) {
    return (
      <div className={`relative ${className ?? ''}`} style={style}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
          priority={priority}
          unoptimized={unoptimized}
          onError={() => setDidError(true)}
          style={{ objectFit: 'cover' }}
          {...rest}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width as number}
      height={height as number}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={className}
      style={style}
      onError={() => setDidError(true)}
      {...rest}
    />
  );
}