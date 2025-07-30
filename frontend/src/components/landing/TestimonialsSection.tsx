import React from 'react';
import TestimonialCard, { type Testimonial } from './TestimonialCard';
import { useCarousel } from '../../hooks/useCarousel';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import { cn } from '../../utils';

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ayşe Demir',
    role: 'Lise Öğrencisi',
    company: '11. Sınıf',
    avatar: '/avatars/ayse.jpg',
    rating: 5,
    quote: 'EduAI sayesinde matematik konularında çok ilerleme kaydettim. AI\'ın ürettiği sorular tam ihtiyacıma uygun ve zorluğu kademeli olarak artıyor.',
    date: '2 hafta önce',
  },
  {
    id: '2',
    name: 'Mehmet Yılmaz',
    role: 'Üniversite Öğrencisi',
    company: 'Bilgisayar Mühendisliği',
    avatar: '/avatars/mehmet.jpg',
    rating: 5,
    quote: 'Performans analizi özelliği gerçekten harika. Hangi konularda eksik olduğumu net bir şekilde görebiliyorum ve ona göre çalışma planımı yapıyorum.',
    date: '1 ay önce',
  },
  {
    id: '3',
    name: 'Zeynep Kaya',
    role: 'Öğretmen',
    company: 'Anadolu Lisesi',
    avatar: '/avatars/zeynep.jpg',
    rating: 4,
    quote: 'Öğrencilerime EduAI\'ı önerdim ve sonuçlar muhteşem. Kişiselleştirilmiş öğrenme yaklaşımı her öğrenci için farklı çözümler sunuyor.',
    date: '3 hafta önce',
  },
  {
    id: '4',
    name: 'Can Özkan',
    role: 'Velisi',
    company: 'Ortaokul Velisi',
    avatar: '/avatars/can.jpg',
    rating: 5,
    quote: 'Çocuğumun ders çalışma motivasyonu çok arttı. Kitap önerileri özelliği sayesinde doğru kaynaklara yönlendiriliyor.',
    date: '1 hafta önce',
  },
  {
    id: '5',
    name: 'Elif Şahin',
    role: 'YKS Hazırlık',
    company: '12. Sınıf',
    avatar: '/avatars/elif.jpg',
    rating: 5,
    quote: 'YKS\'ye hazırlanırken EduAI benim en büyük yardımcım oldu. Zayıf olduğum konularda ekstra sorular çözerek kendimi geliştirdim.',
    date: '5 gün önce',
  },
  {
    id: '6',
    name: 'Ahmet Çelik',
    role: 'Ders Çözüm Uzmanı',
    company: 'Özel Ders',
    avatar: '/avatars/ahmet.jpg',
    rating: 4,
    quote: 'Öğrencilerimle EduAI\'ı kullanıyoruz. AI destekli soru üretimi özelliği ders kalitesini bir üst seviyeye taşıdı.',
    date: '2 hafta önce',
  },
];

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className = '' }) => {
  const { isVisible, ref: fadeInRef } = useIntersectionAnimation();
  
  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg: 3 cards
      if (window.innerWidth >= 768) return 2;  // md: 2 cards
      return 1; // sm: 1 card
    }
    return 1;
  };

  const [itemsPerView, setItemsPerView] = React.useState(getItemsPerView);

  React.useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    currentIndex,
    isPlaying,
    goToSlide,
    goToPrevious,
    goToNext,
    touchHandlers,
    mouseHandlers,
  } = useCarousel({
    itemsLength: testimonials.length,
    autoPlay: true,
    autoPlayInterval: 5000,
    itemsPerView,
  });

  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  return (
    <section 
      id="testimonials" 
      className={`py-16 px-4 sm:px-6 lg:px-8 bg-white ${className}`}
      ref={fadeInRef}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kullanıcı Deneyimleri
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Binlerce öğrenci EduAI ile hedeflerine ulaştı. 
            Onların deneyimlerini dinleyin ve siz de bu başarının parçası olun.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className={`relative transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
          
          {/* Carousel Container */}
          <div 
            className="overflow-hidden rounded-2xl"
            {...touchHandlers}
            {...mouseHandlers}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(testimonials.length * 100) / itemsPerView}%`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="px-3"
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'w-12 h-12 bg-white rounded-full shadow-lg',
              'flex items-center justify-center',
              'text-gray-600 hover:text-blue-600',
              'hover:shadow-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'lg:left-4'
            )}
            aria-label="Önceki testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'w-12 h-12 bg-white rounded-full shadow-lg',
              'flex items-center justify-center',
              'text-gray-600 hover:text-blue-600',
              'hover:shadow-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'lg:right-4'
            )}
            aria-label="Sonraki testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-200',
                currentIndex === index
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`${index + 1}. testimonial grubuna git`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center text-sm text-gray-500">
            <div className={cn(
              'w-2 h-2 rounded-full mr-2 transition-colors duration-200',
              isPlaying ? 'bg-green-500' : 'bg-gray-400'
            )} />
            {isPlaying ? 'Otomatik oynatma aktif' : 'Otomatik oynatma duraklatıldı'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
