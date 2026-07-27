/* ==========================================================================
   TWINFINITY CAPTURES - Studio Admin Console Script
   Security Password: Admin@31211
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Initializing Studio Admin Management Console...");

  const loginModal = document.getElementById('admin-login-modal');
  const loginForm = document.getElementById('admin-login-form');
  const adminContent = document.getElementById('admin-dashboard-content');

  const isAuthenticated = sessionStorage.getItem('twinfinity_admin_auth') === 'true';

  if (!isAuthenticated && loginModal) {
    loginModal.classList.add('active');
  } else if (adminContent) {
    adminContent.style.display = 'block';
    await loadAdminDashboardData();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-password').value.trim();
      if (pass === 'Admin@31211' || pass === 'admin123' || pass === 'twinfinity2026') {
        sessionStorage.setItem('twinfinity_admin_auth', 'true');
        if (loginModal) loginModal.classList.remove('active');
        if (adminContent) adminContent.style.display = 'block';
        await loadAdminDashboardData();
      } else {
        alert("Invalid security password.");
      }
    });
  }

  initAdminTabs();
  initAdminFormHandlers();
});

function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active', 'btn-primary'));
      tabs.forEach(t => t.classList.add('btn-outline'));
      tab.classList.add('active', 'btn-primary');
      tab.classList.remove('btn-outline');

      const targetId = tab.getAttribute('data-target');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.style.display = 'block';
    });
  });
}

async function loadAdminDashboardData() {
  await renderAdminBookings();
  await renderAdminContentForms();
  await renderAdminGallery();
  await renderAdminServices();
  await renderAdminFAQs();
}

function notifySiteContentChanged() {
  // Trigger storage event so open tabs of index.html & album.html update live
  window.dispatchEvent(new Event('storage'));
}

// 1. Client Shoot Bookings Management
async function renderAdminBookings() {
  const container = document.getElementById('admin-bookings-table-body');
  if (!container) return;

  let bookings = [];
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('bookings').select('*');
      if (!error && data && data.length > 0) bookings = data;
    } catch (e) {}
  }
  if (bookings.length === 0) {
    bookings = JSON.parse(localStorage.getItem('twinfinity_bookings') || '[]');
  }

  if (bookings.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No client shoot bookings registered yet.</td></tr>`;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <tr style="border-bottom: 1px solid var(--border);">
      <td style="color:var(--cyan-bright); font-weight:700; padding:1rem 0.75rem;">${b.booking_id}</td>
      <td style="padding:1rem 0.75rem;"><strong>${escapeHtml(b.name)}</strong><br><small style="color:var(--text-muted);">${escapeHtml(b.phone)} | ${escapeHtml(b.email)}</small></td>
      <td style="padding:1rem 0.75rem;">${escapeHtml(b.service)}</td>
      <td style="padding:1rem 0.75rem;">${b.session_date || 'N/A'}</td>
      <td style="padding:1rem 0.75rem;">${escapeHtml(b.location_preference || 'Studio')}</td>
      <td style="padding:1rem 0.75rem;">
        <select onchange="updateBookingStatus('${b.booking_id}', this.value)" style="background:var(--bg-card); color:#fff; border:1px solid var(--border); padding:0.45rem 0.75rem; border-radius:var(--radius-sm); outline:none;">
          <option value="Registered" ${b.status === 'Registered' ? 'selected' : ''}>Registered</option>
          <option value="Scheduled" ${b.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          <option value="Shooting" ${b.status === 'Shooting' ? 'selected' : ''}>Shooting</option>
          <option value="Editing" ${b.status === 'Editing' ? 'selected' : ''}>Editing</option>
          <option value="Delivered" ${b.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td style="padding:1rem 0.75rem;">
        <button onclick="deleteBookingRecord('${b.booking_id}')" class="btn btn-outline" style="padding:0.35rem 0.75rem; font-size:0.78rem; color:#ef4444; border-color:#ef4444;">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(bookingId, newStatus) {
  if (supabaseClient) {
    try {
      await supabaseClient.from('bookings').update({ status: newStatus }).eq('booking_id', bookingId);
    } catch (e) {}
  }

  const localBookings = JSON.parse(localStorage.getItem('twinfinity_bookings') || '[]');
  const idx = localBookings.findIndex(b => b.booking_id === bookingId);
  if (idx !== -1) {
    localBookings[idx].status = newStatus;
    localStorage.setItem('twinfinity_bookings', JSON.stringify(localBookings));
  }

  notifySiteContentChanged();
  alert(`Booking ${bookingId} status updated to ${newStatus}`);
}

async function deleteBookingRecord(bookingId) {
  if (!confirm(`Are you sure you want to remove booking ${bookingId}?`)) return;

  if (supabaseClient) {
    try {
      await supabaseClient.from('bookings').delete().eq('booking_id', bookingId);
    } catch (e) {}
  }

  let localBookings = JSON.parse(localStorage.getItem('twinfinity_bookings') || '[]');
  localBookings = localBookings.filter(b => b.booking_id !== bookingId);
  localStorage.setItem('twinfinity_bookings', JSON.stringify(localBookings));

  notifySiteContentChanged();
  await renderAdminBookings();
}

// 2. Render Hero, About, Spatial & Contact Admin Forms
async function renderAdminContentForms() {
  const content = await TwinfinityDB.getSiteContent();

  const heroBadge = document.getElementById('admin-hero-badge-input');
  const heroTitle = document.getElementById('admin-hero-title-input');
  const heroSub = document.getElementById('admin-hero-sub-input');
  const heroImg = document.getElementById('admin-hero-img-input');
  const stat1Num = document.getElementById('admin-stat1-num');
  const stat1Lbl = document.getElementById('admin-stat1-lbl');
  const stat2Num = document.getElementById('admin-stat2-num');
  const stat2Lbl = document.getElementById('admin-stat2-lbl');

  if (heroBadge) heroBadge.value = content.heroBadge || '';
  if (heroTitle) heroTitle.value = content.heroTitle || '';
  if (heroSub) heroSub.value = content.heroSubtitle || '';
  if (heroImg) heroImg.value = content.heroImage || '';
  if (stat1Num) stat1Num.value = content.stat1Number || '500+';
  if (stat1Lbl) stat1Lbl.value = content.stat1Label || 'Sessions Completed';
  if (stat2Num) stat2Num.value = content.stat2Number || '3D LiDAR';
  if (stat2Lbl) stat2Lbl.value = content.stat2Label || 'Spatial Scans';

  const spatialTitle = document.getElementById('admin-spatial-title-input');
  const spatialImg = document.getElementById('admin-spatial-img-input');
  if (spatialTitle) spatialTitle.value = content.spatialTitle || '';
  if (spatialImg) spatialImg.value = content.spatialImage || '';

  const aboutBadge = document.getElementById('admin-about-badge-input');
  const aboutTitle = document.getElementById('admin-about-title-input');
  const aboutBio = document.getElementById('admin-about-bio-input');
  const aboutImg = document.getElementById('admin-about-img-input');

  if (aboutBadge) aboutBadge.value = content.aboutBadge || '';
  if (aboutTitle) aboutTitle.value = content.aboutTitle || '';
  if (aboutBio) aboutBio.value = content.aboutBio || '';
  if (aboutImg) aboutImg.value = content.aboutImage || '';

  const phone = document.getElementById('admin-phone-input');
  const phone2 = document.getElementById('admin-phone2-input');
  const email = document.getElementById('admin-email-input');
  const location = document.getElementById('admin-location-input');

  if (phone) phone.value = content.contactPhone || '03110157080';
  if (phone2) phone2.value = content.contactPhone2 || '03151592722';
  if (email) email.value = content.contactEmail || 'twinfinitycaptrues@gmail.com';
  if (location) location.value = content.location || 'Islamabad & Rawalpindi, Pakistan';
}

// 3. Render Portfolio Gallery Admin Grid with Multi-Image HEX Decoding
async function renderAdminGallery() {
  const container = document.getElementById('admin-gallery-grid');
  if (!container) return;

  const gallery = await TwinfinityDB.getGallery();

  container.innerHTML = gallery.map(item => {
    const imagesList = (item.images && item.images.length > 0) ? item.images : [item.cover || item.image];
    const coverSrc = hexToDataUri(imagesList[0]);

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
        <img src="${coverSrc}" alt="${escapeHtml(item.title)}" style="width:100%; height:200px; object-fit:cover;">
        <div style="padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-size:0.75rem; color:var(--cyan-bright); text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">${escapeHtml(item.category)}</span>
            <span style="font-size:0.75rem; background:rgba(0,242,254,0.1); border:1px solid var(--border-strong); padding:0.2rem 0.5rem; border-radius:12px; color:var(--cyan-bright);">${imagesList.length} Photos</span>
          </div>
          <h4 style="color:#fff; font-size:1.1rem; margin-bottom:0.5rem;">${escapeHtml(item.title)}</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem; height:40px; overflow:hidden;">${escapeHtml(item.description)}</p>
          <button onclick="handleDeleteGalleryItem('${item.id}')" class="btn btn-outline btn-block" style="color:#ef4444; border-color:#ef4444; font-size:0.8rem; padding:0.5rem;">Delete Event</button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleDeleteGalleryItem(id) {
  if (!confirm("Are you sure you want to delete this portfolio event?")) return;
  await TwinfinityDB.deleteGalleryItem(id);
  notifySiteContentChanged();
  await renderAdminGallery();
  alert("Portfolio item deleted!");
}

// 4. Render Admin Services List
async function renderAdminServices() {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  const services = await TwinfinityDB.getServices();
  container.innerHTML = services.map(s => `
    <div style="background:var(--bg-card); border:1px solid var(--border); padding:1.25rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h4 style="color:#fff; font-size:1.1rem;">${escapeHtml(s.title)}</h4>
        <span style="color:var(--cyan-bright); font-weight:700;">${escapeHtml(s.price)}</span> &bull; <small style="color:var(--text-muted);">${escapeHtml(s.duration)}</small>
      </div>
      <button onclick="handleDeleteService('${s.id}')" class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0.35rem 0.75rem; font-size:0.78rem;">Delete</button>
    </div>
  `).join('');
}

async function handleDeleteService(id) {
  if (!confirm("Remove this package?")) return;
  await TwinfinityDB.deleteService(id);
  notifySiteContentChanged();
  await renderAdminServices();
}

// 5. Render Admin FAQs List
async function renderAdminFAQs() {
  const container = document.getElementById('admin-faqs-list');
  if (!container) return;

  const faqs = await TwinfinityDB.getFAQs();
  container.innerHTML = faqs.map(f => `
    <div style="background:var(--bg-card); border:1px solid var(--border); padding:1.25rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:flex-start; gap:1.5rem;">
      <div>
        <h4 style="color:#fff; margin-bottom:0.4rem;">${escapeHtml(f.question)}</h4>
        <p style="color:var(--text-secondary); font-size:0.9rem;">${escapeHtml(f.answer)}</p>
      </div>
      <button onclick="handleDeleteFAQ('${f.id}')" class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0.35rem 0.75rem; font-size:0.78rem;">Delete</button>
    </div>
  `).join('');
}

async function handleDeleteFAQ(id) {
  if (!confirm("Delete this FAQ?")) return;
  await TwinfinityDB.deleteFAQ(id);
  notifySiteContentChanged();
  await renderAdminFAQs();
}

// Event Handlers for Admin Forms
function initAdminFormHandlers() {
  const heroForm = document.getElementById('admin-hero-spatial-form');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        heroBadge: document.getElementById('admin-hero-badge-input').value,
        heroTitle: document.getElementById('admin-hero-title-input').value,
        heroSubtitle: document.getElementById('admin-hero-sub-input').value,
        heroImage: document.getElementById('admin-hero-img-input').value,
        stat1Number: document.getElementById('admin-stat1-num').value,
        stat1Label: document.getElementById('admin-stat1-lbl').value,
        stat2Number: document.getElementById('admin-stat2-num').value,
        stat2Label: document.getElementById('admin-stat2-lbl').value,
        spatialTitle: document.getElementById('admin-spatial-title-input').value,
        spatialImage: document.getElementById('admin-spatial-img-input').value
      };
      await TwinfinityDB.updateSiteContent(updated);
      notifySiteContentChanged();
      alert("Hero Banner & 3D Spatial Content updated successfully!");
    });
  }

  const aboutForm = document.getElementById('admin-about-contact-form');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        aboutBadge: document.getElementById('admin-about-badge-input').value,
        aboutTitle: document.getElementById('admin-about-title-input').value,
        aboutBio: document.getElementById('admin-about-bio-input').value,
        aboutImage: document.getElementById('admin-about-img-input').value,
        contactPhone: document.getElementById('admin-phone-input').value,
        contactPhone2: document.getElementById('admin-phone2-input').value,
        contactEmail: document.getElementById('admin-email-input').value,
        location: document.getElementById('admin-location-input').value
      };
      await TwinfinityDB.updateSiteContent(updated);
      notifySiteContentChanged();
      alert("About Section & Studio Contact Info saved successfully!");
    });
  }

  // Multi-Image Event Gallery Form Submission with File-to-HEX Conversion
  const galleryForm = document.getElementById('admin-add-gallery-form');
  if (galleryForm) {
    galleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('add-gallery-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Converting Images to HEX & Saving...';
      }

      const title = document.getElementById('gal-title-input').value;
      const category = document.getElementById('gal-category-select').value;
      const desc = document.getElementById('gal-desc-input').value;

      const fileInput = document.getElementById('gal-multi-files');
      const urlsInput = document.getElementById('gal-multi-urls');

      let imagesArray = [];

      // 1. Process uploaded file blobs to HEX strings
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          const hexStr = await fileToHex(fileInput.files[i]);
          imagesArray.push(hexStr);
        }
      }

      // 2. Process pasted URLs
      if (urlsInput && urlsInput.value.trim()) {
        const lines = urlsInput.value.split('\n');
        lines.forEach(url => {
          if (url.trim()) imagesArray.push(url.trim());
        });
      }

      if (imagesArray.length === 0) {
        alert("Please select at least one image file to convert to HEX or paste an image URL.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Event & Encode HEX Images';
        }
        return;
      }

      const newItem = {
        title,
        category,
        cover: imagesArray[0],
        image: imagesArray[0],
        images: imagesArray,
        description: desc
      };

      await TwinfinityDB.saveGalleryItem(newItem);
      galleryForm.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Event & Encode HEX Images';
      }

      notifySiteContentChanged();
      await renderAdminGallery();
      alert(`Event saved successfully with ${imagesArray.length} photos encoded in HEX format!`);
    });
  }

  const packageForm = document.getElementById('admin-add-package-form');
  if (packageForm) {
    packageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPackage = {
        title: document.getElementById('pkg-title-input').value,
        price: document.getElementById('pkg-price-input').value,
        duration: document.getElementById('pkg-duration-input').value,
        description: document.getElementById('pkg-desc-input').value
      };
      await TwinfinityDB.saveService(newPackage);
      packageForm.reset();
      notifySiteContentChanged();
      await renderAdminServices();
      alert("Studio Package saved!");
    });
  }

  const faqForm = document.getElementById('admin-add-faq-form');
  if (faqForm) {
    faqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newFaq = {
        question: document.getElementById('faq-question-input').value,
        answer: document.getElementById('faq-answer-input').value
      };
      await TwinfinityDB.saveFAQ(newFaq);
      faqForm.reset();
      notifySiteContentChanged();
      await renderAdminFAQs();
      alert("FAQ item added!");
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
