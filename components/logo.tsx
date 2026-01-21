'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function Logo({ 
  className = '', 
  priority = false,
  sizes = '(max-width: 640px) 20vw, (max-width: 1024px) 20vw, 20vw'
}: LogoProps) {
  return (
    <picture className={`block w-full h-full ${className}`}>
      {/* Small screens (mobile) */}
      <source
        media="(max-width: 640px)"
        srcSet="/images/qpeptide_finder_logo_transparent_small.webp"
        type="image/webp"
      />
      <source
        media="(max-width: 640px)"
        srcSet="/images/qpeptide_finder_logo_transparent_small.png"
        type="image/png"
      />
      
      {/* Medium screens (tablet) */}
      <source
        media="(min-width: 641px) and (max-width: 1024px)"
        srcSet="/images/qpeptide_finder_logo_transparent_medium.webp"
        type="image/webp"
      />
      <source
        media="(min-width: 641px) and (max-width: 1024px)"
        srcSet="/images/qpeptide_finder_logo_transparent_medium.png"
        type="image/png"
      />
      
      {/* Large screens (desktop) */}
      <source
        media="(min-width: 1025px)"
        srcSet="/images/qpeptide_finder_logo_transparent_large.webp"
        type="image/webp"
      />
      <source
        media="(min-width: 1025px)"
        srcSet="/images/qpeptide_finder_logo_transparent_large.png"
        type="image/png"
      />
      
      {/* Fallback Image */}
      <Image
        src="/images/qpeptide_finder_logo_transparent_medium.png"
        alt="QPeptide Finder Logo"
        width={400}
        height={400}
        className="w-full h-full object-contain"
        priority={priority}
        sizes={sizes}
      />
    </picture>
  );
}