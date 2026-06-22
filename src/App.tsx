import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  Boxes, 
  Thermometer, 
  ShieldAlert, 
  Warehouse, 
  Timer, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Menu, 
  X, 
  Check, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Award, 
  Calculator, 
  AlertCircle, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Instagram,
  XSquare,
  Sparkles
} from 'lucide-react';

// Interfaces for structured data
interface FleetVehicle {
  id: string;
  name: string;
  year: string;
  image: string;
  description: string;
  tag: string;
  specs: {
    engine: string;
    payload: string;
    range: string;
    efficiency: string;
    speciality: string;
  };
  availabilityStatus: 'Available' | 'In Transit' | 'Maintenance';
  currentLocation: string;
}

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  tags: string[];
}

export default function App() {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Search and filter state for Fleet
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');
  const [fleetFilterTag, setFleetFilterTag] = useState('All');
  const [isFleetLoading, setIsFleetLoading] = useState(false);

  // Trigger brief shimmer loading when search or category filter updates
  useEffect(() => {
    setIsFleetLoading(true);
    const delay = setTimeout(() => {
      setIsFleetLoading(false);
    }, 550);
    return () => clearTimeout(delay);
  }, [fleetSearchQuery, fleetFilterTag]);

  // Interactive FAQ Accordion active index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Selected vehicle for details modal
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);

  // Selected Service for details modal
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  // Interactive Freight Quote calculator fields
  const [quoteRequest, setQuoteRequest] = useState({
    fullName: '',
    email: '',
    phone: '',
    origin: '',
    destination: '',
    weightLbs: 15000,
    serviceNeeded: 'Full Truckload (FTL)',
    prioritySpeed: 'Standard',
    mileage: 450,
    message: ''
  });

  // State to track if user calculated quote once (so dynamic feedback updates)
  const [quoteCalculated, setQuoteCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submissionReference, setSubmissionReference] = useState('');
  
  // Custom form validation errors state
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    origin?: string;
    destination?: string;
  }>({});

  // Individual field validator
  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "fullName") {
      if (!value.trim()) {
        error = "Full Name is required.";
      } else if (value.trim().length < 3) {
        error = "Full Name must be at least 3 characters.";
      }
    } else if (name === "email") {
      if (!value.trim()) {
        error = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Please enter a valid email address (e.g. name@domain.com).";
      }
    } else if (name === "phone") {
      if (!value.trim()) {
        error = "Phone number is required.";
      } else if (!/^\+?[\d\s\-()]{7,20}$/.test(value)) {
        error = "Please enter a valid phone number (at least 7 digits).";
      }
    } else if (name === "origin") {
      if (!value.trim()) {
        error = "Origin location is required.";
      } else if (value.trim().length < 3) {
        error = "Origin must be at least 3 characters.";
      }
    } else if (name === "destination") {
      if (!value.trim()) {
        error = "Destination location is required.";
      } else if (value.trim().length < 3) {
        error = "Destination must be at least 3 characters.";
      }
    }
    
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Auto-calculated rates based on fields
  const [estimatedCost, setEstimatedCost] = useState({ min: 0, max: 0, transitDays: 1 });

  // Calculate prices dynamically in useEffect based on distance, service type, speed, weight
  useEffect(() => {
    let basePerMile = 2.45; // FTL default
    let loadingFactor = 1.0;

    switch (quoteRequest.serviceNeeded) {
      case 'Less-Than-Truckload (LTL)':
        basePerMile = 1.15;
        loadingFactor = 0.65;
        break;
      case 'Refrigerated (Reefer)':
        basePerMile = 2.85;
        loadingFactor = 1.25;
        break;
      case 'Heavy Haul / Oversized':
        basePerMile = 4.25;
        loadingFactor = 1.6;
        break;
      case 'Warehousing & Distribution':
        basePerMile = 0.5;
        loadingFactor = 0.3;
        break;
      case 'Expedited / Time-Critical':
        basePerMile = 3.65;
        loadingFactor = 1.45;
        break;
    }

    // Weight adjustment
    const weightFactor = Math.max(0.8, Math.min(1.5, quoteRequest.weightLbs / 20000));
    
    // Expedited multiplier
    const speedMultiplier = quoteRequest.prioritySpeed === 'Expedited' ? 1.4 : 1.0;

    const rawCost = quoteRequest.mileage * basePerMile * weightFactor * speedMultiplier * loadingFactor;
    const baseMin = Math.round(rawCost * 0.95 + 150);
    const baseMax = Math.round(rawCost * 1.05 + 280);

    // Transit time
    let days = Math.ceil(quoteRequest.mileage / 500);
    if (quoteRequest.prioritySpeed === 'Expedited') {
      days = Math.max(1, Math.ceil(quoteRequest.mileage / 750));
    }

    setEstimatedCost({
      min: baseMin,
      max: baseMax,
      transitDays: days
    });
  }, [quoteRequest.mileage, quoteRequest.serviceNeeded, quoteRequest.weightLbs, quoteRequest.prioritySpeed]);

  // Handle outside click to close mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuOpen && 
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Esc key closes modals
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedVehicle(null);
        setSelectedService(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Form Submission Mock with complete user state tracking
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform full sweep validation
    const errors: {
      fullName?: string;
      email?: string;
      phone?: string;
      origin?: string;
      destination?: string;
    } = {};

    if (!quoteRequest.fullName.trim()) {
      errors.fullName = "Full Name is required.";
    } else if (quoteRequest.fullName.trim().length < 3) {
      errors.fullName = "Full Name must be at least 3 characters.";
    }

    if (!quoteRequest.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteRequest.email)) {
      errors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!quoteRequest.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-()]{7,20}$/.test(quoteRequest.phone)) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }

    if (!quoteRequest.origin.trim()) {
      errors.origin = "Origin location is required.";
    } else if (quoteRequest.origin.trim().length < 3) {
      errors.origin = "Origin must be at least 3 characters.";
    }

    if (!quoteRequest.destination.trim()) {
      errors.destination = "Destination location is required.";
    } else if (quoteRequest.destination.trim().length < 3) {
      errors.destination = "Destination must be at least 3 characters.";
    }

    setFormErrors(errors);

    // If there are any validation errors, do not submit
    if (Object.keys(errors).length > 0) {
      // Find and scroll slightly to the first error input for exceptional experience
      const firstErrorKey = Object.keys(errors)[0];
      const fieldElement = document.getElementsByName(firstErrorKey)[0];
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (fieldElement as HTMLElement).focus();
      }
      return;
    }

    setIsSubmitting(true);

    // Generate simulated ID
    const sampleRef = `IH-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmissionReference(sampleRef);
      setQuoteCalculated(true);
    }, 1200);
  };

  // Reset Form and start over
  const handleResetForm = () => {
    setQuoteRequest({
      fullName: '',
      email: '',
      phone: '',
      origin: '',
      destination: '',
      weightLbs: 15000,
      serviceNeeded: 'Full Truckload (FTL)',
      prioritySpeed: 'Standard',
      mileage: 450,
      message: ''
    });
    setFormErrors({});
    setSubmitSuccess(false);
    setSubmissionReference('');
  };

  // Handle fleet booking inside vehicles modal (scrolls & pre-fills type)
  const handleBookVehicle = (type: string) => {
    setQuoteRequest(prev => ({
      ...prev,
      serviceNeeded: type
    }));
    setSelectedVehicle(null);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Structured static data definitions
  const services: ServiceDetail[] = [
    {
      id: 'ftl',
      title: 'Full Truckload (FTL)',
      description: 'Dedicated trailers for high-volume shipments. Direct, no-handling routes with real-time tracking.',
      details: 'Our Full Truckload service provides an exclusive 53-foot dry van or temperature-controlled trailer. Since your cargo is the only shipment onboard, it remains secure from pickup to drop-off. Ideal for shipments over 15,000 lbs, hazardous materials, high-value goods, or time-sensitive retail drops.',
      icon: <Boxes className="w-6 h-6 text-brand-accent" />,
      tags: ['Dry Van', 'Fast Transit', 'Dedicated Rig', 'Custom Routes']
    },
    {
      id: 'ltl',
      title: 'Less-Than-Truckload (LTL)',
      description: 'Cost-effective shared space for smaller freight. Smart consolidation, fast transit, and dock visibility.',
      details: 'Pay only for the trailer space you use. We synthesize pick-ups and route shipments dynamically across a robust web of regional cross-docks. Standardized sizing guidelines ensure optimal packing, safety compliance, and highly economical commercial transport rates.',
      icon: <Boxes className="w-6 h-6 text-brand-accent text-opacity-80" />,
      tags: ['Cost Saver', 'Consolidated Cargo', 'National Hubs', 'Flexible Booking']
    },
    {
      id: 'reefer',
      title: 'Refrigerated (Reefer)',
      description: 'Temperature-controlled trailers for perishables, pharmaceuticals, and sensitive goods. Precision climate range.',
      details: 'Equipped with the latest carrier cooling cycles, our reefers monitor state variables continuously. From frozen meat (-10°F) to sensitive chemicals and fresh flora (55°F), we stream telemetry stats directly to dispatcher consoles daily.',
      icon: <Thermometer className="w-6 h-6 text-brand-accent" />,
      tags: ['Cold Chain', '-20°F to 75°F', 'Pharma Compliant', 'Live Temp Stream']
    },
    {
      id: 'heavy',
      title: 'Heavy Haul & Oversized',
      description: 'Specialized permits, escorts, and low-boy trailers for defense gear, construction systems, and heavy rigs.',
      details: 'IronHaul engineers handle logistics from route clearance surveys to statutory permits and pilot escort cars. Our heavy-haul units carry double-drop decks, expandable stretch flatbeds, and multiple axle configurations to distribute weight safely.',
      icon: <ShieldAlert className="w-6 h-6 text-brand-accent" />,
      tags: ['Permitted Routes', 'Multi-Axle Flatbeds', 'Escort Teams', 'High Payload']
    },
    {
      id: 'warehouse',
      title: 'Warehousing & Distribution',
      description: 'Strategic storage, cross-docking, and last-mile logistics. Secure, dry, climate-monitored facilities.',
      details: 'Over 300,000 sq ft of dry commercial warehouse storage situated at key logistics corridors. We execute rapid cross-dock sorting, short-term staging, inventory control, and pick-and-pack distribution integrated with client ERP systems.',
      icon: <Warehouse className="w-6 h-6 text-brand-accent" />,
      tags: ['3PL Solutions', 'Climate Monitored', 'WMS Integrated', '24/7 Security']
    },
    {
      id: 'expedited',
      title: 'Expedited & Time-Critical',
      description: 'When every minute counts. Team drivers, express routing, and priority handling for urgent cargo.',
      details: 'We place dedicated team drivers on expedited routes to eliminate overnight stops. Fleet cascadia trucks operate near-continuously, halting only for fuel refills. Over 99.4% on-time accuracy for automotive, retail supply, and aerospace parts.',
      icon: <Timer className="w-6 h-6 text-brand-accent" />,
      tags: ['Near-Zero Stops', 'Dual-Driver Teams', 'Priority Dispatch', 'Guaranteed SLA']
    }
  ];

  const fleet: FleetVehicle[] = [
    {
      id: 'peterbilt',
      name: 'Peterbilt 579 Ultra',
      year: '2025',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop',
      description: 'Ultra-sleek aerodynamics, adaptive fuel optimization, and premium long-haul sleeper amenities.',
      tag: 'Long Haul FTL',
      specs: {
        engine: 'PACCAR MX-13 Torque (510 hp)',
        payload: 'Up to 48,000 lbs',
        range: '1,350 Miles',
        efficiency: '7.9 MPG (Eco Mode)',
        speciality: 'Precision highway flow'
      },
      availabilityStatus: 'Available',
      currentLocation: 'Charlotte, NC Hub'
    },
    {
      id: 'volvo',
      name: 'Volvo VNL 860 Sleeper',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=2071&auto=format&fit=crop',
      description: 'Spacious 77-inch high-roof sleeper, optimized for maximum driver safety and temperature-regulated transport.',
      tag: 'Reefer / Dry Van',
      specs: {
        engine: 'Volvo D13 Turbo Compound (455 hp)',
        payload: 'Up to 46,500 lbs',
        range: '1,100 Miles',
        efficiency: '8.2 MPG (Advanced)',
        speciality: 'Cold product handling'
      },
      availabilityStatus: 'In Transit',
      currentLocation: 'Regional Route (En route Chicago, IL)'
    },
    {
      id: 'freightliner',
      name: 'Freightliner Cascadia Daycab',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop',
      description: 'The workhorse of commercial transport. Engineered for regional versatility and heavy localized hauling.',
      tag: 'Heavy Haul / Regional',
      specs: {
        engine: 'Detroit DD15 Elite inline-6 (475 hp)',
        payload: 'Up to 52,000 lbs',
        range: '850 Miles',
        efficiency: '7.4 MPG',
        speciality: 'Heavy loads & flatbeds'
      },
      availabilityStatus: 'Available',
      currentLocation: 'Dallas, TX Terminal'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'James Delaney',
      role: 'Supply Chain Director',
      company: 'Apex Manufacturing',
      text: '"IronHaul has been our primary carrier for over six years. Their on-time performance is unmatched, and their dispatchers communicate proactively whenever traffic impacts the schedule."',
      rating: 5,
      avatarInitials: 'JD'
    },
    {
      id: 2,
      name: 'Sofia Chen',
      role: 'Logistics Manager',
      company: 'FreshFields Co.',
      text: '"The reefer service is strictly top-notch. Our cold-chain products arrive at the perfect temperature point every single time without variance. Highly recommend their smart live trackers."',
      rating: 5,
      avatarInitials: 'SC'
    },
    {
      id: 3,
      name: 'Marcus Reed',
      role: 'Project Director',
      company: 'Titan Industrial Systems',
      text: '"Heavy-haul oversized industrial machinery can be a permit nightmare. IronHaul handled the entire operation—route safety plans, state police escorts, and secure delivery. Flawless."',
      rating: 5,
      avatarInitials: 'MR'
    }
  ];

  const faqs = [
    {
      question: "How fast can I receive a guaranteed rate quote?",
      answer: "By filling out our Interactive Quote Estimator below, you get a real-time routing rate immediately. For binding bulk lanes or custom oversized shipments, our dispatch desk will email over a finalized agreement within 2 hours or less."
    },
    {
      question: "What insurance coverage limits are carried by IronHaul?",
      answer: "We carry $15,000,000 in comprehensive commercial liability coverages, alongside standard cargo liability insurance up to $1,000,000. Higher cargo valuations can be specifically declared and insured prior to dispatch allocation."
    },
    {
      question: "Are your trucks equipped with live real-time GPS sensors?",
      answer: "Yes, our entire Peterbilt, Volvo, and Freightliner fleet uses premium electronic logging devices linked with commercial GPS. We provide a custom tracking link so you can view your cargo's coordinates, speed, and ETA inside an active map."
    },
    {
      question: "Are you fully FMCSA and Dot compliant?",
      answer: "Absolutely. IronHaul Logistics is fully DOT certified and compliant with the Federal Motor Carrier Safety Administration (FMCSA) safety codes. We proudly hold a top-tier safety rating, reflecting our commitment to careful highway transit."
    }
  ];

  // Filter fleet based on search query and category filters
  const filteredFleet = fleet.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(fleetSearchQuery.toLowerCase()) || 
                          vehicle.description.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
                          vehicle.tag.toLowerCase().includes(fleetSearchQuery.toLowerCase());
    const matchesTag = fleetFilterTag === 'All' || vehicle.tag.includes(fleetFilterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-brand-dark flex flex-col selection:bg-brand-accent/20 selection:text-brand-dark">
      
      {/* ====== HEADER / NAVIGATION ====== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-brand-dark/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          {/* Logo element with semantic anchor */}
          <a href="#home" className="flex items-center gap-3 text-white no-underline group focus-visible:ring-2 focus-visible:ring-brand-accent rounded p-1" aria-label="IronHaul Homepage">
            <Truck className="text-brand-accent w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-115" />
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              Iron<span className="text-brand-accent">Haul</span>
            </span>
          </a>

          {/* Desktop Nav Links - Fully Semantic */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/90" aria-label="Main Navigation">
            <a href="#home" className="hover:text-brand-accent transition-colors relative py-1 focus-visible:ring-2 focus-visible:ring-brand-accent rounded">Home</a>
            <a href="#services" className="hover:text-brand-accent transition-colors relative py-1 focus-visible:ring-2 focus-visible:ring-brand-accent rounded">Services</a>
            <a href="#fleet" className="hover:text-brand-accent transition-colors relative py-1 focus-visible:ring-2 focus-visible:ring-brand-accent rounded">Fleet</a>
            <a href="#about" className="hover:text-brand-accent transition-colors relative py-1 focus-visible:ring-2 focus-visible:ring-brand-accent rounded">About</a>
            <a href="#testimonials" className="hover:text-brand-accent transition-colors relative py-1 focus-visible:ring-2 focus-visible:ring-brand-accent rounded">Testimonials</a>
            <a href="#contact" className="hover:text-brand-accent transition-colors relative py-1 focus-visible:ring-2 focus-visible:ring-brand-accent rounded">Contact</a>
          </nav>

          {/* Header CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <a 
              href="#contact" 
              className="hidden sm:inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-semibold text-xs sm:text-sm py-2 px-4 rounded-full transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-accent"
              aria-label="Navigate to contact to request a Quote"
            >
              <Phone className="w-4 h-4" /> Get a Quote
            </a>
            
            {/* Hamburger button with proper aria states */}
            <button 
              ref={menuBtnRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-white hover:text-brand-accent transition p-2 focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              id="menuToggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <div 
          ref={mobileMenuRef}
          id="mobile-nav-panel"
          className={`md:hidden absolute top-full left-0 w-full bg-brand-dark/95 border-b border-white/10 transition-all duration-300 ease-in-out origin-top ${
            mobileMenuOpen ? 'max-h-96 opacity-100 scale-y-100 py-4' : 'max-h-0 opacity-0 scale-y-0 overflow-hidden pointer-events-none'
          }`}
        >
          <div className="px-5 space-y-2 pb-3">
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-white/90 hover:text-brand-accent font-medium text-base rounded hover:bg-white/5 px-2 transition-colors"
            >
              Home
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-white/90 hover:text-brand-accent font-medium text-base rounded hover:bg-white/5 px-2 transition-colors"
            >
              Services
            </a>
            <a 
              href="#fleet" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-white/90 hover:text-brand-accent font-medium text-base rounded hover:bg-white/5 px-2 transition-colors"
            >
              Fleet
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-white/90 hover:text-brand-accent font-medium text-base rounded hover:bg-white/5 px-2 transition-colors"
            >
              About
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-white/90 hover:text-brand-accent font-medium text-base rounded hover:bg-white/5 px-2 transition-colors"
            >
              Testimonials
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-white/90 hover:text-brand-accent font-medium text-base rounded hover:bg-white/5 px-2 transition-colors"
            >
              Contact
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-semibold py-2.5 px-4 rounded-xl text-center mt-3 text-sm transition-all"
            >
              <Phone className="w-4 h-4" /> Get a Quote
            </a>
          </div>
        </div>
      </header>

      {/* ====== HERO BRYCE ====== */}
      <section 
        id="home" 
        className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-20 bg-brand-dark overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background Image with fallback overlay color */}
        <div className="absolute inset-0 bg-brand-dark">
          <img 
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop" 
            alt="IronHaul transport semi-truck traversing country highway under open sky" 
            className="w-full h-full object-cover opacity-35 filter contrast-125"
          />
        </div>
        
        {/* Elegant backdrop gradient styling */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark via-brand-dark/95 to-transparent"></div>
        
        {/* Subtle grid pattern for texture overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20 lg:py-32">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 bg-brand-accent/20 text-brand-accent text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full border border-brand-accent/35">
              <Sparkles className="w-4 h-4" /> America's Premier Freight Carrier
            </span>
            
            <h1 
              id="hero-heading" 
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none"
            >
              Hauling the Nation <br />
              <span className="text-brand-accent">with Grit &amp; Grace</span>
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
              From coast to coast, IronHaul Logistics delivers your contract freight safely, on time, and with fully integrated live dispatch telemetry. We move your cargo with absolute trust.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-bold text-base py-3 px-6 sm:px-8 rounded-full transition-all duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-brand-accent hover:scale-[1.02] transform"
              >
                Request a Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#services" 
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/60 hover:bg-white hover:text-brand-dark font-semibold text-base py-3 px-6 sm:px-8 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white"
              >
                Explore Services
              </a>
            </div>
          </div>
        </div>

        {/* Floating scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce text-2xl z-10 hidden sm:block pointer-events-none">
          <ChevronDown className="w-6 h-6 mx-auto text-brand-accent" />
        </div>
      </section>

      {/* ====== STATS BAND ====== */}
      <section className="bg-brand-mid border-y border-white/5 py-8 md:py-12 relative z-10" aria-label="Key Performance Indicators">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-2">
              <div className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-accent">14,200+</div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mt-1 uppercase tracking-wider">Miles Covered Daily</div>
            </div>
            <div className="p-2">
              <div className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-accent">2,500+</div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mt-1 uppercase tracking-wider">Active Cargo Clients</div>
            </div>
            <div className="p-2">
              <div className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-accent">98.6%</div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mt-1 uppercase tracking-wider">On-Time Delivery Rate</div>
            </div>
            <div className="p-2">
              <div className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-accent">18+</div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mt-1 uppercase tracking-wider">Years of Dispatch Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SERVICES SECTION ====== */}
      <section id="services" className="py-16 md:py-24 bg-white" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-brand-accent font-semibold text-xs sm:text-sm uppercase tracking-widest block mb-2">Our Logistics Capabilities</span>
            <h2 id="services-heading" className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">
              Full-Scale Freight Solutions
            </h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto my-4 rounded-full"></div>
            <p className="text-slate-600 text-base sm:text-lg">
              We tailor every mile to your freight profile, strict cargo mandates, and schedule. No safety margins compromised. Learn more below.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className="service-card flex flex-col justify-between bg-slate-50 hover:bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-md outline-none"
              >
                <div>
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent mb-5 leading-none">
                    {service.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-dark mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="bg-slate-200/60 text-brand-dark/85 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-1 text-xs text-brand-accent font-bold uppercase tracking-wider hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-accent rounded p-1 cursor-pointer"
                    aria-label={`Read fully detailed capabilities of ${service.title}`}
                  >
                    Details &amp; Specifications <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FLEET SECTION with filter & search ====== */}
      <section id="fleet" className="py-16 md:py-24 bg-slate-50 border-t border-slate-100" aria-labelledby="fleet-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-brand-accent font-semibold text-xs sm:text-sm uppercase tracking-widest block mb-2">Our Superb Fleet</span>
            <h2 id="fleet-heading" className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">
              Built to Move, Built to Last
            </h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto my-4 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base">
              Explore our premium highway fleet. We maintain zero-defect standards for clean safety records on every single route dispatch.
            </p>
          </div>

          {/* Interactive Search / Filter UI Container */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm mb-8 border border-slate-200/60 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Category buttons */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-center" role="group" aria-label="Filter fleet vehicles">
                {['All', 'Long Haul', 'Reefer', 'Heavy Haul'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFleetFilterTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      (tag === 'All' && fleetFilterTag === 'All') ||
                      (tag === 'Long Haul' && fleetFilterTag === 'Long Haul') ||
                      (tag === 'Reefer' && fleetFilterTag === 'Reefer') ||
                      (tag === 'Heavy Haul' && fleetFilterTag === 'Heavy Haul')
                        ? 'bg-brand-accent text-brand-dark shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Live search input */}
              <div className="relative w-full md:w-80">
                <label htmlFor="fleet-search" className="sr-only">Search fleet trucks</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 h-4 text-slate-400" />
                </div>
                <input
                  id="fleet-search"
                  type="text"
                  placeholder="Search motor carrier rigs (e.g. Cummins)..."
                  value={fleetSearchQuery}
                  onChange={(e) => setFleetSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all text-brand-dark"
                />
                {fleetSearchQuery && (
                  <button 
                    onClick={() => setFleetSearchQuery('')} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Clear cargo rig text search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fleet Grid */}
          {isFleetLoading ? (
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto" id="fleet-loading-skeletons" aria-live="polite">
              {[1, 2, 3].map((cardId) => (
                <div 
                  key={cardId} 
                  className="fleet-card bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/80 p-0 flex flex-col justify-between"
                >
                  <div className="h-48 sm:h-52 bg-slate-250 shimmer relative w-full">
                    <div className="absolute top-4 right-4 bg-slate-350 h-5 w-12 rounded-full" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-5 bg-slate-300 rounded w-2/3 shimmer" />
                      <div className="h-4 bg-slate-200 rounded w-16 shimmer" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full shimmer" />
                      <div className="h-3 bg-slate-200 rounded w-5/6 shimmer" />
                    </div>
                    <div className="flex items-center justify-between gap-1 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                        <div className="h-3 bg-slate-250 rounded w-14 shimmer" />
                      </div>
                      <div className="h-4 bg-slate-300 rounded w-24 shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFleet.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto" id="fleet-cards-grid">
              {filteredFleet.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="fleet-card group bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/80 hover:shadow-xl transition-all"
                >
                  <div className="overflow-hidden h-48 sm:h-52 bg-slate-900 relative">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-brand-dark/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-accent border border-white/10">
                      {vehicle.year}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-bold text-brand-dark group-hover:text-brand-accent transition-colors">
                        {vehicle.name}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-md shrink-0">
                        {vehicle.tag}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                      {vehicle.description}
                    </p>

                    <div className="flex items-center justify-between gap-1 border-t border-slate-100 pt-3">
                      <span className="text-xs font-semibold text-brand-dark inline-flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          vehicle.availabilityStatus === 'Available' ? 'bg-green-500' : 'bg-amber-500'
                        }`}></span>
                        {vehicle.availabilityStatus}
                      </span>
                      <button 
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="text-xs font-bold text-brand-dark hover:text-brand-accent transition cursor-pointer flex items-center gap-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent px-1.5 rounded"
                      >
                        Launch Tech Specs <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl max-w-lg mx-auto border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-semibold">No equipment matches your active search queries.</p>
              <button 
                onClick={() => { setFleetSearchQuery(''); setFleetFilterTag('All'); }} 
                className="text-xs font-bold text-brand-accent mt-2 uppercase transition hover:text-brand-gold underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Custom Equipment Quote Trigger */}
          <div className="text-center mt-12">
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-bold text-sm sm:text-base py-3 px-6 sm:px-8 rounded-full transition-all duration-300 shadow-md focus-visible:ring-2 focus-visible:ring-brand-accent"
              onClick={() => {
                setQuoteRequest(prev => ({
                  ...prev,
                  message: 'I am requesting standard rates for specific Peterbilt/Volvo tractive fleet units.'
                }));
              }}
            >
              <Truck className="w-4 h-4" /> Request a Specific Rig
            </a>
          </div>
        </div>
      </section>

      {/* ====== ABOUT US ====== */}
      <section id="about" className="py-16 md:py-24 bg-white" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            
            {/* Column 1: copy */}
            <div className="space-y-6">
              <span className="text-brand-accent font-semibold text-xs sm:text-sm uppercase tracking-widest block">More Than Motor Logistics</span>
              <h2 id="about-heading" className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">
                A Coast-to-Coast Legacy built on Handshake Integrity
              </h2>
              <div className="w-16 h-1 bg-brand-accent rounded-full"></div>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Founded initially in 2007 from a single flatbed rig and simple word-of-mouth partnerships, IronHaul Logistics has evolved into a key contract helper with over 300 active tractors. We strictly avoid shortcuts. 
              </p>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Whether you ship temperature-checked organic products, heavy pipeline infrastructure, or commercial merchandise, we back every contract with top-grade compliance benchmarks, $15M umbrella limits, and dual-driver expedited options.
              </p>

              {/* Highlights list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="text-brand-accent w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">FMCSA Safe</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Award className="text-brand-accent w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">$15M Cover</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Check className="text-brand-accent w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">DOT Certified</span>
                </div>
              </div>
            </div>

            {/* Column 2: image with content badge */}
            <div className="relative">
              <div className="aspect-video sm:aspect-square md:aspect-auto md:h-[450px] overflow-hidden rounded-2xl shadow-xl bg-slate-200 border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=2071&auto=format&fit=crop" 
                  alt="Spotless IronHaul team driver cab standing at freight terminal yard" 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </div>
              
              {/* Floating certificate badge */}
              <div className="absolute -bottom-5 -left-5 bg-brand-accent text-brand-dark px-5 py-4 rounded-xl shadow-lg border border-brand-accent-light/10 hidden sm:block">
                <div className="font-display font-black text-2xl">18+ Years</div>
                <div className="text-xs font-bold uppercase tracking-wider text-brand-dark/85">Of Unbeaten Reliability</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS SECTION ====== */}
      <section id="testimonials" className="py-16 md:py-24 bg-brand-dark text-white relative overflow-hidden" aria-labelledby="testimonials-heading">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-brand-accent font-semibold text-xs sm:text-sm uppercase tracking-widest block mb-2">Customer Shipping History</span>
            <h2 id="testimonials-heading" className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              What Our Clients Say
            </h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto my-4 rounded-full"></div>
            <p className="text-slate-350 text-sm sm:text-base">
              Explore concrete satisfaction scores. We keep freight moving under strict transit guidelines.
            </p>
          </div>

          {/* Horizontal Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((test) => (
              <div 
                key={test.id} 
                className="bg-brand-mid/55 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-brand-accent mb-4" aria-label="5 star review rating score">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-accent" />
                    ))}
                  </div>
                  <blockquote className="text-slate-200 text-sm italic leading-relaxed mb-6">
                    {test.text}
                  </blockquote>
                </div>
                
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent font-black text-sm">
                    {test.avatarInitials}
                  </div>
                  <div>
                    <cite className="not-italic font-bold text-sm text-white block">
                      {test.name}
                    </cite>
                    <span className="text-slate-400 text-xs block">
                      {test.role}, <span className="text-brand-accent text-opacity-80">{test.company}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ACCORDION FAQS SECTION ====== */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100" aria-label="Frequently Asked Questions">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-accent font-semibold text-xs sm:text-sm uppercase tracking-widest block mb-1">Answers to common concerns</span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">
              Safety &amp; Compliance FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`border rounded-xl transition-all ${
                    isOpen 
                      ? 'border-brand-accent bg-slate-50' 
                      : 'border-slate-200 bg-white hover:border-slate-350'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-brand-dark text-sm sm:text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-xl cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-brand-accent shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-60 opacity-100 border-t border-slate-150' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-5 py-4 text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== CONTACT / QUOTE CALC INGEST ====== */}
      <section id="contact" className="py-16 md:py-24 bg-slate-50 border-t border-slate-150 relative" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Col: Contact Info (5 Cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="text-brand-accent font-semibold text-xs sm:text-sm uppercase tracking-widest block">Get a Fast Estimate</span>
                <h2 id="contact-heading" className="font-display text-3xl sm:text-4xl font-bold text-brand-dark tracking-tight">
                  Let's Move Your Freight Profile
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Have an active load schedule? Populate details below. Our Interactive Calculator estimates transit margins. Dispatch reviews submissions instantly.
                </p>
              </div>

              {/* Direct channels */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-sm">Call Dispatch Hotline</h3>
                    <p className="text-slate-600 text-sm font-medium hover:text-brand-accent transition">
                      +1 (800) 555-HAUL
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-sm">Drop Cargo Manifests</h3>
                    <p className="text-slate-600 text-sm font-medium hover:text-brand-accent transition">
                      dispatch@ironhaullogistics.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-sm">HQ Headquarters</h3>
                    <address className="not-italic text-slate-600 text-sm">
                      4700 Freightliner Blvd, Suite 200<br />Charlotte, NC 28208
                    </address>
                  </div>
                </div>
              </div>

              {/* Social Channels with proper titles */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Connect on Socials</h4>
                <div className="flex gap-4">
                  <a href="#" className="text-slate-450 hover:text-brand-accent transition focus-visible:ring-2 focus-visible:ring-brand-accent p-1 rounded" title="Connect on Facebook">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-450 hover:text-brand-accent transition focus-visible:ring-2 focus-visible:ring-brand-accent p-1 rounded" title="Connect on LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-450 hover:text-brand-accent transition focus-visible:ring-2 focus-visible:ring-brand-accent p-1 rounded" title="Connect on Twitter">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-450 hover:text-brand-accent transition focus-visible:ring-2 focus-visible:ring-brand-accent p-1 rounded" title="Connect on Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Col: High-Fidelity Interactive Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-250/90 relative">
              
              {/* Form submit states */}
              {submitSuccess ? (
                <div className="text-center py-8 space-y-5 animate-fadeIn">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold text-brand-dark">Quote Inquiry Received!</h3>
                    <p className="text-xs font-mono text-slate-400 px-3 py-1 bg-slate-50 inline-block rounded-md border border-slate-100">
                      Receipt Ref: <span className="font-bold text-brand-dark">{submissionReference}</span>
                    </p>
                  </div>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you <strong className="text-brand-dark">{quoteRequest.fullName}</strong>. A dispatch pricing supervisor is compiling road permits and fuel adjustments for your <strong className="text-brand-dark">{quoteRequest.serviceNeeded}</strong> route. We will reach out to <strong className="text-brand-dark">{quoteRequest.email}</strong> shortly.
                  </p>

                  {/* Summary of estimated price generated locally */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-w-sm mx-auto text-left space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-[#059669]">Local Calculation Preview:</div>
                    <div className="text-sm font-semibold text-brand-dark flex justify-between">
                      <span>Transit Length:</span>
                      <span>~{quoteRequest.mileage} miles</span>
                    </div>
                    <div className="text-sm font-semibold text-brand-dark flex justify-between">
                      <span>Est. Duration:</span>
                      <span>{estimatedCost.transitDays} {estimatedCost.transitDays === 1 ? 'Working Day' : 'Working Days'}</span>
                    </div>
                    <div className="text-base font-bold text-[#059669] flex justify-between border-t border-slate-200 pt-2 shrink-0">
                      <span>Rate Estimate:</span>
                      <span>${estimatedCost.min.toLocaleString()} - ${estimatedCost.max.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleResetForm}
                      className="text-xs font-bold uppercase tracking-widest text-brand-accent hover:text-brand-gold transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent rounded p-1 cursor-pointer underline"
                    >
                      Calculate New Cargo Route
                    </button>
                  </div>
                </div>
              ) : (
                <form id="contactForm" onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <div className="flex items-center gap-2 text-brand-accent font-bold text-sm uppercase tracking-wider">
                      <Calculator className="w-4 h-4" /> Live Freight Cost Estimator
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Rates compute automatically as you modify options.</p>
                  </div>

                  {/* Sub-grid name & contact */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        name="fullName"
                        required 
                        placeholder="John Doe" 
                        value={quoteRequest.fullName}
                        onChange={(e) => {
                          setQuoteRequest({...quoteRequest, fullName: e.target.value});
                          if (formErrors.fullName) validateField('fullName', e.target.value);
                        }}
                        onBlur={(e) => validateField('fullName', e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:ring-2 outline-none transition text-brand-dark ${
                          formErrors.fullName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/5' 
                            : 'border-slate-300 focus:border-brand-accent focus:ring-brand-accent/20'
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 font-semibold animate-fadeIn" role="alert">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        required 
                        placeholder="john@example.com" 
                        value={quoteRequest.email}
                        onChange={(e) => {
                          setQuoteRequest({...quoteRequest, email: e.target.value});
                          if (formErrors.email) validateField('email', e.target.value);
                        }}
                        onBlur={(e) => validateField('email', e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:ring-2 outline-none transition text-brand-dark ${
                          formErrors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/5' 
                            : 'border-slate-300 focus:border-brand-accent focus:ring-brand-accent/20'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 font-semibold animate-fadeIn" role="alert">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                        Phone Number *
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        placeholder="+1 (555) 000-0000" 
                        value={quoteRequest.phone}
                        onChange={(e) => {
                          setQuoteRequest({...quoteRequest, phone: e.target.value});
                          if (formErrors.phone) validateField('phone', e.target.value);
                        }}
                        onBlur={(e) => validateField('phone', e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:ring-2 outline-none transition text-brand-dark ${
                          formErrors.phone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/5' 
                            : 'border-slate-300 focus:border-brand-accent focus:ring-brand-accent/20'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 font-semibold animate-fadeIn" role="alert">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                        Service Needed
                      </label>
                      <select 
                        value={quoteRequest.serviceNeeded}
                        onChange={(e) => setQuoteRequest({...quoteRequest, serviceNeeded: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition text-brand-dark"
                      >
                        <option>Full Truckload (FTL)</option>
                        <option>Less-Than-Truckload (LTL)</option>
                        <option>Refrigerated (Reefer)</option>
                        <option>Heavy Haul / Oversized</option>
                        <option>Warehousing &amp; Distribution</option>
                        <option>Expedited / Time-Critical</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing slider & detail fields */}
                  <div className="grid sm:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    
                    {/* Weight config */}
                    <div className="sm:col-span-6 space-y-1">
                      <div className="flex justify-between text-xs font-bold text-brand-dark uppercase tracking-wide">
                        <span>Cargo Weight</span>
                        <span className="text-brand-accent">{quoteRequest.weightLbs.toLocaleString()} Lbs</span>
                      </div>
                      <input 
                        type="range" 
                        min="500" 
                        max="52000" 
                        step="500"
                        value={quoteRequest.weightLbs}
                        onChange={(e) => setQuoteRequest({...quoteRequest, weightLbs: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                        aria-label="Cargo Weight in Lbs"
                      />
                    </div>

                    {/* Mileage config */}
                    <div className="sm:col-span-6 space-y-1 font-sans">
                      <div className="flex justify-between text-xs font-bold text-brand-dark uppercase tracking-wide">
                        <span>Estimated Mileage</span>
                        <span className="text-brand-accent">{quoteRequest.mileage} Miles</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="3200" 
                        step="25"
                        value={quoteRequest.mileage}
                        onChange={(e) => setQuoteRequest({...quoteRequest, mileage: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                        aria-label="Estimated route distance in miles"
                      />
                    </div>

                    {/* Radio priority */}
                    <div className="sm:col-span-12 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 mt-1">
                      <span className="text-xs font-bold uppercase tracking-wide text-brand-dark">Priority Speed Class:</span>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark cursor-pointer">
                          <input 
                            type="radio" 
                            name="priority" 
                            value="Standard" 
                            checked={quoteRequest.prioritySpeed === 'Standard'}
                            onChange={() => setQuoteRequest({...quoteRequest, prioritySpeed: 'Standard'})}
                            className="text-brand-accent focus:ring-brand-accent w-4 h-4"
                          />
                          Standard
                        </label>
                        <label className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark cursor-pointer">
                          <input 
                            type="radio" 
                            name="priority" 
                            value="Expedited" 
                            checked={quoteRequest.prioritySpeed === 'Expedited'}
                            onChange={() => setQuoteRequest({...quoteRequest, prioritySpeed: 'Expedited'})}
                            className="text-brand-accent focus:ring-brand-accent w-4 h-4"
                          />
                          Expedited (+40%)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Route location fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                        Origin City / Hub *
                      </label>
                      <input 
                        type="text" 
                        name="origin"
                        required
                        placeholder="e.g. Charlotte, NC" 
                        value={quoteRequest.origin}
                        onChange={(e) => {
                          setQuoteRequest({...quoteRequest, origin: e.target.value});
                          if (formErrors.origin) validateField('origin', e.target.value);
                        }}
                        onBlur={(e) => validateField('origin', e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:ring-2 outline-none transition text-brand-dark ${
                          formErrors.origin 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/5' 
                            : 'border-slate-300 focus:border-brand-accent focus:ring-brand-accent/20'
                        }`}
                      />
                      {formErrors.origin && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 font-semibold animate-fadeIn" role="alert">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
                          {formErrors.origin}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                        Destination City / Hub *
                      </label>
                      <input 
                        type="text" 
                        name="destination"
                        required
                        placeholder="e.g. Los Angeles, CA" 
                        value={quoteRequest.destination}
                        onChange={(e) => {
                          setQuoteRequest({...quoteRequest, destination: e.target.value});
                          if (formErrors.destination) validateField('destination', e.target.value);
                        }}
                        onBlur={(e) => validateField('destination', e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:ring-2 outline-none transition text-brand-dark ${
                          formErrors.destination 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/5' 
                            : 'border-slate-300 focus:border-brand-accent focus:ring-brand-accent/20'
                        }`}
                      />
                      {formErrors.destination && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 font-semibold animate-fadeIn" role="alert">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
                          {formErrors.destination}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Textarea detail */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-brand-dark mb-1">
                      Cargo Notes / Fragile Specifications
                    </label>
                    <textarea 
                      rows={3} 
                      placeholder="Add specific handling constraints, dock timings, liftgate requirements..." 
                      value={quoteRequest.message}
                      onChange={(e) => setQuoteRequest({...quoteRequest, message: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition text-brand-dark" 
                    />
                  </div>

                  {/* Live Cost Output Widget */}
                  <div className="bg-brand-mid text-white rounded-xl p-4 flex items-center justify-between gap-5 shadow-sm">
                    <div>
                      <span className="text-[10px] text-brand-accent uppercase font-extrabold tracking-widest block">Est. Rate Breakdown</span>
                      <div className="font-display text-xl sm:text-2xl font-black text-white shrink-0">
                        ${estimatedCost.min.toLocaleString()} - ${estimatedCost.max.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-300 uppercase block">Est. Transit Time</span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        ~{estimatedCost.transitDays} {estimatedCost.transitDays === 1 ? 'Working Day' : 'Working Days'}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-brand-accent hover:bg-brand-accent-light disabled:bg-slate-300 disabled:cursor-not-allowed text-brand-dark font-extrabold text-sm sm:text-base py-3 rounded-xl transition duration-300 shadow justify-center inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Securing Fleet Slot...
                        </>
                      ) : (
                        <>
                          Submit Freight Schedule Request
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-slate-400 text-center uppercase tracking-wider">
                    FMCSA Safety certified dispatch validation &bull; Private compliance data and secure transmission
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-brand-dark text-slate-400 py-12 border-t border-white/5 mt-auto" aria-label="Footer Area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-2 text-white">
              <Truck className="text-brand-accent w-6 h-6" />
              <span className="font-display font-bold text-lg tracking-wide">IronHaul Logistics</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-5 sm:gap-8 text-xs font-medium text-slate-300" aria-label="Footer Quicklinks">
              <a href="#home" className="hover:text-white transition">Home</a>
              <a href="#services" className="hover:text-white transition">Services</a>
              <a href="#fleet" className="hover:text-white transition">Fleet</a>
              <a href="#about" className="hover:text-white transition">About</a>
              <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-slate-450 text-center sm:text-left">
              &copy; {new Date().getFullYear()} IronHaul Logistics, Inc. DOT #1938502. All rights reserved.
            </div>
            
            <div className="flex gap-4 sm:gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition focus-visible:outline-none focus-visible:underline">Privacy Policy</a>
              <a href="#" className="hover:text-white transition focus-visible:outline-none focus-visible:underline">Terms of Service</a>
              <a href="#" className="hover:text-white transition focus-visible:outline-none focus-visible:underline">Safety &amp; Compliance</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ====== HIGH-FIDELITY FLEET MODAL ====== */}
      {selectedVehicle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-brand-dark/80 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicle-modal-title"
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-slideUp">
            
            {/* Modal Image Header */}
            <div className="relative h-44 sm:h-56 bg-slate-900 shrink-0">
              <img 
                src={selectedVehicle.image} 
                alt={selectedVehicle.name} 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"></div>
              
              {/* Overlaid Title */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-brand-accent bg-brand-accent/15 px-2.5 py-1 rounded-full border border-brand-accent/20 uppercase">
                  {selectedVehicle.tag}
                </span>
                <h3 id="vehicle-modal-title" className="font-display text-xl sm:text-2xl font-bold mt-2">
                  {selectedVehicle.name} Specifications
                </h3>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/85 p-1.5 rounded-full transition focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Close vehicle specifications modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Specifics Scrollable Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-brand-dark">
              <p className="text-slate-600 text-sm leading-relaxed">
                {selectedVehicle.description}
              </p>

              {/* Specs Table */}
              <div className="border border-slate-150 rounded-xl overflow-hidden text-xs sm:text-sm">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Engineering Telemetry Values
                </div>
                
                <div className="divide-y divide-slate-150">
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-slate-500 font-semibold">Tractive Powertrain Unit</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.engine}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-slate-500 font-semibold">Maximum Payload Load Limit</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.payload}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-slate-500 font-semibold">Est. Autonomous Range Limit</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.range}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-slate-500 font-semibold">Full Cycle Fuel Efficiency</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.efficiency}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-slate-500 font-semibold">Optimized Routing Speciality</span>
                    <span className="font-bold text-brand-gold">{selectedVehicle.specs.speciality}</span>
                  </div>
                </div>
              </div>

              {/* Live Location and Dispatch Info */}
              <div className="bg-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-200">
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Active Dispatch Coordinates</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    {selectedVehicle.currentLocation}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  selectedVehicle.availabilityStatus === 'Available' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  Status: {selectedVehicle.availabilityStatus}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-150 p-4 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition uppercase tracking-wider cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-300 rounded"
              >
                Close specs
              </button>
              <button 
                onClick={() => handleBookVehicle(selectedVehicle.tag)}
                className="bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-extrabold text-xs py-2 px-5 rounded-full transition duration-300 shadow-sm uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                Book this unit <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====== HIGH-FIDELITY SERVICE MODAL ====== */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-brand-dark/80 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
        >
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-slideUp">
            
            {/* Header */}
            <div className="bg-brand-dark text-white p-5 sm:p-6 relative shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-accent/20 rounded-xl flex items-center justify-center text-brand-accent leading-none">
                  {selectedService.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-brand-accent block uppercase">Logistics Division Code</span>
                  <h3 id="service-modal-title" className="font-display text-lg sm:text-xl font-bold">
                    {selectedService.title} Details
                  </h3>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 bg-white/10 text-white hover:bg-white/20 p-1.5 rounded-full transition focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Close logistics service details modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable specs */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Transit Mandates</h4>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {selectedService.details}
                </p>
              </div>

              {/* Detail list items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Tags &amp; Compliances</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedService.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                      &bull; {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* FMCSA standards callout */}
              <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-150 text-slate-700 text-xs flex gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-dark block">Zero-Defect Safety Standard SLA</span>
                  This service is monitored under DOT regulations. Dynamic ELD links track safe rest intervals blockages instantly.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-150 p-4 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition uppercase tracking-wider cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-300 rounded"
              >
                Close Specs
              </button>
              <button 
                onClick={() => {
                  setQuoteRequest(prev => ({
                    ...prev,
                    serviceNeeded: selectedService.title
                  }));
                  setSelectedService(null);
                  const contactSec = document.getElementById('contact');
                  if (contactSec) {
                    contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-extrabold text-xs py-2 px-5 rounded-full transition duration-300 shadow-sm uppercase tracking-wider cursor-pointer"
              >
                Request Quote For This
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
