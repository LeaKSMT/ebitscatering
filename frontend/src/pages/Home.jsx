import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    ArrowRight,
    Crown,
    Star,
    ShieldCheck,
    Gem,
    PartyPopper,
    BadgeCheck,
    Quote,
} from "lucide-react";

import hero from "../assets/hero.jpg";
import gal1 from "../assets/gal1.jpg";
import gal2 from "../assets/gal2.jpg";
import gal3 from "../assets/gal3.jpg";
import ChatBot from "../components/ChatBot";

const fadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            delay: i * 0.1,
            ease: "easeOut",
        },
    }),
};

const softScale = {
    hidden: { opacity: 0, scale: 0.975 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.55,
            ease: "easeOut",
        },
    },
};

const staggerWrap = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

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
                badge: "Refined Choice",
            },
            {
                id: "basic-wedding",
                title: "Basic Wedding Package",
                category: "Wedding Package",
                price: "₱58,000",
                pax: "100 pax",
                desc: "A beautiful wedding package with catering, table setup, staff, and event essentials.",
                badge: "Most Popular",
            },
            {
                id: "premium-wedding",
                title: "Premium Wedding Package",
                category: "Wedding Package",
                price: "₱75,000",
                pax: "100 pax",
                desc: "Premium wedding experience with catering, host, photo coverage, cake, and more.",
                badge: "Premium Pick",
            },
        ],
        []
    );

    const services = [
        {
            title: "Premium Catering",
            text: "Fresh and delicious menu options prepared for weddings, debuts, birthdays, and more.",
            icon: <UtensilsCrossed className="h-6 w-6" />,
        },
        {
            title: "Event Planning",
            text: "Organized coordination for your event flow, setup, and celebration essentials.",
            icon: <CalendarDays className="h-6 w-6" />,
        },
        {
            title: "Premium Decorations",
            text: "Elegant styling and themed decorations tailored to your chosen occasion.",
            icon: <Award className="h-6 w-6" />,
        },
        {
            title: "Professional Staff",
            text: "Friendly and experienced staff focused on service, presentation, and client satisfaction.",
            icon: <Users className="h-6 w-6" />,
        },
    ];

    const reasons = [
        {
            title: "Fresh and Quality Food",
            text: "Prepared with quality ingredients to give your guests a satisfying dining experience.",
            icon: <UtensilsCrossed className="h-5 w-5" />,
        },
        {
            title: "Organized Booking Process",
            text: "From package selection to quotation and booking confirmation, the process stays clear and simple.",
            icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
            title: "Reliable Event Service",
            text: "Our team focuses on timely setup, smooth coordination, and professional presentation.",
            icon: <Clock3 className="h-5 w-5" />,
        },
        {
            title: "Memorable Celebrations",
            text: "We help create elegant weddings, debuts, birthdays, anniversaries, and other special occasions.",
            icon: <HeartHandshake className="h-5 w-5" />,
        },
    ];

    const galleryItems = [
        { src: gal1, title: "Elegant Debut Setup" },
        { src: gal2, title: "Wedding Aisle and Stage" },
        { src: gal3, title: "Styled Celebration Backdrop" },
    ];

    const processSteps = [
        {
            step: "01",
            title: "Choose a Package",
            text: "Browse curated catering packages that match your event style and budget.",
            icon: <Gem className="h-5 w-5" />,
        },
        {
            step: "02",
            title: "Request a Quotation",
            text: "Send your event details and receive a clear estimate for your celebration.",
            icon: <Quote className="h-5 w-5" />,
        },
        {
            step: "03",
            title: "Plan Your Setup",
            text: "Finalize the package, styling, and celebration details with confidence.",
            icon: <PartyPopper className="h-5 w-5" />,
        },
        {
            step: "04",
            title: "Celebrate Smoothly",
            text: "Enjoy an organized and elegant event experience handled by our team.",
            icon: <BadgeCheck className="h-5 w-5" />,
        },
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
        "block rounded-2xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10";

    const sectionTitle = (eyebrow, title, highlight, desc) => (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mb-12 text-center md:mb-14"
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/55 md:text-xs">
                {eyebrow}
            </p>
            <h3 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.03em] text-[#0b4d3b] sm:text-[42px] md:text-[52px]">
                {title} <span className="text-[#d4a514]">{highlight}</span>
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 md:text-[16px]">
                {desc}
            </p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#f8f7f2] text-green-950">
            <nav className="sticky top-0 z-50 flex h-[82px] items-center justify-between border-b border-white/10 bg-[#0b4d3b]/85 px-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:px-10 lg:px-14">
                <div className="leading-none">
                    <h1 className="text-[21px] font-extrabold tracking-tight text-yellow-400 md:text-[25px]">
                        Ebit&apos;s Catering
                    </h1>
                    <p className="mt-1 text-[11px] text-white/85 md:text-[12px]">
                        Premium catering for unforgettable celebrations
                    </p>
                </div>

                <div className="hidden items-center gap-7 text-[15px] md:flex">
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
                        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#0b4d3b]"
                    >
                        Login
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 p-2 md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </nav>

            {mobileMenuOpen && (
                <div className="sticky top-[78px] z-40 border-t border-white/10 bg-[#0b4d3b]/95 px-5 py-4 shadow-md backdrop-blur-xl md:hidden">
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
                className="scroll-mt-24 relative flex min-h-[720px] items-center overflow-hidden md:min-h-[860px] md:scroll-mt-28"
                style={{
                    backgroundImage: `url(${hero})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="hero-luxury-overlay absolute inset-0" />
                <div className="hero-vignette absolute inset-0" />
                <div className="hero-mesh absolute inset-0" />
                <div className="hero-noise absolute inset-0" />

                <div className="hero-glow hero-glow-1" />
                <div className="hero-glow hero-glow-2" />
                <div className="hero-glow hero-glow-3" />
                <div className="hero-shine" />

                <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.06fr_0.94fr] lg:px-12">
                    <div className="text-center lg:text-left">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            variants={fadeUp}
                            className="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-white/10 px-4 py-2 text-xs text-white/95 backdrop-blur-sm md:text-sm">
                                <Sparkles size={14} className="text-yellow-400" />
                                Elegant Event Catering
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/90 backdrop-blur-sm md:text-sm">
                                <Star size={14} className="text-yellow-400" />
                                Refined • Premium • Memorable
                            </div>
                        </motion.div>

                        <motion.h2
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            variants={fadeUp}
                            className="text-[40px] font-extrabold leading-[0.98] tracking-[-0.05em] text-white sm:text-[58px] md:text-[78px]"
                        >
                            Luxury Catering
                            <br />
                            Crafted for
                            <br />
                            <span className="hero-gold-text">Special Moments</span>
                        </motion.h2>

                        <motion.p
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            variants={fadeUp}
                            className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-white/85 md:text-[17px] lg:mx-0"
                        >
                            Elegant catering, refined styling, and seamless event service
                            for weddings, debuts, birthdays, anniversaries, and other
                            milestone celebrations.
                        </motion.p>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            custom={3}
                            variants={fadeUp}
                            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
                        >
                            <Link
                                to="/packages"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-[#0b4d3b] shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#fff8e6]"
                            >
                                View Packages
                                <ChevronRight size={18} />
                            </Link>

                            <button
                                onClick={handleGetQuotation}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3.5 font-semibold text-green-950 shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-yellow-300"
                            >
                                Get Free Quotation
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            custom={4}
                            variants={fadeUp}
                            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                            {[
                                { value: "Premium", label: "Presentation" },
                                { value: "Trusted", label: "Coordination" },
                                { value: "Elegant", label: "Celebrations" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-[24px] border border-white/12 bg-white/10 px-5 py-4 text-left backdrop-blur-md shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
                                >
                                    <p className="text-base font-bold text-yellow-400 md:text-lg">
                                        {item.value}
                                    </p>
                                    <p className="mt-1 text-sm text-white/78">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={softScale}
                        className="hidden lg:block"
                    >
                        <div className="relative mx-auto max-w-[480px] rounded-[36px] border border-white/10 bg-white/10 p-4 shadow-[0_32px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                            <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/10 via-transparent to-yellow-300/5" />

                            <div className="relative rounded-[30px] bg-gradient-to-br from-[#12533f] via-[#0b4d3b] to-[#06291f] p-7 text-white">
                                <div className="mb-7 flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.34em] text-white/60">
                                            Signature Experience
                                        </p>
                                        <h3 className="mt-3 text-[30px] font-bold leading-tight">
                                            Ebit&apos;s Premium Service
                                        </h3>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-yellow-400 shadow-inner">
                                        <Crown size={24} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        "Elegant setup and stylish presentation",
                                        "Fresh, quality food for special occasions",
                                        "Professional staff and smooth coordination",
                                        "Curated packages for memorable celebrations",
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:border-yellow-300/25 hover:bg-white/10"
                                        >
                                            <CheckCircle2
                                                size={17}
                                                className="mt-0.5 shrink-0 text-yellow-400"
                                            />
                                            <p className="text-sm leading-7 text-white/88">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                                            Best for
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-white/92">
                                            Weddings • Debuts
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                                            Service
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-white/92">
                                            Elegant • Organized • Trusted
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#f8f7f2] px-5 py-16 md:px-10 md:py-20 lg:px-20">
                <div className="pointer-events-none absolute left-0 top-12 h-40 w-40 rounded-full bg-[#d4a514]/10 blur-3xl" />
                <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-[#0b4d3b]/10 blur-3xl" />

                {sectionTitle(
                    "What We Offer",
                    "Our",
                    "Services",
                    "Everything you need for a memorable and stress-free celebration."
                )}

                <motion.div
                    variants={staggerWrap}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.16 }}
                    className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {services.map((item, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={fadeUp}
                            className="group premium-card relative overflow-hidden rounded-[30px] border border-[#ece6d8] bg-white px-6 py-7 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                        >
                            <div className="premium-card-shine" />
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#c99d1a] transition duration-300 group-hover:bg-[#0b4d3b] group-hover:text-white">
                                {item.icon}
                            </div>

                            <h4 className="mb-3 text-[20px] font-bold leading-tight text-green-950">
                                {item.title}
                            </h4>

                            <p className="text-[15px] leading-7 text-slate-600">
                                {item.text}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <section className="bg-[#f8f7f2] px-5 pb-16 md:px-10 md:pb-20 lg:px-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.16 }}
                    variants={softScale}
                    className="relative mx-auto max-w-6xl overflow-hidden rounded-[38px] bg-gradient-to-br from-[#0d5a43] via-[#0b4d3b] to-[#082f25] p-7 text-white shadow-[0_28px_56px_rgba(0,0,0,0.16)] md:p-10"
                >
                    <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-yellow-300/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative z-10 mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:text-xs">
                                Featured Selection
                            </p>
                            <h3 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.03em] md:text-[46px]">
                                Signature <span className="text-yellow-400">Packages</span>
                            </h3>
                            <p className="mt-4 text-[15px] leading-7 text-white/80 md:text-[16px]">
                                Discover our most requested packages designed for refined,
                                memorable, and beautifully organized celebrations.
                            </p>
                        </div>

                        <Link
                            to="/packages"
                            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-[#0b4d3b] transition duration-300 hover:-translate-y-1 hover:bg-[#fff8e6]"
                        >
                            See All Packages
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    <motion.div
                        variants={staggerWrap}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.16 }}
                        className="relative z-10 grid gap-5 lg:grid-cols-3"
                    >
                        {featuredPackages.map((item, index) => (
                            <motion.div
                                key={item.id}
                                custom={index}
                                variants={fadeUp}
                                className={`group relative overflow-hidden rounded-[30px] border bg-[#fffdf8] p-6 text-[#0b4d3b] shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${index === 1
                                        ? "package-featured border-[#e4bc41] ring-1 ring-[#e4bc41]/40"
                                        : "border-transparent"
                                    }`}
                            >
                                <div className="package-card-glow" />

                                <div
                                    className={`mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${index === 1
                                            ? "bg-[#fff3c8] text-[#9b7510]"
                                            : "bg-[#f4efe2] text-[#6e6453]"
                                        }`}
                                >
                                    {item.badge}
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b4d3b]/55">
                                            {item.category}
                                        </p>
                                        <h4 className="mt-3 text-[22px] font-extrabold leading-tight md:text-[24px]">
                                            {item.title}
                                        </h4>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-[22px] font-extrabold text-[#d1a31d] md:text-[26px]">
                                            {item.price}
                                        </p>
                                        <p className="text-sm text-slate-500">{item.pax}</p>
                                    </div>
                                </div>

                                <div className="mb-4 mt-4 h-[3px] w-14 rounded-full bg-[#d1a31d]" />

                                <p className="min-h-[92px] text-[15px] leading-7 text-slate-600">
                                    {item.desc}
                                </p>

                                <button
                                    onClick={() => handlePackageQuote(item)}
                                    className={`mt-5 inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition duration-300 ${index === 1
                                            ? "bg-yellow-400 text-[#0b4d3b] shadow-[0_12px_30px_rgba(212,165,20,0.28)] hover:-translate-y-1 hover:bg-yellow-300"
                                            : "bg-[#0b4d3b] text-white hover:-translate-y-1 hover:bg-[#0f624a]"
                                        }`}
                                >
                                    Get Quotation
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            <section className="bg-[#f8f7f2] px-5 pb-16 md:px-10 md:pb-20 lg:px-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.18 }}
                    variants={softScale}
                    className="mx-auto max-w-6xl rounded-[36px] border border-[#ece6d8] bg-white p-7 shadow-[0_16px_40px_rgba(0,0,0,0.05)] md:p-10"
                >
                    <div className="mb-8 max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/55 md:text-xs">
                            Seamless Experience
                        </p>
                        <h3 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.03em] text-[#0b4d3b] md:text-[46px]">
                            How It <span className="text-[#d4a514]">Works</span>
                        </h3>
                        <p className="mt-4 text-[15px] leading-7 text-slate-500 md:text-[16px]">
                            A cleaner and easier booking flow that keeps every step clear,
                            polished, and organized.
                        </p>
                    </div>

                    <motion.div
                        variants={staggerWrap}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.18 }}
                        className="grid gap-5 lg:grid-cols-4"
                    >
                        {processSteps.map((item, index) => (
                            <motion.div
                                key={index}
                                custom={index}
                                variants={fadeUp}
                                className="group relative overflow-hidden rounded-[28px] border border-[#ece6d8] bg-[#fcfbf7] p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                            >
                                <div className="absolute right-4 top-4 text-[30px] font-extrabold text-[#0b4d3b]/8">
                                    {item.step}
                                </div>

                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#b99117] transition group-hover:bg-[#0b4d3b] group-hover:text-white">
                                    {item.icon}
                                </div>

                                <h4 className="mb-3 text-[19px] font-bold text-[#0b4d3b]">
                                    {item.title}
                                </h4>

                                <p className="text-[15px] leading-7 text-slate-600">
                                    {item.text}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            <section
                id="about"
                className="scroll-mt-24 relative overflow-hidden bg-[#0c5a43] px-5 py-16 text-white md:scroll-mt-28 md:px-10 md:py-20 lg:px-20"
            >
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute -left-12 top-12 h-44 w-44 rounded-full bg-yellow-300/10 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
                </div>

                <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:text-xs">
                            About Us
                        </p>
                        <h3 className="mt-3 mb-6 text-[32px] font-extrabold leading-tight tracking-[-0.03em] md:text-[46px]">
                            About <span className="text-yellow-400">Ebit&apos;s Catering</span>
                        </h3>

                        <p className="mb-4 text-[15px] leading-8 text-white/90 md:text-[17px]">
                            A DTI registered catering business dedicated to making your
                            parties better with fresh, clean, and tasty food.
                        </p>

                        <p className="mb-7 text-[15px] leading-8 text-white/90 md:text-[17px]">
                            We specialize in weddings, debuts, birthdays, anniversaries,
                            and baptismal celebrations, bringing experience, creativity,
                            and professional service to every event we handle.
                        </p>

                        <div className="grid gap-4 text-[15px] text-white/90 md:text-[16px]">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-yellow-400" />
                                <p>DTI Registered Business</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-yellow-400" />
                                <p>Experienced Professional Team</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-yellow-400" />
                                <p>Fresh and Quality Ingredients</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-yellow-400" />
                                <p>Elegant setup for special occasions</p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-yellow-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-white">
                                    Trusted Event Support
                                </p>
                                <p className="mt-1 text-sm leading-6 text-white/75">
                                    Organized service from planning up to event day.
                                </p>
                            </div>

                            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-yellow-400">
                                    <Crown className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-white">
                                    Elegant Presentation
                                </p>
                                <p className="mt-1 text-sm leading-6 text-white/75">
                                    Premium setup that elevates every celebration.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={softScale}
                        className="relative"
                    >
                        <div className="absolute -right-5 -top-5 z-10 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                            <p className="text-sm font-semibold text-yellow-400">
                                Elegant & Organized
                            </p>
                            <p className="mt-1 text-xs text-white/75">
                                Setup • Catering • Celebration Flow
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
                            <img
                                src={gal2}
                                alt="Ebit's Catering event setup"
                                className="h-[320px] w-full object-cover transition duration-700 hover:scale-105 md:h-[470px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b4d3b]/84 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                    <p className="text-base font-bold text-yellow-400 md:text-lg">
                                        Elegant setup for memorable celebrations
                                    </p>
                                    <p className="mt-2 text-sm text-white/85">
                                        Weddings, debuts, birthdays, anniversaries, and special
                                        events.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-[#f8f7f2] px-5 py-16 md:px-10 md:py-20 lg:px-20">
                {sectionTitle(
                    "Why Choose Us",
                    "Why Choose",
                    "Ebit’s",
                    "A trusted catering service focused on quality food, elegant setup, and organized event support."
                )}

                <motion.div
                    variants={staggerWrap}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.18 }}
                    className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2"
                >
                    {reasons.map((item, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={fadeUp}
                            className="group rounded-[28px] border border-[#ece6d8] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#c99d1a] transition duration-300 group-hover:bg-[#0b4d3b] group-hover:text-white">
                                    {item.icon}
                                </div>

                                <div>
                                    <h4 className="mb-2 text-[20px] font-bold text-[#0b4d3b]">
                                        {item.title}
                                    </h4>
                                    <p className="text-[15px] leading-7 text-slate-600">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <section
                id="gallery"
                className="scroll-mt-24 bg-[#f8f7f2] px-5 py-16 md:scroll-mt-28 md:px-10 md:py-20 lg:px-20"
            >
                {sectionTitle(
                    "Recent Setups",
                    "Our",
                    "Gallery",
                    "A glimpse of the events and elegant celebration setups we’ve catered."
                )}

                <motion.div
                    variants={staggerWrap}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.18 }}
                    className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3"
                >
                    {galleryItems.map((item, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={fadeUp}
                            className="group gallery-card relative overflow-hidden rounded-[30px] shadow-md"
                        >
                            <img
                                src={item.src}
                                alt={item.title}
                                className="h-64 w-full object-cover transition duration-700 group-hover:scale-110 md:h-72"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                            <div className="gallery-hover-overlay absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-base font-semibold text-white md:text-lg">
                                    {item.title}
                                </p>
                                <p className="mt-1 translate-y-2 text-sm text-white/0 transition duration-500 group-hover:translate-y-0 group-hover:text-white/75">
                                    Premium celebration styling and elegant event setup.
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <section
                id="contact"
                className="scroll-mt-24 bg-[#f8f7f2] px-5 py-16 md:scroll-mt-28 md:px-10 md:py-20 lg:px-20"
            >
                {sectionTitle(
                    "Contact Us",
                    "Get in",
                    "Touch",
                    "We’d love to hear from you"
                )}

                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                        className="space-y-5"
                    >
                        <div className="rounded-[28px] border border-[#ece6d8] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbf4df]">
                                    <Phone className="h-5 w-5 text-[#b99117]" />
                                </div>
                                <div>
                                    <h4 className="mb-2 text-[18px] font-bold md:text-[20px]">
                                        Phone
                                    </h4>
                                    <p className="text-[15px] text-slate-600 md:text-[16px]">
                                        0917 679 0643
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[#ece6d8] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbf4df]">
                                    <MapPin className="h-5 w-5 text-[#b99117]" />
                                </div>
                                <div>
                                    <h4 className="mb-2 text-[18px] font-bold md:text-[20px]">
                                        Address
                                    </h4>
                                    <p className="text-[15px] leading-8 text-slate-600 md:text-[16px]">
                                        Blk 5 Lot 14 Tierra Verde Residences
                                        <br />
                                        Burol 3, Dasmariñas City, Cavite
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[#ece6d8] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbf4df]">
                                    <MessageCircle className="h-5 w-5 text-[#b99117]" />
                                </div>
                                <div>
                                    <h4 className="mb-2 text-[18px] font-bold md:text-[20px]">
                                        Facebook
                                    </h4>
                                    <p className="mb-4 text-[15px] leading-7 text-slate-600">
                                        Visit our official Facebook page for more inquiries and
                                        updates.
                                    </p>
                                    <a
                                        href="https://www.facebook.com/ebitscateringandservices"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-[#fbf4df] px-4 py-2.5 font-semibold text-[#0b4d3b] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-400 hover:text-green-950"
                                    >
                                        Visit our Facebook Page
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.form
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={softScale}
                        onSubmit={handleContactSubmit}
                        className="relative overflow-hidden rounded-[30px] border border-[#ece6d8] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
                    >
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#d4a514]/10 blur-3xl" />
                        <div className="relative">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbf4df]">
                                    <MessageCircle className="h-5 w-5 text-[#b99117]" />
                                </div>
                                <h4 className="text-[20px] font-bold md:text-[22px]">
                                    Send us a message
                                </h4>
                            </div>

                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={contactForm.name}
                                onChange={handleContactChange}
                                className="mb-4 w-full rounded-2xl border border-[#d8d2c7] bg-[#fcfbf7] px-4 py-3.5 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={contactForm.email}
                                onChange={handleContactChange}
                                className="mb-4 w-full rounded-2xl border border-[#d8d2c7] bg-[#fcfbf7] px-4 py-3.5 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                            />

                            <textarea
                                name="message"
                                placeholder="Your Message"
                                rows="5"
                                value={contactForm.message}
                                onChange={handleContactChange}
                                className="mb-4 w-full resize-none rounded-2xl border border-[#d8d2c7] bg-[#fcfbf7] px-4 py-3.5 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
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
                                className="w-full rounded-2xl bg-yellow-400 py-3.5 font-semibold text-green-950 shadow-[0_14px_30px_rgba(212,165,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300"
                            >
                                Send Message
                            </button>
                        </div>
                    </motion.form>
                </div>
            </section>

            <footer className="relative overflow-hidden bg-[#0c5a43] px-5 py-12 text-white md:px-10 lg:px-20">
                <div className="absolute left-0 top-0 h-44 w-44 rounded-full bg-yellow-300/8 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

                <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
                    <div>
                        <h4 className="mb-3 text-[30px] font-bold text-yellow-400 md:text-[34px]">
                            Ebit&apos;s Catering
                        </h4>
                        <p className="max-w-md text-[15px] leading-8 text-white/85 md:text-[16px]">
                            For making parties better with fresh, clean, and tasty food
                            and elegant celebration services.
                        </p>
                    </div>

                    <div>
                        <h5 className="mb-4 text-lg font-bold md:text-xl">Quick Links</h5>
                        <div className="space-y-3 text-white/85">
                            <a href="#home" className="block transition hover:text-yellow-400">
                                Home
                            </a>
                            <Link
                                to="/packages"
                                className="block transition hover:text-yellow-400"
                            >
                                Packages
                            </Link>
                            <a href="#about" className="block transition hover:text-yellow-400">
                                About
                            </a>
                            <a href="#gallery" className="block transition hover:text-yellow-400">
                                Gallery
                            </a>
                            <a href="#contact" className="block transition hover:text-yellow-400">
                                Contact
                            </a>
                        </div>
                    </div>

                    <div>
                        <h5 className="mb-4 text-lg font-bold md:text-xl">Business Info</h5>
                        <div className="space-y-3 text-white/85">
                            <p>DTI Registered Catering Business</p>
                            <p>Dasmariñas City, Cavite</p>
                            <p>0917 679 0643</p>
                            <a
                                href="https://www.facebook.com/ebitscateringandservices"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-yellow-400 transition hover:text-yellow-300"
                            >
                                Visit Facebook Page
                            </a>
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-white/75">
                    © 2026 Ebit&apos;s Catering. All rights reserved.
                </div>
            </footer>

            <ChatBot />
        </div>
    );
}

export default Home;