"use client";

import React from 'react';
import { motion } from 'motion/react';

const partners = [
  "LUXURY STONE", "DORNBRACHT", "GAGGENAU", "RIMADESIO", "MOLTENI&C", "POLIFORM"
];

export const Partners: React.FC = () => {
  return (
    <section className="bg-white py-24 md:py-32 border-b border-gray-100 px-6 overflow-hidden">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-[#1A1A1A] mb-4 uppercase tracking-[0.2em]"
            style={{ fontSize: '18px', fontFamily: 'Montserrat, sans-serif' }}
          >
            Đối tác tin cậy
          </h2>
          <div className="w-12 h-[2px] bg-[#D4AF37] mx-auto opacity-50" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center">
          {partners.map((partner, index) => (
            <motion.div 
              key={partner}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group flex justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-40 hover:opacity-100"
            >
              <div 
                className="text-2xl font-bold tracking-[0.1em] text-[#1A1A1A] text-center"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {partner}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};