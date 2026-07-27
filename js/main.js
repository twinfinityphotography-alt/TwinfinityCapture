/* ==========================================================================
   TWINFINITY CAPTURES - Fashion & Photography Studio Main Script
   Real-Time Admin Sync & Dynamic Database Media Renderer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Initializing Twinfinity Captures Studio...");

  // Mobile Drawer Control
  const hamburgerBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeDrawerBtn = document.getElementById('close-mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburgerBtn && mobileDrawer && closeDrawerBtn) {
    hamburgerBtn.addEventListener('click', () => mobileDrawer.classList.add('active'));
    closeDrawerBtn.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    });
  }

  // Load All Dynamic Site Content from Supabase / Local Engine
  await refreshAllWebsiteData();

  // Initialize Portfolio Category Filter Buttons
  initCategoryFilters();

  // Initialize Booking Modal
  initBookingModal();

  // Initialize Live Booking Tracker
  initBookingTracker();

  // REAL-TIME AUTO REFRESH: Listen for storage events when changes are saved in Admin Dashboard
  window.addEventListener('storage', async (e) => {
    console.log("Admin update detected, refreshing site content in real time...");
    await refreshAllWebsiteData();
  });
});

async function refreshAllWebsiteData() {
  await renderSiteContent();
  await renderPhotographyServices();
  await renderPortfolioGallery('All');
  await renderFAQs();
}

/* ==========================================================================
   DYNAMIC RENDERING FUNCTIONS
   ========================================================================== */

// 1. Render Photography Services / Packages
async function renderPhotographyServices() {
  const container = document.getElementById('services-grid-container');
  if (!container) return;

  const services = await TwinfinityDB.getServices();
  container.innerHTML = services.map(srv => `
    <div class="service-card">
      <div>
        <span class="badge-tag">${escapeHtml(srv.duration || 'Studio Session')}</span>
        <h3>${escapeHtml(srv.title)}</h3>
        <div class="price">${escapeHtml(srv.price)}</div>
        <p>${escapeHtml(srv.description)}</p>
        <ul class="service-features">
          ${(srv.features || ['Twin Photographers', 'High-Res Digital Album', 'Professional Retouching']).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
        </ul>
      </div>
      <button class="btn btn-outline btn-block open-booking-modal" data-service="${escapeHtml(srv.title)}">
        Book Photography Session
      </button>
    </div>
  `).join('');
}

// 2. Render Portfolio Gallery with Multi-Image HEX Decoding
async function renderPortfolioGallery(filterCategory = 'All') {
  const container = document.getElementById('portfolio-grid-container');
  if (!container) return;

  const gallery = await TwinfinityDB.getGallery();

  const filtered = (filterCategory === 'All')
    ? gallery
    : gallery.filter(item => item.category && item.category.toLowerCase() === filterCategory.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No photography items in category "${filterCategory}". Add items in Admin Console!</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const rawImagesList = (item.images && item.images.length > 0) ? item.images : [item.cover || item.image];
    const decodedCover = hexToDataUri(rawImagesList[0]);
    const isGif = (rawImagesList[0] || '').toLowerCase().endsWith('.gif');

    return `
      <div class="portfolio-card" onclick="openMultiImageModal('${item.id}')">
        <div class="portfolio-media-wrapper">
          <img src="${decodedCover}" alt="${escapeHtml(item.title)}" loading="lazy">
          ${isGif ? `<div style="position:absolute; top:1rem; right:1rem; background:rgba(0,242,254,0.2); backdrop-filter:blur(8px); border:1px solid var(--cyan-bright); padding:0.25rem 0.6rem; border-radius:20px; font-size:0.75rem; color:var(--cyan-bright); font-weight:700;">ANIMATED GIF</div>` : ''}
          ${rawImagesList.length > 1 ? `<div style="position:absolute; bottom:1rem; right:1rem; background:rgba(7,8,12,0.85); backdrop-filter:blur(8px); border:1px solid var(--border-strong); padding:0.25rem 0.75rem; border-radius:20px; font-size:0.75rem; color:var(--cyan-bright); font-weight:700;">✦ ${rawImagesList.length} EVENT PHOTOS</div>` : ''}
        </div>
        <div class="portfolio-overlay">
          <span class="portfolio-category">${escapeHtml(item.category || 'Portraits')}</span>
          <h3 class="portfolio-title">${escapeHtml(item.title)}</h3>
        </div>
      </div>
    `;
  }).join('');
}

function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      await renderPortfolioGallery(category);
    });
  });
}

// 3. Render FAQs Accordion
async function renderFAQs() {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  const faqs = await TwinfinityDB.getFAQs();
  container.innerHTML = faqs.map((faq, index) => `
    <div class="faq-item ${index === 0 ? 'active' : ''}">
      <div class="faq-header" onclick="toggleFaq(this)">
        ${escapeHtml(faq.question)}
      </div>
      <div class="faq-body">
        ${escapeHtml(faq.answer)}
      </div>
    </div>
  `).join('');
}

function toggleFaq(headerEl) {
  const faqItem = headerEl.closest('.faq-item');
  const isActive = faqItem.classList.contains('active');
  document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
  if (!isActive) faqItem.classList.add('active');
}

// 4. Render All Site Content Dynamically (Hero, About, Spatial, Contact, Location)
async function renderSiteContent() {
  const content = await TwinfinityDB.getSiteContent();

  // Hero Section
  const heroBadgeEl = document.getElementById('dynamic-hero-badge');
  const heroTitleEl = document.getElementById('dynamic-hero-title');
  const heroSubEl = document.getElementById('dynamic-hero-subtitle');
  const heroImgEl = document.getElementById('hero-main-img');
  const stat1Num = document.getElementById('dynamic-stat1-num');
  const stat1Lbl = document.getElementById('dynamic-stat1-lbl');
  const stat2Num = document.getElementById('dynamic-stat2-num');
  const stat2Lbl = document.getElementById('dynamic-stat2-lbl');

  if (heroBadgeEl && content.heroBadge) heroBadgeEl.textContent = content.heroBadge;
  if (heroTitleEl && content.heroTitle) heroTitleEl.innerHTML = content.heroTitle;
  if (heroSubEl && content.heroSubtitle) heroSubEl.innerHTML = content.heroSubtitle;
  if (heroImgEl && content.heroImage) heroImgEl.src = hexToDataUri(content.heroImage);
  if (stat1Num && content.stat1Number) stat1Num.textContent = content.stat1Number;
  if (stat1Lbl && content.stat1Label) stat1Lbl.textContent = content.stat1Label;
  if (stat2Num && content.stat2Number) stat2Num.textContent = content.stat2Number;
  if (stat2Lbl && content.stat2Label) stat2Lbl.textContent = content.stat2Label;

  // 3D Spatial Section
  const spatialTitleEl = document.getElementById('dynamic-spatial-title');
  const spatialSubEl = document.getElementById('dynamic-spatial-sub');
  const spatialImgEl = document.getElementById('spatial-main-img');
  if (spatialTitleEl && content.spatialTitle) spatialTitleEl.innerHTML = content.spatialTitle;
  if (spatialSubEl && content.spatialSubtitle) spatialSubEl.textContent = content.spatialSubtitle;
  if (spatialImgEl && content.spatialImage) spatialImgEl.src = hexToDataUri(content.spatialImage);

  // About Section
  const aboutBadgeEl = document.getElementById('dynamic-about-badge');
  const aboutTitleEl = document.getElementById('dynamic-about-title');
  const aboutBioEl = document.getElementById('dynamic-about-bio');
  const aboutImgEl = document.getElementById('about-main-img');

  if (aboutBadgeEl && content.aboutBadge) aboutBadgeEl.textContent = content.aboutBadge;
  if (aboutTitleEl && content.aboutTitle) aboutTitleEl.innerHTML = content.aboutTitle;
  if (aboutBioEl && content.aboutBio) aboutBioEl.textContent = content.aboutBio;
  if (aboutImgEl && content.aboutImage) aboutImgEl.src = hexToDataUri(content.aboutImage);

  // Contact Info & Footer Displays
  const phoneEls = document.querySelectorAll('.contact-phone-display');
  phoneEls.forEach(el => el.textContent = content.contactPhone || '03110157080');

  const emailEls = document.querySelectorAll('.contact-email-display');
  emailEls.forEach(el => el.textContent = content.contactEmail || 'twinfinitycaptrues@gmail.com');

  const locationEls = document.querySelectorAll('.contact-location-display');
  locationEls.forEach(el => el.textContent = content.location || 'Islamabad & Rawalpindi, Pakistan');

  const hoursEls = document.querySelectorAll('.contact-hours-display');
  hoursEls.forEach(el => el.textContent = content.studioHours || 'Mon - Sat: 10:00 AM - 8:00 PM');
}

/* ==========================================================================
   MULTI-IMAGE EVENT GALLERY MODAL (HEX DECODED)
   ========================================================================== */

async function openMultiImageModal(itemId) {
  const gallery = await TwinfinityDB.getGallery();
  const item = gallery.find(g => g.id === itemId);
  if (!item) return;

  const rawImagesList = (item.images && item.images.length > 0) ? item.images : [item.cover || item.image];
  const decodedImages = rawImagesList.map(img => hexToDataUri(img));

  const modalHtml = `
    <div id="portfolio-modal" class="modal-overlay active">
      <div class="modal-card" style="max-width:900px; padding:2rem;">
        <button onclick="document.getElementById('portfolio-modal').remove()" style="position:absolute; top:1rem; right:1.5rem; background:none; border:none; color:var(--cyan-bright); font-size:2rem; cursor:pointer; z-index:10;">&times;</button>
        
        <div style="margin-bottom:1.5rem;">
          <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.15em; color:var(--cyan-bright); font-weight:700;">${escapeHtml(item.category)} &bull; ${decodedImages.length} EVENT PHOTOS ENCODED IN HEX</span>
          <h3 style="font-size:2rem; color:#fff; margin:0.3rem 0 0.5rem 0; font-family:var(--font-heading);">${escapeHtml(item.title)}</h3>
          <p style="color:var(--text-secondary); line-height:1.7;">${escapeHtml(item.description)}</p>
        </div>

        <!-- Main Display Image -->
        <div style="border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border); height:460px; margin-bottom:1.25rem;">
          <img id="modal-main-view" src="${decodedImages[0]}" alt="${escapeHtml(item.title)}" style="width:100%; height:100%; object-fit:cover;">
        </div>

        <!-- Multi-Image Thumbnail Selector Grid -->
        ${decodedImages.length > 1 ? `
          <div style="display:flex; gap:0.75rem; overflow-x:auto; padding-bottom:0.5rem;">
            ${decodedImages.map((src, i) => `
              <img src="${src}" onclick="document.getElementById('modal-main-view').src='${src}'; document.querySelectorAll('.modal-thumb').forEach(t=>t.style.borderColor='var(--border)'); this.style.borderColor='var(--cyan-bright)';" class="modal-thumb" style="width:100px; height:70px; object-fit:cover; border-radius:var(--radius-sm); border:2px solid ${i === 0 ? 'var(--cyan-bright)' : 'var(--border)'}; cursor:pointer; transition:var(--transition);">
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/* ==========================================================================
   BOOKING MODAL & TRACKER LOGIC
   ========================================================================== */

function initBookingModal() {
  const modalOverlay = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('close-booking-modal');
  const bookingForm = document.getElementById('booking-form');
  const serviceSelect = document.getElementById('booking-service-select');

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('open-booking-modal')) {
      const selectedService = e.target.getAttribute('data-service');
      if (selectedService && serviceSelect) {
        serviceSelect.value = selectedService;
      }
      if (modalOverlay) modalOverlay.classList.add('active');
    }
  });

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking Session...';
      }

      const formData = {
        name: document.getElementById('book-name').value,
        email: document.getElementById('book-email').value,
        phone: document.getElementById('book-phone').value,
        service: document.getElementById('booking-service-select').value,
        session_date: document.getElementById('book-date').value,
        location_preference: document.getElementById('book-location')?.value || 'Studio Shoot',
        notes: document.getElementById('book-notes')?.value || ''
      };

      const result = await TwinfinityDB.createBooking(formData);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Session Booking';
      }

      modalOverlay.classList.remove('active');
      bookingForm.reset();

      showBookingSuccessModal(result);

      if (window.TwinfinityNotifier) {
        window.TwinfinityNotifier.sendBookingEmail(result);
      }
    });
  }
}

function showBookingSuccessModal(booking) {
  const successModalHtml = `
    <div id="success-modal" class="modal-overlay active">
      <div class="modal-card" style="text-align:center;">
        <div style="font-size:3rem; color:var(--cyan-bright); margin-bottom:1rem;">✦</div>
        <h3 style="font-size:1.8rem; margin-bottom:0.5rem; color:#fff;">Session Booked!</h3>
        <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
          Your photography session is registered at Twinfinity Captures Studio.
        </p>
        <div style="background:var(--bg-card); border:1px solid var(--border-strong); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:1.5rem;">
          <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--text-muted); display:block; margin-bottom:0.25rem;">Your Booking Tracking ID</span>
          <strong style="font-size:2rem; font-family:var(--font-heading); color:var(--cyan-bright); letter-spacing:0.1em;">${booking.booking_id}</strong>
        </div>
        <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:2rem;">
          Use this ID to check your shoot &amp; editing progress live on our portal.
        </p>
        <div style="display:flex; gap:1rem; justify-content:center;">
          <button class="btn btn-primary" onclick="closeSuccessModal(); trackBookingDirect('${booking.booking_id}');">
            Track Booking Live
          </button>
          <button class="btn btn-outline" onclick="closeSuccessModal(); window.TwinfinityNotifier.openWhatsAppConfirmation(${JSON.stringify(booking).replace(/"/g, '&quot;')});">
            WhatsApp Confirmation
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', successModalHtml);
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.remove();
}

function trackBookingDirect(bookingId) {
  const input = document.getElementById('track-booking-id-input');
  const trackBtn = document.getElementById('track-booking-btn');
  if (input && trackBtn) {
    input.value = bookingId;
    trackBtn.click();
    document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
  }
}

function initBookingTracker() {
  const trackBtn = document.getElementById('track-booking-btn');
  const input = document.getElementById('track-booking-id-input');
  const resultCard = document.getElementById('tracking-result-card');

  if (!trackBtn || !input || !resultCard) return;

  trackBtn.addEventListener('click', async () => {
    const bookingId = input.value.trim();
    if (!bookingId) {
      alert("Please enter a valid 7-character Booking ID (e.g. TW-84920)");
      return;
    }

    trackBtn.disabled = true;
    trackBtn.textContent = 'Searching...';

    const booking = await TwinfinityDB.getBookingById(bookingId);

    trackBtn.disabled = false;
    trackBtn.textContent = 'Track Booking';

    if (!booking) {
      resultCard.style.display = 'block';
      resultCard.innerHTML = `
        <div style="text-align:center; padding:2rem 0; color:#ef4444;">
          <h4>No Booking Record Found</h4>
          <p style="color:var(--text-muted); margin-top:0.5rem;">Please verify your Booking ID (e.g. TW-84920) or book a new session.</p>
        </div>
      `;
      return;
    }

    const statuses = ['Registered', 'Scheduled', 'Shooting', 'Editing', 'Delivered'];
    const currentStatusIndex = Math.max(0, statuses.indexOf(booking.status || 'Registered'));

    resultCard.style.display = 'block';
    resultCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--border); padding-bottom:1rem;">
        <div>
          <span style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Booking ID</span>
          <h3 style="color:var(--cyan-bright); font-size:1.5rem;">${booking.booking_id}</h3>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Client</span>
          <p style="color:#fff; font-weight:600;">${escapeHtml(booking.name)}</p>
        </div>
      </div>
      <div style="margin-bottom:2rem; background:var(--bg-card); padding:1rem 1.5rem; border-radius:var(--radius-md); border:1px solid var(--border);">
        <p style="font-size:0.9rem; color:var(--text-secondary);"><strong>Package:</strong> ${escapeHtml(booking.service)}</p>
        <p style="font-size:0.9rem; color:var(--text-secondary);"><strong>Session Date:</strong> ${booking.session_date || 'To be scheduled'}</p>
        <p style="font-size:0.9rem; color:var(--text-secondary);"><strong>Location:</strong> ${escapeHtml(booking.location_preference || 'Studio Shoot')}</p>
      </div>
      <div class="tracking-timeline">
        ${statuses.map((st, idx) => {
          let nodeClass = '';
          if (idx < currentStatusIndex) nodeClass = 'completed';
          else if (idx === currentStatusIndex) nodeClass = 'active';

          return `
            <div class="tracking-node ${nodeClass}">
              <div class="node-dot">${idx < currentStatusIndex ? '✓' : (idx + 1)}</div>
              <p>${st}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
