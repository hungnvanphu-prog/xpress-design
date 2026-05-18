export interface Project {
  id: number;
  title: string;
  category: string;
  style: string;
  image: string;
  description: string;
  client?: string;
  architect?: string;
  area?: string;
  location?: string;
  year?: string;
  constructionTime?: string;
  gallery?: string[];
}

export const ALL_PROJECTS: Project[] = [
  { 
    id: 1, 
    title: "Biệt thự Xanh Đà Lạt", 
    category: "Villa", 
    style: "Modern", 
    image: "https://images.unsplash.com/photo-1765279162736-14c7d64ff820?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwbHV4dXJ5JTIwbWluaW1hbGlzdCUyMGFyY2hpdGVjdHVyZSUyMGhvdXNlJTIwcG9vbHxlbnwxfHx8fDE3NzU3NDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Biệt thự Xanh Đà Lạt xử lý bài toán nhà nghỉ dưỡng trên sườn dốc: mở rộng về phía thung lũng nhưng vẫn giữ cảm giác ấm và kín đáo. Công trình bám theo cao độ tự nhiên, dùng đá bazan, gỗ thông và kính low-e để kết nối với rừng thông mà không đánh đổi tiện nghi khí hậu.",
    client: "Mr. Minh Quan",
    architect: "Le Anh Tuan",
    area: "450 m2",
    location: "Da Lat, Viet Nam",
    year: "2024",
    constructionTime: "12 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1765279162736-14c7d64ff820",
      "https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff",
      "https://images.unsplash.com/photo-1758448756362-e323282ccbcc",
      "https://images.unsplash.com/photo-1750360563453-1c02464f2e97",
      "https://images.unsplash.com/photo-1765279333918-949ddcb655ba",
      "https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2"
    ]
  },
  { 
    id: 2, 
    title: "Penthouse Urban Skyline", 
    category: "Penthouse", 
    style: "Minimalist", 
    image: "https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb20lMjBkZXNpZ24lMjBtaW5pbWFsJTIwc3R5bGUlMjBjaXR5JTIwdmlld3xlbnwxfHx8fDE3NzU3NDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Penthouse Urban Skyline biến lợi thế tầm nhìn thành một không gian sống có kiểm soát: giảm nắng, giảm ồn và giữ riêng tư cho gia đình. Thiết kế đi theo hướng Luxury Minimalism, dùng đá Calacatta, gỗ walnut và ánh sáng gián tiếp để tạo sự sang trọng kín tiếng.",
    client: "Mrs. Lan Huong",
    architect: "Nguyen Van Nam",
    area: "320 m2",
    location: "TP. Ho Chi Minh",
    year: "2023",
    constructionTime: "8 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2",
      "https://images.unsplash.com/photo-1765279333918-949ddcb655ba",
      "https://images.unsplash.com/photo-1758448756362-e323282ccbcc"
    ]
  },
  { 
    id: 3, 
    title: "Neo Classic Residence", 
    category: "Apartment", 
    style: "Neo Classic", 
    image: "https://images.unsplash.com/photo-1765279333918-949ddcb655ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBtYXN0ZXIlMjBiZWRyb29tJTIwaW50ZXJpb3IlMjBkZXNpZ24lMjBhcmNoaXRlY3R1cmUlMjBtaW5pbWFsfGVufDF8fHx8MT7757466618MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Neo Classic Residence giữ tinh thần cổ điển Pháp nhưng tiết chế chi tiết để phù hợp với căn hộ hiện đại. Phào chỉ, trần caisson và bảng màu trắng ngà - champagne - xanh prussian được dùng có chọn lọc, tạo cảm giác trang trọng mà không nặng nề.",
    client: "Mr. Hoang Nam",
    architect: "Tran Thi Mai",
    area: "180 m2",
    location: "Ha Noi, Viet Nam",
    year: "2024",
    constructionTime: "6 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1765279333918-949ddcb655ba",
      "https://images.unsplash.com/photo-1758448756362-e323282ccbcc"
    ]
  },
  { 
    id: 4, 
    title: "Nhà phố Tối giản Đà Nẵng", 
    category: "Nhà phố", 
    style: "Minimalist", 
    image: "https://images.unsplash.com/photo-1750360563453-1c02464f2e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdG93bmhvdXNlJTIwYXJjaGl0ZWN0dXJlJTIwZXh0ZXJpb3IlMjBkZXNpZ24lMjBtb2Rlcm4lMjBmYWNhZGV8ZW58MXx8fHwxNzc1NzQ2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Nhà phố Tối giản Đà Nẵng giải quyết mặt bằng hẹp trong điều kiện nắng gió ven biển. Giếng trời lệch trục, khoảng rỗng và lớp lam bê tông giúp nhà kín đáo ở mặt tiền nhưng vẫn sáng, thoáng và dễ bảo trì bên trong.",
    client: "Mr. Thanh Tung",
    architect: "Pham Hoang Duy",
    area: "250 m2",
    location: "Da Nang, Viet Nam",
    year: "2023",
    constructionTime: "10 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1750360563453-1c02464f2e97",
      "https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff"
    ]
  },
  { 
    id: 5, 
    title: "Văn phòng Sáng tạo Sài Gòn", 
    category: "Office", 
    style: "Contemporary", 
    image: "https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGFyY2hpdGVjdHVyZSUyMGdhcmRlbiUyMHRlcnJhY2UlMjBsdXh1cnklMjBtaW5pbWFsJTIwZGVzaWdufGVufDF8fHx8MTc3NTc0NjY2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Văn phòng Sáng tạo Sài Gòn được tổ chức theo hoạt động thay vì sơ đồ bàn ghế cố định. Các vùng cộng tác, focus-pod, phòng họp linh hoạt và cafeteria trung tâm giúp đội ngũ công nghệ chuyển đổi giữa làm nhóm và tập trung sâu mà không bị nhiễu âm.",
    client: "Saigon Tech JSC",
    architect: "Xpress Design Studio",
    area: "2,800 m2",
    location: "TP. Ho Chi Minh",
    year: "2025",
    constructionTime: "9 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff",
      "https://images.unsplash.com/photo-1765279162736-14c7d64ff820"
    ]
  },
  { 
    id: 6, 
    title: "Nhà phố Hà Nội 2025", 
    category: "Nhà phố", 
    style: "Modern", 
    image: "https://images.unsplash.com/photo-1758448756362-e323282ccbcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcmNoaXRlY3R1cmUlMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvciUyMGV4dGVyaW9yJTIwbWluaW1hbCUyMGRlc2lnbiUyMHZpbGxhJTIwaG91c2UlMjBnYWxsZXJ5fGVufDF8fHx8MTc3NTc0NjY1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Nhà phố Hà Nội 2025 đưa ánh sáng và cây xanh vào một khu đất phố cổ ít mặt thoáng. Lõi sáng trung tâm, vườn trong nhà và mặt tiền gạch đất nung thủ công giúp công trình sống hiện đại bên trong nhưng vẫn giữ nhịp vật liệu gần gũi với Hà Nội cũ.",
    client: "Private",
    architect: "Xpress Design Studio",
    area: "320 m2",
    location: "Hoan Kiem, Ha Noi",
    year: "2025",
    constructionTime: "11 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1758448756362-e323282ccbcc",
      "https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2"
    ]
  },
];
