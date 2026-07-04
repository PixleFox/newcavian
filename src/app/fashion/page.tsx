'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, ArrowRight, Star, Heart, Share2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const products = [
  {
    id: 1,
    name: 'تی شرت طرح دار مردانه',
    price: '۲۹۹,۰۰۰',
    originalPrice: '۳۹۹,۰۰۰',
    discount: '۲۵٪',
    rating: 4.8,
    image: '/tshirt-1.jpg',
    colors: ['#000000', '#3B82F6', '#EF4444', '#10B981'],
  },
  {
    id: 2,
    name: 'تی شرت ساده زنانه',
    price: '۲۴۹,۰۰۰',
    originalPrice: '۳۴۹,۰۰۰',
    discount: '۲۹٪',
    rating: 4.9,
    image: '/tshirt-2.jpg',
    colors: ['#FFFFFF', '#F59E0B', '#8B5CF6', '#EC4899'],
  },
  {
    id: 3,
    name: 'تی شرت طرح گرافیکی',
    price: '۳۴۹,۰۰۰',
    originalPrice: null,
    discount: null,
    rating: 4.7,
    image: '/tshirt-3.jpg',
    colors: ['#111827', '#1F2937', '#4B5563'],
  },
  {
    id: 4,
    name: 'تی شرت نخی مردانه',
    price: '۲۷۹,۰۰۰',
    originalPrice: '۳۷۹,۰۰۰',
    discount: '۲۶٪',
    rating: 4.8,
    image: '/tshirt-4.jpg',
    colors: ['#1E40AF', '#065F46', '#7E22CE'],
  },
];

const categories = [
  { name: 'پرفروش‌ها', id: 'bestsellers' },
  { name: 'جدیدترین‌ها', id: 'new-arrivals' },
  { name: 'تخفیف‌دارها', id: 'sale' },
  { name: 'پیشنهاد ویژه', id: 'special-offer' },
];

export default function FashionHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-br from-purple-900 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="w-full h-full bg-gradient-to-r from-purple-900/90 to-indigo-800/90"></div>
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="bg-white/20 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full inline-flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full ml-2"></span>
                مجموعه تابستانه ۱۴۰۳
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              جدیدترین طرح‌های تی‌شرت مردانه
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-100 mb-8"
            >
              با کیفیت ترین تی‌شرت‌ها با طرح‌های منحصر به فرد و قیمت مناسب
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-medium text-lg flex items-center justify-center transition-colors">
                <ShoppingBag className="ml-2" />
                همین حالا بخرید
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-medium text-lg border border-white/20 transition-colors">
                مشاهده محصولات
                <ArrowLeft className="mr-2" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">دسته‌بندی‌ها</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronRight className="text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronLeft className="text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative h-48 bg-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 flex items-end p-6">
                  <h3 className="text-white text-lg font-medium">{category.name}</h3>
                </div>
                <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-500">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">پرفروش‌ترین‌ها</h2>
            <button className="text-pink-600 hover:text-pink-700 flex items-center">
              مشاهده همه
              <ArrowLeft className="mr-1" size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-pink-500 transition-colors shadow-md">
                      <Heart size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-pink-500 transition-colors shadow-md">
                      <Share2 size={18} />
                    </button>
                  </div>
                  {product.discount && (
                    <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      {product.discount} تخفیف
                    </div>
                  )}
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-5xl">👕</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} ml-0.5`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 mr-1">({product.rating})</span>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {product.originalPrice} تومان
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900">
                        {product.price} تومان
                      </span>
                    </div>
                    <button className="w-10 h-10 bg-gray-100 hover:bg-pink-50 text-pink-500 rounded-full flex items-center justify-center transition-colors">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        className="w-5 h-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={`رنگ ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">تازه‌های فروشگاه</h2>
            <button className="text-pink-600 hover:text-pink-700 flex items-center">
              مشاهده همه
              <ArrowLeft className="mr-1" size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice().reverse().map((product) => (
              <motion.div
                key={`new-${product.id}`}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-white text-pink-500 text-xs font-bold px-2 py-1 rounded-full">
                      جدید
                    </div>
                  </div>
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-5xl">👕</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 font-medium mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {product.originalPrice} تومان
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900">
                        {product.price} تومان
                      </span>
                    </div>
                    <button className="w-10 h-10 bg-gray-100 hover:bg-pink-50 text-pink-500 rounded-full flex items-center justify-center transition-colors">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">۱۵٪ تخفیف ویژه اولین خرید</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              با عضویت در خبرنامه ما از جدیدترین تخفیف‌ها و محصولات جدید با خبر شوید
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="آدرس ایمیل خود را وارد کنید"
                className="flex-grow px-6 py-3 rounded-r-lg text-gray-900 focus:outline-none"
                dir="ltr"
              />
              <button className="bg-gray-900 hover:bg-black px-6 py-3 rounded-l-lg font-medium transition-colors">
                عضویت
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
