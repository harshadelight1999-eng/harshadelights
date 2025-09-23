"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { logos, luxuryStyles, utils } from '../lib/assets'

interface LuxuryLogoProps {
  variant?: 'elegant' | 'elegantAlt'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  style?: 'default' | 'glow' | 'float' | 'shimmer'
  href?: string
  className?: string
  priority?: boolean
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 60, height: 60 },
  lg: { width: 80, height: 80 },
  xl: { width: 120, height: 120 },
} as const

const styleMap = {
  default: '',
  glow: luxuryStyles.animations.glow,
  float: luxuryStyles.animations.float,
  shimmer: luxuryStyles.animations.shimmer,
} as const

export default function LuxuryLogo({
  variant = 'elegant',
  size = 'md',
  style = 'default',
  href = '/',
  className = '',
  priority = false
}: LuxuryLogoProps) {
  const logoSrc = logos.getVariant(variant)
  const dimensions = sizeMap[size]
  const animationClass = styleMap[style]

  const logoClass = utils.combineStyles(
    'drop-shadow-lg transition-all duration-300',
    animationClass,
    className
  )

  const LogoImage = (
    <Image
      src={logoSrc}
      alt="Harsha Delights - Premium Confectionery"
      width={dimensions.width}
      height={dimensions.height}
      className={logoClass}
      priority={priority}
    />
  )

  // If href is provided, wrap in Link
  if (href) {
    return (
      <Link 
        href={href}
        className="inline-block hover:scale-105 transition-transform duration-300"
        aria-label="Harsha Delights Home"
      >
        {LogoImage}
      </Link>
    )
  }

  return LogoImage
}

// Logo variants for different contexts
export const LogoVariants = {
  // Header/Navigation
  Header: (props: Partial<LuxuryLogoProps>) => (
    <LuxuryLogo 
      size="md" 
      style="default" 
      href="/" 
      priority 
      {...props} 
    />
  ),

  // Hero section
  Hero: (props: Partial<LuxuryLogoProps>) => (
    <LuxuryLogo 
      size="xl" 
      style="glow" 
      variant="elegant"
      priority 
      {...props} 
    />
  ),

  // Footer
  Footer: (props: Partial<LuxuryLogoProps>) => (
    <LuxuryLogo 
      size="lg" 
      style="default" 
      href="/" 
      {...props} 
    />
  ),

  // Loading/Splash
  Loading: (props: Partial<LuxuryLogoProps>) => (
    <LuxuryLogo 
      size="xl" 
      style="float" 
      variant="elegantAlt"
      {...props} 
    />
  ),

  // Cards/Product areas
  Card: (props: Partial<LuxuryLogoProps>) => (
    <LuxuryLogo 
      size="sm" 
      style="default" 
      {...props} 
    />
  ),
}