"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  Search, 
  ChevronDown, 
  Eye, 
  Calendar, 
  User, 
  Facebook, 
  Instagram, 
  Youtube,
  ArrowRight,
  Download,
  CheckCircle2,
  TrendingUp,
  Zap,
  Award,
  PlayCircle
} from 'lucide-react';

const BlogCard = ({ post }: { post: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="group flex flex-col h-full bg-white p-6 border border-transparent hover:border-[#D4AF37] hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] hover:scale-[1.02] transition-all duration-500"
  >
    <Link href={`/insights/${post.id}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden mb-6 -mx-6 -mt-6">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold px-3 py-1">
          {post.category}
        </div>
      </div>
    </Link>
    <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#D4AF37]" /> {post.date}</span>
      <span className="flex items-center gap-1.5"><User size={12} className="text-[#D4AF37]" /> {post.author}</span>
    </div>
    <Link href={`/insights/${post.id}`} className="block mb-3">
      <h3 className="text-[20px] md:text-[22px] leading-snug text-[#1A1A1A] line-clamp-2 transition-colors group-hover:text-[#D4AF37] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
        {post.title}
      </h3>
    </Link>
    <p className="text-[#4A4A4A] text-[14px] line-clamp-3 leading-[1.6] mb-6 font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {post.description}
    </p>
    <div className="mt-auto">
      <Link href={`/insights/${post.id}`} className="inline-flex items-center gap-2 text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#D4AF37] transition-colors pb-1 border-b border-[#1A1A1A] group-hover:border-[#D4AF37]">
        Đọc thêm <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
);

export default function Insights() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const featuredArticles = [
    {
      id: 101,
      category: "Nghiên cứu & Khảo sát",
      title: "Khảo sát 100 gia đình trẻ: Điều họ thực sự cần trong không gian sống",
      description: "Dữ liệu từ 100 dự án thực tế cho thấy: 78% ưu tiên không gian mở kết nối gia đình hơn là diện tích phòng ngủ cá nhân. Bài viết phân tích sâu sự dịch chuyển hành vi trong thiết kế nhà ở đô thị.",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMGhvbWV8ZW58MXx8fHwxNzc2MjQzMzUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "15/04/2026",
      author: "Phòng R&D XPRESS",
    },
    {
      id: 102,
      category: "Phân tích chuyên sâu",
      title: "Phân tích chi phí - lợi ích của giếng trời trong nhà phố ống",
      description: "Nhiều người e ngại giếng trời chiếm diện tích và gây thấm dột. Tuy nhiên, bài toán kinh tế cho thấy giếng trời giúp giảm 45% chi phí điện năng chiếu sáng và thông gió chỉ sau 3 năm vận hành.",
      image: "https://images.unsplash.com/photo-1699445226629-c420105feb07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMHNreWxpZ2h0fGVufDF8fHx8MTc3NjI0MzM1Mnww&ixlib=rb-4.1.0&q=80&w=1080",
      date: "12/04/2026",
      author: "KTS. Lê Anh",
    }
  ];

  const posts = [
    {
      id: 1,
      category: "Xu hướng thiết kế",
      title: "Kỷ nguyên của 'Quiet Luxury': Sự xa xỉ tĩnh lặng trong kiến trúc hiện đại",
      description: "Khám phá cách các vật liệu nguyên bản và ánh sáng tự nhiên thay thế cho những phô trương hào nhoáng, định hình lại định nghĩa về sự đẳng cấp.",
      image: "https://images.unsplash.com/photo-1772411650649-f88111bcb8a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWlldCUyMGx1eHVyeSUyMGxpdmluZyUyMHJvb20lMjBtaW5pbWFsJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3NjM1MTE2OHww&ixlib=rb-4.1.0&q=80&w=1080",
      date: "12/04/2026",
      author: "Phòng Thiết kế XPRESS"
    },
    {
      id: 2,
      category: "Xu hướng thiết kế",
      title: "Đưa thiên nhiên vào không gian sống: Hơn cả một xu hướng vật lý",
      description: "Phân tích triết lý thiết kế Biophilic, nơi ranh giới giữa kiến trúc nhân tạo và thảm thực vật tự nhiên được xóa nhòa để chữa lành tâm trí.",
      image: "https://images.unsplash.com/photo-1776071287160-41f4d3c3938c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9waGlsaWMlMjBkZXNpZ24lMjBpbnRlcmlvciUyMGFyY2hpdGVjdHVyZSUyMHBsYW50c3xlbnwxfHx8fDE3NzYzNTExNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "08/04/2026",
      author: "KTS. Lê Anh"
    },
    {
      id: 3,
      category: "Tối ưu không gian",
      title: "Nghệ thuật phân bổ không gian mở: Liền mạch nhưng vẫn riêng tư",
      description: "Giải pháp xử lý tỷ lệ và vật liệu chuyển tiếp thông minh, giúp các khu vực chức năng hòa quyện vào nhau mà không đánh mất đi đặc tính riêng.",
      image: "https://images.unsplash.com/photo-1605635543237-e9c8c472d09a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVuJTIwc3BhY2UlMjBtb2Rlcm4lMjBpbnRlcmlvciUyMHRyYW5zaXRpb258ZW58MXx8fHwxNzc2MzUxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "05/04/2026",
      author: "KTS. Quốc Bảo"
    },
    {
      id: 4,
      category: "Tối ưu không gian",
      title: "Ánh sáng như một loại vật liệu: Điêu khắc không gian bằng bóng tối",
      description: "Cách tối ưu hóa nguồn sáng tự nhiên và thiết kế chiếu sáng nhân tạo để tạo nên chiều sâu cảm xúc và định hình khối kiến trúc.",
      image: "https://images.unsplash.com/photo-1757213576539-3c1b5da81d5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBuYXR1cmFsJTIwbGlnaHQlMjBzaGFkb3clMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzYzNTEyNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "02/04/2026",
      author: "Chuyên gia Minh Tuấn"
    },
    {
      id: 5,
      category: "Trải nghiệm sống",
      title: "Kiến tạo 'Thánh địa cá nhân': Nơi kiến trúc ôm trọn những rung cảm",
      description: "Ngôi nhà đúng nghĩa không chỉ phục vụ sinh hoạt, mà là chốn phản chiếu nội tâm và nuôi dưỡng những trải nghiệm sống độc bản của gia chủ.",
      image: "https://images.unsplash.com/photo-1762199904064-56ddc38eda99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHNhbmN0dWFyeSUyMG1pbmltYWwlMjBiZWRyb29tfGVufDF8fHx8MTc3NjM1MTI1MXww&ixlib=rb-4.1.0&q=80&w=1080",
      date: "28/03/2026",
      author: "Stylist Ngọc Hà"
    },
    {
      id: 6,
      category: "Trải nghiệm sống",
      title: "Tâm lý học không gian: Tác động vô hình của kiến trúc đến cảm xúc",
      description: "Hiểu về cách mà tỷ lệ trần nhà, kết cấu bề mặt và bảng màu tĩnh lặng có thể xoa dịu sự căng thẳng và khơi gợi sự bình yên từ bên trong.",
      image: "https://images.unsplash.com/photo-1710000937663-057028309aa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6ZW4lMjBpbnRlcmlvciUyMHBzeWNob2xvZ3klMjBjb2xvcnxlbnwxfHx8fDE3NzYzNTEyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "25/03/2026",
      author: "Phòng R&D XPRESS"
    }
  ];

  const categories = [
    "Tất cả",
    "Xu hướng thiết kế",
    "Tối ưu không gian",
    "Trải nghiệm sống"
  ];

  return (
    <div className="bg-white w-full">
      {/* 1. Hero Section (Upgraded) */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758565811522-86b7ba4d5300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMHBvb2wlMjBvcGVuJTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3NzYyNDMxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Insights Hero"
            className="w-full h-full object-cover scale-105 opacity-40 mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <motion.div
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            <span className="text-[#D4AF37] text-[12px] uppercase tracking-[0.3em] font-bold mb-6 block">
              Thought Leadership
            </span>
            <h1 className="text-white mb-8 text-[40px] md:text-[56px] leading-[1.2] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
              Góc nhìn — <br className="hidden md:block" />Kiến tạo không gian bền vững
            </h1>
            <p className="text-white/80 text-[16px] md:text-[18px] leading-[1.8] font-light max-w-3xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Nghiên cứu, xu hướng và kiến thức chuyên sâu từ đội ngũ kiến trúc sư của XPRESS DESIGN. Chúng tôi không chỉ thiết kế không gian, chúng tôi kiến tạo giá trị.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Filter Bar */}
      <section className="bg-white py-6 border-b border-gray-100 sticky top-[80px] z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 md:gap-6 text-[11px] uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`pb-1 px-2 transition-colors ${
                  activeCategory === cat 
                    ? "text-[#1A1A1A] border-b-2 border-[#D4AF37]" 
                    : "text-gray-400 hover:text-[#1A1A1A] border-b-2 border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64 mt-4 md:mt-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent focus:border-[#D4AF37] outline-none transition-colors text-[13px] rounded-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
        </div>
      </section>

      {/* 3. Báo cáo đặc biệt (Feature Report) */}
      <section className="py-20 md:py-24 bg-white relative z-30">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-[#1A1A1A] flex flex-col lg:flex-row overflow-hidden shadow-2xl"
          >
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 px-4 py-2 w-max">
                BÁO CÁO ĐẶC BIỆT
              </div>
              
              <h2 className="text-3xl md:text-[40px] text-white mb-6 leading-[1.2] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                Báo cáo Xu hướng Nội thất 2026
              </h2>
              
              <p className="text-white/70 text-[15px] mb-10 leading-[1.8] font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                15 xu hướng thiết kế nội thất nổi bật, phân tích từ 200+ dự án
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 relative z-10">
                <div className="flex-1 relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn..."
                    className="w-full bg-white/5 border border-white/20 text-white px-6 py-4 outline-none focus:border-[#D4AF37] transition-colors text-[14px] font-light placeholder:text-white/40"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-[#D4AF37] text-[#1A1A1A] px-8 py-4 uppercase tracking-[0.15em] text-[12px] font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isSubscribed ? <CheckCircle2 size={16} /> : <Download size={16} />}
                  {isSubscribed ? "Đã gửi qua Email" : "Tải báo cáo miễn phí"}
                </button>
              </form>
              <p className="text-white/40 text-[11px] mt-4 font-light flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <CheckCircle2 size={12} className="text-[#D4AF37]" /> Cam kết không spam, tài liệu sẽ được gửi trực tiếp qua email.
              </p>
            </div>
            
            <div className="lg:w-1/2 relative h-[400px] lg:h-auto bg-[#2A2A2A]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc3NjI0MzM1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Report Cover"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
              />
              {/* Mockup Book UI Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="w-[280px] h-[380px] bg-white shadow-2xl flex flex-col border-l-[12px] border-[#1A1A1A] relative rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out origin-bottom-left cursor-pointer">
                  <div className="p-8 flex flex-col h-full bg-[#F8F9FA]">
                    <span className="text-[#D4AF37] text-[8px] font-bold tracking-[0.2em] mb-4">XPRESS DESIGN</span>
                    <h3 className="font-['Playfair_Display',serif] text-2xl text-[#1A1A1A] leading-tight mb-auto">
                      Trend Report:<br/>Living Space 2026
                    </h3>
                    <div className="w-8 h-[2px] bg-[#D4AF37] mt-8" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Bài viết nổi bật (Featured Articles) */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-12">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <h2 className="text-[28px] md:text-3xl text-[#1A1A1A] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
              Tiêu điểm chuyên môn
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {featuredArticles.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="group flex flex-col h-full bg-white p-6 border border-transparent hover:border-[#D4AF37] hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] hover:scale-[1.02] transition-all duration-500"
              >
                <Link href={`/insights/${article.id}`} className="block overflow-hidden mb-8 relative aspect-[16/9] -mx-6 -mt-6">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 bg-white text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold px-4 py-2 shadow-lg">
                    {article.category}
                  </div>
                </Link>
                
                <div className="flex items-center gap-4 text-[11px] text-gray-400 uppercase tracking-widest mb-4 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#D4AF37]" /> {article.date}</span>
                  <span className="flex items-center gap-1.5"><User size={14} className="text-[#D4AF37]" /> {article.author}</span>
                </div>
                
                <Link href={`/insights/${article.id}`} className="block mb-4">
                  <h3 className="text-[24px] md:text-[28px] leading-[1.3] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {article.title}
                  </h3>
                </Link>
                
                <p className="text-[#4A4A4A] text-[15px] leading-[1.7] mb-8 font-light line-clamp-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {article.description}
                </p>
                
                <div className="mt-auto">
                  <Link href={`/insights/${article.id}`} className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#D4AF37] transition-colors group/btn">
                    Đọc bài viết <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Nghiên cứu & Dữ liệu (Research & Data) */}
      <section className="py-24 bg-[#F8F9FA] border-y border-gray-200 my-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#D4AF37] text-[11px] uppercase tracking-[0.2em] font-bold mb-4 block">
              Hiệu quả được chứng minh
            </span>
            <h2 className="text-[28px] md:text-[36px] text-[#1A1A1A] leading-[1.2] font-medium mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nghiên cứu của chúng tôi —<br/>Dữ liệu từ 200+ dự án thực tế
            </h2>
            <p className="text-[#4A4A4A] text-[15px] font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Tại XPRESS DESIGN, mọi giải pháp thiết kế đều được xây dựng dựa trên sự thấu hiểu nhu cầu thực tế và được chứng minh bằng các chỉ số đo lường hiệu năng rõ ràng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, value: "92%", text: "Khách hàng hài lòng với giải pháp ánh sáng" },
              { icon: Zap, value: "35%", text: "Tiết kiệm trung bình 35% điện năng" },
              { icon: CheckCircle2, value: "100%", text: "Dự án bàn giao đúng tiến độ" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 border-t-4 border-transparent hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 group"
              >
                <stat.icon size={32} className="text-[#D4AF37] mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <h3 className="text-4xl text-[#1A1A1A] font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>{stat.value}</h3>
                <p className="text-[#4A4A4A] text-[13px] leading-relaxed font-medium uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stat.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Tất cả bài viết (All Articles) */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              <h2 className="text-[28px] md:text-3xl text-[#1A1A1A] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                Thư viện kiến thức
              </h2>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-colors"><ArrowRight size={16} className="rotate-180" /></button>
              <button className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-colors"><ArrowRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex justify-center gap-2">
            {[1, 2, 3, "..."].map((n, i) => (
              <button 
                key={i}
                className={`w-12 h-12 flex items-center justify-center text-[13px] font-bold ${n === 1 ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white'} transition-colors`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {n}
              </button>
            ))}
            <button className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-[#D4AF37] hover:text-white transition-colors">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Video Webinar Section */}
      <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-[#D4AF37]/30 px-3 py-1">
                <PlayCircle size={14} /> XPRESS Masterclass
              </span>
              <h2 className="text-[32px] md:text-[40px] leading-[1.2] font-medium mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Webinar: Nghệ thuật tổ chức không gian mở cho Biệt thự phố
              </h2>
              <p className="text-white/70 text-[15px] font-light leading-[1.8] mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Trong số XPRESS Masterclass tháng này, KTS trưởng Lê Anh sẽ chia sẻ bí quyết giải quyết bài toán "kết nối nhưng vẫn riêng tư" - một trong những thách thức lớn nhất khi thiết kế không gian mở cho các căn biệt thự có diện tích hạn chế tại trung tâm thành phố.
              </p>
              <div className="flex flex-wrap gap-6 text-[12px] font-medium tracking-wider mb-10 text-white/90">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-[#D4AF37]" /> Thời lượng: 12 phút</span>
                <span className="flex items-center gap-2"><User size={16} className="text-[#D4AF37]" /> Diễn giả: KTS Lê Anh</span>
              </div>
              <button className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] px-8 py-4 uppercase tracking-[0.15em] text-[12px] font-bold transition-all duration-300">
                Xem toàn bộ series
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative aspect-video bg-black cursor-pointer group"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
                alt="Webinar Thumbnail"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center pl-1 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <PlayCircle size={40} strokeWidth={1.5} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-[1440px] mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[32px] md:text-[40px] text-white mb-4 font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>Đăng ký nhận bản tin — Cập nhật xu hướng mỗi tháng</h2>
            <p className="text-white/60 mb-12 text-[14px] uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Đừng bỏ lỡ những chia sẻ chuyên môn từ các chuyên gia.</p>
            <form className="flex flex-col gap-4" onSubmit={handleSubscribe}>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  required
                  placeholder="Họ tên của bạn..."
                  className="flex-1 px-8 py-4 bg-[#2A2A2A] border border-white/10 outline-none focus:border-[#D4AF37] text-white text-[14px] transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
                <input 
                  type="email" 
                  required
                  placeholder="Địa chỉ Email..."
                  className="flex-1 px-8 py-4 bg-[#2A2A2A] border border-white/10 outline-none focus:border-[#D4AF37] text-white text-[14px] transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
              </div>
              <button className="bg-[#D4AF37] text-[#1A1A1A] w-full px-10 py-5 uppercase tracking-[0.2em] text-[12px] font-bold hover:bg-white transition-all duration-300">
                Đăng ký
              </button>
            </form>
            <p className="text-white/40 text-[11px] mt-6 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Bằng việc đăng ký, bạn đồng ý nhận email từ XPRESS DESIGN. Bạn có thể hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}