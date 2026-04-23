"use client";

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4">
      {/* Zalo Button (Using MessageCircle as icon) */}
      <a 
        href="https://zalo.me/yourid" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#0068FF] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 relative group"
      >
        <MessageCircle size={30} fill="white" />
        <span className="absolute right-full mr-4 bg-white text-[#0068FF] px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg translate-x-4 group-hover:translate-x-0">
          Chat Zalo
        </span>
      </a>

      {/* Hotline Button */}
      <a 
        href="tel:0987654321" 
        className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#1A1A1A] shadow-2xl hover:scale-110 transition-all duration-300 relative group animate-bounce"
      >
        <Phone size={30} />
        <span className="absolute right-full mr-4 bg-white text-[#1A1A1A] px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg translate-x-4 group-hover:translate-x-0">
          Hotline: 0987.654.321
        </span>
      </a>
    </div>
  );
};