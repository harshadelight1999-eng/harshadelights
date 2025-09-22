import { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import AboutUs from '@/components/sections/AboutUs';
import Categories from '@/components/sections/Categories';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Home - Premium Confectionery & Traditional Sweets',
  description: 'Discover authentic flavors with Harsha Delights premium confectionery. Traditional sweets, chocolates, namkeens, and dry fruits delivered fresh to your doorstep.',
  openGraph: {
    title: 'Harsha Delights - Premium Confectionery & Traditional Sweets',
    description: 'Discover authentic flavors with premium confectionery, traditional sweets, chocolates, namkeens, and dry fruits.',
    images: ['/images/homepage-hero.jpg'],
  },
};

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Product Categories */}
        <Categories />

        {/* About Us */}
        <AboutUs />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Testimonials */}
        <Testimonials />

        {/* Contact Section */}
        <Contact />
      </main>

      <Footer />
    </>
  );
}