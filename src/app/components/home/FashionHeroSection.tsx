'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';

export default function FashionHeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-pink-100 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Content */}
          <motion.div 
            className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              Summer Collection 2024
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Discover Your Perfect Style with Our Latest T-Shirt Collection
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Elevate your wardrobe with our premium quality t-shirts. Comfort meets style in every stitch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="/shop"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Now
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.a>
              
              <motion.a
                href="#collections"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                View Collections
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.a>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
              {[
                { text: 'Premium Quality' },
                { text: 'Free Shipping' },
                { text: '30-Day Returns' },
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            className="lg:w-1/2 mt-12 lg:mt-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-6">👕</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Arrivals</h3>
                    <p className="text-gray-600 dark:text-gray-300">Summer Collection 2024</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl -z-10"></div>
              
              {/* Badge */}
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Trending Now</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
