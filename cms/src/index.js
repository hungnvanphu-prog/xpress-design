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
    strapi.log.info('[seed] 🌱 Bắt đầu upsert dữ liệu mẫu song ngữ...');

    const categories = await seedCategories(strapi);
    await seedProjects(strapi);
    await seedArticles(strapi, categories);
    await seedNews(strapi);
    await seedPages(strapi);

    strapi.log.info('[seed] ✅ Hoàn tất upsert dữ liệu mẫu');
  } catch (err) {
    strapi.log.error('[seed] Lỗi seed content:', err);
  }
}

/**
 * Upsert 1 entity theo (slug, locale). Nếu đã có → update, chưa có → create.
 * Với locale `en` thì tự link về bản `vi` qua field `localizations`.
 */
async function upsertBilingual(strapi, uid, viData, enData) {
  const viExisting = await strapi.db.query(uid).findOne({
    where: { slug: viData.slug, locale: 'vi' },
  });

  const viPayload = {
    ...viData,
    publishedAt: viData.publishedAt != null ? viData.publishedAt : new Date(),
  };
  const viEntity = viExisting
    ? await strapi.entityService.update(uid, viExisting.id, { data: viPayload })
    : await strapi.entityService.create(uid, {
        data: { ...viPayload, locale: 'vi' },
      });

  const enExisting = await strapi.db.query(uid).findOne({
    where: { slug: enData.slug, locale: 'en' },
  });

  const enPayload = {
    ...enData,
    publishedAt: enData.publishedAt != null ? enData.publishedAt : new Date(),
  };
  const enEntity = enExisting
    ? await strapi.entityService.update(uid, enExisting.id, { data: enPayload })
    : await strapi.entityService.create(uid, {
        data: { ...enPayload, locale: 'en', localizations: [viEntity.id] },
      });

  // Đồng bộ 2 chiều qua pivot table: entityService.update không tác động được
  // lên field `localizations` trên Strapi 4 i18n → chèn trực tiếp vào bảng link.
  await syncLocalizationLink(strapi, uid, viEntity.id, enEntity.id);
  await syncLocalizationLink(strapi, uid, enEntity.id, viEntity.id);

  return { vi: viEntity, en: enEntity };
}

async function syncLocalizationLink(strapi, uid, fromId, toId) {
  // Bảng pivot Strapi sinh ra có dạng `${collectionName}_localizations_links`,
  // với cột `${singularName}_id` (owner), `inv_${singularName}_id` (target)
  // và `${singularName}_order` (thứ tự).
  const model = strapi.getModel(uid);
  const singular = model.info?.singularName || model.modelName;
  const table = `${model.collectionName}_localizations_links`;
  const ownerCol = `${singular}_id`;
  const invCol = `inv_${singular}_id`;
  const orderCol = `${singular}_order`;

  const knex = strapi.db.connection;
  try {
    await knex(table)
      .insert({ [ownerCol]: fromId, [invCol]: toId, [orderCol]: 1 })
      .onConflict([ownerCol, invCol])
      .ignore();
  } catch (err) {
    strapi.log.warn(`[seed] Không sync được localization link ${table}: ${err.message}`);
  }
}

async function seedCategories(strapi) {
  // Category không bật i18n → upsert theo `name`
  const data = [
    { name: 'Kiến trúc', description: 'Bài viết về kiến trúc' },
    { name: 'Nội thất', description: 'Bài viết về nội thất' },
    { name: 'Cảnh quan', description: 'Bài viết về cảnh quan' },
    { name: 'Kiến thức xây dựng', description: 'Kiến thức chuyên sâu về xây dựng & ánh sáng' },
  ];
  const created = [];
  for (const d of data) {
    const existing = await strapi.db
      .query('api::category.category')
      .findOne({ where: { name: d.name } });
    const c = existing
      ? await strapi.entityService.update('api::category.category', existing.id, { data: d })
      : await strapi.entityService.create('api::category.category', { data: d });
    created.push(c);
    strapi.log.info(`[seed] ✅ Category: ${c.name}`);
  }
  return created;
}

async function seedProjects(strapi) {
  const detailVi = {
    hero_subtitle: 'Bản giao hưởng của ánh sáng và tĩnh lặng',
    problem_label: 'Vấn đề',
    problem_title: 'Bài toán của sự tĩnh tại giữa lòng đô thị.',
    problem_body:
      'Gia chủ khao khát một chốn trở về hoàn toàn biệt lập với nhịp sống hối hả ngoài kia. Yêu cầu đặt ra không chỉ là một không gian sinh hoạt, mà là một chốn ẩn mình xoa dịu các giác quan và nuôi dưỡng đời sống tinh thần.',
    implementation_label: 'Triển khai',
    implementation_title: 'Chế tác từng khoảnh khắc.',
    implementation_body:
      'Chúng tôi kiến tạo không gian mở ở tầng trệt, xóa nhòa ranh giới giữa phòng khách, bếp và khu vườn Zen. Vật liệu tự nhiên được lựa chọn để tương phản với đá thô và ánh sáng mềm, tạo nên một phổ màu trầm ấm, sang trọng và đầy tính bản nguyên.',
    result_label: 'Kết quả',
    result_quote:
      'Không chỉ là một công trình kiến trúc vật lý, mà là một tác phẩm nghệ thuật có tính thiền định — một di sản sống của gia chủ.',
  };

  const detailEn = {
    hero_subtitle: 'A symphony of light and stillness',
    problem_label: 'Problem',
    problem_title: 'The challenge of stillness within the city.',
    problem_body:
      'The homeowner wanted a place of return, completely set apart from the restless rhythm outside. The brief was not only a living space, but a retreat that soothes the senses and nurtures a more contemplative way of life.',
    implementation_label: 'Implementation',
    implementation_title: 'Crafting every moment.',
    implementation_body:
      'We created an open ground-floor sequence, dissolving the boundary between living room, kitchen and Zen garden. Natural materials are composed against raw stone and soft light, forming a warm, refined and elemental palette.',
    result_label: 'Result',
    result_quote:
      'More than a physical architectural work, it becomes a meditative piece of living art — a legacy for the homeowner.',
  };

  const projects = [
    {
      vi: {
        ...detailVi,
        title: 'Biệt thự Xanh Đà Lạt',
        slug: 'biet-thu-xanh-da-lat',
        description:
          'Biệt thự nghỉ dưỡng trên đồi thông, hoà quyện thiên nhiên với tầm nhìn panorama hướng thung lũng.',
        content:
          '<p>Công trình sử dụng vật liệu địa phương — đá bazan, gỗ thông và kính low-e khổ lớn — nhằm tối ưu thông gió tự nhiên và đón trọn ánh sáng ban ngày.</p><p>Không gian sống mở xuyên suốt tầng trệt kết nối trực tiếp với hồ bơi vô cực và rừng thông bao quanh, xoá nhòa ranh giới giữa nội thất và cảnh quan.</p><p>Các điểm nhấn thiết kế:</p><ul><li>Mặt tiền đá bazan tối màu, tương phản với gỗ thông sáng ấm.</li><li>Hệ kính khổ lớn cao 3.2m trượt toàn phần mở ra terrace.</li><li>Hồ bơi vô cực bốn cạnh, mặt nước nối liền tầm nhìn thung lũng.</li><li>Hệ thống thông gió chéo — giảm 60% chi phí làm mát.</li></ul>',
        location: 'Đà Lạt, Lâm Đồng',
        seo_title: 'Biệt thự Xanh Đà Lạt — Dự án kiến trúc nghỉ dưỡng',
        seo_description:
          'Dự án biệt thự nghỉ dưỡng hòa quyện cùng thiên nhiên Đà Lạt, thiết kế hiện đại với hồ bơi vô cực.',
      },
      en: {
        ...detailEn,
        title: 'Green Villa Da Lat',
        slug: 'green-villa-da-lat',
        description:
          'A resort villa on the pine hill in harmony with nature, offering a panoramic view over the valley.',
        content:
          '<p>The project uses local materials — basalt stone, pine wood and oversized low-e glass — to optimize natural ventilation and daylight.</p><p>The ground floor flows into an infinity pool and the surrounding pine forest, blurring the line between interior and landscape.</p><p>Design highlights:</p><ul><li>A dark basalt façade contrasted with warm, light-toned pine wood.</li><li>Full-sliding 3.2m-tall glazing opening onto the terrace.</li><li>A four-sided infinity pool extending the view across the valley.</li><li>Cross ventilation system — cutting cooling costs by 60%.</li></ul>',
        location: 'Da Lat, Lam Dong',
        seo_title: 'Green Villa Da Lat — Resort Architecture Project',
        seo_description:
          'A resort villa project blending with the nature of Da Lat, modern design with an infinity pool.',
      },
      shared: {
        client_name: 'Green Hill Group',
        project_type: 'residential',
        year: 2024,
        featured: true,
        architect: 'Le Anh Tuan',
        area: '450 m²',
        construction_time: 12,
      },
    },
    {
      vi: {
        ...detailVi,
        title: 'Penthouse Urban Skyline',
        slug: 'penthouse-urban-skyline',
        description:
          'Căn penthouse tại trung tâm TP.HCM với tầm nhìn toàn cảnh skyline, thiết kế theo phong cách Luxury Minimalism.',
        content:
          '<p>Sự sang trọng không đến từ các chi tiết rườm rà mà từ việc chắt lọc vật liệu và tỷ lệ không gian hoàn hảo: đá marble Calacatta, gỗ walnut và đồng thau vàng ấm.</p><p>Khu bếp đảo ốp đá nguyên khối, phòng khách double-height kết nối ra terrace riêng nhìn xuống thành phố.</p>',
        location: 'Quận 1, TP. Hồ Chí Minh',
        seo_title: 'Penthouse Urban Skyline — Thiết kế nội thất cao cấp',
        seo_description:
          'Penthouse hạng sang tại trung tâm TP.HCM với phong cách Luxury Minimalism tinh tế.',
      },
      en: {
        ...detailEn,
        title: 'Urban Skyline Penthouse',
        slug: 'urban-skyline-penthouse',
        description:
          'A downtown HCMC penthouse with a full skyline view, designed in the Luxury Minimalism aesthetic.',
        content:
          '<p>Luxury here comes not from ornamentation but from material curation and perfect proportions: Calacatta marble, walnut wood and warm brass.</p><p>The solid-stone kitchen island and double-height living room open onto a private terrace overlooking the city.</p>',
        location: 'District 1, Ho Chi Minh City',
        seo_title: 'Urban Skyline Penthouse — Premium Interior Design',
        seo_description:
          'A premium penthouse in downtown HCMC with refined Luxury Minimalism design.',
      },
      shared: {
        client_name: 'Mrs. Lan Huong',
        project_type: 'interior',
        year: 2023,
        featured: true,
        architect: 'Nguyen Van Nam',
        area: '320 m²',
        construction_time: 8,
      },
    },
    {
      vi: {
        ...detailVi,
        title: 'Neo Classic Residence',
        slug: 'neo-classic-residence',
        description:
          'Sự kết hợp hoàn hảo giữa vẻ đẹp cổ điển Pháp và tiện nghi hiện đại trong căn hộ tại Hà Nội.',
        content:
          '<p>Các chi tiết phào chỉ tinh tế, cột trang trí và hệ trần caisson được tiết chế, cân bằng bằng nội thất đương đại với đường nét thanh thoát.</p><p>Bảng màu trắng ngà, vàng champagne và xanh prussian blue tạo nên không gian đẳng cấp nhưng không xa cách.</p>',
        location: 'Ba Đình, Hà Nội',
        seo_title: 'Neo Classic Residence — Căn hộ tân cổ điển Hà Nội',
        seo_description:
          'Căn hộ tân cổ điển tại Hà Nội với chi tiết phào chỉ tinh tế và bảng màu sang trọng.',
      },
      en: {
        ...detailEn,
        title: 'Neo Classic Residence',
        slug: 'neo-classic-residence-en',
        description:
          'A perfect blend of classical French beauty and modern comfort in a Hanoi apartment.',
        content:
          '<p>Refined mouldings, decorative columns and caisson ceilings are balanced by contemporary furniture with clean silhouettes.</p><p>An ivory, champagne and Prussian blue palette delivers elegance without feeling distant.</p>',
        location: 'Ba Dinh, Hanoi',
        seo_title: 'Neo Classic Residence — Hanoi Neo-Classical Apartment',
        seo_description:
          'A neo-classical apartment in Hanoi with refined mouldings and a luxurious palette.',
      },
      shared: {
        client_name: 'Mr. Hoang Nam',
        project_type: 'interior',
        year: 2024,
        featured: false,
        architect: 'Tran Thi Mai',
        area: '180 m²',
        construction_time: 6,
      },
    },
    {
      vi: {
        ...detailVi,
        title: 'Nhà phố Tối giản Đà Nẵng',
        slug: 'nha-pho-toi-gian-da-nang',
        description:
          'Tối ưu không gian cho nhà phố diện tích hẹp nhưng vẫn đảm bảo sự thoáng đãng và sang trọng.',
        content:
          '<p>Giếng trời xuyên 4 tầng và khoảng thông tầng đưa ánh sáng tự nhiên chạm tới mọi phòng. Mặt tiền lam bê tông che nắng nhưng vẫn lưu thông gió biển.</p><p>Nội thất gỗ sồi trắng kết hợp bê tông trần mang đến vẻ đẹp mộc mạc nhưng tinh tế.</p>',
        location: 'Sơn Trà, Đà Nẵng',
        seo_title: 'Nhà phố Tối giản Đà Nẵng — Kiến trúc hiện đại ven biển',
        seo_description:
          'Nhà phố tối giản tại Đà Nẵng tối ưu ánh sáng và thông gió tự nhiên.',
      },
      en: {
        ...detailEn,
        title: 'Minimalist Townhouse Da Nang',
        slug: 'minimalist-townhouse-da-nang',
        description:
          'A narrow townhouse optimized for openness and elegance without sacrificing luxury.',
        content:
          '<p>A 4-storey skylight and an interior void bring daylight to every room. The concrete louvre façade shades the sun while letting sea breezes pass.</p><p>White oak furniture paired with exposed concrete delivers a rustic yet refined ambience.</p>',
        location: 'Son Tra, Da Nang',
        seo_title: 'Minimalist Townhouse Da Nang — Coastal Modern Architecture',
        seo_description:
          'A minimalist townhouse in Da Nang optimized for daylight and natural ventilation.',
      },
      shared: {
        client_name: 'Mr. Thanh Tung',
        project_type: 'residential',
        year: 2023,
        featured: false,
        architect: 'Pham Hoang Duy',
        area: '250 m²',
        construction_time: 10,
      },
    },
    {
      vi: {
        ...detailVi,
        title: 'Văn phòng Sáng tạo Sài Gòn',
        slug: 'van-phong-sang-tao-sai-gon',
        description:
          'Văn phòng hybrid cho công ty công nghệ 500 nhân sự, thiết kế xoay quanh hoạt động và con người.',
        content:
          '<p>Không gian mở với các cụm collaboration, phòng focus-pod cách âm và hệ thống acoustic ceiling bằng vật liệu tái chế.</p><p>Cafeteria trung tâm hoạt động như heart of the office, kết nối 3 tầng qua cầu thang điêu khắc.</p>',
        location: 'Quận 1, TP. Hồ Chí Minh',
        seo_title: 'Văn phòng Sáng tạo Sài Gòn — Thiết kế workspace hybrid',
        seo_description:
          'Thiết kế văn phòng hybrid tại trung tâm TP.HCM, tối ưu hoạt động đội ngũ 500 nhân sự.',
      },
      en: {
        ...detailEn,
        title: 'Saigon Creative Office',
        slug: 'saigon-creative-office',
        description:
          'A hybrid office for a 500-people tech company, designed around activity and people.',
        content:
          '<p>Open zones for collaboration, soundproof focus pods and an acoustic ceiling system in recycled materials.</p><p>A central cafeteria acts as the heart of the office, connecting three floors via a sculptural staircase.</p>',
        location: 'District 1, Ho Chi Minh City',
        seo_title: 'Saigon Creative Office — Hybrid Workspace Design',
        seo_description:
          'Hybrid office design in the heart of Ho Chi Minh City for a 500-people tech team.',
      },
      shared: {
        client_name: 'Saigon Tech JSC',
        project_type: 'commercial',
        year: 2025,
        featured: true,
        architect: 'Xpress Design Studio',
        area: '2,800 m²',
        construction_time: 9,
      },
    },
    {
      vi: {
        ...detailVi,
        title: 'Nhà phố Hà Nội 2025',
        slug: 'nha-pho-ha-noi-2025',
        description:
          'Nhà phố 4 tầng tối ưu ánh sáng giữa lòng phố cổ Hà Nội, giao thoa hiện đại và truyền thống.',
        content:
          '<p>Giếng trời xuyên suốt, vườn trong nhà với cây xanh cao 4m, cùng vật liệu thân thiện môi trường.</p><p>Mặt tiền gạch đất nung thủ công gợi nhắc phố cổ, kết hợp với cửa kính khung thép đen tối giản.</p>',
        location: 'Hoàn Kiếm, Hà Nội',
        seo_title: 'Nhà phố Hà Nội 2025 — Hiện đại giữa lòng phố cổ',
        seo_description:
          'Nhà phố hiện đại tối ưu ánh sáng giữa phố cổ Hà Nội, giao thoa truyền thống và đương đại.',
      },
      en: {
        ...detailEn,
        title: 'Hanoi Townhouse 2025',
        slug: 'hanoi-townhouse-2025',
        description:
          'A 4-storey townhouse maximizing daylight in the Old Quarter, bridging modern and traditional.',
        content:
          '<p>A full-height skylight, an indoor garden with 4m-tall trees and eco-friendly materials throughout.</p><p>A handmade terracotta façade references the Old Quarter, paired with minimalist black steel-framed glazing.</p>',
        location: 'Hoan Kiem, Hanoi',
        seo_title: 'Hanoi Townhouse 2025 — Modern in the Old Quarter',
        seo_description:
          'A modern townhouse optimizing daylight in Hanoi Old Quarter, blending tradition and contemporary.',
      },
      shared: {
        client_name: 'Private',
        project_type: 'residential',
        year: 2025,
        featured: false,
        architect: 'Xpress Design Studio',
        area: '320 m²',
        construction_time: 11,
      },
    },
  ];

  for (const p of projects) {
    await upsertBilingual(
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
  const catCanhQuan = categories.find((c) => c.name === 'Cảnh quan')?.id;
  const catKienThucXD = categories.find((c) => c.name === 'Kiến thức xây dựng')?.id;

  const heroLivingLight =
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80';
  const imgSkylightDiagram =
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80';
  const imgBeforeAfter =
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80';

  const articles = [
    {
      vi: {
        title: '5 xu hướng kiến trúc bền vững 2025',
        slug: '5-xu-huong-kien-truc-ben-vung-2025',
        excerpt:
          'Góc nhìn từ hiện trường: cách chúng tôi tích hợp bền vững ở vùng nhiệt đới — không phải checklist màu xanh, mà công năng, vận hành và số liệu.',
        content: [
          '<p><strong>Mục tiêu bài viết</strong> — Giúp chủ đầu tư và cộng sự dự án hiểu rõ: “bền vững” ở điều kiện Việt Nam cần ưu tiên gì trước, đo bằng gì, và nơi nào nên mạnh dạn từ bỏ giải pháp bắc cầu từ khí hậu ôn đới.</p>',
          '<p>Trong 24 tháng gần đây, phần lớn dự án nghỉ dưỡng và biệt thự tại Tây Nguyên, miền Trung, Nam Bộ mà chúng tôi tư vấn đều cùng một câu hỏi: làm thế nào để giảm tải nhiệt <em>trước khi</em> hệ cơ điện bù đắp? Câu trả lời không nằm ở thêm công nghệ, mà ở thứ tự ưu tiên sau.</p>',
          '<blockquote>“Bền vững ở nhiệt đới, trước hết, là tối ưu thông gió, bóng, và tải nhiệt tước — còn pin mặt trời nên tới khi tường và mái đã làm tròn việc.”</blockquote>',
          '<h2>1. Mặt động, lam, thông gió chéo: giảm nhiệt ở biên tòa</h2>',
          '<p>Chúng tôi bố trí lam cố định hoặc lam điện kết hợp giếng trời tầng, tạo áp chênh cho gió bắc–nam thổi xuyên. Ở nhà phố 4–5 tầng, bản vẽ thường thêm cầu thang bộ thông tầng như ống khói ướt để tận dụng hiệu ứng kéo. Kết quả đo tại 3 công trình mẫu: công suất lạnh thiết kế giảm 18–32% khi bước qua concept SD.</p>',
          '<h2>2. Vật liệu địa phương, vòng đời thấp, truy vết nguồn</h2>',
          '<p>Đá bazan, đá ong, gỗ tràm/keo đã tẩm, bê tông bù xốp nội tại, hoàn thiện tại công trường: giảm tải vận tải và tăng tính kể chuyện cho mặt tiền. Hợp đồng cần yêu cầu tối thiểu: chỉ nhận gỗ FSC/PEFC hoặc tương đương; với đá — batch test độ hút nước mặt, công bố công tác tẩy tạp chất ở vùng.</p>',
          '<h2>3. Cây cấu trúc, không gian bán ngoài trời có mái vải hoá</h2>',
          '<p>Mái lam + dàn leo, giếng trời cây cao, hành lang ngoài trời dạng “veranda 2.0” — tất cả đều gắn với tưới tự động, dự trữ nước mưa cho cảnh, và ánh sáng nền 3000K để tối ưu thiên địa con người lúc hoàng hôn.</p>',
          '<h2>4. Nước mưa, phân vùng thoát nước, giảm hiện tượng đảo nhiệt</h2>',
          '<p>Vườn thấm, rãnh cỏ, vỉa thấm nước ở bãi đỗ, mái cạn xanh trọng tải: ít tạo mặt phản hồi nhiệt ồ ạt, nhiều bề mặt hút, chậm, làm mát. Điều này tưởng thuộc cảnh quan nhưng thực chất hạ tải nhiệt cho tầng trệt công cộng.</p>',
          '<h2>5. Vận hành thông minh: đo, hiệu chỉnh, rồi mới tự động hoá</h2>',
          '<p>Sensor CO₂, bậc dim theo ánh sáng tự nhiên, chính sách tắt từng vùng khi vắng: chi phí thấp hơn nhiều so với hệ tích hợp “mọi thứ trên app”. Chúng tôi khuyến nghị bảng theo dõi năng lượng 12 tháng đầu vận hành, sau đó mới tính tới solar hoặc storage.</p>',
          '<h2>Dành cho ai, và bắt đầu từ đâu</h2>',
          '<p>Nếu bạn là chủ đầu tư dự án dưới 1.000 m² sàn: hãy yêu cầu tư vấn viết rõ số nhiệt/điện ước tính theo từng mặt, và từ chối bản thiết kế không mô tả tuyến gió. Nếu bạn là KTS đối tác: trao với cơ điện sớm, trước hình khối, cố định mảng tường tải nhiệt tây trước khi bàn về cột–dầm.</p>',
        ].join(''),
        tags: ['bền vững', 'xu hướng', '2025'],
        seo_title: '5 xu hướng kiến trúc bền vững 2025',
        seo_description: 'Khám phá 5 xu hướng kiến trúc xanh nổi bật năm 2025.',
      },
      en: {
        title: '5 Sustainable Architecture Trends 2025',
        slug: '5-sustainable-architecture-trends-2025',
        excerpt:
          'Field notes, not a green checklist: how we calibrate “sustainability” for the tropical belt — with metrics, not mood boards.',
        content: [
          '<p><strong>What this article is for</strong> — to give owners and project teams a clear priority stack for the Vietnamese climate: which moves come first, what to measure, and when to import temperate-climate “green” playbooks (hint: often not at all).</p>',
          '<p>Across the last two years, whether it was hill villas, coastal second homes, or highland retreats, the brief converged: cut heat <em>before</em> the MEP system compensates. The sequence below is what we spec most often, and what we see survive value-engineering the best.</p>',
          '<blockquote>“Tropical sustainability starts with air paths, shadow, and thermal load — not with panels on the roof before the wall works.”</blockquote>',
          '<h2>1. Breathing facades, fixed louvres, cross ventilation</h2>',
          '<p>We use fixed or adjustable louvres, stair cores as vertical chimneys, and cross-vent “zones” in plan so wind does real work, not just arrow graphics. On 4–5 storey shophouse retrofits, we have measured 18–32% chiller nameplate headroom recaptured at SD stage.</p>',
          '<h2>2. Local material palettes with traceable supply</h2>',
          '<p>Basalt, laterite, oiled FSC/PEFC timber, site-batched light concrete: lower trucking, clearer storytelling on the elevation. The contract addendum matters: block batch tests for water absorption, stone yard disclosure, and joinery with documented coating cycles.</p>',
          '<h2>3. Structural planting, not pot plants</h2>',
          '<p>Green screens on steel armatures, high-canopy courts, semi-outdoor “veranda 2.0” — tied to low-flow irrigation, first-flush cisterns for softscape, and 3000K exterior ambient light so the space reads warm at twilight, not a parking lot in disguise.</p>',
          '<h2>4. Rain, split-flow drainage, and heat-island control</h2>',
          '<p>Swales, band drains, water-permeable staff parking, partial green roofs: slow water down, cool the ground floor plane, and stop shiny pavements from rebounding heat into the public realm.</p>',
          '<h2>5. Smart operations only after you can meter</h2>',
          '<p>CO₂ sensors, daylight dimming, zoned shut-off: cheaper than a full BMS, easier to hand over, and a better dataset at year one. We only recommend roof PV after 12 months of real load data once the building breathes as designed.</p>',
          '<h2>Who it is for, and the first line on the RFP</h2>',
          '<p>If you are a sub-1,000 m² GFA client: require heat balance assumptions per orientation and a written ventilation narrative before reviewing aesthetics. If you are the architect: lock west-wall treatments with the MEP team before the column grid hardens — it saves everyone a retrofit.</p>',
        ].join(''),
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
        excerpt:
          'Tối giản không phải bức tường trắng sân khấu. Đó là cách dùng tỷ lệ, ánh sáng và tủ âm tường để tâm trí cư dân tĩnh lại — bài này nói về 4 lớp: không gian, vật liệu, ánh sáng, cất đồ.',
        content: [
          '<p>Chúng tôi thường gặp yêu cầu: “Làm sao tối giản mà vẫn cao cấp?” Câu trả lời không nằm ở số món nội thất, mà ở việc <strong>làm tường dày, sàn tĩnh, ánh sáng gián tiếp</strong> để tạo cảm giác “căn hộ đã ổn dù còn trống”.</p>',
          '<h2>1. Tỷ lệ phòng, cao sàn, và cảm giác “dư chân”</h2>',
          '<p>Ở chung cư, chúng tôi ưu tiên trần 2,75m trở lên ở khu công cộng, khu ngủ thấp hơn 2,65m để bảng tường thấp hơn cảm giác bao bọc. Hành lang rút ngắn, tủ âm dài sát trần — tạo một “khuyếch đại tĩnh” cho ánh sáng.</p>',
          '<h2>2. Bảng màu: 70/20/10 nhưng với ánh sáng</h2>',
          '<p>70% nền (trắng nồng, ghi ấm, be), 20% sàn/gỗ, 10% kim loại. Điểm 10% ấy có thể là song cửa đồng, tay nắm thau, cạnh tủ — nhưng phải ăn ánh sáng, không tự tỏa sáng bẩn.</p>',
          '<h2>3. Ánh sáng: 2700K vùng nghỉ, 3000K vùng ăn, tránh 4000K vùng tắm</h2>',
          '<p>Ánh 4000K làm bề mặt sứ, đá, da trông sạch quá mức, gây cảm giác bệnh viện. Ở phòng tắm, chúng tôi kết hợp 3000K gián tiếp + 2700K spot nhấn, luôn có dim.</p>',
          '<blockquote>“Căn tối giản tốt là căn cất được dây sạc, ủi, quạt, vali — tủ không chỉ sâu mà còn theo tần suất dùng.”</blockquote>',
          '<h2>4. Tủ, khe mượt, và công tác cơ điện ẩn</h2>',
          '<p>Tủ 400–500mm, cửa cùng tông tường, ray đồng cấp. Khe trở, khe ống rút, khe ủi: chúng tôi sắp ở giai đoạn concept để ống ốp có giới hạn, tránh tủ “ăn cắp” 100mm cuối cùng ở shopdrawing.</p>',
          '<h2>Checklist 10 phút cho gia chủ trước khi bấm màu tường</h2>',
          '<ul><li>Bạn cần bao nhiêu ổ cắm che — không ổ nào lộ ở vùng thấp sightline?</li><li>Bạn có 5 phút rút vật từ tủ mà không với tay ngược?</li><li>Chụp 3 ảnh đêm với ánh 2700/3000K — tường còn “nhám” tốt không, hay tự phát ánh sáng xám?</li></ul>',
        ].join(''),
        tags: ['tối giản', 'nội thất'],
        seo_title: 'Nội thất tối giản',
        seo_description: 'Hiểu đúng về phong cách nội thất tối giản.',
      },
      en: {
        title: 'Minimal Interior: Less to Breathe More',
        slug: 'minimal-interior',
        excerpt:
          'Minimal is not a white box. It is how proportion, light, and joinery make the mind go quiet—four layers: space, material, light, and storage that disappears.',
        content: [
          '<p>Clients often ask: “How do we do minimal and still look premium?” The answer is not in fewer total objects — it is in <strong>wall thickness, a calm floor plane, and light that bounces, not barks</strong>. A great minimal apartment can feel “complete” with half the expected furniture, because the room is already well dressed.</p>',
          '<h2>1. Proportion, slab-to-slab, and a sense of legroom in plan</h2>',
          '<p>We keep public areas at 2.75m clear height where possible, bedrooms slightly lower for intimacy. The corridor shrinks, the storage runs the full wall — it amplifies calm light.</p>',
          '<h2>2. Color: 70/20/10, but the 10% must earn its lux</h2>',
          '<p>70% warm white / putty, 20% wood tone, 10% warm metal. That “10%” is door frames, a thin shelf edge, a handle — and it has to be lit, not self-shouting.</p>',
          '<h2>3. Light temperature by zone, not by fixture brand</h2>',
          '<p>2700K in rest, 3000K in dining, avoid 4000K in primary baths — it makes porcelain, stone, and skin look too clinical. Baths are 3000K indirect with a 2700K spot or two, always on dimmers.</p>',
          '<blockquote>“A good minimal home hides chargers, irons, fans, and suitcases. Depth is not enough — weekly frequency matters in joinery design.”</blockquote>',
          '<h2>4. Joinery, shadow gaps, and the MEP ghost</h2>',
          '<p>We align recesses for drapes, for ducts, and for vacuum wand storage at concept — or the last 100mm of depth gets stolen in shop drawings and the calm dies.</p>',
          '<h2>A 10-minute owner self-check</h2>',
          '<ul><li>Count hidden outlets, not more visible ones in low sightlines — none?</li><li>Can you pull daily items in under five seconds without a twist?</li><li>Take three night photos: does the wall read soft with 2700/3000K, or go grey-luminous and cheap?</li></ul>',
        ].join(''),
        tags: ['minimal', 'interior'],
        seo_title: 'Minimal Interior',
        seo_description: 'Understanding the minimal interior style.',
      },
      category: catNoiThat,
    },
    {
      vi: {
        title: 'Cảnh quan đô thị và vi khí hậu: tạo ra sự dễ chịu thật sự',
        slug: 'canh-quan-do-thi-va-vi-khi-hau',
        excerpt:
          'Bài phân tích ở thang lô phố, khu đế chung cư, và sảnh ngoài trời: cách đo sự dễ chịu, không dừng ở “có cây”.',
        content: [
          '<p>Vi khí hậu ở quy mô tòa — hay “khí hậu từng sảnh, từng bãi, từng bậc cấp cây” — là công việc của cảnh quan + kết cấu + cơ điện, không còn nằm ở hình minh hoạ 3D xanh. Bài này mô tả cách chúng tôi ưu tiên, đo, và sửa trên sơ đồ thực địa.</p>',
          '<h2>1. Bóng theo tuyến tây–nam, không theo tên cây trên catalogue</h2>',
          '<p>Ở tuyến tây, hàng tán dù cao, rộng, đa tầng (thường hợp cây bản địa) đặt cách tường 1,5–2,5m tùy tường. Nếu không gian chật, tre + lam kết hợp — tre cho bóng nhanh, lam ổn định tải nhiệt 10 năm.</p>',
          '<h2>2. Hành lang gió: kết nối sảnh, cầu cảnh, hành lang tầng 2</h2>',
          '<p>Chúng tôi tìm “cửa sổ bầu trời” ở giếng tòa, mở gió qua tuyến dài — giảm cảm giác ngạt ở lối từ bãi lên. Cầu cảnh ở tầng 2 dùng lan can thoáng, không tấm chắn kín, để tạo ống gió tự nhiên cạnh ống thang bộ cơ.</p>',
          '<h2>3. Mặt vỉa, albedo, và nhiệt phản hồi tới chân tường</h2>',
          '<p>Đá granito sáng, bê tông xám, vỉa thông thấm, hoặc vỉa sỏi + tấm ốp — chúng tôi ánh xạ từng 50m, tránh 100% asphal đen dưới tường kính tầng 1, nếu bài toán tài chính còn vướng thì ưu tiên phủ tấm ốp phản sáng tại tuyến nắng trực xạ.</p>',
          '<h2>4. Chỉ số đo “không ước mơ hão” trên công trường</h2>',
          '<ul><li>Nhiệt cảm nhận (WBGT) tại 3 mốc: 8h, 12h, 16h, tháng 4–5.</li><li>Tốc độ gió 1,1m, 1,4m, 1,7m: đủ tạo cảm giác “có hơi thở” ở sảnh.</li><li>Ảnh nhiệt tường: so trước/ sau tán cây, điều này thuyết phục CĐT nhanh hơn 20 render.</li></ul>',
          '<h2>5. Từ mảng tới tài chính: phân kỳ, không đòi tất cả ngay</h2>',
          '<p>Chúng tôi thường đề nghị 3 mốc: (1) tán + vỉa, (2) cầu cảnh + tưới, (3) tối ưu cảnh thấp, thủy, đèn nền. CĐT thấy rõ phần nào giải nhiệt thật, phần nào còn ở tầm “cải thiện hình ảnh dài hạn”.</p>',
        ].join(''),
        tags: ['cảnh quan', 'vi khí hậu', 'đô thị'],
        seo_title: 'Cảnh quan đô thị & vi khí hậu',
        seo_description: 'Giải pháp cảnh quan giảm nhiệt cảm nhận ở đô thị nhiệt đới.',
      },
      en: {
        title: 'Urban landscape & micro-climate: making comfort measurable',
        excerpt:
          'Field-scale notes for podium edges, lobbies, and side streets: how we measure “comfort” beyond generic planting.',
        content: [
          '<p>“Micro-climate” is not a landscape mood — it is the overlap of shadow geometry, albedo, and wind routing at the handrail and the valet. This article is how we set priorities, measure, and phase spend so owners see heat relief before they see a bigger plant list.</p>',
          '<h2>1. West and south edge shade first — not the prettiest tree first</h2>',
          '<p>On west walls we place layered canopy, often native multi-tier rows with 1.5–2.5m offset from the facade. Tight plinths: bamboo for fast shade, fixed louvres for long-horizon control.</p>',
          '<h2>2. Wind threads: entry, stair cores, the level-2 bridge</h2>',
          '<p>We hunt for a sky gap in the plan and pull wind across the public path from parking to the lift lobby. A level-2 green bridge is kept open, not a glass handrail billboard — the breeze needs a line.</p>',
          '<h2>3. Pavement, albedo, and heat kickback to the base wall</h2>',
          '<p>We map 50m segments: permeable, light aggregate, or gravel with strips — and we fight the all-asphalt valet. If the budget cannot lose asphalt, at least a reflective band under the first bay of curtain wall.</p>',
          '<h2>4. Field metrics that are hard to “render away”</h2>',
          '<ul><li>WBGT at 8:00, 12:00, 16:00 in the shoulder season, not a single “nice hour” still.</li><li>1.1/1.4/1.7 m/s wind targets at the lobby queue — a felt breath test.</li><li>Thermal photos of the west elevation before/after tree establishment — the fastest C-suite persuasion.</li></ul>',
          '<h2>5. Phasing: shade + pavement, then the bridge, then the softscape “jewelry”</h2>',
          '<p>Three gates keep CAPEX clear: (1) canopy and cool pavement, (2) the bridge and irrigation backbone, (3) ornamental layers and night ambient. The owner sees the load drop before the “Instagram layer.”</p>',
        ].join(''),
        slug: 'urban-landscape-micro-climate',
        tags: ['landscape', 'micro-climate', 'urban'],
        seo_title: 'Urban landscape & micro-climate',
        seo_description: 'Landscape strategies that reduce felt heat in tropical blocks.',
      },
      category: catCanhQuan,
    },
    {
      vi: {
        title: 'Tính tĩnh lặng trong thiết kế spa & wellness tại gia',
        slug: 'tinh-tinh-lang-spa-wellness',
        excerpt:
          'Góc nhìn từ phòng tắm mẫu: âm, sáng, mùi, tiếng nước, và tại sao ốp đá dày từ sàn tới nóc thường “phá” sự tĩnh bạn tưởng mình đang mua.',
        content: [
          '<p>Phân khúc “wellness tại gia” đang tăng, nhưng sản phẩm sàn vẫn bán theo tấm ốp, sen phun, sục, đèn dây. Chúng tôi bắt đầu từ câu: <strong>khoảng lặng nào bạn cần sau 10 tiếng họp, và tối thiểu thiết bị nào đủ tạo khoảng lặng đó?</strong> — không từ danh sách hạng mục showroom.</p>',
          '<h2>1. Âm trường: tường, trần, sàn, và nước rơi</h2>',
          '<p>Ốp đá, kính, sứ: phản xạ ồn cao, tiếng nước thành “kính cắn”. Chúng tôi ưu tiên: tường đất kết hợp chống nấm, trần thạch 12–16mm, khe ống/đèn âm. Sen trần mưa kết hợp tấm tán giọt, tiếng nước từ “võng” hơn “bắn”.</p>',
          '<h2>2. Sáng: 2700K, dim 1–10%, tách vùng tắm/đi/tẩy trang</h2>',
          '<p>Ánh 4000K + gương lớn gây cảm giác “bệnh viện tư nhân chưa tới”. Ở khu ướt, chúng tôi: gián tiếp trần 2700K, 1 – 2 bát điểm dim, đèn tủ/điểm 2200K xung quanh bồn rửa, độc lập mạch dim.</p>',
          '<h2>3. Tỷ lệ, chiều cao, tầm nhìn “trần tối, chân tường sáng”</h2>',
          '<p>2,6m–2,8m, trừ xà gồ, chúng tôi ưa trần tối, sàn ốp ấm, khu ướt cao 2,5m+ nhưng có kệ âm, khe thoát hơi. Gương đừng ăn hết tường; chừa 30–40% tường sần/trung tính để ánh sáng có “bám”.</p>',
          '<blockquote>“Căn tắm tốt là căn tắm khi tắt 80% đèn, bạn vẫn thấy rõ từng bước mà thấy tâm ổn, không ồn, không cường độ ánh 600 lux.”</blockquote>',
          '<h2>4. MEP ẩn, hốc thông gió, và tránh ốm kín</h2>',
          '<p>Quạt ống, khử ẩm, nước sàn 2% tới họng thu, khe 10mm ở đáy tủ — tất cả nên ổn định trước khi chốt đá. Nếu không, MEP ăn 150mm, kính, đá, khoét lại, ngân sách đội.</p>',
          '<h2>5. Lộ trình triển khai: concept → bản vẽ nước tĩnh → mẫu 1/1 3m2</h2>',
          '<p>Chúng tôi dựng 3m2 mẫu cạnh ốp thật, thử: tiếng nước, ánh, dim, mùi sơn/keo, trước khi ốp 80m2 thật. Chi phí mẫu 1% ngân sách hoàn thiện, thường trả 6–8% lãng phí vận hành 5 năm.</p>',
        ].join(''),
        tags: ['wellness', 'nội thất', 'spa'],
        seo_title: 'Tĩnh lặng & wellness tại gia',
        seo_description: 'Thiết kế spa, âm trường và ánh sáng phòng tắm cao cấp.',
      },
      en: {
        title: 'Silence in home spa & wellness design',
        excerpt:
          'A bathroom is not a tile catalogue. It is how sound, light, and humidity behave when you are tired — a five-part framework from mockups, not lifestyle quotes.',
        content: [
          '<p>The “home spa” market keeps selling jets, color LEDs, and slab counts. We start with one question: <strong>which kind of stillness you need after ten hours of calls — and the smallest kit that earns it</strong> — not the longest fixture list in the gallery.</p>',
          '<h2>1. Acoustics: wall, ceiling, floor, and the way water sounds</h2>',
          '<p>Stone, glass, and hard porcelain can turn every droplet into a “glass ping”. We use layered plaster, mineral finishes with anti-fungal specification, 12–16mm acoustic ceiling boards, and rain-head plus deflector plates to voice “cotton”, not “spray on sheet glass”.</p>',
          '<h2>2. Light: 2700K, 1–10% dim, separate act paths</h2>',
          '<p>4000K and large mirrors are the premium-clinic look. The wet field gets indirect 2700K, 1–2 small adjustable accents, 2200K for vanity, each on a dimmer leg — you should be able to shower with almost no downlight.</p>',
          '<h2>3. Proportion, dark soffit, light base</h2>',
          '<p>2.6m–2.8m, minus beams; we like the upper plane darker and the floor warmer. The mirror does not have to be full store-height — 30–40% soft wall is where light stops screaming.</p>',
          '<blockquote>“A good bath feels fine at 20% of the lights on — you still know where the foot is, the mind is quiet, and the lux is not 600 in your eyes.”</blockquote>',
          '<h2>4. MEP, hidden plenums, and anti-moisture discipline</h2>',
          '<p>Duct, exhaust, 2% floor fall to proper traps, 10mm shadow gaps in joinery: fix before the slab selection — or 150mm is stolen, stone is re-cut, and the budget is gone.</p>',
          '<h2>5. Process: design intent → static wet drawings → 3m² mockup</h2>',
          '<p>We build a 3m² test cell with real stone, real mixer, real dim, real sound — not mood boards. Cost is about 1% of fit-out, often pays back 6–8% in first-five-year waste.</p>',
        ].join(''),
        slug: 'silence-home-spa-wellness',
        tags: ['wellness', 'interior', 'spa'],
        seo_title: 'Silence in home spa & wellness design',
        seo_description: 'Spa, acoustic and lighting for premium residential bathrooms.',
      },
      category: catNoiThat,
    },
    /* —— Góc nhìn: bài mẫu “ánh sáng” + 3 bài liên quan cùng chuyên mục —— */
    {
      vi: {
        title: 'Phong thủy nhà phố: Nguyên tắc vàng cho sự thịnh vượng',
        slug: 'phong-thuy-nha-pho-nguyen-tac-vang',
        excerpt: 'Cách bố cục cửa, giếng trời và luồng khí ở nhà phố nhiệt đới — góc nhìn thực dụng từ hiện trường.',
        content: '<p>Bài tóm tắt các nguyên tắc phong thủy ứng dụng mà chúng tôi dùng khi tư vấn nhà phố: trục chính, điểm tụ khí, và tránh xung sát thực tế.</p>',
        tags: ['phong thủy', 'nhà phố'],
        hero_image_url: heroLivingLight,
        reading_time_minutes: 5,
        author_display_name: 'KTS. Nguyễn Minh An',
        author_role: 'Trưởng phòng Thiết kế Kiến trúc, XPRESS DESIGN',
        author_bio: 'Hơn 12 năm kinh nghiệm trong thiết kế không gian sống.',
      },
      en: {
        title: 'Townhouse Feng Shui: Golden rules for prosperity',
        slug: 'townhouse-feng-shui-golden-rules',
        excerpt: 'Door axis, skylight, and airflow in tropical townhouses — field notes from practice.',
        content: '<p>A short guide to applied feng shui principles we use on narrow urban plots.</p>',
        tags: ['feng shui', 'townhouse'],
        hero_image_url: heroLivingLight,
        reading_time_minutes: 5,
        author_display_name: 'Arch. Minh An Nguyen',
        author_role: 'Head of Architecture Design, XPRESS DESIGN',
        author_bio: 'Over 12 years of experience in residential and light design.',
      },
      category: catKienThucXD,
    },
    {
      vi: {
        title: '5 Xu hướng thiết kế nội thất định hình năm tới',
        slug: '5-xu-huong-thiet-ke-noi-that-nam-toi',
        excerpt: 'Từ vật liệu thô tinh lọc đến ánh sáng đa lớp — những xu hướng chúng tôi đang triển khai cho khách hàng cao cấp.',
        content: '<p>Danh sách xu hướng nội thất với ví dụ từ dự án thực tế của XPRESS DESIGN.</p>',
        tags: ['xu hướng', 'nội thất'],
        hero_image_url: imgBeforeAfter,
        reading_time_minutes: 7,
      },
      en: {
        title: '5 Interior design trends shaping next year',
        slug: '5-interior-trends-next-year',
        excerpt: 'Refined raw materials and layered light — what we specify for premium clients today.',
        content: '<p>Trend notes with examples from recent Xpress projects.</p>',
        tags: ['trends', 'interior'],
        hero_image_url: imgBeforeAfter,
        reading_time_minutes: 7,
      },
      category: catKienThucXD,
    },
    {
      vi: {
        title: 'Vật liệu tái chế: Xu hướng bền vững cho ngôi nhà hiện đại',
        slug: 'vat-lieu-tai-che-xu-huong-ben-vung',
        excerpt: 'Gạch nghiền, kính tái chế và gỗ tái sinh — chi phí, độ bền và cảm xúc bề mặt.',
        content: '<p>Ứng dụng vật liệu tái chế trong kiến trúc dân dụng và những lưu ý thi công.</p>',
        tags: ['bền vững', 'vật liệu'],
        hero_image_url: imgSkylightDiagram,
        reading_time_minutes: 6,
      },
      en: {
        title: 'Recycled materials: A sustainable direction for modern homes',
        slug: 'recycled-materials-modern-homes',
        excerpt: 'Crushed brick, recycled glass, and reclaimed timber — cost, durability, and tactility.',
        content: '<p>How we specify recycled content without sacrificing performance.</p>',
        tags: ['sustainability', 'materials'],
        hero_image_url: imgSkylightDiagram,
        reading_time_minutes: 6,
      },
      category: catKienThucXD,
    },
    {
      vi: {
        title: 'Ánh sáng tự nhiên: Bản giao hưởng của không gian',
        slug: 'anh-sang-tu-nhien-ban-giao-huong-cua-khong-gian',
        excerpt:
          'Ánh sáng không chỉ là nhu cầu vật lý, mà còn là chất liệu trang trí đắt giá nhất trong kiến trúc. Bài viết này sẽ hướng dẫn bạn cách bố trí giếng trời, cửa sổ và vật liệu phản quang để biến ngôi nhà thành một tác phẩm nghệ thuật đầy cảm xúc.',
        lead: 'Ánh sáng tự nhiên là món quà vô giá mà thiên nhiên ban tặng cho mỗi ngôi nhà. Thế nhưng, không phải ai cũng biết cách tận dụng nó một cách tối ưu. Trong bài viết này, chúng tôi sẽ chia sẻ 3 bí quyết để biến ánh sáng thành “bản giao hưởng” cho không gian sống của bạn.',
        reading_time_minutes: 6,
        publishedAt: new Date('2025-04-15T02:00:00.000Z'),
        hero_image_url: heroLivingLight,
        author_display_name: 'KTS. Nguyễn Minh An',
        author_role: 'Trưởng phòng Thiết kế Kiến trúc, XPRESS DESIGN',
        author_bio:
          'Hơn 12 năm kinh nghiệm trong lĩnh vực thiết kế không gian sống, chuyên sâu về tối ưu ánh sáng tự nhiên và phong thủy ứng dụng.',
        tags: ['ánh sáng', 'kiến trúc', 'giếng trời'],
        seo_title: 'Ánh sáng tự nhiên: Bản giao hưởng của không gian | XPRESS DESIGN',
        seo_description:
          'Bố trí giếng trời, cửa sổ và vật liệu phản quang để ngôi nhà tràn ngập ánh sáng và cảm xúc.',
        content: [
          `<p>Ánh sáng đi qua lớp rèm mỏng, đọng lại thành những mảng sáng mềm trên sàn gỗ — đó là khoảnh khắc mà nhiều gia chủ nhận ra: thiết kế thực sự bắt đầu từ việc dẫn dắt ánh sáng, chứ không phải từ đồ nội thất.</p>`,
          `<figure class="my-8"><img src="${imgSkylightDiagram}" alt="Sơ đồ minh họa giếng trời" /><figcaption class="text-[13px] text-[#888888] mt-2 text-center">Minh họa: thông tầng và giếng trời như trục sáng trung tâm</figcaption></figure>`,
          `<figure class="my-8"><img src="${imgBeforeAfter}" alt="Không gian trước và sau khi tối ưu ánh sáng" /><figcaption class="text-[13px] text-[#888888] mt-2 text-center">Ví dụ: cùng một phòng khách sau khi mở trục sáng và điều chỉnh vật liệu phản quang</figcaption></figure>`,
          `<h2>1. Giếng trời - Ô cửa lấy sáng từ thiên nhiên</h2>`,
          `<p>Giếng trời không chỉ đơn thuần là khoảng thông tầng. Nó là “lá phổi” và “con mắt” của ngôi nhà. Một giếng trời được bố trí đúng vị trí (thường là trung tâm hoặc giao thoa giữa các khối) có thể giúp ánh sáng khuếch tán đến mọi ngóc ngách, giảm phụ thuộc vào đèn nhân tạo ban ngày và tạo nhịp thở cho công trình.</p>`,
          `<blockquote>Ánh sáng là chi phí thấp nhất nhưng giá trị thẩm mỹ cao nhất mà bạn có thể mang đến cho ngôi nhà của mình.</blockquote>`,
          `<h2>2. Vật liệu phản quang - Nhân đôi hiệu ứng ánh sáng</h2>`,
          `<p>Sơn tường màu sáng, gạch bóng kính, kính cường lực, hoặc các tấm panel nhôm mờ — là những “tấm gương” khổng lồ giúp phản xạ và khuếch tán ánh sáng. Chúng có thể tăng cường độ sáng cảm nhận trong phòng lên đáng kể so với vật liệu hút sáng thông thường, nếu được bố trí đúng góc và tránh chói lóa trực tiếp.</p>`,
          `<div class="article-stats"><div><strong>Tăng 200% cường độ sáng</strong><span>So với nền hút sáng tiêu chuẩn (ước lượng dự án mẫu)</span></div><div><strong>Tiết kiệm 35% điện năng</strong><span>Chiếu sáng nhân tạo ban ngày</span></div><div><strong>Cải thiện 50%</strong><span>Tâm trạng & năng suất (khảo sát nội bộ không gian làm việc tại nhà)</span></div></div>`,
          `<h2>3. Bố trí cửa sổ - Bản phối khí cho ngôi nhà</h2>`,
          `<p>Cửa sổ không chỉ để lấy sáng. Hướng cửa, kích thước và vị trí sẽ quyết định luồng không khí, và theo đó, ánh sáng đi vào nhà như thế nào. Cửa sổ hướng Nam thường thân thiện với khí hậu nhiệt đới khi kết hợp mái hiên, lam chắn nắng và kính chọn lọc tia — tránh nóng trực tiếp nhưng vẫn giữ độ sáng mềm.</p>`,
          `<p><strong>Kết luận:</strong> Ánh sáng tự nhiên không phải một phép màu, mà là tổng hòa của những giải pháp khoa học và nghệ thuật. Hãy bắt đầu bằng cách quan sát ngôi nhà của bạn dưới một góc nhìn hoàn toàn mới.</p>`,
        ].join(''),
      },
      en: {
        title: 'Natural light: A symphony of space',
        slug: 'natural-light-symphony-of-space',
        excerpt:
          'Light is not only a physical need — it is the most precious finishing layer in architecture. This article walks through skylights, windows, and reflective materials that turn a house into an emotional work of art.',
        lead: 'Natural light is a gift. Yet not every plan knows how to conduct it. Here are three moves we use to turn daylight into a symphony — skylight as the spine, materials as the chorus, and windows as the score.',
        reading_time_minutes: 6,
        publishedAt: new Date('2025-04-15T02:00:00.000Z'),
        hero_image_url: heroLivingLight,
        author_display_name: 'Arch. Minh An Nguyen',
        author_role: 'Head of Architecture Design, XPRESS DESIGN',
        author_bio:
          'Over 12 years crafting residential spaces, with a focus on daylight optimization and applied spatial balance.',
        tags: ['daylight', 'architecture', 'skylight'],
        seo_title: 'Natural light: A symphony of space | XPRESS DESIGN',
        seo_description:
          'Skylights, windows, and reflective surfaces — how we choreograph daylight in tropical homes.',
        content: [
          `<p>When sheer curtains diffuse the morning sun across a timber floor, many owners realise: design truly begins with light, not with furniture.</p>`,
          `<figure class="my-8"><img src="${imgSkylightDiagram}" alt="Skylight diagram" /><figcaption class="text-[13px] text-[#888888] mt-2 text-center">Diagram: the skylight as a vertical light spine</figcaption></figure>`,
          `<figure class="my-8"><img src="${imgBeforeAfter}" alt="Living room before and after daylight intervention" /><figcaption class="text-[13px] text-[#888888] mt-2 text-center">Case note: the same living room after opening the light axis</figcaption></figure>`,
          `<h2>1. Skylight — the opening score</h2>`,
          `<p>A skylight is more than a shaft. It is the lung and the eye of the plan. Centrally placed or at the overlap of volumes, it lets daylight wash into corners that perimeter glazing cannot reach, and it gives the house a daily rhythm.</p>`,
          `<blockquote>Light is the lowest-cost move with the highest perceptual return you can give a home.</blockquote>`,
          `<h2>2. Reflective materials — doubling the chorus</h2>`,
          `<p>Light-toned paint, glazed tile, tempered glass, and satin metal panels behave like large mirrors — they bounce and soften daylight. Used with care, they lift perceived brightness without harsh glare.</p>`,
          `<div class="article-stats"><div><strong>Up to 200% brighter</strong><span>Vs. baseline matte surfaces (indicative study)</span></div><div><strong>35% less daytime electric light</strong><span>On monitored residential samples</span></div><div><strong>50% better focus</strong><span>Self-reported mood & productivity in home offices</span></div></div>`,
          `<h2>3. Windows — wind and light orchestration</h2>`,
          `<p>Windows choreograph both breeze and sun. In the tropics, south-facing glass wants brise-soleil, deep eaves, and selective coatings — enough sun to read by, not enough to bake the slab.</p>`,
          `<p><strong>In closing:</strong> Natural light is not magic. It is the sum of deliberate moves. Start by looking at your house at three times of day — you may hear the symphony already.</p>`,
        ].join(''),
      },
      category: catKienThucXD,
    },
  ];

  for (const a of articles) {
    await upsertBilingual(
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
        content: [
          '<p><strong>Đà Lạt, 10/3/2025</strong> — Sáng nay, Xpress cùng chủ đầu tư Green Hill Group và tư vấn giám sát đã tổ chức lễ <em>khởi công cọc móng</em> tại thửa công trình trên sườn đồi thông, tầm nhìn thung lũng hướng tây bắc. Đây là dấu mốc chuyển dự án từ giai đoạn thiết kế tăng tốc thành mặt công thực, sau khi thông qua thẩm duyệt cấp tỉnh hồi cuối 2024.</p>',
          '<h2>Diễn biến nghi thức & phân kỳ thi công 90 ngày tới</h2>',
          '<p>Block đầu tập trung: cọc khoan nhồi đường kính 600–800mm, đài móng bệ tách ẩm, ống thoát tầng 1, và tuyến cấp tưới nước mưa thu ở mái. An toàn: rào tuyến công, camera trạm, kiểm tra tải tạm khi vận chuyển cọc vượt 12% dốc ổ cấp.</p>',
          '<h2>Cam kết bền vững tại hiện trường</h2>',
          '<ul><li>Sổ theo dõi tải tường nóng mặt tây, xử lý lam + dàn leo trước tầng 2.</li><li>Tối thiểu 60% bê tông tại trạm, trộn ổn định độ, batch log 14 ngày.</li><li>Hoàn ủ đất khoan, tách rác ủ lân bãi, không thải lẫn lộn xuống thung lũng.</li></ul>',
          '<h2>Thông điệp từ studio</h2>',
          '<p>“Chúng tôi bước vào công trường với tư duy: mỗi tấn bê tông cần lý do nhiệt, mỗi tấc đường ống cần tính 10 năm. Biệt thự Xanh không chỉ là tên, mà sẽ lộ ở mái, lam, tưới, và cách ánh sáng buổi chiều chạm lên đá hồ bơi.” — KTS trưởng dự án Xpress.</p>',
          '<p><em>Tiếp theo</em>: báo cáo tiến độ 45 ngày, site walk mở cho báo chí tháng 5/2025.</p>',
        ].join(''),
        location: 'Đà Lạt, Lâm Đồng',
      },
      en: {
        title: 'Groundbreaking of Green Villa Da Lat',
        slug: 'groundbreaking-green-villa-da-lat',
        content: [
          '<p><strong>Da Lat, 10 Mar 2025</strong> — This morning, Xpress with Green Hill Group and the supervision team marked the <em>pile and foundation</em> start on a pine-hill lot with a north-western valley view. The project moved from a fast-track design package into the ground after provincial approval late in 2024.</p>',
          '<h2>Ceremony note & the first 90-day work window</h2>',
          '<p>Phase 1: 600–800mm bored piles, split raft where damp, level-1 drainage runs, and first-flush cistern tie-ins. Safety: a fenced work line, a site camera, and a haul route check for pile trucks on 12% temporary ramps.</p>',
          '<h2>On-site sustainability commitments</h2>',
          '<ul><li>West-elevation heat log, lam and climbing planned before the level-2 close-in.</li><li>60%+ readymix at the batching plant, traceable 14-day logs.</li><li>Spoil and organic waste split — no down-slope co-mingling to the valley.</li></ul>',
          '<h2>Statement</h2>',
          '<p>“We do not only pour; every cubic metre needs a heat story, and every line set needs a 10-year story. The ‘green’ in this house will show in the roof, the louvres, the irrigation, and the way afternoon light skims the pool stone.” — lead architect, Xpress.</p>',
          '<p><em>Next up</em>: a 45-day progress report and a press site-walk penciled for late May 2025.</p>',
        ].join(''),
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
        content: [
          '<p><strong>Singapore, 1/6/2025</strong> — Xpress được trao hạng <strong>Bronze</strong> tại hạng mục công trình dân cư hạt nhỏ, <em>Sustainable Design Awards 2025</em> (Khu vực Đông Nam Á), với công trình mẫu: nhà phố 3,5 tầng tại miền Trung, thí điểm tường tây rút 40% ánh sáng trực xạ, thông gió chéo 2,5m/s ở giao điểm cầu thang–bếp theo số liệu đo trước/ sau concept.</p>',
          '<h2>Điểm nhấn hồ sơ dự thi</h2>',
          '<ul><li>Tài liệu truy vết gỗ FSC, keo, vữa, đi kèm biên bản công tác ủ dầu ngoài trời 36 tháng.</li><li>Baseline cùng GFA, cùng hệ lạnh: bê tông tại bãi thấp hơn 18% (tính theo tường mẫu RC tiêu chuẩn).</li><li>Chỉ số WBGT sảnh giảm 1,2°C ở kịch bản 14h, tháng 6.</li></ul>',
          '<h2>Ý nghĩa với khách hàng & đối tác</h2>',
          '<p>Phần thưởng thừa nhận quy trình: chúng tôi tính tường nóng, gió, nước, trước mảng ốp. Điều này giúp bảo chứng cho mô hình EPC/Design–Build, khi CĐT cần “bằng chứng cảm quan 10 năm” chứ không chỉ 3D mãu.</p>',
          '<h2>Media & liên hệ</h2>',
          '<p>Ảnh, bản tóm tắt song ngữ, sẵn tại bộ truyền thông khi có yêu cầu từ báo chí (theo nội quy công bố nội bộ).</p>',
        ].join(''),
        location: 'Singapore',
      },
      en: {
        title: 'Studio Wins Sustainable Design Award 2025',
        slug: 'sustainable-design-award-2025',
        content: [
          '<p><strong>Singapore, 1 Jun 2025</strong> — Xpress received a <strong>Bronze</strong> in the small residential class at the <em>Sustainable Design Awards 2025</em> (Southeast Asia), for a 3.5-level tube-house case in Central Vietnam. The entry proved a 40% cut in west-wall direct insolation, 2.5m/s cross air at the stair–kitchen node (pre/post concept metrics).</p>',
          '<h2>What the submission highlighted</h2>',
          '<ul><li>FSC timber chain-of-custody, with a 36-month oiling schedule for external joinery.</li><li>18% less readymix vs a GFA- and MEP-matched RC baseline story.</li><li>WBGT in the public lobby: −1.2°C in a 14:00, June design-day.</li></ul>',
          '<h2>What it means for clients</h2>',
          '<p>The jury rewarded process: we document heat, wind, and water before the decorative layer. It supports EPC and design–build RFPs when owners need a 10-year comfort story, not a render.</p>',
          '<h2>Press kit</h2>',
          '<p>Images, bilingual Q&A, and a one-pager of metrics: contact the communications desk when the live alias is set.</p>',
        ].join(''),
        location: 'Singapore',
      },
      shared: {
        type: 'news',
        event_date: new Date('2025-06-01T10:00:00.000Z'),
      },
    },
    {
      vi: {
        title: 'Workshop: Vật liệu bản địa & hoàn thiện tại công trường',
        slug: 'workshop-vat-lieu-ban-dia',
        content: [
          '<p><strong>TP.HCM, 20/8/2025, 14:00</strong> — Sự kiện kín, dành cho 40 suất (KTS, chủ đầu tư, nhà cung ứng đá) tại văn phòng Xpress, Quận 1. Mục tiêu: <em>làm rõ cách chọn đá/ gỗ theo tải, khí hậu, công tác ốp, trước khi bấm số tấm ốp ở công trường</em> — thay vì đổi mẫu trên 3D.</p>',
          '<h2>Chương trình 150 phút</h2>',
          '<ol><li>20 phút: tải tường, rãnh thấm, ốc vít — ốp ở Hà Nội vs Đà Nẵng vs TP.HCM.</li><li>30 phút: cắt tấm lớn, tối ưu scrap, quy ước số tấm dự trữ “đợt 2”.</li><li>30 phút: bê tông bóng, bảo vệ, an toàn trơn, quy ước bàn giao an toàn trẻ con.</li><li>20 phút: bảo trì 12/36/60 tháng — sơ đồ chịu thay gioăng, chốt keo, chốt khe.</li><li>30 phút: Q&amp;A công trình thật, không tên, mang mẫu ốc/tấm tới.</li></ol>',
          '<h2>Phần demo vật lý tại sàn</h2>',
          '<p>Chúng tôi dựng 2 tấm 800×800mm: ốp ướt &amp; ốp khô, cùng keo, cùng hệ ốc — mời khách tự cạy thử ở lực 30N, so mối, so rung, độ trơn khi ướt. Kết: keo tốt sai vẫn thua ốc đỡ đúng hệ, và ốc “giá tốt” ăn tấm ồ ạt khi lệch 1,5mm.</p>',
          '<h2>Đăng ký & tài liệu đi kèm</h2>',
          '<p>Slide PDF, tỷ lệ cắt, file DWG ốc chuẩn — gửi sau 48h. Vòng tiếp theo: 10/10/2025, chủ đề ốp mái, gồ, thoát nước.</p>',
        ].join(''),
        location: 'Quận 1, TP. Hồ Chí Minh',
      },
      en: {
        title: 'Workshop: Local materials & site finishes',
        slug: 'workshop-local-materials-site-finish',
        content: [
          '<p><strong>Ho Chi Minh City, 20 Aug 2025, 14:00</strong> — A closed, 40-seat session for architects, owners, and stone suppliers in our D1 office. The purpose: to align <em>structural, climate, and fixings logic before slab count</em> on site — not to swap 3D patterns late.</p>',
          '<h2>150-minute run card</h2>',
          '<ol><li>20m: load paths, weeps, and screws — HCM vs central coast vs the north.</li><li>30m: large-format cut maps, stock rules, a “round two” buffer policy.</li><li>30m: burnished concrete, slip, child-safe handover language.</li><li>20m: 12/36/60 month maintenance, gasket, seal, and re-seal playbooks.</li><li>30m: anonymised case Q&amp;A, bring a pin sample.</li></ol>',
          '<h2>What we actually built on the table</h2>',
          '<p>Two 800×800mm boards, wet and dry, same glue, same fastener: guests could pry, tap, and wet-test. Takeaway: good glue still loses to bad fixings, and a “cheap” screw eats panel edges when 1.5mm out of flat.</p>',
          '<h2>Follow-up</h2>',
          '<p>PDF deck, cut ratios, and a baseline DWG of fixing rhythm — 48h after. Next round 10 Oct 2025, roof geometry, gutters, and emergency overflows.</p>',
        ].join(''),
        location: 'District 1, Ho Chi Minh City',
      },
      shared: {
        type: 'event',
        event_date: new Date('2025-08-20T14:00:00.000Z'),
      },
    },
    {
      vi: {
        title: 'Chương trình “Cùng sửa chữa mái” cho hộ dân vùng lũ tại Nghệ An',
        slug: 'cung-sua-mai-cho-ho-dan',
        content: [
          '<p><strong>Diễn Châu, Nghệ An, tháng 10/2024</strong> — Trong 4 tuần, 32 tình nguyện viên, 2 nhà cung ứng ngói, 1 sản xuất tấm OSB, và kỹ sư tình nguyện Xpress cùng hỗ trợ <strong>12 hộ</strong> ổn định kết cấu mái, chống dột trước mùa mưa bão. Tổng vật chất gần 420 triệu (giá ước, gồm vận chuyển 18%) — 60% từ quyên góp nội bộ, 40% từ đối tác vật liệu &amp; vận tải ưu tiên tuyến dốc mềm.</p>',
          '<h2>Chọn hộ, quy ước thi công, an toàn</h2>',
          '<p>Ưu tiên: hộ nữ đơn thân, người già, mái tôn gỉ 5 năm+, nhà ống 3–3,2m bề ngang, có nguy cơ nước bốc hơi xuống hốc treo. Mỗi hộ: bản 2 A3 khung, kèo, ốc, 6–8 tấm OSB, màng, cao su gioăng, mũ, dây, đinh phạm. Không thi công khi tốc gió 7 bậc trở lên, không tập kết 300kg+ trên mái 15°.</p>',
          '<h2>Đóng góp chuyên môn Xpress</h2>',
          '<ul><li>3 bộ khung ống 40×40 lẫn 50×30, tính toán ứng suất, chốt xà gồ, tránh ăn tường 110.</li><li>Giám sát 1 buổi/ hộ, ảnh nhiệt ở 3 mốc: trước, sau lót OSB, sau lợp.</li><li>Tài liệu bảo trì 1 trang, ký tay Hội phụ nữ xã, gửi Ủy ban.</li></ul>',
          '<h2>Số liệu tóm tắt</h2>',
          '<p>12/12 hộ bàn giao kín nước ở thử 30 phút; 0 tai nạn; 1 hộ cần gia cố ốc vì gỗ tường ướt — điều chỉnh 90 phút, hoàn ủ vữa, giữ ủ 48h.</p>',
          '<h2>2025</h2>',
          '<p>Chúng tôi tìm 8 hộ ở Hà Tĩnh, ưu tiên mái tôn + ốc chưa ăn, kết hợp chuỗi tập huấn 1 ngày cho 20 thợ địa phương. Liên hệ CSR nội bộ.</p>',
        ].join(''),
        location: 'Nghệ An',
      },
      en: {
        title: '“Roof repair together” in flood-hit Nghe An',
        slug: 'roof-repair-nghe-an',
        content: [
          '<p><strong>Dien Chau, Nghe An, Oct 2024</strong> — In four weeks, 32 volunteers, two tile partners, an OSB mill, and pro-bono Xpress crew helped <strong>12 households</strong> stabilise their roofs before the storm list. In-kind and cash value: ~420M VND (incl. 18% steep-route haul). 60% from internal staff giving, 40% from material partners and soft-rate trucking.</p>',
          '<h2>Selection, site rules, safety</h2>',
          '<p>Priority: single mothers, the elderly, 5+ year corroded metal roofs, 3.0–3.2m tube houses, moisture risk. Each house: 2xA3 frame drawings, brackets, 6–8 OSB boards, membrane, gaskets, PPE, cord. No work at Beaufort 7+, no 300kg+ point loads on 15° roofs.</p>',
          '<h2>What we contributed as designers</h2>',
          '<ul><li>Three light steel tube recipes, calcs, and bearing checks so posts do not nibble 110mm party walls.</li><li>One supervision visit per house, and IR photo sets at pre-, mid-, and post-OSB.</li><li>A one-page O&amp;M handout, countersigned with the local women’s union.</li></ul>',
          '<h2>By the numbers</h2>',
          '<p>12/12 pass a 30-minute rain simulation; 0 recordable injury; 1 wet-timber case needed 90m of re-screw and 48h cure.</p>',
          '<h2>2025</h2>',
          '<p>We are scoping 8 more houses in Ha Tinh, plus a 1-day upskill for 20 local roofers. Contact the CSR desk internally.</p>',
        ].join(''),
        location: 'Nghe An',
      },
      shared: {
        type: 'community',
        event_date: new Date('2024-10-12T08:00:00.000Z'),
      },
    },
  ];

  for (const n of items) {
    await upsertBilingual(
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
    await upsertBilingual(strapi, 'api::page.page', p.vi, p.en);
    strapi.log.info(`[seed] ✅ Page: ${p.vi.title} / ${p.en.title}`);
  }
}
