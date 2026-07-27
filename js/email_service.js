/* ==========================================================================
   TWINFINITY CAPTURES - Photography Booking Email & WhatsApp Notifier
   ========================================================================== */

window.TwinfinityNotifier = {
  async sendBookingEmail(booking) {
    console.log("Dispatching Twinfinity Photography Confirmation for:", booking.booking_id);
    if (typeof emailjs !== 'undefined') {
      try {
        await emailjs.send('default_service', 'twinfinity_booking_template', {
          to_name: booking.name,
          to_email: booking.email,
          booking_id: booking.booking_id,
          service_name: booking.service,
          session_date: booking.session_date
        });
        console.log("Email Sent Successfully!");
      } catch (err) {
        console.warn("EmailJS notification error:", err);
      }
    }
  },

  openWhatsAppConfirmation(booking) {
    const phoneNumber = "923110157080";
    const text = encodeURIComponent(
      `📸 *TWINFINITY CAPTURES STUDIO - BOOKING CONFIRMATION*\n\n` +
      `*Client Name:* ${booking.name}\n` +
      `*Booking ID:* ${booking.booking_id}\n` +
      `*Package:* ${booking.service}\n` +
      `*Session Date:* ${booking.session_date}\n` +
      `*Location:* ${booking.location_preference}\n\n` +
      `Thank you for booking with Twin Sisters Photography Studio!`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  }
};
