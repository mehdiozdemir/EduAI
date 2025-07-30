import { cn } from '../../utils';
import { useIntersectionAnimation } from '../../hooks/useAnimations';

// Social Media Icons
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 20.749c-2.19 0-3.967-1.777-3.967-3.967s1.777-3.967 3.967-3.967 3.967 1.777 3.967 3.967-1.777 3.967-3.967 3.967zm7.117 0c-2.19 0-3.967-1.777-3.967-3.967s1.777-3.967 3.967-3.967 3.967 1.777 3.967 3.967-1.777 3.967-3.967 3.967z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Footer navigation data
const footerNavigation = {
  product: {
    title: 'Ürün',
    links: [
      { name: 'Özellikler', href: '#features' },
      { name: 'Nasıl Çalışır', href: '#how-it-works' },
      { name: 'Fiyatlandırma', href: '/pricing' },
      { name: 'Demo', href: '/demo' },
    ]
  },
  support: {
    title: 'Destek',
    links: [
      { name: 'Yardım Merkezi', href: '/help' },
      { name: 'İletişim', href: '/contact' },
      { name: 'SSS', href: '/faq' },
      { name: 'Canlı Destek', href: '/support' },
    ]
  },
  company: {
    title: 'Şirket',
    links: [
      { name: 'Hakkımızda', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Kariyer', href: '/careers' },
      { name: 'Basın Kiti', href: '/press' },
    ]
  },
  legal: {
    title: 'Yasal',
    links: [
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
      { name: 'KVKK', href: '/gdpr' },
      { name: 'Çerez Politikası', href: '/cookies' },
    ]
  }
};

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/eduai',
    icon: FacebookIcon
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/eduai',
    icon: TwitterIcon
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/eduai',
    icon: LinkedInIcon
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/eduai',
    icon: InstagramIcon
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/eduai',
    icon: YouTubeIcon
  },
];

interface FooterSectionProps {
  className?: string;
}

export default function FooterSection({ className }: FooterSectionProps) {
  const { ref, isVisible } = useIntersectionAnimation();

  const handleSectionScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer 
      ref={ref}
      className={cn(
        'bg-gray-900 text-white transition-all duration-1000',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-blue-400">EduAI</h3>
              <p className="text-gray-300 mt-2 leading-relaxed">
                Yapay zeka destekli kişiselleştirilmiş eğitim platformu. 
                Öğrenme sürecinizi optimize edin, hedeflerinize daha hızlı ulaşın.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
                    aria-label={social.name}
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerNavigation).map(([key, section]) => (
            <div key={key} className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          e.preventDefault();
                          handleSectionScroll(link.href);
                        }
                      }}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                Bültenimize Abone Olun
              </h4>
              <p className="text-gray-300 text-sm">
                EduAI'daki yenilikler ve eğitim ipuçları için e-posta listemize katılın.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 whitespace-nowrap">
                Abone Ol
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>© 2025 EduAI. Tüm hakları saklıdır.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-end space-x-6 text-sm">
              <a 
                href="/privacy" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              >
                Gizlilik
              </a>
              <a 
                href="/terms" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              >
                Şartlar
              </a>
              <a 
                href="/cookies" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              >
                Çerezler
              </a>
              <div className="text-gray-500">
                Made with ❤️ in Turkey
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
