/**
 * Landing Page Content Configuration
 * Centralized content management for easy updates and localization
 */

// Content interfaces for type safety
export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
    ariaLabel: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
    ariaLabel: string;
  };
  features: string[];
  trustIndicators: {
    userCount: string;
    rating: number;
    testimonialPreview: string;
  };
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  stats?: {
    value: string;
    label: string;
  };
}

export interface WorkflowStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
  duration?: string;
}

export interface StatisticItem {
  id: string;
  value: number;
  label: string;
  description: string;
  icon: string;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'percentage' | 'decimal';
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
  featured?: boolean;
  tags: string[];
}

export interface CTAContent {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
    ariaLabel: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
    ariaLabel: string;
  };
  socialProof: {
    userCount: string;
    rating: number;
    recentSignups: string;
  };
  riskReduction: string[];
  urgency?: {
    message: string;
    countdown?: string;
  };
}

export interface FooterContent {
  brand: {
    name: string;
    description: string;
    logo: string;
  };
  navigation: {
    [category: string]: {
      title: string;
      links: Array<{
        name: string;
        href: string;
        external?: boolean;
      }>;
    };
  };
  social: Array<{
    name: string;
    href: string;
    icon: string;
    ariaLabel: string;
  }>;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
  };
  legal: {
    copyright: string;
    links: Array<{
      name: string;
      href: string;
    }>;
    madeWith: string;
  };
}

// Hero Section Content
export const heroContent: HeroContent = {
  title: "AI ile Kişiselleştirilmiş Eğitim Deneyimi",
  subtitle: "Geleceğin Öğrenme Platformu",
  description: "EduAI ile yapay zeka destekli soru üretimi, detaylı performans analizi ve kişiselleştirilmiş kitap önerileri sayesinde öğrenme hedeflerinize daha hızlı ulaşın. Binlerce öğrenci akademik başarısını artırdı.",
  primaryCTA: {
    text: "Ücretsiz Başla",
    href: "/register",
    ariaLabel: "EduAI'ye ücretsiz kaydol"
  },
  secondaryCTA: {
    text: "Demo İzle",
    href: "/demo",
    ariaLabel: "EduAI demo videosunu izle"
  },
  features: [
    "AI destekli soru üretimi",
    "Detaylı performans analizi",
    "Kişiselleştirilmiş öğrenme",
    "7/24 destek"
  ],
  trustIndicators: {
    userCount: "50,000+",
    rating: 4.8,
    testimonialPreview: "EduAI sayesinde matematik notlarım %40 arttı!"
  }
};

// Features Section Content
export const featuresContent: FeatureItem[] = [
  {
    id: "ai-questions",
    title: "AI Destekli Soru Üretimi",
    description: "Yapay zeka algoritmaları ile seviyenize uygun, kişiselleştirilmiş sorular otomatik olarak üretilir.",
    icon: "brain",
    benefits: [
      "Seviyenize uygun soru difficulty",
      "Zayıf konulara odaklanma",
      "Sınırsız soru havuzu",
      "Güncel müfredat uyumlu"
    ],
    stats: {
      value: "1M+",
      label: "Üretilen Soru"
    }
  },
  {
    id: "performance-analysis",
    title: "Detaylı Performans Analizi",
    description: "İlerlemenizi takip edin, güçlü ve zayıf yönlerinizi keşfedin, hedefinize odaklanın.",
    icon: "analytics",
    benefits: [
      "Gerçek zamanlı analiz",
      "Konu bazlı başarı oranları",
      "Öğrenme hızı takibi",
      "Karşılaştırmalı raporlar"
    ],
    stats: {
      value: "95%",
      label: "Başarı Artışı"
    }
  },
  {
    id: "book-recommendations",
    title: "Kişiselleştirilmiş Kitap Önerileri",
    description: "AI algoritmaları ile ihtiyaçlarınıza uygun en iyi kitap ve kaynak önerilerini alın.",
    icon: "book",
    benefits: [
      "Seviye bazlı öneriler",
      "Konu eksikliklerine odaklanma",
      "Güncel kaynak veritabanı",
      "Kullanıcı değerlendirmeleri"
    ],
    stats: {
      value: "10K+",
      label: "Kitap Veritabanı"
    }
  },
  {
    id: "personalized-learning",
    title: "Adaptif Öğrenme Sistemi",
    description: "Her öğrencinin öğrenme stiline uygun, kişiselleştirilmiş eğitim deneyimi sunar.",
    icon: "user",
    benefits: [
      "Bireysel öğrenme hızı",
      "Tercih edilen öğrenme stili",
      "Esnek çalışma programı",
      "Motivasyon takip sistemi"
    ],
    stats: {
      value: "85%",
      label: "Motivasyon Artışı"
    }
  }
];

// How It Works Section Content
export const workflowContent: WorkflowStep[] = [
  {
    id: "register",
    step: 1,
    title: "Kayıt Ol",
    description: "Hızlı ve kolay kayıt işlemi ile EduAI ailesine katıl.",
    icon: "user-plus",
    details: [
      "E-posta ile 30 saniyede kayıt",
      "Temel bilgilerinizi girin",
      "E-posta doğrulaması yapın",
      "Profilinizi tamamlayın"
    ],
    duration: "2 dakika"
  },
  {
    id: "select-subjects",
    step: 2,
    title: "Konu Seçimi",
    description: "Çalışmak istediğiniz konuları ve hedeflerinizi belirleyin.",
    icon: "book-open",
    details: [
      "İlgi alanlarınızı seçin",
      "Mevcut seviyenizi belirleyin",
      "Hedef seviyenizi ayarlayın",
      "Çalışma planınızı oluşturun"
    ],
    duration: "3 dakika"
  },
  {
    id: "ai-practice",
    step: 3,
    title: "AI Destekli Çalışma",
    description: "Kişiselleştirilmiş sorularla pratik yapın ve ilerlemenizi takip edin.",
    icon: "brain",
    details: [
      "Seviyenize uygun sorular",
      "Anlık geri bildirim",
      "Hata analizi ve öneriler",
      "Adaptif zorluk ayarı"
    ],
    duration: "Sürekli"
  },
  {
    id: "track-progress",
    step: 4,
    title: "İlerleme Takibi",
    description: "Detaylı raporlar ile gelişiminizi izleyin ve hedefinize ulaşın.",
    icon: "chart",
    details: [
      "Günlük progress raporları",
      "Haftalık başarı analizi",
      "Konu bazlı performans",
      "Hedef takip sistemi"
    ],
    duration: "Her gün"
  }
];

// Statistics Section Content
export const statisticsContent: StatisticItem[] = [
  {
    id: "users",
    value: 50000,
    label: "Aktif Kullanıcı",
    description: "EduAI ile öğrenme yolculuğuna devam eden öğrenci sayısı",
    icon: "users",
    suffix: "+"
  },
  {
    id: "questions",
    value: 2500000,
    label: "Çözülen Soru",
    description: "Platform üzerinde başarıyla çözülen toplam soru sayısı",
    icon: "question",
    format: "number",
    suffix: "+"
  },
  {
    id: "success-rate",
    value: 87.5,
    label: "Başarı Oranı",
    description: "Kullanıcıların akademik başarılarındaki ortalama artış",
    icon: "trophy",
    format: "percentage",
    suffix: "%"
  },
  {
    id: "satisfaction",
    value: 4.8,
    label: "Kullanıcı Memnuniyeti",
    description: "5 üzerinden ortalama kullanıcı memnuniyet puanı",
    icon: "star",
    format: "decimal",
    suffix: "/5"
  }
];

// Testimonials Section Content
export const testimonialsContent: TestimonialItem[] = [
  {
    id: "testimonial-1",
    name: "Ahmet Yılmaz",
    role: "11. Sınıf Öğrencisi",
    company: "Fen Lisesi",
    avatar: "/images/testimonials/ahmet-y.jpg",
    rating: 5,
    content: "EduAI sayesinde matematik konularındaki eksiklerimi fark ettim ve hedefli çalışarak notlarımı %40 artırdım. AI destekli sorular gerçekten seviyeme uygundu.",
    date: "2024-12-15",
    featured: true,
    tags: ["matematik", "lise", "başarı"]
  },
  {
    id: "testimonial-2",
    name: "Zeynep Kaya",
    role: "Üniversite Öğrencisi",
    company: "İTÜ Bilgisayar Mühendisliği",
    avatar: "/images/testimonials/zeynep-k.jpg",
    rating: 5,
    content: "Üniversite sınavına hazırlanırken EduAI'nin kişiselleştirilmiş çalışma planı ve detaylı analizleri sayesinde hedeflediğim bölümü kazandım.",
    date: "2024-11-28",
    featured: true,
    tags: ["üniversite", "sınav", "başarı"]
  },
  {
    id: "testimonial-3",
    name: "Mehmet Özkan",
    role: "8. Sınıf Öğrencisi",
    avatar: "/images/testimonials/mehmet-o.jpg",
    rating: 5,
    content: "Fizik dersinde zorlanıyordum ama EduAI'nin önerdiği kitaplar ve pratik sorular sayesinde artık en sevdiğim ders haline geldi.",
    date: "2024-12-10",
    featured: false,
    tags: ["fizik", "ortaokul", "kitap-önerileri"]
  },
  {
    id: "testimonial-4",
    name: "Ayşe Demir",
    role: "Lise Mezunu",
    company: "Dershane Öğrencisi",
    avatar: "/images/testimonials/ayse-d.jpg",
    rating: 4,
    content: "EduAI'nin performans takip sistemi motivasyonumu artırdı. Hangi konularda eksik olduğumu görüp ona göre çalışma planı yapabiliyorum.",
    date: "2024-12-05",
    featured: false,
    tags: ["motivasyon", "planlama", "analiz"]
  },
  {
    id: "testimonial-5",
    name: "Can Yıldız",
    role: "9. Sınıf Öğrencisi",
    company: "Anadolu Lisesi",
    avatar: "/images/testimonials/can-y.jpg",
    rating: 5,
    content: "Platform çok kullanıcı dostu ve AI sayesinde her zaman bana uygun sorularla karşılaşıyorum. Öğrenme süreci çok daha eğlenceli oldu.",
    date: "2024-11-20",
    featured: true,
    tags: ["kullanıcı-dostu", "eğlenceli", "ai"]
  },
  {
    id: "testimonial-6",
    name: "Elif Sarı",
    role: "12. Sınıf Öğrencisi",
    avatar: "/images/testimonials/elif-s.jpg",
    rating: 5,
    content: "YKS'ye hazırlanırken EduAI'nin sunduğu detaylı raporlar ve kişiselleştirilmiş çalışma planı sayesinde kendimi çok daha hazır hissediyorum.",
    date: "2024-12-01",
    featured: false,
    tags: ["yks", "hazırlık", "raporlar"]
  }
];

// CTA Section Content
export const ctaContent: CTAContent = {
  title: "EduAI ile Öğrenme Yolculuğuna Başla",
  subtitle: "Geleceğin Eğitim Teknolojisi",
  description: "Yapay zeka destekli kişiselleştirilmiş eğitim deneyimi ile akademik hedeflerinize ulaşın. Binlerce öğrenci gibi siz de başarınızı artırın.",
  primaryCTA: {
    text: "Ücretsiz Başla",
    href: "/register",
    ariaLabel: "EduAI'ye ücretsiz kaydol ve öğrenmeye başla"
  },
  secondaryCTA: {
    text: "Demo İzle",
    href: "/demo",
    ariaLabel: "EduAI platformu demo videosunu izle"
  },
  socialProof: {
    userCount: "50,000+",
    rating: 4.8,
    recentSignups: "Bu hafta 1,200+ yeni öğrenci katıldı"
  },
  riskReduction: [
    "Ücretsiz deneme süresi",
    "Kredi kartı bilgisi gerektirmez",
    "İstediğiniz zaman iptal edebilirsiniz",
    "7/24 teknik destek"
  ]
};

// Footer Section Content
export const footerContent: FooterContent = {
  brand: {
    name: "EduAI",
    description: "Yapay zeka destekli kişiselleştirilmiş eğitim platformu. Öğrenme sürecinizi optimize edin, hedeflerinize daha hızlı ulaşın.",
    logo: "/images/logo-white.svg"
  },
  navigation: {
    product: {
      title: "Ürün",
      links: [
        { name: "Özellikler", href: "#features" },
        { name: "Nasıl Çalışır", href: "#how-it-works" },
        { name: "Fiyatlandırma", href: "/pricing" },
        { name: "Demo", href: "/demo" }
      ]
    },
    support: {
      title: "Destek",
      links: [
        { name: "Yardım Merkezi", href: "/help" },
        { name: "İletişim", href: "/contact" },
        { name: "SSS", href: "/faq" },
        { name: "Canlı Destek", href: "/support" }
      ]
    },
    company: {
      title: "Şirket",
      links: [
        { name: "Hakkımızda", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Kariyer", href: "/careers" },
        { name: "Basın Kiti", href: "/press" }
      ]
    },
    legal: {
      title: "Yasal",
      links: [
        { name: "Gizlilik Politikası", href: "/privacy" },
        { name: "Kullanım Şartları", href: "/terms" },
        { name: "KVKK", href: "/gdpr" },
        { name: "Çerez Politikası", href: "/cookies" }
      ]
    }
  },
  social: [
    {
      name: "Facebook",
      href: "https://facebook.com/eduai",
      icon: "facebook",
      ariaLabel: "Facebook sayfamızı ziyaret edin"
    },
    {
      name: "Twitter",
      href: "https://twitter.com/eduai",
      icon: "twitter",
      ariaLabel: "Twitter hesabımızı takip edin"
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/eduai",
      icon: "linkedin",
      ariaLabel: "LinkedIn sayfamızı ziyaret edin"
    },
    {
      name: "Instagram",
      href: "https://instagram.com/eduai",
      icon: "instagram",
      ariaLabel: "Instagram hesabımızı takip edin"
    },
    {
      name: "YouTube",
      href: "https://youtube.com/eduai",
      icon: "youtube",
      ariaLabel: "YouTube kanalımıza abone olun"
    }
  ],
  newsletter: {
    title: "Bültenimize Abone Olun",
    description: "EduAI'daki yenilikler ve eğitim ipuçları için e-posta listemize katılın.",
    placeholder: "E-posta adresiniz",
    buttonText: "Abone Ol"
  },
  legal: {
    copyright: "© 2025 EduAI. Tüm hakları saklıdır.",
    links: [
      { name: "Gizlilik", href: "/privacy" },
      { name: "Şartlar", href: "/terms" },
      { name: "Çerezler", href: "/cookies" }
    ],
    madeWith: "Made with ❤️ in Turkey"
  }
};

// Content Export
export const landingPageContent = {
  hero: heroContent,
  features: featuresContent,
  workflow: workflowContent,
  statistics: statisticsContent,
  testimonials: testimonialsContent,
  cta: ctaContent,
  footer: footerContent
};

export default landingPageContent;
