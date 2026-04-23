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
  ArrowRight
} from 'lucide-react';

const BlogCard = ({ post }: { post: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <Link href={`/blog/${post.id}`} className="block">
      <div className="relative aspect-video overflow-hidden mb-6">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-[#D4AF37] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1">
          {post.category}
        </div>
      </div>
    </Link>
    <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
      <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
      <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
    </div>
    <Link href={`/blog/${post.id}`} className="block">
      <h3 className="text-xl text-[#1A1A1A] mb-3 line-clamp-2 transition-colors group-hover:text-[#D4AF37]" style={{ fontFamily: 'Playfair Display, serif' }}>
        {post.title}
      </h3>
    </Link>
    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {post.description}
    </p>
  </motion.div>
);

export default function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const featuredPost = {
    id: 12,
    category: "Xu hướng nội thất",
    title: "Nghệ thuật Minimalism trong thiết kế Biệt thự cao cấp 2026",
    description: "Khám phá cách sự tối giản không chỉ là bớt đi mà là sự chọn lọc tinh hoa nhất để tạo nên không gian sống đẳng cấp, tĩnh lặng và đầy cảm xúc cho gia chủ.",
    image: "https://images.unsplash.com/photo-1760072513442-9872656c1b07",
    date: "12/04/2026",
    author: "KTS. Lê Anh",
    views: "1,240"
  };

  const posts = [
    {
      id: 1,
      category: "Phong thủy",
      title: "Phong thủy phòng khách: Bí quyết thu hút tài lộc và bình an",
      description: "Sắp xếp không gian sống hài hòa theo các nguyên tắc phong thủy giúp dòng năng lượng luân chuyển tốt nhất.",
      image: "https://images.unsplash.com/photo-1758800600436-eca719abf40c",
      date: "10/04/2026",
      author: "Xpress Design",
      views: "850"
    },
    {
      id: 2,
      category: "Kiến thức xây dựng",
      title: "Quy trình thi công móng công trình: Những lưu ý quan trọng",
      description: "Nền móng là linh hồn của công trình. Tìm hiểu quy trình kỹ thuật đạt chuẩn để đảm bảo sự bền vững vượt thời gian.",
      image: "https://images.unsplash.com/photo-1721244654394-36a7bc2da288",
      date: "08/04/2026",
      author: "KS. Minh Tuấn",
      views: "1,120"
    },
    {
      id: 3,
      category: "Cảm hứng",
      title: "Bộ sưu tập nội thất Signature cho phòng ăn đẳng cấp",
      description: "Những mẫu bàn ăn và ghế với đường nét tinh xảo, chất liệu da cao cấp mang lại trải nghiệm ẩm thực hoàn hảo.",
      image: "https://images.unsplash.com/photo-1758855284310-ba961fb5fa2a",
      date: "05/04/2026",
      author: "Stylist Ngọc Hà",
      views: "640"
    },
    {
      id: 4,
      category: "Kiến thức xây dựng",
      title: "Giải pháp ánh sáng thông minh cho không gian Luxury",
      description: "Ánh sáng không chỉ để thắp sáng mà còn là công cụ tạo nên kịch bản không gian sống đầy nghệ thuật.",
      image: "https://images.unsplash.com/photo-1771858073810-e3568f605b35",
      date: "02/04/2026",
      author: "KTS. Quốc Bảo",
      views: "930"
    },
    {
      id: 5,
      category: "Cảm hứng",
      title: "Xu hướng Landscape 2026: Mang thiên nhiên vào biệt thự phố",
      description: "Tận dụng tối đa diện tích sân vườn nhỏ để tạo nên một hệ sinh thái xanh mát và riêng tư tuyệt đối.",
      image: "https://images.unsplash.com/photo-1760972543739-c1a033671d64",
      date: "28/03/2026",
      author: "KTS. Mai Lan",
      views: "780"
    },
    {
      id: 6,
      category: "Phong thủy",
      title: "Lựa chọn màu sắc hợp mệnh cho gia chủ mệnh Kim",
      description: "Tư vấn phối màu trắng sứ và vàng gold trong thiết kế nội thất để kích hoạt may mắn.",
      image: "https://images.unsplash.com/photo-1629813022755-f0df31416606",
      date: "25/03/2026",
      author: "Chuyên gia Phong Thủy",
      views: "1,500"
    }
  ];

  const popularPosts = [
    { id: 7, title: "Cách chọn vật liệu đá tự nhiên cho nội thất", image: "https://images.unsplash.com/photo-1771858073810-e3568f605b35" },
    { id: 8, title: "Cải tạo nhà phố cũ thành không gian Luxury", image: "https://images.unsplash.com/photo-1721244654394-36a7bc2da288" },
    { id: 9, title: "Mẫu phòng ngủ tối giản nhưng ấm cúng", image: "https://images.unsplash.com/photo-1758800600436-eca719abf40c" },
    { id: 10, title: "Kinh nghiệm chọn đơn vị thi công uy tín", image: "https://images.unsplash.com/photo-1758855284310-ba961fb5fa2a" },
    { id: 11, title: "Xu hướng gạch ốp lát khổ lớn 2026", image: "https://images.unsplash.com/photo-1760072513442-9872656c1b07" },
  ];

  const categories = [
    { name: "Xu hướng nội thất", count: 12 },
    { name: "Phong thủy", count: 8 },
    { name: "Kiến thức xây dựng", count: 15 },
    { name: "Cảm hứng", count: 20 },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[450px] pt-20 w-full flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1629813022755-f0df31416606"
          alt="Blog Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white mb-4"
            style={{ fontSize: '48px', fontFamily: 'Playfair Display, serif' }}
          >
            Cẩm nang
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center space-x-2 text-white/80 text-sm uppercase tracking-widest font-medium mb-6">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">Trang chủ</Link>
              <span className="text-[#D4AF37]">/</span>
              <span className="text-white">Cẩm nang</span>
            </div>
            <p className="text-white/80 uppercase tracking-[0.3em] text-xs font-bold">
              Kiến thức, xu hướng và bí quyết thiết kế
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-[#F8F9FA] py-8 border-b border-gray-100 sticky top-[80px] z-30 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 focus:border-[#D4AF37] outline-none transition-colors text-sm"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#D4AF37] cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <option>Tất cả danh mục</option>
                <option>Xu hướng nội thất</option>
                <option>Phong thủy</option>
                <option>Kiến thức xây dựng</option>
                <option>Cảm hứng</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 md:w-56">
              <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#D4AF37] cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <option>Mới nhất</option>
                <option>Xem nhiều nhất</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row bg-[#F8F9FA] overflow-hidden"
          >
            <div className="lg:w-3/5 relative h-[400px] lg:h-[500px] overflow-hidden group">
              <ImageWithFallback
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="lg:w-2/5 p-12 lg:p-16 flex flex-col justify-center">
              <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-6 block">
                {featuredPost.category}
              </span>
              <h2 className="text-3xl lg:text-4xl text-[#1A1A1A] mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                {featuredPost.title}
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {featuredPost.description}
              </p>
              <div className="flex items-center gap-6 text-[10px] text-gray-400 uppercase tracking-widest mb-10 font-semibold">
                <span className="flex items-center gap-2"><Calendar size={14} /> {featuredPost.date}</span>
                <span className="flex items-center gap-2"><User size={14} /> {featuredPost.author}</span>
              </div>
              <Link href={`/blog/${featuredPost.id}`} className="flex items-center text-[#D4AF37] text-xs uppercase tracking-widest font-bold group">
                Đọc bài viết ngay
                <ArrowRight size={18} className="ml-3 group-hover:translate-x-3 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content (Grid + Sidebar) */}
      <section className="pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Grid */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {posts.map((post, idx) => (
                  <BlogCard key={idx} post={post} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-20 flex justify-center gap-3">
                {[1, 2, 3, "..."].map((n, i) => (
                  <button 
                    key={i}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold border ${n === 1 ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-gray-200 text-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#D4AF37]'} transition-all`}
                  >
                    {n}
                  </button>
                ))}
                <button className="w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/3 space-y-16">
              {/* Popular Posts */}
              <div>
                <h4 className="text-xl mb-8 pb-4 border-b border-gray-100" style={{ fontFamily: 'Playfair Display, serif' }}>Bài viết phổ biến</h4>
                <div className="space-y-6">
                  {popularPosts.map((p, i) => (
                    <Link key={i} href={`/blog/${p.id}`} className="flex gap-4 group">
                      <div className="w-20 h-20 shrink-0 overflow-hidden">
                        <ImageWithFallback src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.title}</h5>
                        <span className="text-[10px] text-gray-400 mt-2 block uppercase tracking-tighter">Xem nhiều nhất</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xl mb-8 pb-4 border-b border-gray-100" style={{ fontFamily: 'Playfair Display, serif' }}>Chuyên mục</h4>
                <ul className="space-y-4">
                  {categories.map((cat, i) => (
                    <li key={i}>
                      <Link href="#" className="flex justify-between items-center text-sm text-gray-600 hover:text-[#D4AF37] transition-colors group">
                        <span style={{ fontFamily: 'Montserrat, sans-serif' }}>{cat.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">{cat.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Follow */}
              <div>
                <h4 className="text-xl mb-8 pb-4 border-b border-gray-100" style={{ fontFamily: 'Playfair Display, serif' }}>Theo dõi chúng tôi</h4>
                <div className="flex gap-4">
                  {[Facebook, Instagram, Youtube].map((Icon, i) => (
                    <button key={i} className="w-12 h-12 flex items-center justify-center border border-gray-200 text-[#1A1A1A] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white transition-all">
                      <Icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner CTA */}
              <div className="bg-[#1A1A1A] p-10 text-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 grayscale group-hover:scale-110 transition-transform duration-1000">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1721244654394-36a7bc2da288" alt="CTA BG" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-white text-2xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Bạn cần tư vấn?</h4>
                  <p className="text-white/50 text-xs mb-8 uppercase tracking-widest">Đội ngũ KTS sẵn sàng hỗ trợ bạn</p>
                  <button className="w-full py-4 border border-[#D4AF37] text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#D4AF37] hover:text-white transition-all">
                    Nhận tư vấn miễn phí
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Đăng ký nhận bản tin</h2>
            <p className="text-white/50 mb-12 text-sm uppercase tracking-widest">Cập nhật xu hướng & kiến trúc mỗi tháng</p>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Địa chỉ Email của bạn..."
                className="flex-1 px-8 py-5 bg-[#2A2A2A] border border-white/5 outline-none focus:border-[#D4AF37] transition-all text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
              <button className="bg-[#D4AF37] text-white px-12 py-5 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white hover:text-[#1A1A1A] transition-all duration-500">
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}