"use client";

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  Calendar, 
  User, 
  Clock, 
  ChevronRight, 
  Check, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Share2, 
  MessageSquare,
  ArrowRight,
  Instagram,
  Youtube
} from 'lucide-react';

const Breadcrumb = ({ category }: { category: string }) => (
  <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
    <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
    <ChevronRight size={10} />
    <Link href="/blog" className="hover:text-white transition-colors">Cẩm nang</Link>
    <ChevronRight size={10} />
    <span className="text-white">{category}</span>
  </nav>
);

const RelatedPostCard = ({ post }: { post: any }) => (
  <Link href={`/blog/${post.id}`} className="flex gap-4 group">
    <div className="w-16 h-16 shrink-0 overflow-hidden">
      <ImageWithFallback src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="flex flex-col justify-center">
      <h5 className="text-xs font-bold text-[#1A1A1A] line-clamp-2 leading-tight group-hover:text-[#D4AF37] transition-colors mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{post.title}</h5>
      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{post.date}</span>
    </div>
  </Link>
);

export default function BlogPostDetailClient({ id }: { id: string }) {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Mock data for a single post
  const post = {
    title: "Nghệ thuật Minimalism trong thiết kế Biệt thự cao cấp 2026",
    category: "Xu hướng nội thất",
    author: "KTS. Nguyễn Văn A",
    authorTitle: "Kiến trúc sư trưởng tại XPRESS DESIGN",
    authorAvatar: "https://images.unsplash.com/photo-1624817184977-3560d3b13d9b",
    authorDesc: "Với hơn 15 năm kinh nghiệm trong lĩnh vực kiến trúc Luxury, KTS. Nguyễn Văn A luôn tìm kiếm sự cân bằng hoàn hảo giữa công năng và tính nghệ thuật tối giản.",
    date: "15/04/2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1760623128588-3a0ad5693205",
    content: `
      Nghệ thuật tối giản (Minimalism) không chỉ là một phong cách thiết kế, mà còn là một triết lý sống. Trong bối cảnh kiến trúc hiện đại năm 2026, Minimalism đang chuyển mình mạnh mẽ, đặc biệt là trong các dự án biệt thự cao cấp. Không còn là sự khô khan, Minimalism giờ đây gắn liền với sự ấm áp, tinh tế và đẳng cấp vượt thời gian.

      Sự tối giản không có nghĩa là loại bỏ mọi thứ, mà là sự chọn lọc tinh hoa nhất để tạo nên không gian sống tĩnh lặng và đầy cảm xúc. Mỗi đường nét, mỗi mảng màu đều được tính toán kỹ lưỡng để mang lại trải nghiệm tốt nhất cho gia chủ.
    `,
    sections: [
      {
        title: "1. Sự kết hợp giữa ánh sáng và không gian",
        content: "Trong thiết kế Luxury Minimalism, ánh sáng được coi là một 'vật liệu' xây dựng vô hình nhưng quan trọng nhất. Việc tận dụng ánh sáng tự nhiên thông qua các hệ cửa kính lớn không chỉ giúp mở rộng không gian mà còn tạo nên những kịch bản ánh sáng thay đổi theo thời gian trong ngày.",
        image: "https://images.unsplash.com/photo-1758800600436-eca719abf40c"
      },
      {
        title: "2. Vật liệu cao cấp làm nên đẳng cấp",
        content: "Sử dụng ít vật liệu hơn đòi hỏi mỗi loại vật liệu được chọn phải thực sự xuất sắc. Đá tự nhiên khổ lớn, gỗ óc chó nhập khẩu hay các mảng tường hoàn thiện thủ công là những yếu tố then chốt tạo nên chiều sâu cho không gian.",
        list: [
          "Đá tự nhiên với vân mây độc bản",
          "Hệ thống ánh sáng thông minh điều khiển theo kịch bản",
          "Nội thất Signature được thiết kế riêng"
        ]
      }
    ],
    quote: "Sự sang trọng thật sự không nằm ở những gì hào nhoáng bên ngoài, mà nằm ở cảm giác bình yên và sự tinh tế trong từng chi tiết nhỏ nhất mà mắt thường đôi khi không nhận thấy."
  };

  const relatedPosts = [
    { id: 2, title: "Giải pháp ánh sáng thông minh cho không gian Luxury", image: "https://images.unsplash.com/photo-1771858073810-e3568f605b35", date: "12/04/2026" },
    { id: 3, title: "Phong thủy phòng khách: Bí quyết thu hút tài lộc", image: "https://images.unsplash.com/photo-1758800600436-eca719abf40c", date: "10/04/2026" },
    { id: 4, title: "Xu hướng Landscape 2026 cho biệt thự vườn", image: "https://images.unsplash.com/photo-1760972543739-c1a033671d64", date: "08/04/2026" }
  ];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative h-[600px] w-full flex items-end">
        <ImageWithFallback 
          src={post.image} 
          alt={post.title} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="container mx-auto px-6 md:px-12 pb-20 relative z-10">
          <Breadcrumb category={post.category} />
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white mb-8 max-w-4xl"
            style={{ fontSize: '48px', lineHeight: '1.2', fontFamily: 'Playfair Display, serif' }}
          >
            {post.title}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-6 text-[11px] text-white/70 uppercase tracking-widest font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="flex items-center gap-2"><Calendar size={14} className="text-[#D4AF37]" /> {post.date}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="flex items-center gap-2"><User size={14} className="text-[#D4AF37]" /> {post.author}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="flex items-center gap-2"><Clock size={14} className="text-[#D4AF37]" /> {post.readTime}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Content Column */}
            <article className="lg:w-2/3 max-w-[800px]">
              {/* Introduction */}
              <p className="text-xl text-[#1A1A1A] mb-12 italic leading-relaxed font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {post.content}
              </p>

              {/* Dynamic Sections */}
              {post.sections.map((section, idx) => (
                <div key={idx} className="mb-16">
                  <h2 className="text-[28px] text-[#1A1A1A] mb-6 mt-10" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {section.title}
                  </h2>
                  <p className="text-[#4A4A4A] text-lg leading-[1.8] mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {section.content}
                  </p>
                  {section.image && (
                    <figure className="my-10">
                      <ImageWithFallback src={section.image} alt={section.title} className="w-full aspect-video object-cover" />
                      <figcaption className="text-center text-xs text-gray-400 mt-4 uppercase tracking-widest italic">Hình ảnh minh họa không gian Luxury Minimalism</figcaption>
                    </figure>
                  )}
                  {section.list && (
                    <ul className="space-y-4 mb-10">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-[#4A4A4A] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <div className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                            <Check size={12} className="text-[#D4AF37]" strokeWidth={3} />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Blockquote */}
              <blockquote className="border-l-4 border-[#D4AF37] pl-8 my-16">
                <p className="text-2xl text-[#D4AF37] italic leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  "{post.quote}"
                </p>
              </blockquote>

              {/* Inline CTA */}
              <div className="bg-[#F8F9FA] p-10 my-16 text-center border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xl mb-4 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Bạn muốn sở hữu không gian sống như thế này?</h4>
                  <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest">Đăng ký để nhận tư vấn chuyên sâu từ đội ngũ KTS</p>
                  <Link href="/contact" className="inline-block bg-[#1A1A1A] text-white px-10 py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-[#D4AF37] transition-all duration-500">
                    Đăng ký tư vấn miễn phí
                  </Link>
                </div>
              </div>

              {/* Social Share */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-10 border-t border-b border-gray-100 my-16">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Chia sẻ bài viết này:</span>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Linkedin, label: 'LinkedIn' },
                    { icon: Share2, label: 'Zalo' }
                  ].map((item, i) => (
                    <button key={i} className="flex items-center gap-2 px-4 py-2 border border-gray-100 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-[10px] font-bold uppercase tracking-widest">
                      <item.icon size={14} /> <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-20">
                <h3 className="text-[28px] text-[#1A1A1A] mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>Bình luận (0)</h3>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Họ và tên *" className="w-full px-6 py-4 bg-[#F8F9FA] border border-gray-200 outline-none focus:border-[#D4AF37] transition-all text-sm" />
                    <input type="email" placeholder="Email *" className="w-full px-6 py-4 bg-[#F8F9FA] border border-gray-200 outline-none focus:border-[#D4AF37] transition-all text-sm" />
                  </div>
                  <textarea rows={5} placeholder="Nội dung bình luận..." className="w-full px-6 py-4 bg-[#F8F9FA] border border-gray-200 outline-none focus:border-[#D4AF37] transition-all text-sm resize-none"></textarea>
                  <button className="bg-[#D4AF37] text-white px-12 py-5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#1A1A1A] transition-all duration-500">
                    Gửi bình luận
                  </button>
                </form>
              </div>
            </article>

            {/* Sidebar Column */}
            <aside className="lg:w-1/3 space-y-16">
              {/* Author Box */}
              <div className="bg-[#F8F9FA] p-10 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-[#D4AF37] p-1">
                  <ImageWithFallback src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="text-xl text-[#1A1A1A] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{post.author}</h4>
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.1em] font-bold mb-4">{post.authorTitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {post.authorDesc}
                </p>
                <Link href="#" className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors border-b border-black pb-1 inline-block">Xem các bài viết khác</Link>
              </div>

              {/* Related Posts */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] mb-8 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#D4AF37]" /> Bài viết liên quan
                </h4>
                <div className="space-y-8">
                  {relatedPosts.map((p) => (
                    <RelatedPostCard key={p.id} post={p} />
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] mb-8 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#D4AF37]" /> Chuyên mục
                </h4>
                <ul className="space-y-4">
                  {[
                    { name: 'Xu hướng nội thất', count: 12 },
                    { name: 'Phong thủy', count: 8 },
                    { name: 'Kiến thức xây dựng', count: 15 },
                    { name: 'Cảm hứng không gian', count: 20 }
                  ].map((cat, i) => (
                    <li key={i}>
                      <Link href="/blog" className="flex justify-between items-center text-sm text-gray-600 hover:text-[#D4AF37] transition-colors group">
                        <span style={{ fontFamily: 'Montserrat, sans-serif' }}>{cat.name}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-1 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">{cat.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Follow */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] mb-8 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#D4AF37]" /> Theo dõi XPRESS
                </h4>
                <div className="flex gap-3">
                  {[Facebook, Instagram, Youtube].map((Icon, i) => (
                    <button key={i} className="w-12 h-12 flex items-center justify-center border border-gray-100 text-[#1A1A1A] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white transition-all">
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Banner */}
              <div className="bg-[#1A1A1A] p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 grayscale">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1721244654394-36a7bc2da288" alt="Banner" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-white text-2xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Tư vấn thiết kế</h4>
                  <p className="text-white/50 text-[10px] mb-8 uppercase tracking-widest">Hoàn toàn miễn phí cho 10 khách hàng đầu tiên tháng này</p>
                  <button className="w-full py-4 bg-[#D4AF37] text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-[#1A1A1A] transition-all">
                    Nhận ngay
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* More Posts Grid */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <h3 className="text-[32px] text-[#1A1A1A] mb-12 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Bài viết khác bạn có thể quan tâm</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {relatedPosts.map((p) => (
              <motion.div 
                key={p.id}
                whileHover={{ y: -10 }}
                className="bg-white group overflow-hidden shadow-sm"
              >
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mb-3 block">Xu hướng</span>
                  <h4 className="text-lg text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors line-clamp-2" style={{ fontFamily: 'Playfair Display, serif' }}>{p.title}</h4>
                  <Link href={`/blog/${p.id}`} className="text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 group/btn">
                    Đọc tiếp <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl mb-6 max-w-2xl mx-auto leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bạn muốn tư vấn thiết kế cho không gian của mình?
          </h2>
          <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-12 font-bold">Kiến tạo giá trị sống đẳng cấp cùng XPRESS DESIGN</p>
          <Link href="/contact" className="inline-block bg-[#D4AF37] text-white px-12 py-6 text-xs uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-[#1A1A1A] transition-all duration-500 shadow-xl">
            Nhận báo giá ngay
          </Link>
        </div>
      </section>
    </div>
  );
}