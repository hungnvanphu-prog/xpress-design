import { routing } from '@/i18n/routing';

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServiceContent {
  name: string;
  tagline: string;
  description: string;
  whyChoose: string;
  process: string;
  features: ServiceFeature[];
  processSteps: ProcessStep[];
  cta: string;
  ctaButton: string;
}

export const servicesData: Record<string, { vi: ServiceContent; en: ServiceContent }> = {
  'thiet-ke-kien-truc': {
    vi: {
      name: 'Thiết kế Kiến trúc',
      tagline:
        'Kiến tạo không gian ngoại thất đẳng cấp, tối ưu hóa công năng và thẩm mỹ hiện đại.',
      description:
        'Dịch vụ thiết kế kiến trúc của XPRESS DESIGN mang đến những giải pháp tổng thể cho ngôi nhà của bạn, từ khối hình, công năng, ánh sáng đến phong thủy. Chúng tôi kiến tạo những công trình không chỉ đẹp mãn nhãn mà còn bền vững theo thời gian.',
      whyChoose: 'Tại sao chọn dịch vụ Thiết kế Kiến trúc của XPRESS DESIGN?',
      process: 'Quy trình làm việc',
      features: [
        {
          title: 'Phân tích mặt bằng & phong thủy',
          description:
            'Đánh giá hiện trạng, phân tích hướng nhà, mệnh chủ, đề xuất giải pháp tối ưu về công năng và năng lượng.',
        },
        {
          title: 'Thiết kế 3D kiến trúc ngoại thất',
          description:
            'Lên ý tưởng, phối cảnh 3D ngoại thất chi tiết, vật liệu, màu sắc, giúp bạn hình dung ngôi nhà trước khi thi công.',
        },
        {
          title: 'Hồ sơ kỹ thuật thi công',
          description:
            'Cung cấp bản vẽ kỹ thuật đầy đủ: mặt bằng, mặt đứng, mặt cắt, kết cấu, điện nước, phù hợp để thi công thực tế.',
        },
        {
          title: 'Giám sát tác quyền',
          description:
            'Kiến trúc sư đồng hành trong suốt quá trình thi công, đảm bảo công trình đúng như thiết kế.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Tiếp nhận thông tin',
          description: 'Trao đổi nhu cầu, phong cách, ngân sách, thời gian mong muốn.',
        },
        {
          step: '02',
          title: 'Khảo sát thực tế',
          description: 'Đo đạc hiện trạng, phân tích địa hình, hướng gió, ánh sáng.',
        },
        {
          step: '03',
          title: 'Phác thảo ý tưởng',
          description: 'Đề xuất 2-3 phương án mặt bằng, phối cảnh sơ bộ.',
        },
        {
          step: '04',
          title: 'Thiết kế chi tiết',
          description: 'Hoàn thiện bản vẽ 3D, hồ sơ kỹ thuật, lựa chọn vật liệu.',
        },
        {
          step: '05',
          title: 'Bàn giao & giám sát',
          description: 'Bàn giao hồ sơ, hỗ trợ giám sát thi công.',
        },
      ],
      cta: 'Bạn đã sẵn sàng kiến tạo không gian sống mơ ước?',
      ctaButton: 'Nhận tư vấn miễn phí',
    },
    en: {
      name: 'Architectural Design',
      tagline:
        'Creating exterior spaces of class, optimizing functionality and modern aesthetics.',
      description:
        "XPRESS DESIGN's architectural design service provides comprehensive solutions for your home, from form, function, light to feng shui. We create works that are not only visually stunning but also timeless.",
      whyChoose: "Why choose XPRESS DESIGN's Architectural Design service?",
      process: 'Work process',
      features: [
        {
          title: "Site & Feng Shui Analysis",
          description:
            "Assess current status, analyze house orientation and owner's destiny, propose optimal solutions for function and energy.",
        },
        {
          title: '3D Exterior Architectural Design',
          description:
            'Develop ideas and detailed 3D exterior renderings of materials and colors, helping you visualize your home before construction.',
        },
        {
          title: 'Technical Construction Drawings',
          description:
            'Provide complete technical drawings: floor plans, elevations, sections, structure, electrical, plumbing, ready for construction.',
        },
        {
          title: 'Construction Supervision',
          description:
            'Architects accompany and supervise throughout construction, ensuring the project matches the design.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Information Gathering',
          description: 'Discuss needs, style, budget, and timeline.',
        },
        { step: '02', title: 'Site Survey', description: 'Measure current state, analyze terrain, wind direction, light.' },
        {
          step: '03',
          title: 'Idea Sketching',
          description: 'Propose 2-3 floor plan options and preliminary renderings.',
        },
        {
          step: '04',
          title: 'Detailed Design',
          description: 'Complete 3D drawings, technical documents, material selection.',
        },
        {
          step: '05',
          title: 'Handover & Supervision',
          description: 'Deliver documents, support construction supervision.',
        },
      ],
      cta: 'Are you ready to create your dream living space?',
      ctaButton: 'Get free consultation',
    },
  },
  'thiet-ke-noi-that': {
    vi: {
      name: 'Thiết kế Nội thất',
      tagline:
        'Thổi hồn vào không gian sống với nét thẩm mỹ tinh tế, vật liệu cao cấp và sự sang trọng.',
      description:
        'Dịch vụ thiết kế nội thất của XPRESS DESIGN mang đến những không gian sống tinh tế, phản ánh cá tính và phong cách riêng của gia chủ, từ việc lựa chọn vật liệu, màu sắc đến bố trí ánh sáng và nội thất.',
      whyChoose: 'Tại sao chọn dịch vụ Thiết kế Nội thất của XPRESS DESIGN?',
      process: 'Quy trình làm việc',
      features: [
        {
          title: 'Thiết kế concept không gian',
          description: 'Xây dựng ý tưởng thiết kế tổng thể, phong cách, bảng màu, vật liệu chủ đạo.',
        },
        {
          title: 'Lựa chọn vật liệu & màu sắc',
          description: 'Tư vấn và lựa chọn vật liệu cao cấp, màu sắc phù hợp với không gian và sở thích.',
        },
        {
          title: 'Thiết kế nội thất chi tiết',
          description: 'Thiết kế 3D nội thất chi tiết, bản vẽ thi công tủ bếp, tủ quần áo, kệ tivi...',
        },
        {
          title: 'Styling nghệ thuật',
          description: 'Bố trí tranh ảnh, phụ kiện, cây xanh, tạo điểm nhấn nghệ thuật cho không gian.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Tiếp nhận thông tin',
          description: 'Trao đổi nhu cầu, phong cách, ngân sách, không gian cần thiết kế.',
        },
        {
          step: '02',
          title: 'Khảo sát thực tế',
          description: 'Đo đạc hiện trạng, ghi nhận các yếu tố ánh sáng, kết cấu.',
        },
        {
          step: '03',
          title: 'Phác thảo ý tưởng',
          description: 'Đề xuất concept, moodboard, bảng màu, phong cách.',
        },
        {
          step: '04',
          title: 'Thiết kế chi tiết',
          description: 'Thiết kế 3D, bản vẽ thi công, lựa chọn vật liệu và đồ nội thất.',
        },
        {
          step: '05',
          title: 'Bàn giao & styling',
          description: 'Bàn giao hồ sơ, hỗ trợ styling và trang trí không gian.',
        },
      ],
      cta: 'Bạn đã sẵn sàng biến không gian sống thành ngôi nhà trong mơ?',
      ctaButton: 'Nhận tư vấn miễn phí',
    },
    en: {
      name: 'Interior Design',
      tagline: 'Bring soul into living spaces with refined aesthetics, premium materials, and elegance.',
      description:
        "XPRESS DESIGN's interior design service creates sophisticated living spaces that reflect the homeowner's unique personality and style, from material and color selection to lighting layout and furniture arrangement.",
      whyChoose: "Why choose XPRESS DESIGN's Interior Design service?",
      process: 'Work process',
      features: [
        {
          title: 'Space Concept Design',
          description: 'Develop overall design concepts, styles, color palettes, and main materials.',
        },
        {
          title: 'Material & Color Selection',
          description: 'Consult and select premium materials and colors suitable for the space and preferences.',
        },
        {
          title: 'Detailed Interior Design',
          description: 'Create 3D interior designs and technical drawings for cabinets, wardrobes, TV units, etc.',
        },
        {
          title: 'Styling & Decoration',
          description: 'Arrange artworks, accessories, plants, creating artistic accents for the space.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Information Gathering',
          description: 'Discuss needs, style, budget, and space requirements.',
        },
        {
          step: '02',
          title: 'Site Survey',
          description: 'Measure current state, record lighting factors and structure.',
        },
        {
          step: '03',
          title: 'Idea Sketching',
          description: 'Propose concepts, moodboards, color palettes, style directions.',
        },
        {
          step: '04',
          title: 'Detailed Design',
          description: 'Create 3D designs, technical drawings, material and furniture selection.',
        },
        {
          step: '05',
          title: 'Handover & Styling',
          description: 'Deliver documents, support styling and space decoration.',
        },
      ],
      cta: 'Are you ready to transform your living space into your dream home?',
      ctaButton: 'Get free consultation',
    },
  },
  'cai-tao-phuc-dung': {
    vi: {
      name: 'Cải tạo & Phục dựng',
      tagline: 'Làm mới không gian cũ, giữ lại giá trị truyền thống kết hợp tiện nghi hiện đại.',
      description:
        'Dịch vụ cải tạo và phục dựng của XPRESS DESIGN mang đến giải pháp toàn diện cho những công trình cũ, vừa giữ gìn giá trị kiến trúc, vừa nâng cấp tiện nghi đáp ứng nhu cầu sống hiện đại.',
      whyChoose: 'Tại sao chọn dịch vụ Cải tạo & Phục dựng của XPRESS DESIGN?',
      process: 'Quy trình làm việc',
      features: [
        {
          title: 'Khảo sát kết cấu hiện hữu',
          description: 'Đánh giá kết cấu hiện trạng, phát hiện các vấn đề cần gia cố, sửa chữa.',
        },
        {
          title: 'Tối ưu hóa không gian sử dụng',
          description: 'Đề xuất giải pháp cải tạo mặt bằng, tối ưu công năng phù hợp nhu cầu.',
        },
        {
          title: 'Nâng cấp hệ thống kỹ thuật',
          description: 'Cải tạo hệ thống điện, nước, điều hòa, thông gió đạt chuẩn hiện đại.',
        },
        {
          title: 'Làm mới diện mạo hoàn toàn',
          description: 'Thiết kế lại mặt tiền, nội thất, mang đến diện mạo mới cho công trình.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Khảo sát & đánh giá',
          description: 'Kiểm tra kết cấu, hệ thống kỹ thuật, hiện trạng công trình.',
        },
        {
          step: '02',
          title: 'Tư vấn giải pháp',
          description: 'Đề xuất phương án cải tạo, dự toán chi phí, thời gian.',
        },
        {
          step: '03',
          title: 'Thiết kế chi tiết',
          description: 'Thiết kế phương án cải tạo, lựa chọn vật liệu mới.',
        },
        {
          step: '04',
          title: 'Thi công cải tạo',
          description: 'Gia cố kết cấu, cải tạo hệ thống kỹ thuật, hoàn thiện.',
        },
        {
          step: '05',
          title: 'Bàn giao & bảo hành',
          description: 'Nghiệm thu, bàn giao công trình, bảo hành theo cam kết.',
        },
      ],
      cta: 'Bạn muốn hồi sinh không gian cũ với diện mạo mới?',
      ctaButton: 'Nhận tư vấn miễn phí',
    },
    en: {
      name: 'Renovation & Restoration',
      tagline: 'Renew old spaces, preserving traditional values while integrating modern amenities.',
      description:
        "XPRESS DESIGN's renovation and restoration service provides comprehensive solutions for old buildings, preserving architectural values while upgrading amenities to meet modern living needs.",
      whyChoose: "Why choose XPRESS DESIGN's Renovation & Restoration service?",
      process: 'Work process',
      features: [
        {
          title: 'Existing Structure Survey',
          description: 'Assess current structure status, identify issues needing reinforcement or repair.',
        },
        {
          title: 'Space Optimization',
          description: 'Propose floor plan renovation solutions, optimize functionality according to needs.',
        },
        {
          title: 'System Upgrade',
          description: 'Upgrade electrical, plumbing, air conditioning, ventilation systems to modern standards.',
        },
        {
          title: 'Complete Makeover',
          description: 'Redesign facades and interiors, bringing a new look to the building.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Survey & Assessment',
          description: 'Inspect structure, technical systems, and current condition.',
        },
        {
          step: '02',
          title: 'Solution Consultation',
          description: 'Propose renovation plans, cost estimates, timeline.',
        },
        {
          step: '03',
          title: 'Detailed Design',
          description: 'Design renovation plans, select new materials.',
        },
        { step: '04', title: 'Construction', description: 'Reinforce structure, upgrade technical systems, complete finishes.' },
        {
          step: '05',
          title: 'Handover & Warranty',
          description: 'Inspect, handover, provide warranty as committed.',
        },
      ],
      cta: 'Do you want to revive your old space with a new look?',
      ctaButton: 'Get free consultation',
    },
  },
  'thi-cong-tron-goi': {
    vi: {
      name: 'Thi công trọn gói',
      tagline: 'Chìa khóa trao tay - Bàn giao nhà hoàn thiện, chỉ việc dọn vào ở.',
      description:
        'Dịch vụ thi công trọn gói của XPRESS DESIGN giúp bạn an tâm với công trình từ A đến Z, từ xin phép xây dựng, thi công phần thô, hoàn thiện đến lắp đặt nội thất và bàn giao.',
      whyChoose: 'Tại sao chọn dịch vụ Thi công trọn gói của XPRESS DESIGN?',
      process: 'Quy trình làm việc',
      features: [
        {
          title: 'Xin phép xây dựng',
          description: 'Hỗ trợ hoàn thiện hồ sơ, thủ tục xin giấy phép xây dựng.',
        },
        {
          title: 'Thi công phần thô',
          description: 'Thi công kết cấu, móng, khung, sàn, mái, tường bao che.',
        },
        {
          title: 'Hoàn thiện & nội thất',
          description: 'Thi công hoàn thiện, lắp đặt nội thất, thiết bị vệ sinh, điện nước.',
        },
        {
          title: 'Bảo hành 5 năm',
          description: 'Cam kết bảo hành kết cấu 5 năm, bảo trì định kỳ miễn phí.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Ký hợp đồng',
          description: 'Thống nhất phạm vi công việc, tiến độ, chi phí, ký kết hợp đồng.',
        },
        {
          step: '02',
          title: 'Xin phép xây dựng',
          description: 'Hoàn thiện hồ sơ, nộp đơn xin giấy phép xây dựng.',
        },
        {
          step: '03',
          title: 'Thi công thô',
          description: 'Thi công kết cấu phần thô theo bản vẽ và tiến độ.',
        },
        {
          step: '04',
          title: 'Hoàn thiện',
          description: 'Thi công hoàn thiện, lắp đặt nội thất, thiết bị.',
        },
        {
          step: '05',
          title: 'Bàn giao & bảo hành',
          description: 'Nghiệm thu, bàn giao, cung cấp chứng chỉ bảo hành 5 năm.',
        },
      ],
      cta: 'Bạn muốn bàn giao công trình trọn gói, chỉ việc dọn vào ở?',
      ctaButton: 'Nhận báo giá thi công',
    },
    en: {
      name: 'Turnkey Construction',
      tagline: 'Turnkey solution - Delivering fully finished homes, ready to move in.',
      description:
        "XPRESS DESIGN's turnkey construction service gives you peace of mind from A to Z, from building permits, structural construction, finishes, furniture installation to final handover.",
      whyChoose: "Why choose XPRESS DESIGN's Turnkey Construction service?",
      process: 'Work process',
      features: [
        {
          title: 'Building Permit',
          description: 'Assist with document completion and building permit application procedures.',
        },
        {
          title: 'Structural Construction',
          description: 'Construct structures, foundations, frames, floors, roofs, enclosing walls.',
        },
        {
          title: 'Finishes & Furniture',
          description: 'Complete finishes, furniture installation, sanitary equipment, electrical, plumbing.',
        },
        {
          title: '5-Year Warranty',
          description: 'Commit to 5-year structural warranty, free periodic maintenance.',
        },
      ],
      processSteps: [
        {
          step: '01',
          title: 'Contract Signing',
          description: 'Agree on scope of work, timeline, costs, sign contract.',
        },
        { step: '02', title: 'Building Permit', description: 'Complete documents, apply for building permit.' },
        {
          step: '03',
          title: 'Structural Work',
          description: 'Construct structural work according to drawings and schedule.',
        },
        { step: '04', title: 'Finishing', description: 'Complete finishes, furniture installation, equipment.' },
        {
          step: '05',
          title: 'Handover & Warranty',
          description: 'Inspect, handover, provide 5-year warranty certificate.',
        },
      ],
      cta: 'Do you want a turnkey project delivery, ready to move in?',
      ctaButton: 'Get construction quote',
    },
  },
};

export type ServiceId = keyof typeof servicesData;

export const serviceSlugs: {
  vi: { slug: string; enSlug: string; name: string }[];
} = {
  vi: [
    { slug: 'thiet-ke-kien-truc', enSlug: 'architectural-design', name: 'Thiết kế Kiến trúc' },
    { slug: 'thiet-ke-noi-that', enSlug: 'interior-design', name: 'Thiết kế Nội thất' },
    { slug: 'cai-tao-phuc-dung', enSlug: 'renovation-restoration', name: 'Cải tạo & Phục dựng' },
    { slug: 'thi-cong-tron-goi', enSlug: 'turnkey-construction', name: 'Thi công trọn gói' },
  ],
};

/** Cùng thứ tự với thẻ trên trang /services: architecture, interior, turnkey, renovation */
export const serviceListingOrder: ServiceId[] = [
  'thiet-ke-kien-truc',
  'thiet-ke-noi-that',
  'thi-cong-tron-goi',
  'cai-tao-phuc-dung',
];

export const serviceHeroImage: Record<ServiceId, string> = {
  /** Ảnh cũ photo-1600596542815-ffad4b1530a1 (404) — thay bằng bản tồn tại. */
  'thiet-ke-kien-truc': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&auto=format&fit=crop',
  'thiet-ke-noi-that': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
  'cai-tao-phuc-dung': 'https://images.unsplash.com/photo-1633354990288-2bfe9967da76?w=1920&q=80',
  'thi-cong-tron-goi': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80',
};

export function getServiceIdFromSlug(pathSlug: string): ServiceId | null {
  for (const row of serviceSlugs.vi) {
    if (row.slug === pathSlug || row.enSlug === pathSlug) {
      if (row.slug in servicesData) return row.slug as ServiceId;
    }
  }
  return null;
}

export function getUrlSlugForLocale(serviceId: ServiceId, locale: string): string {
  for (const row of serviceSlugs.vi) {
    if (row.slug === serviceId) {
      return locale === routing.defaultLocale ? row.slug : row.enSlug;
    }
  }
  return serviceId;
}

export function getServiceContent(serviceId: ServiceId, locale: string): ServiceContent {
  const entry = servicesData[serviceId];
  const loc = locale === 'en' ? 'en' : 'vi';
  return entry[loc];
}

export function getPathSlugsForService(id: ServiceId): { viPath: string; enPath: string } | null {
  for (const row of serviceSlugs.vi) {
    if (row.slug === id) {
      return { viPath: `/services/${row.slug}`, enPath: `/services/${row.enSlug}` };
    }
  }
  return null;
}
