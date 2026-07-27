/* ==========================================================================
   TWINFINITY CAPTURES - Supabase Engine & Hexadecimal Media Converter
   HEX Encoding/Decoding for Multi-Image Event Storage
   ========================================================================== */

const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || 'https://crttogglsjazskcmaswl.supabase.co',
  anonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydHRvZ2dsc2phenNrY21hc3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNDc5OTksImV4cCI6MjEwMDYyMzk5OX0.ggro4Z7PYVGoVoV7XjmTQfT9dqbiPmQMkMXvr0vrpPU'
};

let supabaseClient = null;

if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (err) {
    console.warn("Supabase fallback engine active:", err);
  }
}

/* ==========================================================================
   HEXADECIMAL MEDIA ENCODER & DECODER UTILITIES
   ========================================================================== */

// Convert File Object to HEX String format: "HEX:mimeType:48656c6c6f..."
async function fileToHex(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const bytes = new Uint8Array(arrayBuffer);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      resolve(`HEX:${file.type || 'image/jpeg'}:${hex}`);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Convert HEX String back to Data URI for <img> tags
function hexToDataUri(hexFormattedStr) {
  if (!hexFormattedStr) return '';
  if (!hexFormattedStr.startsWith('HEX:')) return hexFormattedStr; // Normal URL fallback

  try {
    const parts = hexFormattedStr.split(':');
    const mimeType = parts[1] || 'image/jpeg';
    const hex = parts[2] || '';

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }

    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  } catch (e) {
    console.error("Error decoding HEX image:", e);
    return '';
  }
}

// Default Photography Packages & Pricing
const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    title: '3D Spatial & Virtual Twin Tour',
    price: 'RS 49,999',
    duration: '2 Hours Session',
    description: 'Full 3D LiDAR spatial capture of venue, studio, or luxury real estate property with interactive floor plans.',
    features: ['3D LiDAR Spatial Scan', 'Interactive Virtual Tour', 'HDR Still Extraction', '24-Hour Express Delivery']
  },
  {
    id: 'srv-2',
    title: 'Commercial Studio Portrait',
    price: 'RS 29,999',
    duration: '1 Hour Session',
    description: 'Signature commercial portrait session by Twin Sisters with high-contrast studio lighting & 15 edited photos.',
    features: ['Twin Photographers Team', '15 Retouched High-Res Photos', '3 Studio Outfit Changes', 'High-Res Digital Album']
  },
  {
    id: 'srv-3',
    title: 'Event & Gala Coverage',
    price: 'RS 89,999',
    duration: '4 Hours Session',
    description: 'Full event red carpet coverage, ceremony highlights, and real-time digital cloud photo gallery access.',
    features: ['Dual-Camera Live Coverage', 'Real-Time QR Gallery Access', '4K Cinematic Highlights Video', 'Unlimited Edited Shots']
  },
  {
    id: 'srv-4',
    title: 'Brand Product Photography',
    price: 'RS 39,999',
    duration: '2 Hours Session',
    description: 'Studio product staging, 360-spin media capture, and dynamic commercial lighting for e-commerce brands.',
    features: ['360 Spin Media Capture', 'Commercial Studio Staging', 'Transparent PNG & Backgrounds', 'Commercial Rights Included']
  }
];

// Default FAQs
const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    question: 'Who runs Twinfinity Photography Studio?',
    answer: 'Twinfinity Captures is founded and operated by twin sisters specializing in 3D spatial LiDAR capture and high-contrast commercial portraits in Islamabad & Rawalpindi.'
  },
  {
    id: 'faq-2',
    question: 'How do I check my booking status?',
    answer: 'Enter your 7-character Booking ID (e.g. TW-84920) into the Live Booking Tracker section to view real-time status and editing progress.'
  },
  {
    id: 'faq-3',
    question: 'Are all package prices listed in Pakistani Rupees (RS)?',
    answer: 'Yes! All package prices are transparently listed in Rupees (RS) with no hidden fees.'
  },
  {
    id: 'faq-4',
    question: 'What happens if my shoot date needs to change?',
    answer: 'Our admin team will update your booking status to Rescheduled. You will receive an automated Gmail confirmation and WhatsApp update.'
  }
];

// Default Comprehensive Site Content
const DEFAULT_SITE_CONTENT = {
  id: 'main_content',
  heroBadge: 'Twin Sisters Photography Studio & 3D Spatial',
  heroTitle: 'Architecting the <span class="gradient-text">Infinite</span> in Photography',
  heroSubtitle: 'Founded by twin sisters in Islamabad & Rawalpindi delivering high-end commercial portraits, 3D LiDAR spatial capture, and digital twin virtual tours.',
  heroImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  stat1Number: '500+',
  stat1Label: 'Sessions Completed',
  stat2Number: '3D LiDAR',
  stat2Label: 'Spatial Scans',
  spatialTitle: '3D LiDAR <span class="gradient-text">Spatial Digital Twin</span> Capture',
  spatialSubtitle: 'Experience real-time 3D spatial mapping for venues, real estate properties, and commercial studios. Twin Sisters provide interactive 3D floor plans and virtual twin tours accessible on web and mobile.',
  spatialImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  aboutBadge: 'Founders & Master Photographers',
  aboutTitle: 'Meet the <span class="gradient-text">Twin Sisters</span> Behind the Lens',
  aboutBio: 'Operating in Islamabad & Rawalpindi, Pakistan, we combine artistic portrait vision with cutting-edge 3D spatial scanning technology. Every session is handled directly by us to guarantee perfection.',
  aboutImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1000&q=80',
  contactPhone: '03110157080',
  contactPhone2: '03151592722',
  contactEmail: 'twinfinitycaptrues@gmail.com',
  location: 'Islamabad & Rawalpindi, Pakistan',
  studioHours: 'Mon - Sat: 10:00 AM - 8:00 PM'
};

// Default Portfolio Lookbook with Multi-Image Event Arrays
const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    title: 'High-Fashion Editorial Studio Portrait',
    category: 'Portraits',
    cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Signature commercial portrait session with studio lighting and retouched finish by Twin Sisters.'
  },
  {
    id: 'gal-2',
    title: '3D Spatial LiDAR Digital Twin Venue Scan',
    category: '3D Spatial',
    cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Interactive venue mapping and 3D LiDAR spatial scan album for luxury real estate.'
  },
  {
    id: 'gal-3',
    title: 'Grand Gala & Red Carpet Ceremony',
    category: 'Events',
    cover: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Dual-camera live event coverage, red carpet, and ceremony highlights gallery.'
  },
  {
    id: 'gal-4',
    title: 'E-Commerce Brand Product Staging',
    category: 'Commercial',
    cover: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Commercial studio product staging with 360-degree rotation media.'
  },
  {
    id: 'gal-5',
    title: 'Contemporary Fashion Lookbook Shoot',
    category: 'Fashion',
    cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'High-fashion editorial lookbook shoot captured on location.'
  }
];

function generateBookingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TW-${randomStr}`;
}

const TwinfinityDB = {
  // Services
  async getServices() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('services').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    const local = localStorage.getItem('twininfinity_services');
    return local ? JSON.parse(local) : DEFAULT_SERVICES;
  },

  async saveService(serviceData) {
    let service = { ...serviceData, id: serviceData.id || `srv-${Date.now()}` };
    if (supabaseClient) {
      try {
        await supabaseClient.from('services').upsert([service]);
      } catch (e) {}
    }
    let services = await this.getServices();
    const idx = services.findIndex(s => s.id === service.id);
    if (idx !== -1) services[idx] = service;
    else services.push(service);
    localStorage.setItem('twininfinity_services', JSON.stringify(services));
    return service;
  },

  async deleteService(id) {
    if (supabaseClient) {
      try {
        await supabaseClient.from('services').delete().eq('id', id);
      } catch (e) {}
    }
    let services = await this.getServices();
    services = services.filter(s => s.id !== id);
    localStorage.setItem('twininfinity_services', JSON.stringify(services));
  },

  // Gallery Portfolio & Multi-Image HEX Array Support
  async getGallery() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('gallery').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    const local = localStorage.getItem('twininfinity_gallery');
    return local ? JSON.parse(local) : DEFAULT_GALLERY;
  },

  async saveGalleryItem(itemData) {
    let imagesArr = itemData.images || [];
    if (imagesArr.length === 0 && (itemData.cover || itemData.image)) {
      imagesArr = [itemData.cover || itemData.image];
    }

    let item = {
      id: itemData.id || `gal-${Date.now()}`,
      title: itemData.title,
      category: itemData.category || 'Portraits',
      cover: itemData.cover || imagesArr[0] || '',
      image: itemData.cover || imagesArr[0] || '',
      images: imagesArr, // HEX strings array or URLs array
      description: itemData.description || '',
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        await supabaseClient.from('gallery').upsert([item]);
      } catch (e) {}
    }

    let gallery = await this.getGallery();
    const idx = gallery.findIndex(g => g.id === item.id);
    if (idx !== -1) gallery[idx] = item;
    else gallery.unshift(item);
    localStorage.setItem('twininfinity_gallery', JSON.stringify(gallery));
    return item;
  },

  async deleteGalleryItem(id) {
    if (supabaseClient) {
      try {
        await supabaseClient.from('gallery').delete().eq('id', id);
      } catch (e) {}
    }
    let gallery = await this.getGallery();
    gallery = gallery.filter(g => g.id !== id);
    localStorage.setItem('twininfinity_gallery', JSON.stringify(gallery));
  },

  // FAQs
  async getFAQs() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('faqs').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    const local = localStorage.getItem('twininfinity_faqs');
    return local ? JSON.parse(local) : DEFAULT_FAQS;
  },

  async saveFAQ(faqData) {
    let faq = { ...faqData, id: faqData.id || `faq-${Date.now()}` };
    if (supabaseClient) {
      try {
        await supabaseClient.from('faqs').upsert([faq]);
      } catch (e) {}
    }
    let faqs = await this.getFAQs();
    const idx = faqs.findIndex(f => f.id === faq.id);
    if (idx !== -1) faqs[idx] = faq;
    else faqs.push(faq);
    localStorage.setItem('twininfinity_faqs', JSON.stringify(faqs));
    return faq;
  },

  async deleteFAQ(id) {
    if (supabaseClient) {
      try {
        await supabaseClient.from('faqs').delete().eq('id', id);
      } catch (e) {}
    }
    let faqs = await this.getFAQs();
    faqs = faqs.filter(f => f.id !== id);
    localStorage.setItem('twininfinity_faqs', JSON.stringify(faqs));
  },

  // Site Content
  async getSiteContent() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('site_content').select('*').eq('id', 'main_content');
        if (!error && data && data.length > 0) return { ...DEFAULT_SITE_CONTENT, ...data[0] };
      } catch (e) {}
    }
    const local = localStorage.getItem('twininfinity_content');
    return local ? { ...DEFAULT_SITE_CONTENT, ...JSON.parse(local) } : DEFAULT_SITE_CONTENT;
  },

  async updateSiteContent(contentData) {
    const updated = { ...DEFAULT_SITE_CONTENT, ...contentData, id: 'main_content' };
    if (supabaseClient) {
      try {
        await supabaseClient.from('site_content').upsert([updated]);
      } catch (e) {}
    }
    localStorage.setItem('twininfinity_content', JSON.stringify(updated));
    return updated;
  },

  // Bookings
  async createBooking(bookingData) {
    const bookingId = generateBookingId();
    const payload = {
      booking_id: bookingId,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      service: bookingData.service,
      session_date: bookingData.session_date,
      location_preference: bookingData.location_preference || 'Studio Shoot',
      notes: bookingData.notes || '',
      status: 'Registered',
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('bookings').insert([payload]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {}
    }

    const localBookings = JSON.parse(localStorage.getItem('twininfinity_bookings') || '[]');
    localBookings.push(payload);
    localStorage.setItem('twininfinity_bookings', JSON.stringify(localBookings));
    return payload;
  },

  async getBookingById(bookingId) {
    const searchId = bookingId.trim().toUpperCase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('bookings').select('*').eq('booking_id', searchId);
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {}
    }

    const localBookings = JSON.parse(localStorage.getItem('twininfinity_bookings') || '[]');
    return localBookings.find(b => b.booking_id === searchId) || null;
  }
};
