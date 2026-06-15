import { ReactNode } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { logoPengayoman, logoInspektorat } from './assets/logos';

interface HeaderWithLogosProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function HeaderWithLogos({ children, title, subtitle }: HeaderWithLogosProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Logos */}
      <div className="bg-white shadow-md border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Kiri */}
            <div className="flex-shrink-0">
              <img
                src={logoPengayoman}
                alt="Logo Pengayoman - Kementerian Hukum dan HAM"
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
            </div>

            {/* Title */}
            <div className="flex-1 text-center">
              {title && (
                <h1 className="text-xl md:text-2xl lg:text-3xl text-gray-800 leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Logo Kanan */}
            <div className="flex-shrink-0">
              <img
                src={logoInspektorat}
                alt="Logo Inspektorat Jenderal"
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 py-8">
        {children}
      </div>
    </div>
  );
}
