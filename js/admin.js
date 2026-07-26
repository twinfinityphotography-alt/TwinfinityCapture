/* ==========================================================================
   Twinfinity - Full CMS Admin Control Center for Twin Sisters Studio
   ========================================================================== */

const ADMIN_PASS_HASH = "Admin@31211";

window.AdminPortal = {
  isAuthenticated: false,

  login(password) {
    if (password === ADMIN_PASS_HASH) {
      this.isAuthenticated = true;
      sessionStorage.setItem('twinfinity_admin_auth', 'true');
      return true;
    }
    return false;
  },

  checkAuth() {
    this.isAuthenticated = sessionStorage.getItem('twinfinity_admin_auth') === 'true';
    return this.isAuthenticated;
  },

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('twinfinity_admin_auth');
  },

  // Switch Active Admin Tab
  switchTab(tabName) {
    const tabs = document.querySelectorAll('.admin-tab-content');
    const btns = document.querySelectorAll('.admin-tab-btn');

    tabs.forEach(t => t.style.display = 'none');
    btns.forEach(b => b.classList.remove('active'));

    const activeTab = document.getElementById(`admin-tab-${tabName}`);
    const activeBtn = document.getElementById(`admin-btn-${tabName}`);

    if (activeTab) activeTab.style.display = 'block';
    if (activeBtn) activeBtn.classList.add('active');

    // Trigger tab-specific renders
    if (tabName === 'bookings') this.renderBookings();
    if (tabName === 'services') this.renderServicesManager();
    if (tabName === 'gallery') this.renderGalleryManager();
    if (tabName === 'content') this.renderContentEditor();
    if (tabName === 'faqs') this.renderFAQManager();
  },

  // 1. Render Bookings
  async renderBookings() {
    const tableBody = document.getElementById('admin-bookings-table-body');
    if (!tableBody) return;

    const bookings = await window.DB.getAllBookings();
    tableBody.innerHTML = '';

    if (bookings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-dim);">No bookings recorded yet.</td></tr>`;
      return;
    }

    bookings.forEach(b => {
      const bDate = b.bookingDate || b.bookingdate || b.booking_date || 'Date Pending';
      const bTime = b.bookingTime || b.bookingtime || b.booking_time || 'Slot Pending';
      const cName = b.clientName || b.clientname || b.client_name || 'Valued Client';
      const cEmail = b.clientEmail || b.clientemail || b.client_email || '';
      const cPhone = b.clientPhone || b.clientphone || b.client_phone || '';
      const sTitle = b.serviceTitle || b.servicetitle || b.service_title || 'Photography Package';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: var(--primary-cyan);">${b.id}</strong></td>
        <td>
          <div style="font-weight:600;">${cName}</div>
          <div style="font-size:0.8rem; color:var(--text-dim);">${cEmail} | ${cPhone}</div>
        </td>
        <td>${sTitle}</td>
        <td>
          <div>📅 ${bDate}</div>
          <div style="font-size:0.8rem; color:var(--text-dim);">⏰ ${bTime}</div>
        </td>
        <td><span class="status-badge status-${(b.status || 'pending').toLowerCase()}">${b.status}</span></td>
        <td>
          <select onchange="window.AdminPortal.handleStatusChange('${b.id}', this.value)" class="form-select" style="padding:0.3rem 0.6rem; font-size:0.85rem;">
            <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="rescheduled" ${b.status === 'rescheduled' ? 'selected' : ''}>Rescheduled / Date Changed</option>
            <option value="delayed" ${b.status === 'delayed' ? 'selected' : ''}>Delayed</option>
            <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <button onclick="window.AdminPortal.openEditModal('${b.id}')" class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem;">Edit / Date</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  },

  async handleStatusChange(bookingId, newStatus) {
    const booking = await window.DB.getBookingById(bookingId);
    if (!booking) return;

    await window.DB.updateBookingStatus(bookingId, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    await window.NotificationEngine.sendEmailNotification({
      toEmail: booking.clientEmail,
      clientName: booking.clientName,
      bookingId: booking.id,
      serviceTitle: booking.serviceTitle,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      status: newStatus,
      notes: booking.notes
    });

    alert(`Booking ${bookingId} status updated to ${newStatus.toUpperCase()}! Client notified via email.`);
    this.renderBookings();
  },

  async openEditModal(bookingId) {
    const booking = await window.DB.getBookingById(bookingId);
    if (!booking) return;

    const newDate = prompt(`Change session date for ${booking.id}:`, booking.bookingDate);
    const newTime = prompt(`Change session time slot for ${booking.id}:`, booking.bookingTime);
    const newNotes = prompt(`Add admin note / delay details:`, booking.notes || '');

    if (newDate && newTime) {
      await window.DB.updateBookingStatus(bookingId, {
        bookingDate: newDate,
        bookingTime: newTime,
        notes: newNotes,
        status: 'rescheduled',
        updatedAt: new Date().toISOString()
      });

      await window.NotificationEngine.sendEmailNotification({
        toEmail: booking.clientEmail,
        clientName: booking.clientName,
        bookingId: booking.id,
        serviceTitle: booking.serviceTitle,
        bookingDate: newDate,
        bookingTime: newTime,
        status: 'rescheduled',
        notes: newNotes
      });

      alert(`Booking ${bookingId} rescheduled to ${newDate} @ ${newTime}. Client notified!`);
      this.renderBookings();
    }
  },

  // 2. Services & Pricing Manager (in 'RS')
  async renderServicesManager() {
    const list = document.getElementById('admin-services-list');
    if (!list) return;

    const services = await window.DB.getServices();
    list.innerHTML = '';

    services.forEach(s => {
      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.marginBottom = '1rem';
      div.style.padding = '1rem';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="color:#fff;">${s.title}</h4>
            <div style="color:var(--accent-gold); font-weight:700;">${s.price} | ⏱️ ${s.duration}</div>
            <p style="font-size:0.85rem; color:var(--text-muted);">${s.description}</p>
          </div>
          <button onclick="window.AdminPortal.deleteService('${s.id}')" class="btn btn-secondary" style="background:rgba(239,68,68,0.2); color:#ef4444; border-color:#ef4444; padding:0.35rem 0.75rem;">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  },

  async addNewService(title, price, duration, description) {
    const current = await window.DB.getServices();
    const formattedPrice = price.toUpperCase().includes('RS') ? price : `RS ${price}`;
    const newService = { id: 'srv-' + Date.now(), title, price: formattedPrice, duration, description };
    current.push(newService);
    await window.DB.saveServices(current);
    alert('New Service Added Successfully!');
    this.renderServicesManager();
    if (window.renderServices) window.renderServices();
  },

  async deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service package?')) return;
    let current = await window.DB.getServices();
    current = current.filter(s => s.id !== serviceId);
    await window.DB.saveServices(current);
    this.renderServicesManager();
    if (window.renderServices) window.renderServices();
  },

  // 3. Photo Gallery Manager (Twin Sisters & Event Multi-Photo Uploader & Deletion)
  async renderGalleryManager() {
    const grid = document.getElementById('admin-gallery-grid');
    if (!grid) return;

    const gallery = await window.DB.getGallery();
    grid.innerHTML = '';

    gallery.forEach(g => {
      const imgList = g.images || [g.cover || g.image];

      let photoThumbsHtml = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(60px, 1fr)); gap:0.4rem; margin:0.5rem 0;">';
      imgList.forEach((src, pIdx) => {
        photoThumbsHtml += `
          <div style="position:relative; group">
            <img src="${src}" style="width:100%; height:50px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.2);">
            <button onclick="window.AdminPortal.deleteSinglePhoto('${g.id}', ${pIdx})" title="Delete this single photo" style="position:absolute; top:2px; right:2px; background:rgba(239,68,68,0.9); color:#fff; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
          </div>
        `;
      });
      photoThumbsHtml += '</div>';

      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.padding = '1rem';
      div.innerHTML = `
        <img src="${imgList[0]}" alt="${g.title}" style="width:100%; height:160px; object-fit:cover; border-radius:var(--radius-sm); margin-bottom:0.5rem;">
        <h4 style="font-size:1rem; color:#fff;">${g.title}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem;">
          <span class="badge" style="font-size:0.7rem; padding:0.2rem 0.5rem;">${g.category}</span>
          <span style="font-size:0.8rem; color:var(--primary-cyan); font-weight:600;">📷 ${imgList.length} Photos</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.5rem; font-weight:600;">Album Photos (Click ✖ to delete single photo):</div>
        ${photoThumbsHtml}
        <button onclick="window.AdminPortal.deleteGalleryItem('${g.id}')" class="btn btn-secondary" style="width:100%; margin-top:0.75rem; background:rgba(239,68,68,0.2); color:#ef4444; border-color:#ef4444; padding:0.4rem; font-size:0.8rem;">🗑️ Delete Entire Album from Database</button>
      `;
      grid.appendChild(div);
    });
  },

  async uploadPhoto(filesInput, title, category, description) {
    const fileArray = Array.from(filesInput || []);
    if (fileArray.length === 0) return alert('Please select at least one image file to upload.');

    const compressedImages = [];
    for (let i = 0; i < fileArray.length; i++) {
      try {
        const compressed = await window.ImageUtils.compressImage(fileArray[i]);
        compressedImages.push(compressed);
      } catch (err) {
        console.error("Error compressing photo:", err);
      }
    }

    if (compressedImages.length === 0) {
      return alert('No valid images could be processed. Please check file format.');
    }

    const gallery = await window.DB.getGallery();
    const newItem = {
      id: 'gal-' + Date.now(),
      title,
      category,
      cover: compressedImages[0],
      image: compressedImages[0],
      images: compressedImages,
      description
    };
    gallery.unshift(newItem);

    await window.DB.saveGallery(gallery);

    const form = document.getElementById('admin-gallery-form');
    if (form) form.reset();

    alert(`Event Album "${title}" with ${compressedImages.length} photo(s) created & saved to Supabase!`);
    this.renderGalleryManager();
    if (window.renderPortfolio) window.renderPortfolio();
  },

  async deleteGalleryItem(id) {
    if (!confirm('Are you sure you want to permanently delete this album and ALL its photos from the Supabase database?')) return;
    await window.DB.deleteGalleryItem(id);
    alert('Album and all photos deleted permanently from Supabase database!');
    this.renderGalleryManager();
    if (window.renderPortfolio) window.renderPortfolio();
  },

  async deleteSinglePhoto(albumId, photoIndex) {
    if (!confirm('Delete this single photo from the album?')) return;
    await window.DB.deleteSinglePhotoFromAlbum(albumId, photoIndex);
    this.renderGalleryManager();
    if (window.renderPortfolio) window.renderPortfolio();
  },

  // 4. Site Content & Studio Contact/Socials Editor
  async renderContentEditor() {
    const c = await window.DB.getSiteContent();
    if (document.getElementById('edit-hero-title')) document.getElementById('edit-hero-title').value = c.heroTitle || '';
    if (document.getElementById('edit-hero-subtitle')) document.getElementById('edit-hero-subtitle').value = c.heroSubtitle || '';
    if (document.getElementById('edit-about-bio')) document.getElementById('edit-about-bio').value = c.aboutBio || '';
    if (document.getElementById('edit-contact-email')) document.getElementById('edit-contact-email').value = c.contactEmail || 'twinfinityphotography@gmail.com';
    if (document.getElementById('edit-wa1')) document.getElementById('edit-wa1').value = c.whatsapp1 || '03110157080';
    if (document.getElementById('edit-wa2')) document.getElementById('edit-wa2').value = c.whatsapp2 || '03151592722';
    if (document.getElementById('edit-instagram')) document.getElementById('edit-instagram').value = c.instagram || 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw';
    if (document.getElementById('edit-facebook')) document.getElementById('edit-facebook').value = c.facebook || '';
    if (document.getElementById('edit-youtube')) document.getElementById('edit-youtube').value = c.youtube || '';
    if (document.getElementById('edit-tiktok')) document.getElementById('edit-tiktok').value = c.tiktok || '';
    if (document.getElementById('edit-location')) document.getElementById('edit-location').value = c.location || 'Islamabad & Rawalpindi, Pakistan';
    if (document.getElementById('edit-maps-url')) document.getElementById('edit-maps-url').value = c.mapsUrl || 'https://maps.google.com/maps?q=Islamabad,Pakistan&t=&z=12&ie=UTF8&iwloc=&output=embed';

    const currentImg = document.getElementById('admin-about-preview-img');
    if (currentImg && c.aboutImage) currentImg.src = c.aboutImage;
  },

  async saveSiteContent() {
    const heroTitle = document.getElementById('edit-hero-title').value;
    const heroSubtitle = document.getElementById('edit-hero-subtitle').value;
    const aboutBio = document.getElementById('edit-about-bio').value;
    const contactEmail = document.getElementById('edit-contact-email').value;
    const whatsapp1 = document.getElementById('edit-wa1').value;
    const whatsapp2 = document.getElementById('edit-wa2').value;
    const instagram = document.getElementById('edit-instagram').value;
    const facebook = document.getElementById('edit-facebook').value;
    const youtube = document.getElementById('edit-youtube').value;
    const tiktok = document.getElementById('edit-tiktok').value;
    const location = document.getElementById('edit-location').value;
    const mapsUrl = document.getElementById('edit-maps-url').value;

    const aboutFileInput = document.getElementById('edit-about-file');
    const existingContent = await window.DB.getSiteContent();
    let aboutImage = existingContent.aboutImage || 'assets/og-image.png';

    if (aboutFileInput && aboutFileInput.files && aboutFileInput.files.length > 0) {
      try {
        aboutImage = await window.ImageUtils.compressImage(aboutFileInput.files[0]);
      } catch (err) {
        console.error("Error compressing Twin Sisters about image:", err);
      }
    }

    const content = {
      heroTitle,
      heroSubtitle,
      aboutTitle: 'Meet the <span class="gradient-text">Twin Sisters</span> Behind the Lens',
      aboutBio,
      aboutImage,
      contactEmail,
      whatsapp1,
      whatsapp2,
      instagram,
      facebook,
      youtube,
      tiktok,
      location,
      mapsUrl
    };

    await window.DB.saveSiteContent(content);

    if (document.getElementById('dynamic-about-img')) {
      document.getElementById('dynamic-about-img').src = aboutImage;
    }
    if (document.getElementById('admin-about-preview-img')) {
      document.getElementById('admin-about-preview-img').src = aboutImage;
    }

    alert('Studio Details, Twin Sisters Founder Photo & Social Media Links Saved to Supabase!');
    if (window.renderSiteContent) window.renderSiteContent();
  },

  // 5. FAQ Manager
  async renderFAQManager() {
    const list = document.getElementById('admin-faq-list');
    if (!list) return;

    const faqs = await window.DB.getFAQs();
    list.innerHTML = '';

    faqs.forEach(f => {
      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.marginBottom = '1rem';
      div.style.padding = '1rem';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="color:#fff;">Q: ${f.question}</h4>
            <p style="font-size:0.9rem; color:var(--text-muted); margin-top:0.25rem;">A: ${f.answer}</p>
          </div>
          <button onclick="window.AdminPortal.deleteFAQ('${f.id}')" class="btn btn-secondary" style="background:rgba(239,68,68,0.2); color:#ef4444; border-color:#ef4444; padding:0.35rem 0.75rem;">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  },

  async addNewFAQ(question, answer) {
    const faqs = await window.DB.getFAQs();
    faqs.push({ id: 'faq-' + Date.now(), question, answer });
    await window.DB.saveFAQs(faqs);
    alert('New FAQ Added!');
    this.renderFAQManager();
    if (window.renderFAQs) window.renderFAQs();
  },

  async deleteFAQ(id) {
    let faqs = await window.DB.getFAQs();
    faqs = faqs.filter(f => f.id !== id);
    await window.DB.saveFAQs(faqs);
    this.renderFAQManager();
    if (window.renderFAQs) window.renderFAQs();
  }
};
