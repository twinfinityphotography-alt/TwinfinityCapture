/* ==========================================================================
   Twinfinity - Direct Pure Supabase Database Engine & Security Shield
   ========================================================================== */

const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || 'https://crttogglsjazskcmaswl.supabase.co',
  anonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydHRvZ2dsc2phenNrY21hc3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNDc5OTksImV4cCI6MjEwMDYyMzk5OX0.ggro4Z7PYVGoVoV7XjmTQfT9dqbiPmQMkMXvr0vrpPU'
};

let supabaseClient = null;

if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (err) {}
}

// Default fallback objects for instant render speed
const DEFAULT_SERVICES = [
  { id: 'srv-1', title: '3D Spatial & Virtual Twin Tour', price: 'RS 49,999', duration: '2 Hours', description: 'Full 3D LiDAR spatial capture of venue, studio, or real estate property.' },
  { id: 'srv-2', title: 'Commercial Studio Portrait', price: 'RS 29,999', duration: '1 Hour', description: 'High-end lighting photography by Twin Sisters, professional touchups, 15 edited photos.' },
  { id: 'srv-3', title: 'Event & Gala Coverage', price: 'RS 89,999', duration: '4 Hours', description: 'Full event digital coverage, real-time photo gallery access, dual twin photographers.' },
  { id: 'srv-4', title: 'Brand Product Photography', price: 'RS 39,999', duration: '2 Hours', description: 'Studio product staging, 360 spin media, dynamic commercial lighting.' }
];

const DEFAULT_FAQS = [
  { id: 'faq-1', question: 'Who runs Twinfinity Photography?', answer: 'Twinfinity Studio is founded and operated by twin sisters specializing in 3D spatial capture and high-end portrait photography in Islamabad & Rawalpindi.' },
  { id: 'faq-2', question: 'How do I check my booking status?', answer: 'Enter your 7-character Booking ID (e.g. TW-84920) into the Live Booking Tracker section to view real-time status and notes.' },
  { id: 'faq-3', question: 'Are prices listed in RS?', answer: 'Yes! All prices are listed in Rupees (RS) with transparent package breakdowns.' },
  { id: 'faq-4', question: 'What happens if my session date needs to change?', answer: 'Our admin team will update your booking status to Rescheduled or Date Changed. You will receive an automated Gmail confirmation and WhatsApp update.' }
];

const DEFAULT_SITE_CONTENT = {
  id: 'main_content',
  heroTitle: 'Architecting the <span class="gradient-text">Infinite</span> in Photography',
  heroSubtitle: 'Founded by twin sisters in Islamabad & Rawalpindi delivering high-end commercial portraits, 3D LiDAR spatial capture, and digital twin virtual tours. Book your session instantly in RS.',
  aboutTitle: 'Meet the <span class="gradient-text">Twin Sisters</span> Behind the Lens',
  aboutBio: 'We are passionate twin photographers operating in Islamabad & Rawalpindi combining artistic portrait vision with cutting-edge 3D spatial scanning technology. Every session is handled directly by us to guarantee perfection.',
  aboutImage: 'assets/og-image.png',
  contactEmail: 'twinfinityphotography@gmail.com',
  contactPhone: '03110157080',
  whatsapp1: '03110157080',
  whatsapp2: '03151592722',
  instagram: 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw',
  facebook: '',
  youtube: '',
  tiktok: '',
  location: 'Islamabad & Rawalpindi, Pakistan',
  mapsUrl: 'https://maps.google.com/maps?q=Islamabad,Pakistan&t=&z=12&ie=UTF8&iwloc=&output=embed'
};

const DEFAULT_GALLERY = [
  { 
    id: 'gal-1', 
    title: '3D Spatial Digital Twin Scan', 
    category: 'Spatial 3D', 
    cover: 'assets/og-image.png', 
    image: 'assets/og-image.png',
    images: ['assets/og-image.png', 'assets/apple-touch-icon.png', 'assets/favicon-32.png'], 
    description: 'Interactive venue mapping and 3D LiDAR spatial scan album by Twin Sisters.' 
  },
  { 
    id: 'gal-2', 
    title: 'Commercial Studio Portrait Shoot', 
    category: 'Portraits', 
    cover: 'assets/og-image.png', 
    image: 'assets/og-image.png',
    images: ['assets/og-image.png', 'assets/apple-touch-icon.png'], 
    description: 'Signature high-contrast studio lighting portrait series by twin sisters.' 
  },
  { 
    id: 'gal-3', 
    title: 'Grand Gala & High-Profile Event', 
    category: 'Events', 
    cover: 'assets/og-image.png', 
    image: 'assets/og-image.png',
    images: ['assets/og-image.png', 'assets/icon-512.png', 'assets/apple-touch-icon.png'], 
    description: 'Dual-camera live event coverage, red carpet, and ceremony gallery.' 
  }
];

// Lightweight Image Compression Helper
window.ImageUtils = {
  compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// Universal Supabase Database Interface
window.DB = {
  async createBooking(bData) {
    if (!supabaseClient) return bData;

    const payload = {
      id: bData.id,
      clientName: bData.clientName,
      clientname: bData.clientName,
      clientEmail: bData.clientEmail,
      clientemail: bData.clientEmail,
      clientPhone: bData.clientPhone,
      clientphone: bData.clientPhone,
      serviceTitle: bData.serviceTitle,
      servicetitle: bData.serviceTitle,
      bookingDate: bData.bookingDate,
      bookingdate: bData.bookingDate,
      bookingTime: bData.bookingTime,
      bookingtime: bData.bookingTime,
      notes: bData.notes || '',
      status: bData.status || 'pending',
      createdAt: bData.createdAt || new Date().toISOString(),
      createdat: bData.createdAt || new Date().toISOString()
    };

    await supabaseClient.from('bookings').insert([payload]);
    return bData;
  },

  async getBookingById(bookingId) {
    if (!supabaseClient) return null;
    const cleanId = bookingId.trim().toUpperCase();

    const { data, error } = await supabaseClient.from('bookings').select('*').eq('id', cleanId).single();
    if (error || !data) return null;

    return {
      id: data.id,
      clientName: data.clientName || data.clientname || data.client_name || 'Valued Client',
      clientEmail: data.clientEmail || data.clientemail || data.client_email || '',
      clientPhone: data.clientPhone || data.clientphone || data.client_phone || '',
      serviceTitle: data.serviceTitle || data.servicetitle || data.service_title || 'Photography Session',
      bookingDate: data.bookingDate || data.bookingdate || data.booking_date || 'Date Pending',
      bookingTime: data.bookingTime || data.bookingtime || data.booking_time || 'Time Slot Pending',
      notes: data.notes || '',
      status: data.status || 'pending',
      createdAt: data.createdAt || data.createdat || ''
    };
  },

  async getAllBookings() {
    if (!supabaseClient) return [];

    const { data, error } = await supabaseClient.from('bookings').select('*');
    if (error || !data) return [];

    return data.map(d => ({
      id: d.id,
      clientName: d.clientName || d.clientname || d.client_name || 'Valued Client',
      clientEmail: d.clientEmail || d.clientemail || d.client_email || '',
      clientPhone: d.clientPhone || d.clientphone || d.client_phone || '',
      serviceTitle: d.serviceTitle || d.servicetitle || d.service_title || 'Photography Session',
      bookingDate: d.bookingDate || d.bookingdate || d.booking_date || 'Date Pending',
      bookingTime: d.bookingTime || d.bookingtime || d.booking_time || 'Time Slot Pending',
      notes: d.notes || '',
      status: d.status || 'pending',
      createdAt: d.createdAt || d.createdat || ''
    }));
  },

  async updateBookingStatus(bookingId, updates) {
    if (!supabaseClient) return updates;
    await supabaseClient.from('bookings').update(updates).eq('id', bookingId);
    return updates;
  },

  async getServices() {
    if (!supabaseClient) return DEFAULT_SERVICES;
    const { data, error } = await supabaseClient.from('services').select('*');
    if (error || !data || data.length === 0) return DEFAULT_SERVICES;
    return data;
  },

  async saveServices(services) {
    if (!supabaseClient) return services;
    const payload = services.map(s => ({ id: s.id, title: s.title, price: s.price, duration: s.duration, description: s.description }));
    await supabaseClient.from('services').upsert(payload);
    return services;
  },

  async getFAQs() {
    if (!supabaseClient) return DEFAULT_FAQS;
    const { data, error } = await supabaseClient.from('faqs').select('*');
    if (error || !data || data.length === 0) return DEFAULT_FAQS;
    return data;
  },

  async saveFAQs(faqs) {
    if (!supabaseClient) return faqs;
    const payload = faqs.map(f => ({ id: f.id, question: f.question, answer: f.answer }));
    await supabaseClient.from('faqs').upsert(payload);
    return faqs;
  },

  async getSiteContent() {
    const savedImg = localStorage.getItem('twinfinity_about_img');

    if (!supabaseClient) {
      return {
        ...DEFAULT_SITE_CONTENT,
        aboutImage: savedImg || DEFAULT_SITE_CONTENT.aboutImage
      };
    }

    const { data, error } = await supabaseClient.from('site_content').select('*').eq('id', 'main_content').single();
    if (error || !data) {
      return {
        ...DEFAULT_SITE_CONTENT,
        aboutImage: savedImg || DEFAULT_SITE_CONTENT.aboutImage
      };
    }

    let bio = data.aboutBio || data.aboutbio || DEFAULT_SITE_CONTENT.aboutBio;
    let img = data.aboutImage || data.aboutimage || '';

    if (bio.includes("||ABOUT_IMG:")) {
      const parts = bio.split("||ABOUT_IMG:");
      bio = parts[0];
      img = parts[1] || img;
    }

    // Final fallback to savedImg, gallery table founder row, then default
    if (!img || img === 'assets/og-image.png') {
      try {
        const { data: gFounder } = await supabaseClient.from('gallery').select('*').eq('id', 'twin_sisters_founder_photo').single();
        if (gFounder && (gFounder.image || gFounder.cover)) {
          img = gFounder.image || gFounder.cover;
        }
      } catch(e) {}
    }

    if (!img || img === 'assets/og-image.png') {
      img = savedImg || DEFAULT_SITE_CONTENT.aboutImage;
    }

    return {
      id: 'main_content',
      heroTitle: data.heroTitle || data.herotitle || DEFAULT_SITE_CONTENT.heroTitle,
      heroSubtitle: data.heroSubtitle || data.herosubtitle || DEFAULT_SITE_CONTENT.heroSubtitle,
      aboutTitle: data.aboutTitle || data.abouttitle || DEFAULT_SITE_CONTENT.aboutTitle,
      aboutBio: bio,
      aboutImage: img,
      contactEmail: data.contactEmail || data.contactemail || DEFAULT_SITE_CONTENT.contactEmail,
      contactPhone: data.contactPhone || data.contactphone || DEFAULT_SITE_CONTENT.contactPhone,
      whatsapp1: data.whatsapp1 || DEFAULT_SITE_CONTENT.whatsapp1,
      whatsapp2: data.whatsapp2 || DEFAULT_SITE_CONTENT.whatsapp2,
      instagram: data.instagram || DEFAULT_SITE_CONTENT.instagram,
      facebook: data.facebook || '',
      youtube: data.youtube || '',
      tiktok: data.tiktok || '',
      location: data.location || DEFAULT_SITE_CONTENT.location,
      mapsUrl: data.mapsUrl || data.mapsurl || DEFAULT_SITE_CONTENT.mapsUrl
    };
  },

  async saveSiteContent(content) {
    if (content.aboutImage) {
      localStorage.setItem('twinfinity_about_img', content.aboutImage);
    }

    if (!supabaseClient) return content;

    // Fail-proof founder photo save to gallery table
    if (content.aboutImage) {
      try {
        await supabaseClient.from('gallery').upsert([{
          id: 'twin_sisters_founder_photo',
          title: 'Twin Sisters Founders Photo',
          category: 'Founders',
          image: content.aboutImage,
          cover: content.aboutImage,
          description: 'Founders Photo'
        }]);
      } catch(e) {}
    }

    const cleanBio = (content.aboutBio || '').split("||ABOUT_IMG:")[0];
    const encodedBio = cleanBio + (content.aboutImage ? "||ABOUT_IMG:" + content.aboutImage : "");

    const fullPayload = {
      id: 'main_content',
      heroTitle: content.heroTitle,
      herotitle: content.heroTitle,
      heroSubtitle: content.heroSubtitle,
      herosubtitle: content.heroSubtitle,
      aboutTitle: content.aboutTitle,
      abouttitle: content.aboutTitle,
      aboutBio: encodedBio,
      aboutbio: encodedBio,
      aboutImage: content.aboutImage || 'assets/og-image.png',
      aboutimage: content.aboutImage || 'assets/og-image.png',
      contactEmail: content.contactEmail,
      contactemail: content.contactEmail,
      contactPhone: content.whatsapp1 || content.contactPhone,
      contactphone: content.whatsapp1 || content.contactPhone,
      whatsapp1: content.whatsapp1,
      whatsapp2: content.whatsapp2,
      instagram: content.instagram,
      facebook: content.facebook,
      youtube: content.youtube,
      tiktok: content.tiktok,
      location: content.location,
      mapsUrl: content.mapsUrl,
      mapsurl: content.mapsUrl
    };

    const { error } = await supabaseClient.from('site_content').upsert([fullPayload]);
    if (error) {
      console.warn("Supabase full site_content upsert notice, trying strict standard columns:", error.message);
      const standardPayload = {
        id: 'main_content',
        heroTitle: content.heroTitle,
        herotitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        herosubtitle: content.heroSubtitle,
        aboutTitle: content.aboutTitle,
        abouttitle: content.aboutTitle,
        aboutBio: encodedBio,
        aboutbio: encodedBio,
        contactEmail: content.contactEmail,
        contactemail: content.contactEmail
      };
      const res2 = await supabaseClient.from('site_content').upsert([standardPayload]);
      if (res2.error) console.error("🔴 Standard site_content upsert error:", res2.error.message);
      else console.log("🟢 Site Content saved cleanly via standard columns!");
    } else {
      console.log("🟢 Site Content saved cleanly via full payload!");
    }
    return content;
  },

  async getGallery() {
    if (!supabaseClient) return DEFAULT_GALLERY.filter(g => g.id !== 'twin_sisters_founder_photo');
    const { data, error } = await supabaseClient.from('gallery').select('*');
    if (error || !data || data.length === 0) return DEFAULT_GALLERY.filter(g => g.id !== 'twin_sisters_founder_photo');

    return data
      .filter(item => item.id !== 'twin_sisters_founder_photo')
      .map(item => {
        let images = [];
        let desc = item.description || '';

        if (item.images) {
          try {
            images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
          } catch(e) {}
        }

        if ((!images || !Array.isArray(images) || images.length === 0) && desc.includes("||IMAGES:")) {
          const parts = desc.split("||IMAGES:");
          desc = parts[0];
          try { images = JSON.parse(parts[1]); } catch(e) {}
        } else if (desc.includes("||IMAGES:")) {
          desc = desc.split("||IMAGES:")[0];
        }

        if (!images || !Array.isArray(images) || images.length === 0) {
          images = [item.image || item.cover];
        }

        const primaryCover = item.image || item.cover || images[0];

        return {
          id: item.id,
          title: item.title,
          category: item.category,
          cover: primaryCover,
          image: primaryCover,
          images: images,
          description: desc
        };
      });
  },

  async saveGallery(gallery) {
    if (!supabaseClient) return gallery;

    const fullPayload = gallery.map(item => {
      const coverPhoto = item.cover || (item.images && item.images[0]) || item.image || '';
      const cleanDesc = (item.description || '').split("||IMAGES:")[0];
      const encodedDesc = cleanDesc + (item.images && item.images.length > 1 ? "||IMAGES:" + JSON.stringify(item.images) : "");

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        cover: coverPhoto,
        image: coverPhoto,
        images: JSON.stringify(item.images || [coverPhoto]),
        description: encodedDesc
      };
    });

    const { error } = await supabaseClient.from('gallery').upsert(fullPayload);
    if (error) {
      console.warn("Supabase full gallery upsert notice, trying strict standard columns:", error.message);
      const standardPayload = gallery.map(item => {
        const coverPhoto = item.cover || (item.images && item.images[0]) || item.image || '';
        const cleanDesc = (item.description || '').split("||IMAGES:")[0];
        const encodedDesc = cleanDesc + (item.images && item.images.length > 1 ? "||IMAGES:" + JSON.stringify(item.images) : "");

        return {
          id: item.id,
          title: item.title,
          category: item.category,
          image: coverPhoto,
          description: encodedDesc
        };
      });
      const res2 = await supabaseClient.from('gallery').upsert(standardPayload);
      if (res2.error) console.error("🔴 Standard gallery upsert error:", res2.error.message);
      else console.log("🟢 Gallery saved cleanly via standard columns!");
    } else {
      console.log("🟢 Gallery saved cleanly via full payload!");
    }
    return gallery;
  },

  // Delete Entire Gallery Album from Supabase Database
  async deleteGalleryItem(albumId) {
    if (!supabaseClient) return;

    console.log("🗑️ Executing direct Supabase DELETE on gallery album:", albumId);
    const { error } = await supabaseClient.from('gallery').delete().eq('id', albumId);

    if (error) {
      console.error("🔴 Supabase Album Delete Error:", error.message);
      alert("Supabase Delete Error: " + error.message);
    } else {
      console.log("🟢 Album deleted from Supabase cleanly:", albumId);
    }
  },

  // Delete Single Photo from Event Album & Update Supabase
  async deleteSinglePhotoFromAlbum(albumId, photoIndex) {
    let gallery = await this.getGallery();
    const albumIdx = gallery.findIndex(g => g.id === albumId);

    if (albumIdx === -1) return gallery;

    const album = gallery[albumIdx];
    if (!album.images || album.images.length <= photoIndex) return gallery;

    // Remove single photo at index
    album.images.splice(photoIndex, 1);

    if (album.images.length === 0) {
      // If all photos removed, delete entire album row from Supabase
      await this.deleteGalleryItem(albumId);
      gallery = gallery.filter(g => g.id !== albumId);
    } else {
      album.cover = album.images[0];
      album.image = album.images[0];
      await this.saveGallery(gallery);
    }

    return gallery;
  }
};

// ==========================================================================
// BULLETPROOF ANTI-DEVTOOLS & CODE INSPECTION SECURITY SHIELD
// ==========================================================================
window.SecurityEngine = {
  init() {
    // 1. Clear & Neutralize Console Loggers
    const noop = function() {};
    try {
      window.console.log = noop;
      window.console.warn = noop;
      window.console.error = noop;
      window.console.info = noop;
      window.console.table = noop;
      window.console.dir = noop;
    } catch(e) {}

    // 2. Disable Right Click Context Menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // 3. Disable Keyboard Inspection Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    });

    // 4. Smooth Non-Blocking DevTools Dimension Shield
    const checkDevTools = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        document.body.style.filter = 'blur(12px)';
      } else {
        document.body.style.filter = 'none';
      }
    };
    window.addEventListener('resize', checkDevTools);
  }
};

document.addEventListener('DOMContentLoaded', () => window.SecurityEngine.init());
