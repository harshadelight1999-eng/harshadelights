'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Sparkles, Crown, Star } from 'lucide-react';

const heroBackgrounds = [
  '/shared/branding/backgrounds/BG01.png',
  '/shared/branding/backgrounds/BG-02.png',
  '/shared/branding/backgrounds/BG-03.png',
  '/shared/branding/backgrounds/BG-04.png',
  '/shared/branding/backgrounds/BG-5.png',
  '/shared/branding/backgrounds/BG-06.png',
  '/shared/branding/backgrounds/BG-07.png',
];

export default function LuxuryHeroClient() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        {heroBackgrounds.map((bg, index) => (
          <div
            key={bg}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={bg}
              alt={`Hero background ${index + 1}`}
              fill
              className="object-cover scale-105 hover:scale-110 transition-transform duration-[10s]"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
        
        {/* Luxury Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-purple-800/50 to-yellow-900/60" />
        
        {/* Royal Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Sparkles className="absolute top-1/4 left-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
        <Crown className="absolute top-1/3 right-1/4 w-8 h-8 text-yellow-300 animate-bounce" style={{ animationDelay: '2s' }} />
        <Star className="absolute bottom-1/3 left-1/3 w-5 h-5 text-yellow-400 animate-bounce" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className={`mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <Image
            src="/shared/branding/logos/elegant-monogram-logo.png"
            alt="Harsha Delights Logo"
            width={120}
            height={120}
            className="mx-auto drop-shadow-2xl animate-pulse"
          />
        </div>

        {/* Subtitle */}
        <div className={`mb-4 ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <span className="text-yellow-300 text-xl md:text-2xl lg:text-3xl font-medium tracking-wide">
            Harsha Delights
          </span>
        </div>

        {/* Main Title */}
        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-300 bg-clip-text text-transparent">
            Authentic Flavors, Premium Quality
          </span>
        </h1>

        {/* Description */}
        <p className={`text-base md:text-lg lg:text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          Experience the finest traditional sweets, premium chocolates, and artisanal confectionery. Made with love, delivered fresh to your doorstep across India.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
          <Link href="/products">
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-purple-900 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[200px] group flex items-center gap-3">
              <span>Explore Our Products</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>

          <Link href="/about">
            <button className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 min-w-[200px]">
              Our Story
            </button>
          </Link>
        </div>

        {/* Background Indicator Dots */}
        <div className={`flex justify-center gap-2 mt-16 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
          {heroBackgrounds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBgIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentBgIndex
                  ? 'bg-yellow-400 scale-125'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Background ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center animate-pulse">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}