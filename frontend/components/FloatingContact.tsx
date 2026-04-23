"use client";

import { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function FloatingContact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Thêm delay nhẹ để fade-in mượt mà hơn khi vừa load xong trang
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Nút Hotline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-[90px] right-5 z-40 group"
      >
        {/* Tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-['Montserrat',sans-serif] whitespace-nowrap rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          Gọi ngay
          {/* Mũi tên tooltip */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-[#1A1A1A]"></div>
        </div>
        
        <a 
          href="tel:0900123456" 
          className="w-12 h-12 md:w-14 md:h-14 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#b0902c] hover:scale-105 transition-all duration-300"
          aria-label="Gọi Hotline"
        >
          <Phone size={24} fill="currentColor" />
        </a>
      </motion.div>

      {/* Nút Zalo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="fixed bottom-5 right-5 z-40 group"
      >
        {/* Tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-['Montserrat',sans-serif] whitespace-nowrap rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          Chat Zalo
          {/* Mũi tên tooltip */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-[#1A1A1A]"></div>
        </div>
        
        <a 
          href="https://zalo.me/0900123456" 
          target="_blank" 
          rel="noreferrer"
          className="w-12 h-12 md:w-14 md:h-14 bg-[#0068FF] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#0055d4] hover:scale-105 transition-all duration-300"
          aria-label="Chat Zalo"
        >
          <span className="font-bold text-xl">Z</span>
        </a>
      </motion.div>
    </>
  );
}