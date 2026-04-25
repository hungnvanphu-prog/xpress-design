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

  const viPayload = { ...viData, publishedAt: new Date() };
  const viEntity = viExisting
    ? await strapi.entityService.update(uid, viExisting.id, { data: viPayload })
    : await strapi.entityService.create(uid, {
        data: { ...viPayload, locale: 'vi' },
      });

  const enExisting = await strapi.db.query(uid).findOne({
    where: { slug: enData.slug, locale: 'en' },
  });

  const enPayload = { ...enData, publishedAt: new Date() };
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
