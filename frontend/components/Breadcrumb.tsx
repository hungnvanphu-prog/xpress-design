"use client";

import { Link } from '@/i18n/navigation';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-[12px] md:text-[14px] uppercase tracking-widest font-['Montserrat',sans-serif] ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center">
            {/* Nếu là mục cuối (Trang hiện tại) -> Màu #D4AF37 */}
            {isLast ? (
              <span className="text-[#D4AF37] font-semibold">
                {item.label}
              </span>
            ) : (
              /* Nếu không phải mục cuối -> Màu #888888 có link */
              <Link 
                href={item.path || '#'} 
                className="text-[#888888] hover:text-[#D4AF37] transition-colors"
              >
                {item.label}
              </Link>
            )}
            
            {/* Dấu phân cách '/' màu #D4AF37 */}
            {!isLast && (
              <span className="text-[#D4AF37] mx-2">/</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}