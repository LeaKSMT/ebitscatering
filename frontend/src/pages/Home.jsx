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
            className="mb-10 text-center md:mb-12"
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/60 md:text-xs">
                {eyebrow}
            </p>
            <h3 className="mt-3 text-[30px] font-bold leading-tight text-[#0b4d3b] sm:text-[38px] md:text-[46px]">
                {title} <span className="text-[#d4a514]">{highlight}</span>
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 md:text-[16px]">
                {desc}
            </p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#f8f7f2] text-green-950">
            <nav className="sticky top-0 z-50 flex h-[82px] items-center justify-between border-b border-white/10 bg-[#0b4d3b]/88 px-5 text-white shadow-sm backdrop-blur-md md:px-10 lg:px-14">
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
                        className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-white hover:text-[#0b4d3b]"
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
                <div className="sticky top-[78px] z-40 border-t border-white/10 bg-[#0b4d3b] px-5 py-4 shadow-md md:hidden">
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
                className="scroll-mt-24 relative flex min-h-[700px] items-center overflow-hidden md:min-h-[820px] md:scroll-mt-28"
                style={{
                    backgroundImage: `url(${hero})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-[#0b4d3b]/76" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#06241d]/35 via-[#0b4d3b]/54 to-[#061f19]/92" />
                <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-200/10 blur-3xl" />
                <div className="absolute right-1/3 top-16 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

                <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-12">
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
                            className="text-[38px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[54px] md:text-[72px]"
                        >
                            Luxury Catering
                            <br />
                            Crafted for
                            <br />
                            <span className="text-yellow-400">Special Moments</span>
                        </motion.h2>

                        <motion.p
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            variants={fadeUp}
                            className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-white/88 md:text-[17px] lg:mx-0"
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
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-[#0b4d3b] shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#fff8e6]"
                            >
                                View Packages
                                <ChevronRight size={18} />
                            </Link>

                            <button
                                onClick={handleGetQuotation}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3.5 font-semibold text-green-950 shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-yellow-300"
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
                                    className="rounded-[22px] border border-white/12 bg-white/10 px-5 py-4 text-left backdrop-blur-md"
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
                        <div className="relative mx-auto max-w-[455px] rounded-[34px] border border-white/10 bg-white/10 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                            <div className="rounded-[28px] bg-gradient-to-br from-[#114f3d] via-[#0b4d3b] to-[#072e24] p-7 text-white">
                                <div className="mb-7 flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.34em] text-white/60">
                                            Signature Experience
                                        </p>
                                        <h3 className="mt-3 text-[28px] font-bold leading-tight">
                                            Ebit&apos;s Premium Service
                                        </h3>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-yellow-400">
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
                                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 p-4"
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

                                <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                                        Best for
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white/92">
                                        Weddings • Debuts • Birthdays • Anniversaries
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-[#f8f7f2] px-5 py-16 md:px-10 md:py-20 lg:px-20">
                {sectionTitle(
                    "What We Offer",
                    "Our",
                    "Services",
                    "Everything you need for a memorable and stress-free celebration."
                )}

                <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {services.map((item, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            custom={index}
                            variants={fadeUp}
                            className="group rounded-[30px] border border-[#ece6d8] bg-white px-6 py-7 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                        >
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#c99d1a] transition group-hover:bg-[#0b4d3b] group-hover:text-white">
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
                </div>
            </section>

            <section className="bg-[#f8f7f2] px-5 pb-16 md:px-10 md:pb-20 lg:px-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={softScale}
                    className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0d5a43] via-[#0b4d3b] to-[#082f25] p-7 text-white shadow-[0_26px_52px_rgba(0,0,0,0.15)] md:p-10"
                >
                    <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-yellow-300/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative z-10 mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:text-xs">
                                Featured Selection
                            </p>
                            <h3 className="mt-3 text-[30px] font-bold leading-tight md:text-[42px]">
                                Signature <span className="text-yellow-400">Packages</span>
                            </h3>
                            <p className="mt-4 text-[15px] leading-7 text-white/80 md:text-[16px]">
                                Discover our most requested packages designed for refined,
                                memorable, and beautifully organized celebrations.
                            </p>
                        </div>

                        <Link
                            to="/packages"
                            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-[#0b4d3b] transition hover:bg-[#fff8e6]"
                        >
                            See All Packages
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="relative z-10 grid gap-5 lg:grid-cols-3">
                        {featuredPackages.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                custom={index}
                                variants={fadeUp}
                                className={`rounded-[30px] border bg-[#fffdf8] p-6 text-[#0b4d3b] shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl ${index === 1
                                        ? "border-[#e4bc41] ring-1 ring-[#e4bc41]/30"
                                        : "border-transparent"
                                    }`}
                            >
                                {index === 1 && (
                                    <div className="mb-4 inline-flex rounded-full bg-[#fff3c8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b7510]">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b4d3b]/55">
                                            {item.category}
                                        </p>
                                        <h4 className="mt-3 text-[21px] font-extrabold leading-tight md:text-[23px]">
                                            {item.title}
                                        </h4>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-[22px] font-extrabold text-[#d1a31d] md:text-[25px]">
                                            {item.price}
                                        </p>
                                        <p className="text-sm text-slate-500">{item.pax}</p>
                                    </div>
                                </div>

                                <div className="mb-4 mt-4 h-[3px] w-12 rounded-full bg-[#d1a31d]" />

                                <p className="min-h-[92px] text-[15px] leading-7 text-slate-600">
                                    {item.desc}
                                </p>

                                <button
                                    onClick={() => handlePackageQuote(item)}
                                    className="mt-5 inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-[#0b4d3b] transition hover:bg-yellow-300"
                                >
                                    Get Quotation
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            <section
                id="about"
                className="scroll-mt-24 bg-[#0c5a43] px-5 py-16 text-white md:scroll-mt-28 md:px-10 md:py-20 lg:px-20"
            >
                <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:text-xs">
                            About Us
                        </p>
                        <h3 className="mt-3 mb-6 text-[30px] font-bold leading-tight md:text-[42px]">
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
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={softScale}
                        className="relative"
                    >
                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
                            <img
                                src={gal2}
                                alt="Ebit's Catering event setup"
                                className="h-[320px] w-full object-cover md:h-[430px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b4d3b]/82 via-transparent to-transparent" />
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

                <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
                    {reasons.map((item, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            custom={index}
                            variants={fadeUp}
                            className="group rounded-[28px] border border-[#ece6d8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#c99d1a] transition group-hover:bg-[#0b4d3b] group-hover:text-white">
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
                </div>
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

                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
                    {galleryItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            custom={index}
                            variants={fadeUp}
                            className="group relative overflow-hidden rounded-[30px] shadow-md"
                        >
                            <img
                                src={item.src}
                                alt={item.title}
                                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 md:h-72"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-base font-semibold text-white md:text-lg">
                                    {item.title}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
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

                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                        className="space-y-5"
                    >
                        <div className="rounded-[28px] border border-[#ece6d8] bg-white p-5 shadow-sm">
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

                        <div className="rounded-[28px] border border-[#ece6d8] bg-white p-5 shadow-sm">
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

                        <div className="rounded-[28px] border border-[#ece6d8] bg-white p-5 shadow-sm">
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
                                        className="inline-flex items-center gap-2 rounded-2xl bg-[#fbf4df] px-4 py-2.5 font-semibold text-[#0b4d3b] transition hover:bg-yellow-400 hover:text-green-950"
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
                        className="rounded-[30px] border border-[#ece6d8] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                    >
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
                            className="mb-4 w-full rounded-2xl border border-[#d8d2c7] px-4 py-3.5 outline-none transition focus:border-yellow-400"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={contactForm.email}
                            onChange={handleContactChange}
                            className="mb-4 w-full rounded-2xl border border-[#d8d2c7] px-4 py-3.5 outline-none transition focus:border-yellow-400"
                        />

                        <textarea
                            name="message"
                            placeholder="Your Message"
                            rows="5"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            className="mb-4 w-full resize-none rounded-2xl border border-[#d8d2c7] px-4 py-3.5 outline-none transition focus:border-yellow-400"
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
                            className="w-full rounded-2xl bg-yellow-400 py-3.5 font-semibold text-green-950 transition hover:bg-yellow-300"
                        >
                            Send Message
                        </button>
                    </motion.form>
                </div>
            </section>

            <footer className="bg-[#0c5a43] px-5 py-12 text-white md:px-10 lg:px-20">
                <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
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

                <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-white/75">
                    © 2026 Ebit&apos;s Catering. All rights reserved.
                </div>
            </footer>

            <ChatBot />
        </div>
    );
}

export default Home;