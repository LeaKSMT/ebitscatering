import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    UtensilsCrossed,
    CalendarDays,
    Award,
    Users,
    CheckCircle2,
    Phone,
    MapPin,
    MessageCircle,
    Menu,
    X,
    ChevronRight,
    Sparkles,
    HeartHandshake,
    Clock3,
} from "lucide-react";

import hero from "../assets/hero.jpg";
import gal1 from "../assets/gal1.jpg";
import gal2 from "../assets/gal2.jpg";
import gal3 from "../assets/gal3.jpg";
import ChatBot from "../components/ChatBot";

function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [contactStatus, setContactStatus] = useState("");
    const [activeSection, setActiveSection] = useState("home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const featuredPackages = useMemo(
        () => [
            {
                id: "classic-debut",
                title: "Classic Debut",
                category: "Debut Package",
                price: "₱48,000",
                pax: "100 pax",
                desc: "Elegant setup, complete catering, and celebration essentials for a memorable debut.",
            },
            {
                id: "basic-wedding",
                title: "Basic Wedding Package",
                category: "Wedding Package",
                price: "₱58,000",
                pax: "100 pax",
                desc: "A beautiful wedding package with catering, table setup, staff, and event essentials.",
            },
            {
                id: "premium-wedding",
                title: "Premium Wedding Package",
                category: "Wedding Package",
                price: "₱75,000",
                pax: "100 pax",
                desc: "Premium wedding experience with catering, host, photo coverage, cake, and more.",
            },
        ],
        []
    );

    const services = [
        {
            title: "Premium Catering",
            text: "Fresh and delicious menu options prepared for weddings, debuts, birthdays, and more.",
            icon: <UtensilsCrossed className="w-6 h-6" />,
        },
        {
            title: "Event Planning",
            text: "Organized coordination for your event flow, setup, and celebration essentials.",
            icon: <CalendarDays className="w-6 h-6" />,
        },
        {
            title: "Premium Decorations",
            text: "Elegant styling and themed decorations tailored to your chosen occasion.",
            icon: <Award className="w-6 h-6" />,
        },
        {
            title: "Professional Staff",
            text: "Friendly and experienced staff focused on service, presentation, and client satisfaction.",
            icon: <Users className="w-6 h-6" />,
        },
    ];

    const reasons = [
        {
            title: "Fresh and Quality Food",
            text: "Prepared with quality ingredients to give your guests a satisfying dining experience.",
            icon: <UtensilsCrossed className="w-5 h-5" />,
        },
        {
            title: "Organized Booking Process",
            text: "From package selection to quotation and booking confirmation, the process stays clear and simple.",
            icon: <CheckCircle2 className="w-5 h-5" />,
        },
        {
            title: "Reliable Event Service",
            text: "Our team focuses on timely setup, smooth coordination, and professional presentation.",
            icon: <Clock3 className="w-5 h-5" />,
        },
        {
            title: "Memorable Celebrations",
            text: "We help create elegant weddings, debuts, birthdays, anniversaries, and other special occasions.",
            icon: <HeartHandshake className="w-5 h-5" />,
        },
    ];

    const galleryItems = [
        { src: gal1, title: "Elegant Debut Setup" },
        { src: gal2, title: "Wedding Aisle and Stage" },
        { src: gal3, title: "Styled Celebration Backdrop" },
    ];

    const handleGetQuotation = () => {
        const clientUser = JSON.parse(localStorage.getItem("clientUser") || "null");
        const isClientLoggedIn = localStorage.getItem("isClientLoggedIn") === "true";

        if (clientUser && isClientLoggedIn) {
            navigate("/client/quotation");
        } else {
            localStorage.setItem("redirectAfterLogin", "/client/quotation");
            navigate("/login");
        }
    };

    const handlePackageQuote = (pkg) => {
        localStorage.setItem("selectedPackage", JSON.stringify(pkg));
        handleGetQuotation();
    };

    useEffect(() => {
        const sectionIds = ["home", "about", "gallery", "contact"];
        const sections = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 140;
            let currentSection = "home";

            sections.forEach((section) => {
                if (
                    section.offsetTop <= scrollPosition &&
                    section.offsetTop + section.offsetHeight > scrollPosition
                ) {
                    currentSection = section.id;
                }
            });

            setActiveSection(currentSection);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (contactStatus) setContactStatus("");
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();

        if (
            !contactForm.name.trim() ||
            !contactForm.email.trim() ||
            !contactForm.message.trim()
        ) {
            setContactStatus("Please fill out all fields.");
            return;
        }

        setContactStatus("Your message has been sent successfully!");
        setContactForm({
            name: "",
            email: "",
            message: "",
        });
    };

    const navClass = (isActive) =>
        `relative transition px-1 pb-1 font-medium after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#f5c94a] ${isActive
            ? "text-[#f5c94a] after:w-full"
            : "text-white after:w-0 hover:text-[#f5c94a] hover:after:w-full after:transition-all"
        }`;

    const mobileLinkClass =
        "block rounded-2xl px-4 py-3 text-base font-semibold text-white hover:bg-white/10 transition";

    const sectionTitle = (eyebrow, title, highlight, desc) => (
        <div className="text-center mb-12 md:mb-14">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/65">
                {eyebrow}
            </p>
            <h3 className="mt-3 text-[34px] sm:text-[40px] md:text-[50px] leading-tight font-bold text-[#0b4d3b]">
                {title} <span className="text-[#d4a514]">{highlight}</span>
            </h3>
            <p className="mt-4 text-[15px] md:text-[17px] text-slate-500 max-w-2xl mx-auto leading-7">
                {desc}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f7f2] text-green-950">
            <nav className="bg-[#0b4d3b]/95 backdrop-blur-md text-white h-[84px] md:h-[84px] px-5 md:px-10 lg:px-14 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-white/10">
                <div className="leading-none">
                    <h1 className="text-[22px] md:text-[26px] font-extrabold text-yellow-400">
                        Ebit&apos;s Catering
                    </h1>
                    <p className="text-[11px] md:text-[13px] text-white/85 mt-1">
                        For making parties better
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-7 text-[15px]">
                    <a href="#home" className={navClass(activeSection === "home")}>
                        Home
                    </a>

                    <Link
                        to="/packages"
                        className={navClass(location.pathname === "/packages")}
                    >
                        Packages
                    </Link>

                    <a href="#about" className={navClass(activeSection === "about")}>
                        About
                    </a>

                    <a href="#gallery" className={navClass(activeSection === "gallery")}>
                        Gallery
                    </a>

                    <a href="#contact" className={navClass(activeSection === "contact")}>
                        Contact
                    </a>

                    <Link
                        to="/login"
                        className="border border-white/20 bg-white/10 text-white px-4 py-2.5 rounded-2xl font-semibold hover:bg-white hover:text-[#0b4d3b] transition"
                    >
                        Login
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/20 p-2"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </nav>

            {mobileMenuOpen && (
                <div className="md:hidden sticky top-[78px] z-40 bg-[#0b4d3b] border-t border-white/10 px-5 py-4 shadow-md">
                    <div className="flex flex-col gap-2">
                        <a
                            href="#home"
                            className={mobileLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </a>
                        <Link
                            to="/packages"
                            className={mobileLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Packages
                        </Link>
                        <a
                            href="#about"
                            className={mobileLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About
                        </a>
                        <a
                            href="#gallery"
                            className={mobileLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Gallery
                        </a>
                        <a
                            href="#contact"
                            className={mobileLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Contact
                        </a>
                        <Link
                            to="/login"
                            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 font-semibold text-[#0b4d3b]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}

            <section
                id="home"
                className="relative min-h-[650px] md:min-h-[760px] flex items-center justify-center text-center overflow-hidden"
                style={{
                    backgroundImage: `url(${hero})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-[#0b4d3b]/70" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b4d3b]/30 via-[#0b4d3b]/55 to-[#0b4d3b]/90" />
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-200/10 blur-3xl" />

                <div className="relative z-10 max-w-6xl px-6 py-16">
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-white/10 px-4 py-2 text-xs md:text-sm text-white backdrop-blur-sm">
                            <Sparkles size={14} className="text-yellow-400" />
                            Elegant Event Catering
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-white/10 px-4 py-2 text-xs md:text-sm text-white backdrop-blur-sm">
                            <CheckCircle2 size={14} className="text-yellow-400" />
                            Fresh, Clean and Tasty
                        </div>
                    </div>

                    <h2 className="text-white font-extrabold leading-[1.02] text-[40px] sm:text-[56px] md:text-[78px] tracking-[-0.03em]">
                        <span className="text-yellow-400">Premium Catering</span>
                        <br />
                        for Unforgettable
                        <br />
                        Moments
                    </h2>

                    <p className="mt-6 text-white/90 text-[16px] md:text-[20px] leading-[1.8] max-w-3xl mx-auto">
                        Elegant catering, event styling, and celebration services for
                        weddings, debuts, birthdays, anniversaries, and special occasions.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            to="/packages"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0b4d3b] px-7 py-3.5 font-semibold hover:bg-[#fff8e6] transition shadow-lg"
                        >
                            View Packages
                            <ChevronRight size={18} />
                        </Link>

                        <button
                            onClick={handleGetQuotation}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 text-green-950 px-7 py-3.5 font-semibold hover:bg-yellow-300 transition shadow-lg"
                        >
                            Get Free Quotation
                            <ChevronRight size={18} />
                        </button>
                    </div>

                </div>
            </section>

            <section className="px-5 md:px-10 lg:px-20 py-16 md:py-20 bg-[#f8f7f2]">
                {sectionTitle(
                    "What We Offer",
                    "Our",
                    "Services",
                    "Everything you need for a memorable and stress-free celebration."
                )}

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
                    {services.map((item, index) => (
                        <div
                            key={index}
                            className="group bg-white border border-[#ece6d8] rounded-[28px] px-6 py-7 text-center shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition duration-300"
                        >
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fbf4df] flex items-center justify-center mb-5 text-[#c99d1a] group-hover:bg-[#0b4d3b] group-hover:text-white transition">
                                {item.icon}
                            </div>

                            <h4 className="text-[22px] font-bold text-green-950 leading-tight mb-3">
                                {item.title}
                            </h4>

                            <p className="text-[15px] leading-7 text-slate-600">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-5 md:px-10 lg:px-20 pb-16 md:pb-20 bg-[#f8f7f2]">
                <div className="max-w-6xl mx-auto rounded-[34px] bg-gradient-to-br from-[#0c5a43] via-[#0b4d3b] to-[#083629] p-7 md:p-10 lg:p-12 text-white shadow-[0_25px_50px_rgba(0,0,0,0.16)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-yellow-300/10 blur-3xl" />
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 relative z-10">
                        <div className="max-w-2xl">
                            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                                Best Picks
                            </p>
                            <h3 className="text-[34px] md:text-[48px] font-bold mt-3 leading-tight">
                                Featured <span className="text-yellow-400">Packages</span>
                            </h3>
                            <p className="text-white/80 mt-4 text-[15px] md:text-[17px] leading-7">
                                Start with our popular packages and request a quotation based on
                                your selected event.
                            </p>
                        </div>

                        <Link
                            to="/packages"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white text-[#0b4d3b] px-5 py-3 font-semibold hover:bg-[#fff8e6] transition w-fit"
                        >
                            See All Packages
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-5 relative z-10">
                        {featuredPackages.map((item, index) => (
                            <div
                                key={item.id}
                                className={`rounded-[28px] bg-[#fffdf8] text-[#0b4d3b] p-6 shadow-sm border transition hover:-translate-y-1 hover:shadow-xl ${index === 1 ? "border-[#e4bc41]" : "border-transparent"
                                    }`}
                            >
                                {index === 1 && (
                                    <div className="inline-flex rounded-full bg-[#fff3c8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b7510] mb-4">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b4d3b]/55">
                                            {item.category}
                                        </p>
                                        <h4 className="text-[22px] md:text-[24px] font-extrabold mt-3 leading-tight">
                                            {item.title}
                                        </h4>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-[24px] md:text-[26px] font-extrabold text-[#d1a31d]">
                                            {item.price}
                                        </p>
                                        <p className="text-sm text-slate-500">{item.pax}</p>
                                    </div>
                                </div>

                                <div className="w-12 h-[3px] rounded-full bg-[#d1a31d] mt-4 mb-4" />

                                <p className="text-slate-600 leading-7 text-[15px] min-h-[98px]">
                                    {item.desc}
                                </p>

                                <button
                                    onClick={() => handlePackageQuote(item)}
                                    className="mt-5 inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-[#0b4d3b] hover:bg-yellow-300 transition"
                                >
                                    Get Quotation
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="about"
                className="bg-[#0c5a43] text-white px-5 md:px-10 lg:px-20 py-16 md:py-20"
            >
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                            About Us
                        </p>
                        <h3 className="text-[36px] md:text-[52px] font-bold leading-tight mt-3 mb-7">
                            About <span className="text-yellow-400">Ebit&apos;s Catering</span>
                        </h3>

                        <p className="text-[16px] md:text-[18px] leading-8 text-white/90 mb-5">
                            A DTI registered catering business dedicated to making your
                            parties better with fresh, clean, and tasty food.
                        </p>

                        <p className="text-[16px] md:text-[18px] leading-8 text-white/90 mb-7">
                            We specialize in weddings, debuts, birthdays, anniversaries,
                            and baptismal celebrations, bringing experience, creativity,
                            and professional service to every event we handle.
                        </p>

                        <div className="grid gap-4 text-[15px] md:text-[17px] text-white/90">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
                                <p>DTI Registered Business</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
                                <p>Experienced Professional Team</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
                                <p>Fresh and Quality Ingredients</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
                                <p>Elegant setup for special occasions</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative overflow-hidden rounded-[30px] border border-white/10 shadow-2xl">
                            <img
                                src={gal2}
                                alt="Ebit's Catering event setup"
                                className="w-full h-[340px] md:h-[430px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b4d3b]/75 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
                                    <p className="text-yellow-400 font-bold text-base md:text-lg">
                                        Elegant setup for memorable celebrations
                                    </p>
                                    <p className="text-white/85 text-sm mt-2">
                                        Weddings, debuts, birthdays, anniversaries, and special events.
                                    </p>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </section>

            <section className="px-5 md:px-10 lg:px-20 py-16 md:py-20 bg-[#f8f7f2]">
                {sectionTitle(
                    "Why Choose Us",
                    "Why Choose",
                    "Ebit’s",
                    "A trusted catering service focused on quality food, elegant setup, and organized event support."
                )}

                <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
                    {reasons.map((item, index) => (
                        <div
                            key={index}
                            className="group bg-white border border-[#ece6d8] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#fbf4df] flex items-center justify-center shrink-0 text-[#c99d1a] group-hover:bg-[#0b4d3b] group-hover:text-white transition">
                                    {item.icon}
                                </div>

                                <div>
                                    <h4 className="text-[22px] font-bold text-[#0b4d3b] mb-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-slate-600 leading-7 text-[15px]">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="gallery" className="px-5 md:px-10 lg:px-20 py-16 md:py-20 bg-[#f8f7f2]">
                {sectionTitle(
                    "Recent Setups",
                    "Our",
                    "Gallery",
                    "A glimpse of the events and elegant celebration setups we’ve catered."
                )}

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {galleryItems.map((item, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-[28px] shadow-md"
                        >
                            <img
                                src={item.src}
                                alt={item.title}
                                className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white font-semibold text-lg">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="contact" className="px-5 md:px-10 lg:px-20 py-16 md:py-20 bg-[#f8f7f2]">
                {sectionTitle(
                    "Contact Us",
                    "Get in",
                    "Touch",
                    "We’d love to hear from you"
                )}

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <div className="space-y-5">
                        <div className="bg-white border border-[#ece6d8] rounded-[28px] p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#fbf4df] flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-[#b99117]" />
                                </div>
                                <div>
                                    <h4 className="text-[20px] font-bold mb-2">Phone</h4>
                                    <p className="text-[16px] text-slate-600">0917 679 0643</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#ece6d8] rounded-[28px] p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#fbf4df] flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-[#b99117]" />
                                </div>
                                <div>
                                    <h4 className="text-[20px] font-bold mb-2">Address</h4>
                                    <p className="text-[16px] text-slate-600 leading-8">
                                        Blk 5 Lot 14 Tierra Verde Residences
                                        <br />
                                        Burol 3, Dasmariñas City, Cavite
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#ece6d8] rounded-[28px] p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#fbf4df] flex items-center justify-center shrink-0">
                                    <MessageCircle className="w-5 h-5 text-[#b99117]" />
                                </div>
                                <div>
                                    <h4 className="text-[20px] font-bold mb-2">Facebook</h4>
                                    <p className="text-slate-600 mb-4 text-[15px] leading-7">
                                        Visit our official Facebook page for more inquiries and updates.
                                    </p>
                                    <a
                                        href="https://www.facebook.com/ebitscateringandservices"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#fbf4df] text-[#0b4d3b] rounded-2xl font-semibold hover:bg-yellow-400 hover:text-green-950 transition"
                                    >
                                        Visit our Facebook Page
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleContactSubmit}
                        className="bg-white border border-[#ece6d8] rounded-[30px] p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-[#fbf4df] flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-[#b99117]" />
                            </div>
                            <h4 className="text-[22px] md:text-[24px] font-bold">
                                Send us a message
                            </h4>
                        </div>

                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={contactForm.name}
                            onChange={handleContactChange}
                            className="w-full border border-[#d8d2c7] rounded-2xl px-4 py-3.5 mb-4 outline-none focus:border-yellow-400"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={contactForm.email}
                            onChange={handleContactChange}
                            className="w-full border border-[#d8d2c7] rounded-2xl px-4 py-3.5 mb-4 outline-none focus:border-yellow-400"
                        />

                        <textarea
                            name="message"
                            placeholder="Your Message"
                            rows="5"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            className="w-full border border-[#d8d2c7] rounded-2xl px-4 py-3.5 mb-4 outline-none focus:border-yellow-400 resize-none"
                        />

                        {contactStatus && (
                            <p
                                className={`mb-4 text-sm font-medium ${contactStatus.includes("successfully")
                                    ? "text-green-600"
                                    : "text-red-500"
                                    }`}
                            >
                                {contactStatus}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-yellow-400 text-green-950 py-3.5 rounded-2xl font-semibold hover:bg-yellow-300 transition"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </section>

            <footer className="bg-[#0c5a43] text-white px-5 md:px-10 lg:px-20 py-12">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
                    <div>
                        <h4 className="text-[32px] md:text-[38px] font-bold text-yellow-400 mb-3">
                            Ebit&apos;s Catering
                        </h4>
                        <p className="text-white/85 leading-8 max-w-md text-[16px]">
                            For making parties better with fresh, clean, and tasty food
                            and elegant celebration services.
                        </p>
                    </div>

                    <div>
                        <h5 className="text-xl font-bold mb-4">Quick Links</h5>
                        <div className="space-y-3 text-white/85">
                            <a href="#home" className="block hover:text-yellow-400 transition">
                                Home
                            </a>
                            <Link to="/packages" className="block hover:text-yellow-400 transition">
                                Packages
                            </Link>
                            <a href="#about" className="block hover:text-yellow-400 transition">
                                About
                            </a>
                            <a href="#gallery" className="block hover:text-yellow-400 transition">
                                Gallery
                            </a>
                            <a href="#contact" className="block hover:text-yellow-400 transition">
                                Contact
                            </a>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xl font-bold mb-4">Business Info</h5>
                        <div className="space-y-3 text-white/85">
                            <p>DTI Registered Catering Business</p>
                            <p>Dasmariñas City, Cavite</p>
                            <p>0917 679 0643</p>
                            <a
                                href="https://www.facebook.com/ebitscateringandservices"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition"
                            >
                                Visit Facebook Page
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-6 text-center text-white/75">
                    © 2026 Ebit&apos;s Catering. All rights reserved.
                </div>
            </footer>

            <ChatBot />
        </div>
    );
}

export default Home;