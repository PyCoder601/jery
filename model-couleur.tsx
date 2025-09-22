"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {LogIn} from "lucide-react";
import Header from "@/ui/Header";
import {useSelector} from "react-redux";
import {selectDarkMode} from "@/redux/uiSlice";
import Footer from "@/ui/Footer";
import Link from "next/link";

export default function Home() {
    const darkMode = useSelector(selectDarkMode);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return (
        <main
            className={`flex flex-col min-h-screen ${darkMode ? "bg-gradient-to-br from-[#111b21] " +
                "to-[#202c33] text-white" : "bg-gradient-to-br from-gray-100" +
                " to-gray-200 text-gray-800"} transition-colors duration-300`}
        >
            <Header/>
            {/* Hero Section */}
            <section className="flex flex-col md:flex-row items-center justify-between
            px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20 max-w-7xl xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
                <motion.div
                    className="md:w-1/2 space-y-6 text-center md:text-left"
                    initial={{opacity: 0, x: -50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.5}}
                >
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight
                    bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
                        Messagerie instantanée, simple et rapide.
                    </h1>
                    <p
                        className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-500"}`}
                    >
                        Discutez en temps réel avec vos contacts, en toute simplicité.
                    </p>
                    <div className="space-x-4 flex">
                        {isMobile ? (
                            <p className="text-red-500 font-bold">
                                Vous ne pouvez pas faire du login sur mobile (Même whatsApp ne fait pas une version web
                                pour les mobiles 😄️)
                            </p>
                        ) : (
                            <motion.button
                                className={`bg-gradient-to-r from-teal-500 to-green-600 text-white px-8 
                                py-4 rounded-full font-semibold shadow-lg hover:shadow-xl
                                 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                                <LogIn size={20}/>
                                <Link href={"/login"}>Commencer à discuter</Link>
                            </motion.button>
                        )}
                    </div>
                </motion.div>
                <motion.div
                    className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.7, type: "spring", stiffness: 100}}
                >
                    <div
                        className="relative w-full md:w-[400px] h-[300px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[550px] xl:h-[550px]">
                        <div
                            className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-green-600
                             rounded-full blur-2xl opacity-30"></div>
                        <Image
                            src="/mp.png"
                            alt="WhatsApp mockup"
                            fill
                            className="rounded-lg shadow-2xl relative z-10 object-contain"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <Footer darkMode={darkMode}/>
        </main>
    );
}