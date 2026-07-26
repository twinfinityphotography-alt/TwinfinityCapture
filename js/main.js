/* ==========================================================================
   Twinfinity - Main Client Application Controller
   ========================================================================== */

// Force page to start at the top on reload/load
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', async () => {
  window.scrollTo(0, 0);

  // 1. Initial Content Renderers
  window.renderServices();
  window.renderFAQs();
  window.renderSiteContent();
  window.renderPortfolio();

  // 2. Booking Modal Controllers
  const bookingModal = document.getElementById('booking-modal');
  const closeBookingBtn = document.getElementById('close-booking-modal');
  const bookingForm = document.getElementById('booking-form');

  if (closeBookingBtn) {
    closeBookingBtn.addEventListener('click', () => bookingModal.classList.remove('active'));
  }

  // Process Booking Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const clientName = document.getElementById('client-name').value.trim();
      const clientEmail = document.getElementById('client-email').value.trim();
      const clientPhone = document.getElementById('client-phone').value.trim();
      const serviceSelect = document.getElementById('booking-service');
      const serviceTitle = serviceSelect.options[serviceSelect.selectedIndex].text;
      const bookingDate = document.getElementById('booking-date').value;
      const bookingTime = document.getElementById('booking-time').value;
      const notes = document.getElementById('booking-notes').value.trim();

      const bookingId = 'TW-' + Math.floor(10000 + Math.random() * 90000);

      const bookingObject = {
        id: bookingId,
        clientName,
        clientEmail,
        clientPhone,
        serviceTitle,
        bookingDate,
        bookingTime,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await window.DB.createBooking(bookingObject);

      // Email Notification (Gmail SMTP)
      await window.NotificationEngine.sendEmailNotification({
        toEmail: clientEmail,
        clientName,
        bookingId,
        serviceTitle,
        bookingDate,
        bookingTime,
        status: 'pending',
        notes
      });

      await window.NotificationEngine.sendEmailNotification({
        toEmail: 'twinfinityphotography@gmail.com',
        clientName: `ADMIN ALERT: ${clientName}`,
        bookingId,
        serviceTitle,
        bookingDate,
        bookingTime,
        status: 'pending',
        notes
      });

      const waUrl = window.NotificationEngine.getWhatsAppUrl({
        clientPhone,
        clientName,
        bookingId,
        serviceTitle,
        bookingDate,
        bookingTime,
        status: 'pending'
      });

      bookingModal.classList.remove('active');
      bookingForm.reset();

      showBookingSuccessModal(bookingId, waUrl);
    });
  }

  // 3. Live Booking Tracker Search Controller
  const trackerForm = document.getElementById('tracker-form');
  if (trackerForm) {
    trackerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputId = document.getElementById('tracker-id-input').value;
      const resultBox = document.getElementById('tracker-result-box');

      if (!inputId) return;

      const booking = await window.DB.getBookingById(inputId);
      resultBox.style.display = 'block';

      if (!booking) {
        resultBox.innerHTML = `
          <div class="glass-card" style="border-color: #ef4444; text-align:center;">
            <h3 style="color:#ef4444; margin-bottom:0.5rem;">Booking ID Not Found</h3>
            <p>No active booking matched <strong>"${inputId.toUpperCase()}"</strong>. Please verify your 7-character Booking ID.</p>
          </div>
        `;
        return;
      }

      const bDate = booking.bookingDate || booking.bookingdate || booking.booking_date || 'Date Pending';
      const bTime = booking.bookingTime || booking.bookingtime || booking.booking_time || 'Slot Pending';
      const cName = booking.clientName || booking.clientname || booking.client_name || 'Valued Client';
      const sTitle = booking.serviceTitle || booking.servicetitle || booking.service_title || 'Photography Package';

      resultBox.innerHTML = `
        <div class="glass-card" style="border-color: var(--primary-cyan); text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3>Booking Reference: <span class="gradient-text">${booking.id}</span></h3>
            <span class="status-badge status-${(booking.status || 'pending').toLowerCase()}">${booking.status}</span>
          </div>
          <div style="grid-template-columns: 1fr 1fr; display:grid; gap:1rem; margin: 1rem 0;">
            <div><strong>Client Name:</strong> ${cName}</div>
            <div><strong>Service Package:</strong> ${sTitle}</div>
            <div><strong>Scheduled Date:</strong> 📅 ${bDate}</div>
            <div><strong>Time Slot:</strong> ⏰ ${bTime}</div>
          </div>
          <div style="font-size:0.9rem; color:var(--text-muted); background:rgba(0,0,0,0.3); padding:0.75rem; border-radius:var(--radius-sm);">
            <strong>Notes / Status Details:</strong> ${booking.notes || 'Your session is queued and assigned to the Twin Sisters photo team.'}
          </div>
        </div>
      `;
    });
  }

  // 4. Admin Auth Gate & Footer Link
  const adminModal = document.getElementById('admin-modal');
  const openAdminBtn = document.getElementById('open-admin-btn');
  const footerAdminLink = document.getElementById('footer-admin-link');
  const closeAdminBtn = document.getElementById('close-admin-btn');
  const adminLoginForm = document.getElementById('admin-login-form');

  const triggerAdminModal = (e) => {
    e.preventDefault();
    if (window.AdminPortal.checkAuth()) {
      openAdminDashboardView();
    } else {
      adminModal.classList.add('active');
    }
  };

  if (openAdminBtn) openAdminBtn.addEventListener('click', triggerAdminModal);
  if (footerAdminLink) footerAdminLink.addEventListener('click', triggerAdminModal);
  if (closeAdminBtn) closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-pass-input').value;
      if (window.AdminPortal.login(pass)) {
        adminModal.classList.remove('active');
        openAdminDashboardView();
      } else {
        alert("Invalid Admin Password! Please try again.");
      }
    });
  }

  // 5. Mobile Hamburger Navigation Drawer Controller
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeMobileDrawer = document.getElementById('close-mobile-drawer');
  const mobileOpenAdminBtn = document.getElementById('mobile-open-admin-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
    });
  }

  if (closeMobileDrawer && mobileDrawer) {
    closeMobileDrawer.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
    });
  }

  if (mobileOpenAdminBtn) {
    mobileOpenAdminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      triggerAdminModal(e);
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
    });
  });
});

// Render Dynamic Services in 'RS'
window.renderServices = async function () {
  const container = document.getElementById('services-grid-container');
  if (!container) return;

  const services = await window.DB.getServices();
  const select = document.getElementById('booking-service');

  container.innerHTML = '';
  if (select) select.innerHTML = '';

  services.forEach(s => {
    const card = document.createElement('div');
    card.className = 'glass-card service-card';
    card.innerHTML = `
      <div class="service-icon">📷</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
        <span class="service-price">${s.price}</span>
        <span style="font-size:0.85rem; color:var(--text-dim);">⏱️ ${s.duration}</span>
      </div>
      <button data-service-id="${s.id}" class="btn btn-primary open-booking-modal" style="margin-top:1.5rem; width:100%;">Book Session</button>
    `;
    container.appendChild(card);

    if (select) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.title} (${s.price})`;
      select.appendChild(opt);
    }
  });

  document.querySelectorAll('.open-booking-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('booking-modal');
      const serviceId = btn.getAttribute('data-service-id');
      if (serviceId && select) select.value = serviceId;
      modal.classList.add('active');
    });
  });
};

// Render Dynamic Portfolio & Event Albums
window.renderPortfolio = async function () {
  const container = document.getElementById('portfolio-grid-container');
  if (!container) return;

  const gallery = await window.DB.getGallery();
  container.innerHTML = '';

  gallery.forEach(item => {
    const images = item.images || [item.cover || item.image];
    const cover = item.cover || item.image || images[0];

    // Mini thumbnail preview strip for card
    let previewStripHtml = '';
    if (images.length > 1) {
      previewStripHtml = '<div style="display:flex; gap:0.4rem; margin-top:0.5rem;">';
      images.slice(0, 4).forEach(img => {
        previewStripHtml += `<img src="${img}" style="width:45px; height:45px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.2);">`;
      });
      if (images.length > 4) {
        previewStripHtml += `<div style="width:45px; height:45px; background:rgba(0,242,254,0.15); color:var(--primary-cyan); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:bold; border:1px solid var(--primary-cyan);">+${images.length - 4}</div>`;
      }
      previewStripHtml += '</div>';
    }

    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.padding = '1.25rem';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div style="position:relative;">
        <img src="${cover}" alt="${item.title}" style="width:100%; height:230px; object-fit:cover; border-radius:var(--radius-sm); margin-bottom:1rem;">
        <span style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.85); color:var(--primary-cyan); padding:0.25rem 0.6rem; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700; border:1px solid var(--primary-cyan);">📷 ${images.length} Photo${images.length > 1 ? 's' : ''}</span>
      </div>
      <div class="badge" style="font-size:0.75rem; padding:0.2rem 0.6rem; margin-bottom:0.5rem;">${item.category}</div>
      <h3 style="font-size:1.15rem; margin-bottom:0.35rem;">${item.title}</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.4;">${item.description}</p>
      ${previewStripHtml}
      <button class="btn btn-primary" style="width:100%; margin-top:1rem; font-size:0.85rem; padding:0.5rem;">🚀 Open Full Album in New Tab (${images.length} Photos & Details)</button>
    `;

    card.addEventListener('click', () => window.openAlbumDetailsModal(item.id));
    container.appendChild(card);
  });
};

// Global Multi-Image Lightbox Gallery State
window.currentAlbumImages = [];
window.currentImageIndex = 0;

// Open Full Album Details & Multi-Photo Showcase in New Tab
window.openAlbumDetailsModal = function (albumId) {
  console.log("🚀 Opening Album Details Page in New Tab for ID:", albumId);
  window.open(`album.html?id=${encodeURIComponent(albumId)}`, '_blank');
};

// Open Carousel Lightbox Viewer (Full Screen)
window.openLightbox = async function (albumId, startIndex = 0) {
  const gallery = await window.DB.getGallery();
  let album = gallery.find(g => String(g.id).toLowerCase() === String(albumId).toLowerCase());

  if (!album && gallery.length > 0) {
    album = gallery[0];
  }

  if (!album) return;

  window.currentAlbumImages = album.images || [album.cover || album.image];
  window.currentImageIndex = startIndex;

  const modal = document.getElementById('lightbox-modal');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');

  if (titleEl) titleEl.textContent = album.title;
  if (descEl) descEl.textContent = album.description;

  renderLightboxSlide();
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
  }
};

window.renderLightboxSlide = function () {
  const mainImg = document.getElementById('lightbox-main-img');
  const counterEl = document.getElementById('lightbox-counter');
  const thumbsContainer = document.getElementById('lightbox-thumbnails');

  if (mainImg) mainImg.src = window.currentAlbumImages[window.currentImageIndex];
  if (counterEl) counterEl.textContent = `Photo ${window.currentImageIndex + 1} of ${window.currentAlbumImages.length}`;

  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    window.currentAlbumImages.forEach((imgSrc, idx) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.style.width = '60px';
      thumb.style.height = '60px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = 'var(--radius-sm)';
      thumb.style.cursor = 'pointer';
      thumb.style.border = idx === window.currentImageIndex ? '2px solid var(--primary-cyan)' : '1px solid var(--border-color)';
      thumb.addEventListener('click', () => {
        window.currentImageIndex = idx;
        renderLightboxSlide();
      });
      thumbsContainer.appendChild(thumb);
    });
  }
};

window.nextLightboxSlide = function () {
  window.currentImageIndex = (window.currentImageIndex + 1) % window.currentAlbumImages.length;
  window.renderLightboxSlide();
};

window.prevLightboxSlide = function () {
  window.currentImageIndex = (window.currentImageIndex - 1 + window.currentAlbumImages.length) % window.currentAlbumImages.length;
  window.renderLightboxSlide();
};

// Render FAQs
window.renderFAQs = async function () {
  const container = document.getElementById('faq-list-container');
  if (!container) return;

  const faqs = await window.DB.getFAQs();
  container.innerHTML = '';

  faqs.forEach(f => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
      <button class="faq-question">
        <span>${f.question}</span>
        <span>➕</span>
      </button>
      <div class="faq-answer">
        <p>${f.answer}</p>
      </div>
    `;
    item.querySelector('.faq-question').addEventListener('click', () => {
      item.classList.toggle('active');
    });
    container.appendChild(item);
  });
};

// Render Site Content, Studio Contact & Location Details
window.renderSiteContent = async function () {
  const content = await window.DB.getSiteContent();

  const heroTitleEl = document.getElementById('dynamic-hero-title');
  const heroSubEl = document.getElementById('dynamic-hero-subtitle');
  const aboutBioEl = document.getElementById('dynamic-about-bio');
  const aboutImgEl = document.getElementById('dynamic-about-img');
  const emailEl = document.getElementById('dynamic-contact-email');
  const locEl = document.getElementById('dynamic-location');
  const mapsIframe = document.getElementById('google-maps-iframe');

  if (heroTitleEl && content.heroTitle) heroTitleEl.innerHTML = content.heroTitle;
  if (heroSubEl && content.heroSubtitle) heroSubEl.textContent = content.heroSubtitle;
  if (aboutBioEl && content.aboutBio) aboutBioEl.textContent = content.aboutBio;
  if (aboutImgEl && content.aboutImage) aboutImgEl.src = content.aboutImage;
  if (emailEl && content.contactEmail) emailEl.textContent = content.contactEmail;
  if (locEl && content.location) locEl.textContent = content.location;
  if (mapsIframe && content.mapsUrl) mapsIframe.src = content.mapsUrl;

  // Format WhatsApp Link Helper
  const wa1Number = (content.whatsapp1 || '03110157080').replace(/[^0-9]/g, '');
  const wa2Number = (content.whatsapp2 || '03151592722').replace(/[^0-9]/g, '');

  const wa1Url = `https://wa.me/${wa1Number.startsWith('92') ? wa1Number : '92' + wa1Number.replace(/^0/, '')}`;
  const wa2Url = `https://wa.me/${wa2Number.startsWith('92') ? wa2Number : '92' + wa2Number.replace(/^0/, '')}`;
  const instaUrl = content.instagram || 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw';
  const fbUrl = content.facebook || '';
  const ytUrl = content.youtube || '';
  const tiktokUrl = content.tiktok || '';

  const wa1Btns = document.querySelectorAll('.dynamic-wa1-btn');
  const wa2Btns = document.querySelectorAll('.dynamic-wa2-btn');
  const instaBtns = document.querySelectorAll('.dynamic-insta-btn');
  const fbBtns = document.querySelectorAll('.dynamic-fb-btn');
  const ytBtns = document.querySelectorAll('.dynamic-yt-btn');
  const tiktokBtns = document.querySelectorAll('.dynamic-tiktok-btn');

  wa1Btns.forEach(btn => btn.href = wa1Url);
  wa2Btns.forEach(btn => btn.href = wa2Url);

  instaBtns.forEach(btn => {
    btn.href = instaUrl;
    btn.style.display = instaUrl ? 'inline-flex' : 'none';
  });

  fbBtns.forEach(btn => {
    btn.href = fbUrl;
    btn.style.display = fbUrl ? 'inline-flex' : 'none';
  });

  ytBtns.forEach(btn => {
    btn.href = ytUrl;
    btn.style.display = ytUrl ? 'inline-flex' : 'none';
  });

  tiktokBtns.forEach(btn => {
    btn.href = tiktokUrl;
    btn.style.display = tiktokUrl ? 'inline-flex' : 'none';
  });
};

// Open Admin Dashboard View
function openAdminDashboardView() {
  const dashModal = document.getElementById('admin-dashboard-modal');
  if (dashModal) {
    dashModal.classList.add('active');
    window.AdminPortal.switchTab('bookings');
  }
}

// Display Booking Success Confirmation Modal
function showBookingSuccessModal(bookingId, waUrl) {
  const successModal = document.getElementById('success-modal');
  const idEl = document.getElementById('success-booking-id');
  const waBtn = document.getElementById('success-wa-btn');

  if (idEl) idEl.textContent = bookingId;
  if (waBtn) waBtn.href = waUrl;

  if (successModal) successModal.classList.add('active');
}
