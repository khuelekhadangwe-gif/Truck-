export interface Project {
  id: string;
  title: string;
  description: string;
  category: "Web Design" | "Branding" | "Development" | "Art Direction";
  tags: string[];
  challenge: string;
  solution: string;
  role: string;
  stats: string;
  imageUrl: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  popular: boolean;
  buttonText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarColor: string; // Tailwind class background
  text: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon name, e.g. "Globe", "Cpu", etc.
  tags: string[];
}
