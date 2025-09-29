"use client";
import React from "react";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col items-center justify-center text-white"
    >
      <h1 className="mb-8 text-3xl font-bold">About Jery</h1>
      <div className="w-full max-w-md text-center">
        <p className="text-lg text-gray-300">
          Jery is a modern, lightweight server monitoring solution designed to
          give you real-time insights into your infrastructure.
        </p>
        <p className="mt-4 text-lg text-gray-300">
          It provides a terminal-based interface to interact with your servers,
          check metrics, and manage your services.
        </p>
      </div>
    </motion.div>
  );
};

export default AboutPage;
