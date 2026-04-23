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
    title: "The Horizon Villa", 
    category: "Villa", 
    style: "Modern", 
    image: "https://images.unsplash.com/photo-1765279162736-14c7d64ff820?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwbHV4dXJ5JTIwbWluaW1hbGlzdCUyMGFyY2hpdGVjdHVyZSUyMGhvdXNlJTIwcG9vbHxlbnwxfHx8fDE3NzU3NDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "The Horizon Villa là một kiệt tác kiến trúc hiện đại, tọa lạc tại vị thế đắc địa với tầm nhìn panorama. Thiết kế tập trung vào việc xóa nhòa ranh giới giữa không gian nội thất và ngoại thất, sử dụng các mảng kính lớn và vật liệu tự nhiên cao cấp như đá marble và gỗ walnut.",
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
    title: "Urban Skyline Penthouse", 
    category: "Penthouse", 
    style: "Minimalist", 
    image: "https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb20lMjBkZXNpZ24lMjBtaW5pbWFsJTIwc3R5bGUlMjBjaXR5JTIwdmlld3xlbnwxfHx8fDE3NzU3NDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Căn Penthouse tại trung tâm thành phố được thiết kế theo phong cách Luxury Minimalism. Sự sang trọng không đến từ các chi tiết rườm rà mà từ sự tinh tế trong việc lựa chọn vật liệu và tỷ lệ không gian hoàn hảo.",
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
    description: "Sự kết hợp hoàn hảo giữa vẻ đẹp cổ điển và tiện nghi hiện đại. Neo Classic Residence mang lại không gian sống đẳng cấp với các chi tiết phào chỉ tinh tế kết hợp cùng nội thất đương đại.",
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
    title: "Minimalist Townhouse", 
    category: "Nhà phố", 
    style: "Minimalist", 
    image: "https://images.unsplash.com/photo-1750360563453-1c02464f2e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdG93bmhvdXNlJTIwYXJjaGl0ZWN0dXJlJTIwZXh0ZXJpb3IlMjBkZXNpZ24lMjBtb2Rlcm4lMjBmYWNhZGV8ZW58MXx8fHwxNzc1NzQ2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Tối ưu hóa không gian cho nhà phố diện tích hẹp nhưng vẫn đảm bảo sự thoáng đãng và sang trọng. Sử dụng giếng trời và khoảng thông tầng để lấy sáng tự nhiên.",
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
    title: "Green Valley Villa", 
    category: "Villa", 
    style: "Modern", 
    image: "https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGFyY2hpdGVjdHVyZSUyMGdhcmRlbiUyMHRlcnJhY2UlMjBsdXh1cnklMjBtaW5pbWFsJTIwZGVzaWdufGVufDF8fHx8MTc3NTc0NjY2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Biệt thự nghỉ dưỡng hòa mình vào thiên nhiên với thiết kế mở tối đa. Hệ thống cây xanh được tích hợp vào không gian sống mang lại không khí trong lành.",
    client: "Mrs. Thu Hang",
    architect: "Le Anh Tuan",
    area: "500 m2",
    location: "Ba Vi, Ha Noi",
    year: "2024",
    constructionTime: "14 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff",
      "https://images.unsplash.com/photo-1765279162736-14c7d64ff820"
    ]
  },
  { 
    id: 6, 
    title: "The Onyx Apartment", 
    category: "Apartment", 
    style: "Minimalist", 
    image: "https://images.unsplash.com/photo-1758448756362-e323282ccbcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcmNoaXRlY3R1cmUlMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvciUyMGV4dGVyaW9yJTIwbWluaW1hbCUyMGRlc2lnbiUyMHZpbGxhJTIwaG91c2UlMjBnYWxsZXJ5fGVufDF8fHx8MTc3NTc0NjY1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Căn hộ cao cấp với tông màu tối huyền bí nhưng không kém phần sang trọng. Sự kết hợp giữa đá đen onyx và ánh sáng vàng gold tạo nên không gian quyền quý.",
    client: "Mr. Viet Anh",
    architect: "Nguyen Van Nam",
    area: "150 m2",
    location: "TP. Ho Chi Minh",
    year: "2023",
    constructionTime: "5 tháng",
    gallery: [
      "https://images.unsplash.com/photo-1758448756362-e323282ccbcc",
      "https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2"
    ]
  },
];
