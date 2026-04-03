import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import hero from "../assets/hero.jpg";
import ChatBot from "../components/ChatBot";
import gal1 from "../assets/gal1.jpg";
import gal2 from "../assets/gal2.jpg";
import gal3 from "../assets/gal3.jpg";

import { UtensilsCrossed, CalendarDays, Award, Users } from "lucide-react";

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

        if (contactStatus) {
            setContactStatus("");
        }
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
        `transition px-1 pb-1 border-b-2 font-medium ${isActive
            ? "text-[#f5c94a] border-[#f5c94a]"
            : "text-white border-transparent hover:text-[#f5c94a] hover:border-[#f5c94a]"
        }`;

    return (
        <div className="min-h-screen bg-gray-100 text-green-950">
            <nav className="bg-[#0b4d3b] text-white h-[86px] px-8 md:px-14 flex items-center justify-between sticky top-0 z-50">
                <div className="leading-none">
                    <h1 className="text-[26px] font-bold text-yellow-400">
                        Ebit&apos;s Catering
                    </h1>
                    <p className="text-[13px] text-white mt-1">
                        For making parties better
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-7 text-[16px]">
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
                        className="border border-white text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-white hover:text-[#0b4d3b] transition"
                    >
                        Login
                    </Link>
                </div>
            </nav>

            <section
                id="home"
                className="relative h-[555px] md:h-[590px] flex items-center justify-center text-center overflow-hidden"
                style={{
                    backgroundImage: `url(${hero})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-[#0b4d3b]/58" />

                <div className="relative z-10 max-w-[860px] px-6">
                    <h2 className="text-white font-extrabold leading-[1.05] text-[54px] md:text-[68px]">
                        <span className="text-yellow-400">Premium Catering</span> for
                        <br />
                        Unforgettable Moments
                    </h2>

                    <p className="mt-6 text-white text-[18px] md:text-[20px] leading-[1.45] max-w-[900px] mx-auto">
                        Fresh, Clean and Tasty. Serving excellence for your weddings,
                        debuts, and celebrations.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            to="/packages"
                            className="bg-yellow-400 text-green-950 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
                        >
                            View Packages
                        </Link>

                        <button
                            onClick={handleGetQuotation}
                            className="bg-yellow-400 text-green-950 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
                        >
                            Get Quotation
                        </button>
                    </div>
                </div>
            </section>

            <section className="px-8 md:px-20 py-20 bg-gray-100">
                <div className="text-center mb-14">
                    <h3 className="text-[52px] font-bold text-green-950">
                        Our <span className="text-yellow-500">Services</span>
                    </h3>
                    <p className="text-[18px] text-slate-500 mt-4">
                        Everything you need for your perfect celebration
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 max-w-[1500px] mx-auto">
                    {[
                        {
                            title: "Premium Catering",
                            text: "Fresh and delicious menu options for all event types",
                            icon: <UtensilsCrossed className="w-8 h-8 text-yellow-600" />,
                        },
                        {
                            title: "Event Planning",
                            text: "Complete coordination for weddings, debuts, and more",
                            icon: <CalendarDays className="w-8 h-8 text-yellow-600" />,
                        },
                        {
                            title: "Premium Decorations",
                            text: "Elegant themes tailored to your vision",
                            icon: <Award className="w-8 h-8 text-yellow-600" />,
                        },
                        {
                            title: "Professional Staff",
                            text: "Experienced team dedicated to your satisfaction",
                            icon: <Users className="w-8 h-8 text-yellow-600" />,
                        },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-[24px] px-8 py-10 text-center shadow-sm"
                        >
                            <div className="w-16 h-16 mx-auto rounded-full bg-[#f8f3df] flex items-center justify-center mb-6">
                                {item.icon}
                            </div>

                            <h4 className="text-[24px] font-bold text-green-950 leading-tight mb-4">
                                {item.title}
                            </h4>

                            <p className="text-[16px] leading-8 text-slate-600">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section
                id="about"
                className="bg-[#0b4d3b] text-white px-8 md:px-20 py-24"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-4xl">
                        <h3 className="text-[48px] md:text-[56px] font-bold leading-tight mb-8">
                            About <span className="text-yellow-400">Ebit&apos;s Catering</span>
                        </h3>

                        <p className="text-[18px] md:text-[20px] leading-9 text-white/90 mb-6">
                            A DTI registered catering business dedicated to making your
                            parties better with fresh, clean, and tasty food.
                        </p>

                        <p className="text-[18px] md:text-[20px] leading-9 text-white/90 mb-8">
                            We specialize in weddings, debuts, birthdays, anniversaries,
                            and baptismal celebrations, bringing years of experience and
                            passion to every event.
                        </p>

                        <div className="space-y-3 text-[17px] md:text-[18px] text-white/90">
                            <p>• DTI Registered Business</p>
                            <p>• Experienced Professional Team</p>
                            <p>• Fresh & Quality Ingredients</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="gallery" className="px-8 md:px-20 py-20 bg-gray-100">
                <div className="text-center mb-14">
                    <h3 className="text-5xl font-bold text-green-950">
                        Our <span className="text-yellow-500">Gallery</span>
                    </h3>
                    <p className="text-xl text-slate-600 mt-4">
                        Recent events we&apos;ve catered
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="overflow-hidden rounded-3xl shadow-md group">
                        <img
                            src={gal1}
                            alt="Gallery 1"
                            className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
                        />
                    </div>

                    <div className="overflow-hidden rounded-3xl shadow-md group">
                        <img
                            src={gal2}
                            alt="Gallery 2"
                            className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
                        />
                    </div>

                    <div className="overflow-hidden rounded-3xl shadow-md group">
                        <img
                            src={gal3}
                            alt="Gallery 3"
                            className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
                        />
                    </div>
                </div>
            </section>

            <section id="contact" className="px-8 md:px-20 py-20 bg-gray-100">
                <div className="text-center mb-14">
                    <h3 className="text-5xl font-bold">
                        Get in <span className="text-yellow-500">Touch</span>
                    </h3>
                    <p className="text-xl text-slate-600 mt-4">
                        We&apos;d love to hear from you
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    <div className="space-y-6">
                        <div className="bg-white border rounded-3xl p-6">
                            <h4 className="text-2xl font-bold mb-2">Phone</h4>
                            <p className="text-lg text-slate-600">0917 679 0643</p>
                        </div>

                        <div className="bg-white border rounded-3xl p-6">
                            <h4 className="text-2xl font-bold mb-2">Address</h4>
                            <p className="text-lg text-slate-600">
                                Blk 5 Lot 14 Tierra Verde Residences
                                <br />
                                Burol 3, Dasmariñas City, Cavite
                            </p>
                        </div>

                        <div className="bg-white border rounded-3xl p-6">
                            <h4 className="text-2xl font-bold mb-2">Facebook</h4>

                            <a
                                href="https://www.facebook.com/ebitscateringandservices"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 px-4 py-2 bg-[#f8f3df] text-[#0b4d3b] rounded-xl font-semibold hover:bg-yellow-400 hover:text-green-950 transition"
                            >
                                Visit our Facebook Page
                            </a>
                        </div>
                    </div>

                    <form
                        onSubmit={handleContactSubmit}
                        className="bg-white border rounded-3xl p-6"
                    >
                        <h4 className="text-3xl font-bold mb-6">Send us a message</h4>

                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={contactForm.name}
                            onChange={handleContactChange}
                            className="w-full border rounded-xl px-4 py-3 mb-4 outline-none focus:border-yellow-400"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={contactForm.email}
                            onChange={handleContactChange}
                            className="w-full border rounded-xl px-4 py-3 mb-4 outline-none focus:border-yellow-400"
                        />

                        <textarea
                            name="message"
                            placeholder="Your Message"
                            rows="6"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            className="w-full border rounded-xl px-4 py-3 mb-4 outline-none focus:border-yellow-400"
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
                            className="w-full bg-yellow-400 text-green-950 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </section>

            <footer className="bg-[#0b4d3b] text-white text-center py-10 px-6">
                <h4 className="text-4xl font-bold text-yellow-400 mb-3">
                    Ebit&apos;s Catering and Services
                </h4>
                <p className="text-lg mb-2">
                    For making parties better. Fresh, Clean and Tasty.
                </p>
                <p className="text-base mb-2">DTI Registered Catering Business</p>
                <p className="text-base">© 2026 Ebit&apos;s Catering. All rights reserved.</p>
            </footer>

            <ChatBot />
        </div>
    );
}

export default Home;