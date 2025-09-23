"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Sparkles, Crown, Star } from 'lucide-react'
import { backgrounds, logos, buttonStyles, luxuryStyles, utils } from '../lib/assets'

interface LuxuryHeroProps {
  title?: string
  subtitle?: string
  description?: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  autoRotateBackground?: boolean
  rotationInterval?: number
  className?: string
}

export default function LuxuryHero({
  title = "Exquisite Confectionery",
  subtitle = "Harsha Delights",
  description = "Indulge in our royal collection of handcrafted sweets and premium confectionery. Every bite is a journey through elegance and taste.",
  primaryCTA = { text: "Explore Collection", href: "/products" },
  secondaryCTA = { text: "Our Story", href: "/about" },
  autoRotateBackground = true,
  rotationInterval = 5000,
  className = ""
}: LuxuryHeroProps) {
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const bgImages = [
    backgrounds.hero.bg1,
    backgrounds.hero.bg2,
    backgrounds.hero.bg3,
    backgrounds.hero.bg4,
    backgrounds.hero.bg5,
    backgrounds.hero.bg6,
    backgrounds.hero.bg7,
  ]

  // Auto-rotate background images
  useEffect(() => {
    if (!autoRotateBackground) return

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotateBackground, rotationInterval, bgImages.length])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const heroClass = utils.combineStyles(
    'relative min-h-screen flex items-center justify-center overflow-hidden',
    className
  )

  return (
    <section className={heroClass}>
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        {bgImages.map((bg, index) => (
          <div
            key={bg}
            className={utils.combineStyles(
              'absolute inset-0 transition-opacity duration-1000',
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Image
              src={bg}
              alt={`Hero background ${index + 1}`}
              fill
              className="object-cover scale-105 group-hover:scale-110 transition-transform duration-[10s]"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
        
        {/* Luxury Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900/70 via-royal-800/50 to-luxury-gold-900/60" />
        
        {/* Royal Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-royal-shimmer animate-royal-shimmer" />
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Sparkles className={utils.combineStyles(
          'absolute top-1/4 left-1/4 w-6 h-6 text-luxury-gold-400',
          luxuryStyles.animations.float
        )} />
        <Crown className={utils.combineStyles(
          'absolute top-1/3 right-1/4 w-8 h-8 text-luxury-champagne-400',
          luxuryStyles.animations.float
        )} style={{ animationDelay: '2s' }} />
        <Star className={utils.combineStyles(
          'absolute bottom-1/3 left-1/3 w-5 h-5 text-luxury-gold-300',
          luxuryStyles.animations.float
        )} style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className={utils.combineStyles(
        'relative z-20 max-w-7xl mx-auto text-center',
        utils.responsive.spacing.container
      )}>
        {/* Logo */}
        <div className={utils.combineStyles(
          'mb-8',
          isLoaded ? 'animate-fade-in' : 'opacity-0'
        )} style={{ animationDelay: '0.2s' }}>
          <Image
            src={logos.getDefault()}
            alt="Harsha Delights Logo"
            width={120}
            height={120}
            className={utils.combineStyles(
              'mx-auto drop-shadow-2xl',
              luxuryStyles.animations.glow
            )}
          />
        </div>

        {/* Subtitle */}
        <div className={utils.combineStyles(
          'mb-4',
          isLoaded ? 'animate-slide-up' : 'opacity-0'
        )} style={{ animationDelay: '0.4s' }}>
          <span className={utils.combineStyles(
            luxuryStyles.fonts.elegant,
            'text-luxury-gold-300 text-xl md:text-2xl lg:text-3xl font-medium',
            'tracking-wide'
          )}>
            {subtitle}
          </span>
        </div>

        {/* Main Title */}
        <h1 className={utils.combineStyles(
          luxuryStyles.fonts.royal,
          utils.responsive.text.hero,
          'font-bold text-white mb-6 leading-tight',
          'drop-shadow-2xl',
          isLoaded ? 'animate-slide-up' : 'opacity-0'
        )} style={{ animationDelay: '0.6s' }}>
          <span className="bg-gradient-to-r from-white via-luxury-gold-200 to-luxury-champagne-200 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        {/* Description */}
        <p className={utils.combineStyles(
          luxuryStyles.fonts.premium,
          utils.responsive.text.body,
          'text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed',
          isLoaded ? 'animate-slide-up' : 'opacity-0'
        )} style={{ animationDelay: '0.8s' }}>
          {description}
        </p>

        {/* CTA Buttons */}
        <div className={utils.combineStyles(
          'flex flex-col sm:flex-row gap-4 justify-center items-center',
          isLoaded ? 'animate-slide-up' : 'opacity-0'
        )} style={{ animationDelay: '1s' }}>
          <Link href={primaryCTA.href}>
            <button className={utils.combineStyles(
              buttonStyles.gold,
              'group flex items-center gap-3 min-w-[200px]'
            )}>
              <span>{primaryCTA.text}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>

          <Link href={secondaryCTA.href}>
            <button className={utils.combineStyles(
              'bg-white/10 backdrop-blur-md border-2 border-white/30',
              'text-white font-semibold px-8 py-4 rounded-xl',
              'hover:bg-white/20 hover:border-white/50 hover:scale-105',
              'transition-all duration-300 min-w-[200px]'
            )}>
              {secondaryCTA.text}
            </button>
          </Link>
        </div>

        {/* Background Indicator Dots */}
        {autoRotateBackground && (
          <div className={utils.combineStyles(
            'flex justify-center gap-2 mt-16',
            isLoaded ? 'animate-fade-in' : 'opacity-0'
          )} style={{ animationDelay: '1.2s' }}>
            {bgImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBgIndex(index)}
                className={utils.combineStyles(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  index === currentBgIndex
                    ? 'bg-luxury-gold-400 scale-125'
                    : 'bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Background ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className={utils.combineStyles(
          'w-6 h-10 border-2 border-white/50 rounded-full',
          'flex justify-center',
          luxuryStyles.animations.pulse
        )}>
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}