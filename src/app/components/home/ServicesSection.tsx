import { motion } from 'framer-motion';
import { FaCode, FaMobileAlt, FaSearch, FaPalette, FaChartLine, FaServer } from 'react-icons/fa';

const services = [
  {
    icon: <FaCode className="w-8 h-8 text-blue-600" />,
    title: 'توسعه وبسایت',
    description: 'طراحی و توسعه وبسایت‌های مدرن و واکنش‌گرا با استفاده از آخرین فناوری‌های روز دنیا',
  },
  {
    icon: <FaMobileAlt className="w-8 h-8 text-purple-600" />,
    title: 'اپلیکیشن موبایل',
    description: 'طراحی و توسعه اپلیکیشن‌های موبایل اندروید و iOS با بهترین عملکرد و رابط کاربری',
  },
  {
    icon: <FaSearch className="w-8 h-8 text-green-600" />,
    title: 'بهینه‌سازی سئو',
    description: 'بهبود رتبه سایت در موتورهای جستجو و افزایش بازدید ارگانیک',
  },
  {
    icon: <FaPalette className="w-8 h-8 text-yellow-600" />,
    title: 'طراحی رابط کاربری',
    description: 'طراحی رابط کاربری جذاب و کاربرپسند با تمرکز بر تجربه کاربری',
  },
  {
    icon: <FaChartLine className="w-8 h-8 text-red-600" />,
    title: 'دیجیتال مارکتینگ',
    description: 'استراتژی‌های بازاریابی دیجیتال برای رشد کسب و کار آنلاین شما',
  },
  {
    icon: <FaServer className="w-8 h-8 text-indigo-600" />,
    title: 'میزبانی ابری',
    description: 'راهکارهای ابری امن و مقیاس‌پذیر برای میزبانی و مدیریت سرویس‌های شما',
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            خدمات ما
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            با تیمی از متخصصان مجرب در زمینه‌های مختلف فناوری اطلاعات، راهکارهای جامعی برای نیازهای دیجیتال شما ارائه می‌دهیم.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            درخواست مشاوره رایگان
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
