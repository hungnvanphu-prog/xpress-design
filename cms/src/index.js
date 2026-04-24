'use strict';

/**
 * Strapi lifecycle hooks.
 * - bootstrap() chạy 1 lần sau khi Strapi start (mỗi lần boot nhưng idempotent)
 *   1) Seed super admin từ ENV SEED_ADMIN_*
 *   2) Seed locales vi/en (vi = default)
 *   3) Mở public permissions (read-only) cho FE gọi API
 *   4) Seed dữ liệu mẫu song ngữ (Category / Project / Article / News / Page)
 */

module.exports = {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }) {
    await seedSuperAdmin(strapi);
    await seedLocales(strapi);
    await grantPublicPermissions(strapi);
    await seedContent(strapi);
  },
};

/* ============================================================
 * 1) SUPER ADMIN
 * ============================================================ */
async function seedSuperAdmin(strapi) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    strapi.log.info('[seed] SEED_ADMIN_EMAIL/PASSWORD không set → bỏ qua seed admin');
    return;
  }

  const existing = await strapi.db.query('admin::user').findOne({ where: { email } });
  if (existing) {
    strapi.log.info(`[seed] Admin ${email} đã tồn tại`);
    return;
  }

  const superAdminRole = await strapi.db.query('admin::role').findOne({
    where: { code: 'strapi-super-admin' },
  });
  if (!superAdminRole) {
    strapi.log.warn('[seed] Không tìm thấy role Super Admin → bỏ qua');
    return;
  }

  const hashed = await strapi.service('admin::auth').hashPassword(password);

  await strapi.db.query('admin::user').create({
    data: {
      firstname: process.env.SEED_ADMIN_FIRSTNAME || 'Super',
      lastname: process.env.SEED_ADMIN_LASTNAME || 'Admin',
      email,
      username: null,
      password: hashed,
      isActive: true,
      blocked: false,
      registrationToken: null,
      roles: [superAdminRole.id],
    },
  });

  strapi.log.info(`[seed] ✅ Đã tạo admin: ${email}`);
}

/* ============================================================
 * 2) LOCALES (vi default, en phụ)
 * ============================================================ */
async function seedLocales(strapi) {
  try {
    const localeService = strapi.plugin('i18n')?.service('locales');
    if (!localeService) {
      strapi.log.warn('[seed] i18n plugin không có → bỏ qua locales');
      return;
    }

    const wanted = [
      { code: 'vi', name: 'Vietnamese (vi)', isDefault: true },
      { code: 'en', name: 'English (en)', isDefault: false },
    ];

    const existing = await localeService.find();
    const existingCodes = new Set(existing.map((l) => l.code));

    for (const l of wanted) {
      if (!existingCodes.has(l.code)) {
        await localeService.create(l);
        strapi.log.info(`[seed] ✅ Thêm locale: ${l.code}`);
      }
    }

    const viLocale = (await localeService.find()).find((l) => l.code === 'vi');
    if (viLocale && !viLocale.isDefault) {
      await localeService.setDefaultLocale({ code: 'vi' });
      strapi.log.info('[seed] ✅ Đặt vi làm default locale');
    }
  } catch (err) {
    strapi.log.error('[seed] Lỗi seed locales:', err.message);
  }
}

/* ============================================================
 * 3) PUBLIC PERMISSIONS
 * ============================================================ */
async function grantPublicPermissions(strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[seed] Không tìm thấy role Public');
    return;
  }

  const actions = [
    'api::project.project.find',
    'api::project.project.findOne',
    'api::article.article.find',
    'api::article.article.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::news.news.find',
    'api::news.news.findOne',
    'api::page.page.find',
    'api::page.page.findOne',
  ];

  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
      strapi.log.info(`[seed] ✅ Public permission: ${action}`);
    }
  }
}

/* ============================================================
 * 4) SEED CONTENT (vi + en)
 * ============================================================ */
async function seedContent(strapi) {
  try {
    // Chỉ seed khi DB trống → idempotent
    const projectCount = await strapi.entityService.count('api::project.project');
    const articleCount = await strapi.entityService.count('api::article.article');
    const newsCount = await strapi.entityService.count('api::news.news');
    const pageCount = await strapi.entityService.count('api::page.page');

    if (projectCount + articleCount + newsCount + pageCount > 0) {
      strapi.log.info('[seed] Đã có dữ liệu content → bỏ qua seed mẫu');
      return;
    }

    strapi.log.info('[seed] 🌱 Bắt đầu seed dữ liệu mẫu song ngữ...');

    const categories = await seedCategories(strapi);
    await seedProjects(strapi);
    await seedArticles(strapi, categories);
    await seedNews(strapi);
    await seedPages(strapi);

    strapi.log.info('[seed] ✅ Hoàn tất seed dữ liệu mẫu');
  } catch (err) {
    strapi.log.error('[seed] Lỗi seed content:', err);
  }
}

/**
 * Tạo 1 entity ở locale `vi` rồi link bản dịch `en` vào nó.
 * Trả về entity vi (đã có field localizations).
 */
async function createBilingual(strapi, uid, viData, enData) {
  const viEntity = await strapi.entityService.create(uid, {
    data: { ...viData, locale: 'vi', publishedAt: new Date() },
  });

  const enEntity = await strapi.entityService.create(uid, {
    data: {
      ...enData,
      locale: 'en',
      localizations: [viEntity.id],
      publishedAt: new Date(),
    },
  });

  return { vi: viEntity, en: enEntity };
}

async function seedCategories(strapi) {
  // Category không bật i18n → chỉ tạo 1 bản
  const data = [
    { name: 'Kiến trúc', description: 'Bài viết về kiến trúc' },
    { name: 'Nội thất', description: 'Bài viết về nội thất' },
    { name: 'Cảnh quan', description: 'Bài viết về cảnh quan' },
  ];
  const created = [];
  for (const d of data) {
    const c = await strapi.entityService.create('api::category.category', { data: d });
    created.push(c);
    strapi.log.info(`[seed] ✅ Category: ${c.name}`);
  }
  return created;
}

async function seedProjects(strapi) {
  const projects = [
    {
      vi: {
        title: 'Biệt thự Xanh Đà Lạt',
        slug: 'biet-thu-xanh-da-lat',
        description: 'Biệt thự nghỉ dưỡng trên đồi thông, hoà quyện thiên nhiên.',
        content: 'Công trình sử dụng vật liệu địa phương, tối ưu thông gió tự nhiên và ánh sáng ban ngày.',
        location: 'Đà Lạt, Lâm Đồng',
        seo_title: 'Biệt thự Xanh Đà Lạt — Dự án kiến trúc nghỉ dưỡng',
        seo_description: 'Dự án biệt thự nghỉ dưỡng hòa quyện cùng thiên nhiên Đà Lạt.',
      },
      en: {
        title: 'Green Villa Da Lat',
        slug: 'green-villa-da-lat',
        description: 'A resort villa on the pine hill in harmony with nature.',
        content: 'The project uses local materials, optimizes natural ventilation and daylight.',
        location: 'Da Lat, Lam Dong',
        seo_title: 'Green Villa Da Lat — Resort Architecture Project',
        seo_description: 'A resort villa project blending with the nature of Da Lat.',
      },
      shared: {
        client_name: 'Green Hill Group',
        project_type: 'residential',
        year: 2024,
        featured: true,
      },
    },
    {
      vi: {
        title: 'Văn phòng Sáng tạo Sài Gòn',
        slug: 'van-phong-sang-tao-sai-gon',
        description: 'Văn phòng hybrid cho công ty công nghệ 500 nhân sự.',
        content: 'Không gian mở, nhiều khu collaboration và phòng focus-pod.',
        location: 'Quận 1, TP.HCM',
        seo_title: 'Văn phòng Sáng tạo Sài Gòn',
        seo_description: 'Thiết kế văn phòng hybrid tại trung tâm TP.HCM.',
      },
      en: {
        title: 'Saigon Creative Office',
        slug: 'saigon-creative-office',
        description: 'A hybrid office for a 500-people tech company.',
        content: 'Open layout with collaboration zones and focus pods.',
        location: 'District 1, Ho Chi Minh City',
        seo_title: 'Saigon Creative Office',
        seo_description: 'Hybrid office design in the heart of Ho Chi Minh City.',
      },
      shared: {
        client_name: 'Saigon Tech JSC',
        project_type: 'commercial',
        year: 2025,
        featured: true,
      },
    },
    {
      vi: {
        title: 'Nhà phố Hà Nội 2025',
        slug: 'nha-pho-ha-noi-2025',
        description: 'Nhà phố 4 tầng tối ưu ánh sáng giữa lòng phố cổ.',
        content: 'Giếng trời xuyên suốt, vườn trong nhà, vật liệu thân thiện môi trường.',
        location: 'Hoàn Kiếm, Hà Nội',
        seo_title: 'Nhà phố Hà Nội 2025',
        seo_description: 'Nhà phố hiện đại tối ưu ánh sáng giữa phố cổ Hà Nội.',
      },
      en: {
        title: 'Hanoi Townhouse 2025',
        slug: 'hanoi-townhouse-2025',
        description: 'A 4-storey townhouse maximizing daylight in the Old Quarter.',
        content: 'Full-height skylight, indoor garden and eco-friendly materials.',
        location: 'Hoan Kiem, Hanoi',
        seo_title: 'Hanoi Townhouse 2025',
        seo_description: 'A modern townhouse optimizing daylight in Hanoi Old Quarter.',
      },
      shared: {
        client_name: 'Private',
        project_type: 'residential',
        year: 2025,
        featured: false,
      },
    },
  ];

  for (const p of projects) {
    await createBilingual(
      strapi,
      'api::project.project',
      { ...p.vi, ...p.shared },
      { ...p.en, ...p.shared },
    );
    strapi.log.info(`[seed] ✅ Project: ${p.vi.title} / ${p.en.title}`);
  }
}

async function seedArticles(strapi, categories) {
  const catKienTruc = categories.find((c) => c.name === 'Kiến trúc')?.id;
  const catNoiThat = categories.find((c) => c.name === 'Nội thất')?.id;

  const articles = [
    {
      vi: {
        title: '5 xu hướng kiến trúc bền vững 2025',
        slug: '5-xu-huong-kien-truc-ben-vung-2025',
        excerpt: 'Tổng hợp 5 xu hướng kiến trúc xanh đang định hình năm 2025.',
        content: 'Từ vật liệu tái chế đến thiết kế passive, kiến trúc bền vững đang trở thành tiêu chuẩn mới.',
        tags: ['bền vững', 'xu hướng', '2025'],
        seo_title: '5 xu hướng kiến trúc bền vững 2025',
        seo_description: 'Khám phá 5 xu hướng kiến trúc xanh nổi bật năm 2025.',
      },
      en: {
        title: '5 Sustainable Architecture Trends 2025',
        slug: '5-sustainable-architecture-trends-2025',
        excerpt: 'A round-up of 5 green architecture trends shaping 2025.',
        content: 'From recycled materials to passive design, sustainable architecture is the new standard.',
        tags: ['sustainability', 'trends', '2025'],
        seo_title: '5 Sustainable Architecture Trends 2025',
        seo_description: 'Discover 5 outstanding green architecture trends in 2025.',
      },
      category: catKienTruc,
    },
    {
      vi: {
        title: 'Nội thất tối giản: ít hơn để thở nhiều hơn',
        slug: 'noi-that-toi-gian',
        excerpt: 'Vì sao phong cách tối giản ngày càng được ưa chuộng?',
        content: 'Tối giản không phải là nghèo nàn — đó là chắt lọc những gì thực sự cần thiết.',
        tags: ['tối giản', 'nội thất'],
        seo_title: 'Nội thất tối giản',
        seo_description: 'Hiểu đúng về phong cách nội thất tối giản.',
      },
      en: {
        title: 'Minimal Interior: Less to Breathe More',
        slug: 'minimal-interior',
        excerpt: 'Why minimalism is gaining momentum in interior design.',
        content: 'Minimalism is not poverty — it distills what is truly essential.',
        tags: ['minimal', 'interior'],
        seo_title: 'Minimal Interior',
        seo_description: 'Understanding the minimal interior style.',
      },
      category: catNoiThat,
    },
  ];

  for (const a of articles) {
    await createBilingual(
      strapi,
      'api::article.article',
      { ...a.vi, category: a.category },
      { ...a.en, category: a.category },
    );
    strapi.log.info(`[seed] ✅ Article: ${a.vi.title} / ${a.en.title}`);
  }
}

async function seedNews(strapi) {
  const items = [
    {
      vi: {
        title: 'Khởi công dự án Biệt thự Xanh Đà Lạt',
        slug: 'khoi-cong-biet-thu-xanh-da-lat',
        content: 'Lễ khởi công được tổ chức ngày 10/03/2025 với sự tham dự của chủ đầu tư và đội ngũ thiết kế.',
        location: 'Đà Lạt, Lâm Đồng',
      },
      en: {
        title: 'Groundbreaking of Green Villa Da Lat',
        slug: 'groundbreaking-green-villa-da-lat',
        content: 'The groundbreaking ceremony took place on March 10, 2025 with the client and design team.',
        location: 'Da Lat, Lam Dong',
      },
      shared: {
        type: 'event',
        event_date: new Date('2025-03-10T09:00:00.000Z'),
      },
    },
    {
      vi: {
        title: 'Công ty đoạt giải thiết kế bền vững 2025',
        slug: 'giai-thiet-ke-ben-vung-2025',
        content: 'Studio vừa được trao giải Bronze tại Sustainable Design Awards 2025.',
        location: 'Singapore',
      },
      en: {
        title: 'Studio Wins Sustainable Design Award 2025',
        slug: 'sustainable-design-award-2025',
        content: 'Our studio received the Bronze prize at Sustainable Design Awards 2025.',
        location: 'Singapore',
      },
      shared: {
        type: 'news',
        event_date: new Date('2025-06-01T10:00:00.000Z'),
      },
    },
  ];

  for (const n of items) {
    await createBilingual(
      strapi,
      'api::news.news',
      { ...n.vi, ...n.shared },
      { ...n.en, ...n.shared },
    );
    strapi.log.info(`[seed] ✅ News: ${n.vi.title} / ${n.en.title}`);
  }
}

async function seedPages(strapi) {
  const pages = [
    {
      vi: {
        title: 'Trang chủ',
        slug: 'trang-chu',
        seo_title: 'Studio Kiến trúc — Trang chủ',
        seo_description: 'Studio thiết kế kiến trúc & nội thất tại Việt Nam.',
        sections: [
          {
            __component: 'sections.hero',
            title: 'Kiến tạo không gian sống',
            subtitle: 'Chúng tôi thiết kế những công trình hoà hợp với con người và thiên nhiên.',
            cta_text: 'Xem dự án',
            cta_link: '/projects',
          },
          {
            __component: 'sections.cta',
            title: 'Bắt đầu dự án của bạn',
            description: 'Liên hệ để nhận tư vấn miễn phí trong 24h.',
            button_text: 'Liên hệ ngay',
            button_link: '/contact',
          },
        ],
      },
      en: {
        title: 'Home',
        slug: 'home',
        seo_title: 'Architecture Studio — Home',
        seo_description: 'An architecture & interior design studio in Vietnam.',
        sections: [
          {
            __component: 'sections.hero',
            title: 'Crafting Living Spaces',
            subtitle: 'We design projects that harmonize people and nature.',
            cta_text: 'View Projects',
            cta_link: '/projects',
          },
          {
            __component: 'sections.cta',
            title: 'Start Your Project',
            description: 'Contact us for a free consultation within 24h.',
            button_text: 'Contact Us',
            button_link: '/contact',
          },
        ],
      },
    },
    {
      vi: {
        title: 'Giới thiệu',
        slug: 'gioi-thieu',
        seo_title: 'Về chúng tôi',
        seo_description: 'Câu chuyện và đội ngũ của studio.',
        sections: [
          {
            __component: 'sections.hero',
            title: 'Về chúng tôi',
            subtitle: 'Hành trình 10 năm kiến tạo.',
          },
        ],
      },
      en: {
        title: 'About',
        slug: 'about',
        seo_title: 'About Us',
        seo_description: 'Our studio story and team.',
        sections: [
          {
            __component: 'sections.hero',
            title: 'About Us',
            subtitle: 'A 10-year journey of design.',
          },
        ],
      },
    },
  ];

  for (const p of pages) {
    await createBilingual(strapi, 'api::page.page', p.vi, p.en);
    strapi.log.info(`[seed] ✅ Page: ${p.vi.title} / ${p.en.title}`);
  }
}
