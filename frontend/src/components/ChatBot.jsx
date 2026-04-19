import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    MessageCircle,
    X,
    Send,
    Phone,
    MapPin,
    Mail,
    Package,
    Coins,
    CalendarDays,
    Copy,
    Sparkles,
    Bot,
} from "lucide-react";

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [showCallPopup, setShowCallPopup] = useState(false);
    const [chatMode, setChatMode] = useState(null);
    const [lastIntent, setLastIntent] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello! Welcome to Ebit's Catering and Services. How can I help you today?",
            time: "11:52 PM",
        },
    ]);

    const messagesEndRef = useRef(null);

    const PHONE_NUMBER = "0917 679 0643";
    const PHONE_NUMBER_RAW = "09176790643";
    const FB_PAGE = "https://www.facebook.com/ebitscateringandservices";
    const MAP_LINK =
        "https://www.google.com/maps/search/Blk+5+Lot+14+Tierra+Verde+Residences+Burol+3+Dasmarinas+City+Cavite";

    const quickReplies = [
        { label: "Start Inquiry", icon: <Mail size={15} /> },
        { label: "View Packages", icon: <Package size={15} /> },
        { label: "Pricing", icon: <Coins size={15} /> },
        { label: "Check Availability", icon: <CalendarDays size={15} /> },
    ];

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messages, isTyping, open]);

    const addUserMessage = (text) => {
        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text,
                time: getCurrentTime(),
            },
        ]);
    };

    const addBotMessage = (text) => {
        setMessages((prev) => [
            ...prev,
            {
                sender: "bot",
                text,
                time: getCurrentTime(),
            },
        ]);
    };

    const formatCurrency = (amount) => `₱${amount.toLocaleString()}`;
    const normalize = (text) => text.toLowerCase().trim();
    const hasAny = (msg, words) => words.some((word) => msg.includes(word));

    const extractGuests = (msg) => {
        const match =
            msg.match(/how much for (\d+)/i) ||
            msg.match(/for (\d+)\s*(guest|guests|pax|people|persons)/i) ||
            msg.match(/(\d+)\s*(guest|guests|pax|people|persons)/i) ||
            msg.match(/^(\d+)$/);

        return match ? parseInt(match[1], 10) : null;
    };

    const extractPhone = (msg) => {
        const match = msg.match(/09\d{9}/);
        return match ? match[0] : null;
    };

    const hasDate = (msg) => {
        return /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(
            msg
        );
    };

    const extractEventType = (msg) => {
        if (msg.includes("wedding")) return "Wedding";
        if (msg.includes("debut")) return "Debut";
        if (msg.includes("birthday")) return "Birthday";
        if (msg.includes("anniversary")) return "Anniversary";
        if (msg.includes("baptismal") || msg.includes("binyag")) return "Baptismal";
        return null;
    };

    const looksLikeInquiryReply = (msg) => {
        return (
            !!extractPhone(msg) ||
            !!extractGuests(msg) ||
            hasDate(msg) ||
            !!extractEventType(msg) ||
            msg.includes(",")
        );
    };

    const copyPhoneNumber = async () => {
        try {
            await navigator.clipboard.writeText(PHONE_NUMBER_RAW);
            addBotMessage(
                `Sure! I copied our contact number for you.

You may call us at:
${PHONE_NUMBER}

You can also message our Facebook page here:
${FB_PAGE}`
            );
        } catch {
            addBotMessage(`You may call us at ${PHONE_NUMBER}.`);
        }
    };

    const getInquiryAcknowledgement = (message) => {
        return `Thank you! I’ve received your inquiry details. ✨

Here’s what you sent:
${message}

Our team can review this and help you choose the most suitable package for your event.

For faster processing, please make sure your details include:
• Full Name
• Contact Number
• Event Type
• Preferred Date
• Number of Guests
• Special Requests

You may also continue through the "Get Quotation" button on our website if you'd like a more complete inquiry process.`;
    };

    const getBotReply = (message) => {
        const msg = normalize(message);
        const guests = extractGuests(msg);
        const phone = extractPhone(msg);
        const dateDetected = hasDate(msg);
        const eventType = extractEventType(msg);

        if (
            hasAny(msg, [
                "hello",
                "hi",
                "hey",
                "good morning",
                "good afternoon",
                "good evening",
            ])
        ) {
            setLastIntent("greeting");
            return `Hello! Welcome to Ebit's Catering and Services. ✨

How can I help you today?

You can ask me about:
• Packages
• Pricing
• Availability
• Booking inquiries
• Contact information
• Location`;
        }

        if (hasAny(msg, ["thank you", "thanks", "ty", "salamat"])) {
            setLastIntent("thanks");
            return `You're very welcome! ✨

If you still need help with packages, pricing, or booking concerns, just send me a message anytime.`;
        }

        if (hasAny(msg, ["start inquiry", "i want to inquire", "inquire", "inquiry"])) {
            setChatMode("inquiry");
            setLastIntent("inquiry");
            return `I'd be happy to help you start your inquiry. ✨

Please send the following details:
• Full Name
• Contact Number
• Event Type (Wedding, Debut, Birthday, etc.)
• Preferred Date
• Number of Guests
• Special Requests

Example:
"Maria Santos, 09123456789, Birthday, April 1, 2026, 50 guests, simple setup"

Once you send those details, I’ll acknowledge them and guide you on the next step.`;
        }

        if (chatMode === "inquiry" && looksLikeInquiryReply(msg)) {
            setLastIntent("inquiry_details");
            return getInquiryAcknowledgement(message);
        }

        if (
            hasAny(msg, [
                "quotation",
                "quote",
                "request quotation",
                "get quotation",
                "quotation form",
            ])
        ) {
            setChatMode("quotation");
            setLastIntent("quotation");
            return `Sure! For a quotation request, please provide these details:

• Event Type
• Preferred Date
• Number of Guests
• Preferred Package (if any)
• Special Requests

Example:
"I need a quotation for a wedding on December 18, 2026 for 100 guests."

You may also click the "Get Quotation" button on our website to continue.`;
        }

        if (chatMode === "quotation" && (guests || dateDetected || eventType || phone)) {
            setLastIntent("quotation_details");
            return `Thank you! Your quotation request details have been noted. ✨

Here’s what you sent:
${message}

Our team can review your request and prepare the most suitable package recommendation and quotation for your event.`;
        }

        if (
            hasAny(msg, [
                "view packages",
                "packages",
                "show packages",
                "package list",
                "available packages",
            ])
        ) {
            setChatMode("packages");
            setLastIntent("packages");
            return `Of course! Here’s our current package lineup:

DEBUT PACKAGES 🎉
• Classic Debut - ₱48,000
• Rising Star Package - ₱55,000
• All Star Debut Package - ₱70,000
• Diamond Elite Debut Package - ₱80,000

WEDDING PACKAGES 💒
• Wedding Package - ₱58,000
• Wedding Package - ₱65,000
• Wedding Package - ₱75,000
• Wedding Package - ₱82,000
• Wedding Package - ₱90,000

You can also ask me:
• "What are your debut packages?"
• "What are your wedding packages?"
• "Tell me about the 75k wedding package"
• "Which package is good for 100 pax?"`;
        }

        if (hasAny(msg, ["debut packages", "debut package", "debut"])) {
            setChatMode("debut");
            setLastIntent("debut");
            return `We currently offer these debut packages:

• Classic Debut - ₱48,000
• Rising Star Package - ₱55,000
• All Star Debut Package - ₱70,000
• Diamond Elite Debut Package - ₱80,000

These are usually prepared for 100 pax.

You may also ask:
• "What is included in Classic Debut?"
• "What is included in Diamond Elite Debut?"
• "Which debut package is best?"`;
        }

        if (hasAny(msg, ["wedding packages", "wedding package", "wedding"])) {
            setChatMode("wedding");
            setLastIntent("wedding");
            return `We currently offer these wedding packages:

• ₱58,000 Wedding Package
• ₱65,000 Wedding Package
• ₱75,000 Wedding Package
• ₱82,000 Wedding Package
• ₱90,000 Wedding Package

You may also ask:
• "Tell me about the 75k wedding package"
• "What is included in the 90k wedding package?"
• "Which wedding package is best?"`;
        }

        if (hasAny(msg, ["classic debut", "48k debut", "48,000"])) {
            setLastIntent("classic_debut");
            return `The Classic Debut Package is ₱48,000 and is usually good for 100 pax.

Some of its inclusions are:
• Venue styling
• 3 main courses
• Soup/pica-pica, pasta, and salad/dessert
• Bottomless iced tea and purified water
• Complete catering setup
• Tiffany chairs with cushion and ribbons
• Elegant centerpiece setup
• Uniformed waiters and food attendants

For the full list, you can also check our Packages page.`;
        }

        if (hasAny(msg, ["rising star", "55k debut", "55,000"])) {
            setLastIntent("rising_star");
            return `The Rising Star Package is ₱55,000 and is usually good for 100 pax.

Some of its inclusions are:
• Elegant stage backdrop with debutante's name
• Debutante's elegant couch
• Red carpet on the aisle
• Flower arch
• 18 candles standee
• 3 main courses
• Complete catering setup
• Tiffany chairs with cushion and ribbons
• Basic sounds and lights
• 1 bottle of wine for toasting

For the complete inclusions, please check the Packages page.`;
        }

        if (hasAny(msg, ["all star debut", "70k debut", "70,000"])) {
            setLastIntent("all_star_debut");
            return `The All Star Debut Package is ₱70,000 and is usually good for 100 pax.

Some of its inclusions are:
• Elegant stage backdrop
• Debutante's couch
• Flower arch
• 18 candles standee
• 3 main courses
• 2-tiered debutant cake
• Photobooth for 2 hours
• Customized sintra board
• Host with programme
• Sounds and lights

For the complete inclusions, please check the Packages page.`;
        }

        if (hasAny(msg, ["diamond elite debut", "80k debut", "80,000"])) {
            setLastIntent("diamond_elite_debut");
            return `The Diamond Elite Debut Package is ₱80,000 and is usually good for 100 pax.

Some of its inclusions are:
• Elegant stage backdrop
• Debutante's couch
• Flower arch
• 4 main courses
• 2-tiered debutant cake
• Photobooth for 2 hours
• Customized sintra board
• Host with programme
• Sounds and lights
• Projector with white screen
• Sweets table
• Free debutant assistant and program coordinator
• Free use of mannequin

For the complete inclusions, please check our Packages page.`;
        }

        if (hasAny(msg, ["75k wedding", "75,000 wedding", "75000 wedding"])) {
            setLastIntent("75k_wedding");
            return `The ₱75,000 Wedding Package includes all Tiffany chairs and is one of our more upgraded wedding offers.

Some inclusions are:
• Powered speaker and audio mixer
• Wireless microphones
• Mood lights and house lights
• Spinner / DJ
• Host with program
• On-site photo coverage
• 3 main courses
• 2-tier naked cake
• Free use of dove
• Free bottle of wine

For the full details, please check our Packages page.`;
        }

        if (hasAny(msg, ["82k wedding", "82,000 wedding", "82000 wedding"])) {
            setLastIntent("82k_wedding");
            return `The ₱82,000 Wedding Package includes all Tiffany chairs and more upgraded features.

Some inclusions are:
• Powered speaker and microphones
• Spinner / DJ
• Host with program
• On-site photo coverage
• Photo booth for 2 hours
• 3 main courses
• 2-tier naked cake
• HMUA on the day
• Free use of dove
• Free bottle of wine
• Free sash for prosperity dance

For the full details, please check our Packages page.`;
        }

        if (hasAny(msg, ["90k wedding", "90,000 wedding", "90000 wedding"])) {
            setLastIntent("90k_wedding");
            return `The ₱90,000 Wedding Package is one of our most complete offers.

Some inclusions are:
• On-site photo and video coverage
• MTV highlights
• Wedding frame
• Photo booth for 2 hours
• 3 main courses
• 2-tier naked cake
• HMUA on the day
• Grooming for groom
• Free use of dove
• Free bottle of wine
• Free sash for prosperity dance
• Free use of mannequin

For the complete inclusions, please check our Packages page.`;
        }

        if (hasAny(msg, ["pricing", "price", "how much", "rates", "rate", "magkano"])) {
            setChatMode("pricing");
            setLastIntent("pricing");

            if (guests && guests > 0 && guests <= 1000) {
                const total = guests * 400;
                return `For ${guests} guests, the estimated base catering rate is:

${guests} × ₱400 = ${formatCurrency(total)}

Please note that this is the base rate only and does not yet include add-ons.

Available add-ons:
• Lights and Sounds - ₱4,000
• Host - ₱3,500
• Cake - ₱2,000
• Photo - ₱5,000
• Photo Video - ₱15,000
• SDE - ₱27,000
• Clown - ₱3,000

You may also ask:
• "How much for 100 guests?"
• "What are your add-ons?"
• "Can I add host and cake?"`;
            }

            return `Our pricing starts at ₱400 per guest.

Formula:
Total = (Guests × ₱400) + Add-ons

Sample estimates:
• 50 guests = ₱20,000
• 75 guests = ₱30,000
• 100 guests = ₱40,000
• 150 guests = ₱60,000

Available add-ons:
• Lights and Sounds - ₱4,000
• Host - ₱3,500
• Cake - ₱2,000
• Photo - ₱5,000
• Photo Video - ₱15,000
• SDE - ₱27,000
• Clown - ₱3,000

You can send me:
• "50 guests"
• "100 pax"
• "How much for 75 guests?"`;
        }

        if (chatMode === "pricing" && guests && guests > 0 && guests <= 1000) {
            setLastIntent("pricing_followup");
            const total = guests * 400;
            return `For ${guests} guests, the estimated base catering price is:

${guests} × ₱400 = ${formatCurrency(total)}

That does not yet include add-ons. You can also ask me about available add-ons or package suggestions for that guest count.`;
        }

        if (hasAny(msg, ["add on", "add-on", "addons", "add ons", "extra service"])) {
            setLastIntent("addons");
            return `These are our current available add-ons:

• Lights and Sounds - ₱4,000
• Host - ₱3,500
• Cake - ₱2,000
• Photo - ₱5,000
• Photo Video - ₱15,000
• SDE - ₱27,000
• Clown - ₱3,000

You may also ask:
• "How much is host?"
• "How much is cake?"
• "How much is photo video?"`;
        }

        if (hasAny(msg, ["lights and sounds", "sound system", "sounds and lights"])) {
            setLastIntent("addon_lights");
            return `Lights and Sounds costs ₱4,000.`;
        }

        if (hasAny(msg, ["host", "emcee"])) {
            setLastIntent("addon_host");
            return `Host costs ₱3,500.`;
        }

        if (hasAny(msg, ["cake"])) {
            setLastIntent("addon_cake");
            return `Cake costs ₱2,000.`;
        }

        if (hasAny(msg, ["photo video", "video coverage"])) {
            setLastIntent("addon_photovideo");
            return `Photo Video costs ₱15,000.`;
        }

        if (msg.includes("sde")) {
            setLastIntent("addon_sde");
            return `SDE costs ₱27,000.`;
        }

        if (hasAny(msg, ["clown"])) {
            setLastIntent("addon_clown");
            return `Clown costs ₱3,000.`;
        }

        if (msg.includes("photo")) {
            setLastIntent("addon_photo");
            return `Photo costs ₱5,000.`;
        }

        if (hasAny(msg, ["good for 50", "50 pax", "50 guests"])) {
            setLastIntent("50_guests");
            return `For 50 guests, the estimated base catering rate is:

50 × ₱400 = ₱20,000

This does not yet include add-ons.`;
        }

        if (hasAny(msg, ["good for 75", "75 pax", "75 guests"])) {
            setLastIntent("75_guests");
            return `For 75 guests, the estimated base catering rate is:

75 × ₱400 = ₱30,000

This does not yet include add-ons.`;
        }

        if (hasAny(msg, ["good for 100", "100 pax", "100 guests"])) {
            setLastIntent("100_guests");
            return `For 100 guests, the estimated base catering rate is:

100 × ₱400 = ₱40,000

This does not yet include add-ons.

You may also check our debut and wedding packages if you're looking for a more complete package option.`;
        }

        if (
            hasAny(msg, [
                "check availability",
                "availability",
                "available",
                "date available",
                "is this available",
            ])
        ) {
            setChatMode("availability");
            setLastIntent("availability");

            if (dateDetected) {
                return `I received your preferred date. ✨

To help with your availability inquiry, please also include:
• Event type
• Number of guests

Example:
"March 15, 2026, wedding, 100 guests"

Our team can review your requested date and confirm availability.`;
            }

            return `Sure! To check availability, please send:

• Preferred event date
• Event type
• Number of guests

Examples:
• "Is March 15, 2026 available for a wedding?"
• "Check April 1, 2026 for a birthday, 50 guests"

Once you send those details, I’ll help you prepare the inquiry properly.`;
        }

        if (chatMode === "availability" && (dateDetected || eventType || guests)) {
            setLastIntent("availability_details");
            return `Thank you! I’ve noted your availability inquiry details.

Here’s what you sent:
${message}

Our team can review your requested event date and confirm availability as soon as possible.`;
        }

        if (hasAny(msg, ["book", "booking", "reserve", "reservation", "i want to book"])) {
            setChatMode("booking");
            setLastIntent("booking");
            return `Of course! To start your booking request, please send:

• Full Name
• Contact Number
• Event Type
• Preferred Date
• Number of Guests
• Preferred Package
• Special Requests

You may also use the "Get Quotation" button on our website if you want a more complete booking inquiry process.`;
        }

        if (chatMode === "booking" && (guests || dateDetected || eventType || phone)) {
            setLastIntent("booking_details");
            return `Thank you! Your booking details have been noted. ✨

Here’s what you sent:
${message}

Our team can review your request and guide you through the next step of the booking process.`;
        }

        if (
            hasAny(msg, [
                "payment",
                "downpayment",
                "down payment",
                "mode of payment",
                "pay",
            ])
        ) {
            setLastIntent("payment");
            return `For payment and downpayment concerns, we recommend contacting Ebit's Catering directly so our team can give you the most accurate details based on your package and event requirements.

You may contact us through:
• Phone: ${PHONE_NUMBER}
• Facebook: ${FB_PAGE}`;
        }

        if (hasAny(msg, ["menu", "food", "meal", "dishes", "main course"])) {
            setLastIntent("menu");
            return `We offer classic menu selections and package inclusions for weddings and debuts.

Our classic menu options include:
• Classic A
• Classic B
• Classic C
• Classic D

You can visit the Packages page to check the available menu combinations and package inclusions.`;
        }

        if (hasAny(msg, ["freebie", "freebies", "free item"])) {
            setLastIntent("freebies");
            return `The current freebie shown on our Packages page is:

• Backdrop

Other inclusions may also vary depending on your selected package.`;
        }

        if (
            hasAny(msg, [
                "call",
                "call us",
                "contact",
                "contact number",
                "phone",
                "phone number",
                "number",
            ])
        ) {
            setLastIntent("contact");
            return `You can contact Ebit's Catering through:

Phone: ${PHONE_NUMBER}
Facebook: ${FB_PAGE}

If you're using a mobile phone, you can tap the Call Us button below to call directly.`;
        }

        if (hasAny(msg, ["facebook", "fb page", "messenger", "page link", "social media"])) {
            setLastIntent("facebook");
            return `You can message us on Facebook here:

${FB_PAGE}

Our page is open for inquiries and updates as well.`;
        }

        if (
            hasAny(msg, [
                "location",
                "address",
                "where are you located",
                "where are you",
                "located",
            ])
        ) {
            setLastIntent("location");
            return `Our location is:

Blk 5 Lot 14 Tierra Verde Residences
Burol 3, Dasmariñas City, Cavite

You can also use the Location button below to open it on Google Maps.`;
        }

        if (hasAny(msg, ["business hours", "hours", "open", "opening hours", "what time"])) {
            setLastIntent("hours");
            return `For business hours and immediate response concerns, we recommend contacting Ebit's Catering directly through phone or Facebook so our team can assist you right away.

Phone: ${PHONE_NUMBER}
Facebook: ${FB_PAGE}`;
        }

        if (lastIntent === "packages" && hasAny(msg, ["which one", "best", "recommend", "suggest"])) {
            return `If you're choosing a package, it usually depends on your event type, guest count, and budget.

For example:
• Debut events - our debut packages are ideal
• Wedding events - our wedding packages are more suitable

If you want, you can tell me your:
• Event type
• Number of guests
• Budget range

and I’ll suggest the most suitable option.`;
        }

        if (chatMode === "inquiry" && guests) {
            return getInquiryAcknowledgement(message);
        }

        if (dateDetected && (chatMode === "inquiry" || chatMode === "availability" || chatMode === "booking")) {
            return `Thanks! I noted the date you sent.

Please also include:
• Event type
• Number of guests
• Contact number

That way, our team can process your request more accurately.`;
        }

        return `I’d be happy to help. ✨

You can ask me about:
• Packages
• Wedding packages
• Debut packages
• Pricing
• Add-ons
• Availability
• Booking inquiries
• Contact information
• Facebook page
• Location

You can also send complete details like:
"Maria Santos, 09123456789, Birthday, April 1, 2026, 50 guests, simple setup"

and I’ll guide you from there.`;
    };

    const handleSend = (textFromButton = null) => {
        const finalMessage = textFromButton || input;
        if (!finalMessage.trim()) return;

        addUserMessage(finalMessage);
        setInput("");
        setIsTyping(true);

        const reply = getBotReply(finalMessage);

        setTimeout(() => {
            setIsTyping(false);
            addBotMessage(reply);
        }, 700);
    };

    const handleCallUs = () => {
        addUserMessage("Call Us");
        setIsTyping(true);

        const callReply = `Of course! You can reach Ebit's Catering through:

Phone: ${PHONE_NUMBER}
Facebook: ${FB_PAGE}

If you're using a mobile phone, the call can open directly.
If you're on desktop, you can copy the number from the popup.`;

        setTimeout(() => {
            setIsTyping(false);
            addBotMessage(callReply);
        }, 500);

        if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => {
                window.location.href = `tel:${PHONE_NUMBER_RAW}`;
            }, 650);
        } else {
            setShowCallPopup(true);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[9999] max-h-[calc(100vh-40px)] sm:bottom-6 sm:right-6">
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.7, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: 20 }}
                        transition={{ duration: 0.32 }}
                        onClick={() => setOpen(true)}
                        className="group relative flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#d4af37]/35 bg-[linear-gradient(135deg,#d4af37_0%,#f3d769_48%,#b78917_100%)] shadow-[0_20px_40px_rgba(15,77,60,0.28)]"
                    >
                        <span className="absolute inset-0 rounded-full bg-[#d4af37]/20 animate-[ping_2.5s_ease-out_infinite]"></span>
                        <span className="absolute -inset-2 rounded-full bg-[#d4af37]/15 blur-xl"></span>
                        <MessageCircle
                            size={31}
                            className="relative z-10 text-[#0b4f3a] transition-transform duration-300 group-hover:scale-110"
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 34, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="flex h-[min(780px,calc(100vh-40px))] w-[520px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-[30px] border border-white/40 bg-white/95 shadow-[0_30px_90px_rgba(2,20,16,0.26)] backdrop-blur-xl"
                    >
                        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0b4f3a_0%,#0d6047_55%,#07382d_100%)] px-5 py-5 text-white">
                            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#d4af37]/20 blur-2xl"></div>
                            <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f4d56a_0%,#d4af37_60%,#b88919_100%)] shadow-lg">
                                        <Bot size={28} className="text-[#0b4f3a]" />
                                        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[#0b4f3a] bg-lime-400 shadow-[0_0_12px_rgba(132,204,22,0.85)]"></span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-[21px] font-extrabold leading-none tracking-tight sm:text-[22px]">
                                                Ebit&apos;s Catering
                                            </h2>
                                            <Sparkles size={16} className="text-[#f4d56a]" />
                                        </div>

                                        <p className="mt-1 text-sm text-white/75">
                                            Virtual Assistant
                                        </p>

                                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] text-white/95 backdrop-blur">
                                            <span className="h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.95)]"></span>
                                            Online now
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ rotate: 90, scale: 1.05 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => setOpen(false)}
                                    className="rounded-full border border-white/10 bg-white/10 p-2 text-white/90 hover:bg-white/15 hover:text-white"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#f8faf9_0%,#f2f5f3_100%)]">
                            <div className="chatbot-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`flex max-w-[88%] flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`whitespace-pre-line rounded-[22px] px-4 py-3 text-[14px] leading-7 sm:text-[15px] ${msg.sender === "bot"
                                                            ? "border border-[#e5e7eb] bg-white text-slate-700 shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
                                                            : "bg-[linear-gradient(135deg,#d4af37_0%,#f4d56a_100%)] text-[#0b4f3a] shadow-[0_12px_30px_rgba(212,175,55,0.30)]"
                                                        }`}
                                                >
                                                    {msg.text}
                                                </div>

                                                <p
                                                    className={`mt-1.5 px-1 text-[11px] text-slate-400 ${msg.sender === "user" ? "text-right" : "text-left"
                                                        }`}
                                                >
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="rounded-[20px] border border-[#e5e7eb] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0f4d3c] [animation-delay:-0.3s]"></span>
                                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0f4d3c] [animation-delay:-0.15s]"></span>
                                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0f4d3c]"></span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef}></div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="h-6 w-1 rounded-full bg-[linear-gradient(180deg,#d4af37_0%,#0f4d3c_100%)]"></div>
                                    <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#0b4f3a]">
                                        Quick Replies
                                    </p>
                                </div>

                                <div className="mb-4 grid grid-cols-2 gap-2.5">
                                    {quickReplies.map((item, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSend(item.label)}
                                            className="flex items-center justify-center gap-2 rounded-2xl border border-[#e7eaed] bg-white px-3 py-3 text-[13px] font-semibold text-[#0b4f3a] shadow-[0_6px_18px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-[#d4af37]/70 hover:bg-[#fffdf6] hover:shadow-[0_12px_26px_rgba(212,175,55,0.18)] sm:text-[14px]"
                                        >
                                            <span className="text-[#b99117]">{item.icon}</span>
                                            <span className="truncate">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="mb-4 flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                            className="w-full rounded-2xl border border-[#e5e7eb] bg-[#fafaf9] px-4 py-3.5 pr-12 text-[14px] outline-none transition focus:border-[#d4af37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.12)] sm:text-[15px]"
                                        />
                                        <MessageCircle
                                            size={17}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.04, rotate: -8 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSend()}
                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d4af37_0%,#f4d56a_100%)] shadow-[0_12px_26px_rgba(212,175,55,0.34)]"
                                    >
                                        <Send size={20} className="text-[#0b4f3a]" />
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCallUs}
                                        className="flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#10b53f_0%,#079230_100%)] py-3.5 text-[14px] font-bold text-white shadow-[0_14px_26px_rgba(12,168,58,0.24)] sm:text-[15px]"
                                    >
                                        <Phone size={17} />
                                        Call Us
                                    </motion.button>

                                    <motion.a
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        href={MAP_LINK}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0b4f3a_0%,#10684d_100%)] py-3.5 text-[14px] font-bold text-white shadow-[0_14px_26px_rgba(11,79,58,0.24)] sm:text-[15px]"
                                    >
                                        <MapPin size={17} />
                                        Location
                                    </motion.a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCallPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.97 }}
                            className="w-full max-w-sm rounded-[28px] border border-white/30 bg-white/95 p-6 text-center shadow-[0_30px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f7e7a6_0%,#d4af37_100%)] shadow-md">
                                <Phone className="text-[#0B4F3A]" size={28} />
                            </div>

                            <h3 className="mb-2 text-2xl font-extrabold text-[#0B4F3A]">
                                Call Ebit&apos;s Catering
                            </h3>

                            <p className="mb-5 text-[15px] leading-7 text-slate-600">
                                You&apos;re using a desktop browser. Please call us at:
                            </p>

                            <p className="mb-6 bg-gradient-to-r from-[#b99117] to-[#d4af37] bg-clip-text text-3xl font-black text-transparent">
                                {PHONE_NUMBER}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={copyPhoneNumber}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f8f3df] py-3 font-bold text-[#0B4F3A] hover:bg-[#f3e7bc]"
                                >
                                    <Copy size={17} />
                                    Copy Number
                                </button>

                                <button
                                    onClick={() => setShowCallPopup(false)}
                                    className="flex-1 rounded-2xl bg-[#0B4F3A] py-3 font-bold text-white hover:brightness-95"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}