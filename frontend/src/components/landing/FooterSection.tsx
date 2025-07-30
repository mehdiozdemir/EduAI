import { cn } from '../../utils';
import { useIntersectionAnimation } from '../../hooks/useAnimations';

// Social Media Icons
const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const GmailIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
  </svg>
);


const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);



// Team members with their social links
const teamMembers = [
  {
    name: 'Sevgi Başar',
    rol: 'Frontend Developer',
    socialLinks: [
      {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/sevgi-basar/',
        icon: LinkedInIcon
      },
      {
        name: 'YouTube',
        href: 'https://www.youtube.com/@sevgibasar880',
        icon: YouTubeIcon
      },
      {
        name: 'GitHub',
        href: 'https://github.com/Sevgibsr1',
        icon: GitHubIcon
      },
      {
        name: 'Gmail',
        href: 'mailto:sevgibasar564@gmail.com',
        icon: GmailIcon
      },
    ]
  },
  {
    name: 'Mehdi Özdemir',
    rol: 'AI Developer',
    socialLinks: [
      {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/mehdi-%C3%B6zdemir/',
        icon: LinkedInIcon
      },
      {
        name: 'YouTube',
        href: 'https://www.youtube.com/@axls9140',
        icon: YouTubeIcon
      },
      {
        name: 'GitHub',
        href: 'https://github.com/mehdiozdemir',
        icon: GitHubIcon
      },
      {
        name: 'Gmail',
        href: 'mailto:mehdiozdemir10@gmail.com',
        icon: GmailIcon
      },
    ]
  }
];

interface FooterSectionProps {
  className?: string;
}

export default function FooterSection({ className }: FooterSectionProps) {
  const { ref, isVisible } = useIntersectionAnimation();



  return (
    <footer
      id="contact"
      ref={ref}
      className={cn(
        'bg-gray-900 text-white transition-all duration-1000',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-blue-400">EduAI</h3>
              <p className="text-gray-300 mt-2 leading-relaxed">
                Yapay zeka destekli kişiselleştirilmiş eğitim platformu.
                Öğrenme sürecinizi optimize edin, hedeflerinize daha hızlı ulaşın.
              </p>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end lg:pr-48">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Geliştiriciler</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {teamMembers.map((member) => (
                <div key={member.name} className="text-center">
                  <h4 className="text-lg font-semibold text-white mb-1">{member.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{member.rol}</p>
                  <div className="flex justify-center space-x-3">
                    {member.socialLinks.map((social) => {
                      const IconComponent = social.icon;
                      return (
                        <a
                          key={`${member.name}-${social.name}`}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
                          aria-label={`${member.name} ${social.name}`}
                        >
                          <IconComponent />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
              </div>
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
