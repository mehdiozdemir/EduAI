// FooterSection component tests
import { screen } from '@testing-library/react';
import { render } from './test-utils';
import FooterSection from '../FooterSection';

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      footer: {
        logo: {
          text: 'EduAI',
          tagline: 'AI ile Kişiselleştirilmiş Eğitim'
        },
        description: 'EduAI, yapay zeka destekli kişiselleştirilmiş eğitim platformudur. Öğrencilerin potansiyelini keşfetmelerine yardımcı olur.',
        sections: {
          platform: {
            title: 'Platform',
            links: [
              { text: 'Özellikler', href: '/features' },
              { text: 'Fiyatlandırma', href: '/pricing' },
              { text: 'Demo', href: '/demo' }
            ]
          },
          support: {
            title: 'Destek',
            links: [
              { text: 'Yardım Merkezi', href: '/help' },
              { text: 'İletişim', href: '/contact' },
              { text: 'SSS', href: '/faq' }
            ]
          },
          legal: {
            title: 'Yasal',
            links: [
              { text: 'Gizlilik Politikası', href: '/privacy' },
              { text: 'Kullanım Şartları', href: '/terms' },
              { text: 'Çerez Politikası', href: '/cookies' }
            ]
          }
        },
        social: [
          { platform: 'twitter', url: 'https://twitter.com/eduai', icon: 'twitter' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/eduai', icon: 'linkedin' },
          { platform: 'youtube', url: 'https://youtube.com/eduai', icon: 'youtube' }
        ],
        contact: {
          email: 'info@eduai.com',
          phone: '+90 212 123 45 67',
          address: 'İstanbul, Türkiye'
        },
        copyright: '© 2024 EduAI. Tüm hakları saklıdır.'
      }
    })
  })
}));

describe('FooterSection', () => {
  it('renders logo and tagline correctly', () => {
    render(<FooterSection />);
    
    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.getByText('AI ile Kişiselleştirilmiş Eğitim')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<FooterSection />);
    
    expect(screen.getByText(/EduAI, yapay zeka destekli/)).toBeInTheDocument();
  });

  it('renders all footer sections', () => {
    render(<FooterSection />);
    
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Destek')).toBeInTheDocument();
    expect(screen.getByText('Yasal')).toBeInTheDocument();
  });

  it('renders footer navigation links', () => {
    render(<FooterSection />);
    
    // Platform links
    expect(screen.getByText('Özellikler')).toBeInTheDocument();
    expect(screen.getByText('Fiyatlandırma')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
    
    // Support links
    expect(screen.getByText('Yardım Merkezi')).toBeInTheDocument();
    expect(screen.getByText('İletişim')).toBeInTheDocument();
    expect(screen.getByText('SSS')).toBeInTheDocument();
    
    // Legal links
    expect(screen.getByText('Gizlilik Politikası')).toBeInTheDocument();
    expect(screen.getByText('Kullanım Şartları')).toBeInTheDocument();
    expect(screen.getByText('Çerez Politikası')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<FooterSection />);
    
    // Check for social media links
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    const youtubeLink = screen.getByRole('link', { name: /youtube/i });
    
    expect(twitterLink).toBeInTheDocument();
    expect(linkedinLink).toBeInTheDocument();
    expect(youtubeLink).toBeInTheDocument();
    
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/eduai');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/eduai');
    expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com/eduai');
  });

  it('renders contact information', () => {
    render(<FooterSection />);
    
    expect(screen.getByText('info@eduai.com')).toBeInTheDocument();
    expect(screen.getByText('+90 212 123 45 67')).toBeInTheDocument();
    expect(screen.getByText('İstanbul, Türkiye')).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    render(<FooterSection />);
    
    expect(screen.getByText('© 2024 EduAI. Tüm hakları saklıdır.')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<FooterSection />);
    
    // Should have a footer element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    
    // Should have proper navigation structure
    const navElements = screen.getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes for external links', () => {
    render(<FooterSection />);
    
    const socialLinks = screen.getAllByRole('link', { name: /twitter|linkedin|youtube/i });
    
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders with custom className prop', () => {
    render(<FooterSection className="custom-footer" />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('custom-footer');
  });

  it('has dark theme styling', () => {
    render(<FooterSection />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-gray-900', 'text-white');
  });

  it('is responsive with proper layout classes', () => {
    render(<FooterSection />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('py-12', 'lg:py-16');
  });

  it('renders email and phone as clickable links', () => {
    render(<FooterSection />);
    
    const emailLink = screen.getByRole('link', { name: /info@eduai.com/i });
    const phoneLink = screen.getByRole('link', { name: /\+90 212 123 45 67/i });
    
    expect(emailLink).toHaveAttribute('href', 'mailto:info@eduai.com');
    expect(phoneLink).toHaveAttribute('href', 'tel:+902121234567');
  });

  it('handles empty content gracefully', () => {
    // Mock empty content
    jest.doMock('../../../utils/contentManager', () => ({
      useContentManager: () => ({
        getContent: () => ({
          footer: {
            logo: { text: '', tagline: '' },
            description: '',
            sections: {},
            social: [],
            contact: {},
            copyright: ''
          }
        })
      })
    }));

    render(<FooterSection />);
    
    // Should still render the footer structure
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('groups related links properly', () => {
    render(<FooterSection />);
    
    // Each section should group related links
    const platformSection = screen.getByText('Platform').closest('div');
    const supportSection = screen.getByText('Destek').closest('div');
    const legalSection = screen.getByText('Yasal').closest('div');
    
    expect(platformSection).toBeInTheDocument();
    expect(supportSection).toBeInTheDocument();
    expect(legalSection).toBeInTheDocument();
  });
});
