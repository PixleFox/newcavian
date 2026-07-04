import Link from 'next/link';

const stats = [
  { value: '۱۰۰+', label: 'پروژه موفق' },
  { value: '۵۰+', label: 'مشتری راضی' },
  { value: '۹۸%', label: 'رضایت مشتریان' },
];

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Content */}
          <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12 text-center lg:text-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
              راهکارهای دیجیتال برای کسب و کار شما
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              با راهکارهای نوآورانه کاویان، کسب و کار خود را به سطح جدیدی ببرید. ما با تیمی متخصص در زمینه طراحی و توسعه نرم‌افزار در کنار شما هستیم.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <Link 
                href="/contact" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-center"
              >
                شروع کنید
              </Link>
              <Link 
                href="#services" 
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                خدمات ما
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                  <div className="text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Image */}
          <div className="lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-w-16 aspect-h-9 w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center p-8">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold mb-2">تجربه دیجیتال منحصر به فرد</h3>
                  <p className="opacity-90">با راهکارهای اختصاصی ما</p>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 -left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>
    </section>
  );
}
