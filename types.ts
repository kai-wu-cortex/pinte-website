

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  image?: string;
  series?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum Section {
  HOME = 'home',
  SOLUTIONS = 'solutions',
  PRODUCTS = 'products',
  ABOUT = 'about',
  DISTRIBUTORS = 'distributors',
  CONTACT = 'contact',
}

export type TabType = 'hot-stamping' | 'glitter' | 'service';

export type ProductId = 'PK' | 'PC' | 'PLPY' | 'DIGITAL' | 'GLITTER';

export interface ProductDetail {
  id: ProductId;
  name: string;
  subtitle: string;
  description: string;
  heroImage: string;
  features: { title: string; desc: string; icon: any }[];
  params: { label: string; value: string }[];
  substrates: string[];
  applications: string[];
  colors: string[];
  temp: { flat: string; round: string };
}

// Updated CatalogItem for specific product pages
export interface CatalogItem {
  id: string;
  name: string; 
  subtitle?: string;
  description: string; 
  content?: string; // Long form description for the specific page
  image: string; 
  tags?: string[]; 
  // Detailed fields for the specific view
  features?: { title: string; desc: string; icon?: any }[]; 
  params?: { label: string; value: string }[];
  applications?: string[];
  temp?: { flat: string; round: string };
  detailImage?: string; // New field for the long technical image
  seoTitle?: string;
  compatibleSubstrates?: string[];
  colors?: string[];
  specifications?: { label: string; value: string }[];
  processes?: string[];
  technicalParameters?: { label: string; value: string }[];
  qualityTests?: string[];
  moq?: string;
  samplePolicy?: string;
  customizationLeadTime?: string;
  imageAlt?: string;
  faqs?: { question: string; answer: string }[];
}

// NEW: Interface for individual foil swatches
export interface FoilItem {
  id: string;
  code: string;
  name: string;
  hex: string; // Fallback color
  image?: string; // NEW: Specific image URL for this foil color
  previewImage?: string; // NEW: Independent image link for stamping effect
  type: 'Metallic' | 'Matte' | 'Holographic' | 'Pigment' | 'Pearl';
  series: string;
  finish: 'Gloss' | 'Satin' | 'Matte';
}

export interface SolutionData {
    id: string;
    title: string;
    series: string;
    img: string;
    description: string;
    features: string[];
    painPoints?: string[];
}

export interface CulturePost {
  id: string;
  image: string;
  title: string;
  desc: string;
  date: string;
  author: string;
  avatar: string;
  likes: number;
  tags: string[];
}

export interface UILabels {
  nav: {
    home: string;
    solutions: string;
    products: string;
    about: string;
    contact: string;
    getQuote: string;
    viewAllProducts: string;
    onlineTour: string;
  };
  hero: {
    onlineTour: string;
    productionLine: string;
  };
  solutions: {
    title: string;
    subtitle: string;
    cards: {
      distributor: { title: string; desc: string };
      designer: { title: string; desc: string };
      ecommerce: { title: string; desc: string };
    };
    backButton: string;
    downloadPdf: string;
    appAdvantage: string;
    getDatasheet: string;
  };
  about: {
    factoryLabel: string;
    profileTitle: string;
    vision: string;
    history: string;
    visionTitle: string;
    valuesTitle: string;
    achievementsTitle: string;
    partnersTitle: string;
    cultureTitle: string;
    cultureDesc: string;
    readMore: string;
    yearsExp: string;
  };
  products: {
    discoverTitle: string;
    discoverDesc: string;
    viewCatalog: string;
    series: string;
    viewDetails: string;
    backToList: string;
    getSample: string;
    techSpecs: string;
    tempRec: string;
    substrates: string;
    applications: string;
    needHelp: string;
    contactEng: string;
    tabs: { overview: string; specs: string; apps: string };
    flat: string;
    round: string;
    viewFoilRange: string; // New Label
    searchPlaceholder: string; // New Label
  };
  services: {
    title: string;
    subtitle: string;
    capabilities: string;
    oemTitle: string;
    oemDesc: string;
    learnMore: string;
    dashboard: string;
    updated: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  notes: {
    title: string;
    subtitle: string;
  };
  faq: {
    title: string;
    subtitle: string;
    contactBtn: string;
  };
  footer: {
    desc: string;
    quickLinks: string;
    contactUs: string;
    wechat: string;
    scan: string;
    rights: string;
    privacy: string;
    terms: string;
    sitemap: string;
  };
  quote: {
    title: string;
    subtitle: string;
    back: string;
    projectDetails: string;
    appField: string;
    colorField: string;
    painPoints: string;
    extraInfo: string;
    contactInfo: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    backHome: string;
    newRequest: string;
    placeholders: {
      select: string;
      color: string;
      desc: string;
      name: string;
      company: string;
      email: string;
      phone: string;
    }
  }
}
