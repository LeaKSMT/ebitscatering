const nodemailer = require("nodemailer");

function getMailTransporter() {
    const emailUser = (process.env.EMAIL_USER || "").trim();
    const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

    if (!emailUser || !emailPass) {
        throw new Error("Missing EMAIL_USER or EMAIL_PASS in .env");
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
}

async function sendBookingApprovedEmail(booking) {
    const transporter = getMailTransporter();

    const clientEmail = booking.client_email;
    const clientName = booking.client_name || "Client";

    if (!clientEmail) {
        throw new Error("Booking has no client_email");
    }

    await transporter.sendMail({
        from: `"Ebit's Catering" <${process.env.EMAIL_USER}>`,
        to: clientEmail,
        subject: "Your Booking Has Been Approved",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
                <h2 style="color: #0f4d3c;">Booking Approved!</h2>

                <p>Hello ${clientName},</p>

                <p>Your booking request has been approved by Ebit's Catering.</p>

                <p><b>Booking ID:</b> ${booking.id}</p>
                <p><b>Event Type:</b> ${booking.event_type || "N/A"}</p>
                <p><b>Package:</b> ${booking.package_name || "N/A"}</p>
                <p><b>Event Date:</b> ${booking.event_date || "N/A"}</p>
                <p><b>Event Time:</b> ${booking.event_time || "N/A"}</p>
                <p><b>Venue:</b> ${booking.venue || "N/A"}</p>
                <p><b>Guests:</b> ${booking.guests || "N/A"}</p>

                <p>Please check your client portal for more details.</p>

                <br />
                <p>Thank you,<br /><b>Ebit's Catering</b></p>
            </div>
        `,
    });
}

module.exports = {
    sendBookingApprovedEmail,
};