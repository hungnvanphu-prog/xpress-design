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
    await configureInsightSignupAdminList(strapi);
    await seedContent(strapi);
    await hideRelationTagsInContentManager(strapi, 'api::article.article', 'Article');
    await hideRelationTagsInContentManager(strapi, 'api::news.news', 'News');
  },
};

/** Ẩn field quan hệ `tags` mặc định trong CM; biên tập dùng `tag_multiselect`. */
async function hideRelationTagsInContentManager(strapi, uid, label) {
  const contentType = strapi.contentTypes[uid];
  if (!contentType) return;

  try {
    const cmContentTypes = strapi.plugin('content-manager').service('content-types');
    const config = await cmContentTypes.findConfiguration(contentType);
    if (!config?.metadatas?.tags?.edit) return;

    const editRelations = config.layouts?.editRelations || [];
    const tagsHidden = config.metadatas.tags.edit.visible === false;
    const tagsOutOfRelations = !editRelations.includes('tags');
    if (tagsHidden && tagsOutOfRelations) return;

    const nextMetadatas = {
      ...config.metadatas,
      tags: {
        ...config.metadatas.tags,
        edit: {
          ...config.metadatas.tags.edit,
          visible: false,
        },
      },
    };
    const nextLayouts = {
      ...config.layouts,
      editRelations: editRelations.filter((r) => r !== 'tags'),
    };
    await cmContentTypes.updateConfiguration(contentType, {
      ...config,
      metadatas: nextMetadatas,
      layouts: nextLayouts,
    });
    strapi.log.info(`[cms] Đã ẩn field quan hệ tags mặc định trên ${label} (Content Manager)`);
  } catch (err) {
    strapi.log.warn(`[cms] Không chỉnh CM layout ${label} (tags): ${err.message}`);
  }
}

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
    'api::tag.tag.find',
    'api::tag.tag.findOne',
    'api::news.news.find',
    'api::news.news.findOne',
    'api::page.page.find',
    'api::page.page.findOne',
    /** Form công khai: chỉ create, không public find (tránh lộ dữ liệu) */
    'api::insight-signup.insight-signup.create',
    'api::contact-request.contact-request.create',
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

/** Danh sách «Đăng ký Góc nhìn» trong Admin: sắp xếp mới nhất, dễ lọc. */
async function configureInsightSignupAdminList(strapi) {
  const uid = 'api::insight-signup.insight-signup';
  const contentType = strapi.contentTypes[uid];
  if (!contentType) return;
  try {
    const cm = strapi.plugin('content-manager').service('content-types');
    const cfg = await cm.findConfiguration(contentType);
    await cm.updateConfiguration(contentType, {
      ...cfg,
      settings: {
        ...(cfg.settings || {}),
        bulkable: true,
        filterable: true,
        searchable: true,
        pageSize: 25,
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'DESC',
      },
    });
    strapi.log.info('[cms] Content Manager: Đăng ký Góc nhìn — sort createdAt DESC, pageSize 25');
  } catch (err) {
    strapi.log.warn(`[cms] Không cấu hình CM insight-signup: ${err.message}`);
  }
}

/* ============================================================
 * 4) SEED CONTENT (vi + en)
 * ============================================================ */
async function seedTags(strapi) {
  const defs = [
    { slug: 'ben-vung', name: 'Bền vững', name_en: 'Sustainability' },
    { slug: 'xu-huong', name: 'Xu hướng', name_en: 'Trends' },
    { slug: 'nam-2025', name: '2025', name_en: '2025' },
    { slug: 'toi-gian', name: 'Tối giản', name_en: 'Minimal' },
    { slug: 'noi-that', name: 'Nội thất', name_en: 'Interior' },
    { slug: 'canh-quan', name: 'Cảnh quan', name_en: 'Landscape' },
    { slug: 'vi-khi-hau', name: 'Vi khí hậu', name_en: 'Micro-climate' },
    { slug: 'do-thi', name: 'Đô thị', name_en: 'Urban' },
    { slug: 'wellness', name: 'Wellness', name_en: 'Wellness' },
    { slug: 'spa', name: 'Spa', name_en: 'Spa' },
    { slug: 'phong-thuy', name: 'Phong thủy', name_en: 'Feng shui' },
    { slug: 'nha-pho', name: 'Nhà phố', name_en: 'Townhouse' },
    { slug: 'vat-lieu', name: 'Vật liệu', name_en: 'Materials' },
    { slug: 'anh-sang', name: 'Ánh sáng', name_en: 'Daylight' },
    { slug: 'kien-truc', name: 'Kiến trúc', name_en: 'Architecture' },
    { slug: 'gieng-troi', name: 'Giếng trời', name_en: 'Skylight' },
  ];
  const map = new Map();
  for (const d of defs) {
    const existing = await strapi.db.query('api::tag.tag').findOne({ where: { slug: d.slug } });
    const payload = {
      name: d.name,
      name_en: d.name_en || null,
      slug: d.slug,
    };
    const row = existing
      ? await strapi.entityService.update('api::tag.tag', existing.id, { data: payload })
      : await strapi.entityService.create('api::tag.tag', { data: payload });
    map.set(d.slug, row.id);
    strapi.log.info(`[seed] ✅ Tag: ${d.name} (${d.slug})`);
  }
  return map;
}

async function seedContent(strapi) {
  try {
    strapi.log.info('[seed] 🌱 Bắt đầu upsert dữ liệu mẫu song ngữ...');

    const tagMap = await seedTags(strapi);
    const categories = await seedCategories(strapi);
    await seedProjects(strapi);
    await seedArticles(strapi, categories, tagMap);
    await seedNews(strapi, tagMap);
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
  // Category không bật i18n → upsert theo `name`; `name_en` phục vụ hiển thị locale en trên FE
  const data = [
    {
      name: 'Kiến trúc',
      name_en: 'Architecture',
      description: 'Bài viết về kiến trúc',
    },
    {
      name: 'Nội thất',
      name_en: 'Interiors',
      description: 'Bài viết về nội thất',
    },
    {
      name: 'Cảnh quan',
      name_en: 'Landscape',
      description: 'Bài viết về cảnh quan',
    },
    {
      name: 'Kiến thức xây dựng',
      name_en: 'Construction knowledge',
      description: 'Kiến thức chuyên sâu về xây dựng & ánh sáng',
    },
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

async function seedArticles(strapi, categories, tagMap) {
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
        seo_title: '5 Sustainable Architecture Trends 2025',
        seo_description: 'Discover 5 outstanding green architecture trends in 2025.',
      },
      tagSlugs: ['ben-vung', 'xu-huong', 'nam-2025'],
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
        seo_title: 'Minimal Interior',
        seo_description: 'Understanding the minimal interior style.',
      },
      tagSlugs: ['toi-gian', 'noi-that'],
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
        seo_title: 'Urban landscape & micro-climate',
        seo_description: 'Landscape strategies that reduce felt heat in tropical blocks.',
      },
      tagSlugs: ['canh-quan', 'vi-khi-hau', 'do-thi'],
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
        seo_title: 'Silence in home spa & wellness design',
        seo_description: 'Spa, acoustic and lighting for premium residential bathrooms.',
      },
      tagSlugs: ['wellness', 'noi-that', 'spa'],
      category: catNoiThat,
    },
    /* —— Góc nhìn: bài mẫu “ánh sáng” + 3 bài liên quan cùng chuyên mục —— */
    {
      vi: {
        title: 'Phong thủy nhà phố: Nguyên tắc vàng cho sự thịnh vượng',
        slug: 'phong-thuy-nha-pho-nguyen-tac-vang',
        excerpt:
          'Trục cửa, giếng trời và luồng gió ở nhà phố nhiệt đới — cách XPRESS DESIGN dung hòa truyền thống với khoa học kiến trúc, không rơi vào mê tín hay bố cục “sân khấu”.',
        lead: 'Phong thủy ứng dụng với chúng tôi là ngôn ngữ về trục nhìn, tĩnh lặng và luồng khí thật — có thể đo, có thể vẽ, và phải sống tốt cả ban ngày lẫn ban đêm.',
        content: [
          '<p>Ở lô phố hẹp, “tụ khí” thường bị hiểu nhầm là đặt thêm vật phẩm. Tại XPRESS DESIGN, chúng tôi dịch khái niệm đó thành <strong>chuỗi không gian có điểm dừng thị giác</strong>, ánh sáng dịu ở hậu trường, và một tuyến gió xuyên nhà rõ ràng — những thứ vừa là phong thủy thực hành, vừa là tiêu chuẩn nhiệt đới.</p>',
          '<h2>1. Trục cửa: nhìn thấy gì trong 3 giây đầu</h2>',
          '<p>Cửa chính không nên mở thẳng vào cầu thang dốc hay cửa hậu — không vì “xung”, mà vì <em>chuỗi chuyển động</em> khiến người vào nhà mất điểm neo thị giác. Giải pháp: hành lang ngắn, vách lệch, hoặc khối tủ thấp tạo góc ngoặt — vừa tạo foyer, vừa giảm gió hút mạnh khi mở cửa đồng thời.</p>',
          '<h2>2. Giếng trời: “long mạch” bằng ánh sáng và hơi nước</h2>',
          '<p>Giếng trời nhỏ đặt đúng trục dọc nhà giúp tầng trên nhận ánh sáng khuếch tán, đồng thời là ống thoát nhiệt tự nhiên. Chúng tôi tránh giếng chỉ để trang trí cây nếu không có lớp chống thấm và thu nước mưa — ẩm là kẻ phá “khí tĩnh” nhanh nhất.</p>',
          '<h2>3. Bếp và cầu thang: vị trí theo nhịp sinh hoạt, không theo la bàn cứng</h2>',
          '<p>Bếp cần ánh sáng bổ sung tốt, tủ sâu theo tần suất nấu, và tách khỏi luồng gió đi thẳng từ cửa — để mùi và khói không “chạy” vào phòng khách. Cầu thang nên có điểm sáng gián tiếp; bậc quá tối tạo cảm giác bất an thực tế, không cần giải thích bằng phong thủy.</p>',
          '<blockquote>“Căn nhà phong thủy tốt là căn mà sau một ngày dài, bạn bước vào và thở chậm lại được — nhờ tỷ lệ, ánh sáng và gió, không nhờ một vật phẩm may rủi.”</blockquote>',
          '<h2>4. Kết nối với khoa học: WBGT, tốc độ gió, độ chói</h2>',
          '<p>Khi chủ nhà muốn “hợp phong thủ” nhưng vẫn tin vào số liệu, chúng tôi đặt song song: cùng một bản vẽ vừa thỏa trục truyền thống, vừa đạt mục tiêu thông gió chéo và giảm nhiệt tường tây. Hai ngôn ngữ — một thực tại sống.</p>',
          '<p><strong>Kết luận:</strong> Phong thủy nhà phố là bài toán về <em>trật tự và dư âm</em>. XPRESS DESIGN ưu tiên giải pháp có thể giải thích cho cả gia chủ và đội thi công, để ngôi nhà không chỉ đẹp trên hình, mà ổn trong nhiều năm.</p>',
        ].join(''),
        hero_image_url: heroLivingLight,
        reading_time_minutes: 8,
        author_display_name: 'KTS. Nguyễn Minh An',
        author_role: 'Trưởng phòng Thiết kế Kiến trúc, XPRESS DESIGN',
        author_bio: 'Hơn 12 năm kinh nghiệm trong thiết kế không gian sống cao cấp.',
      },
      en: {
        title: 'Townhouse Feng Shui: Golden rules for prosperity',
        slug: 'townhouse-feng-shui-golden-rules',
        excerpt:
          'Door axis, skylight, and real airflow in tropical tube houses — how XPRESS DESIGN aligns tradition with measurable comfort.',
        lead: 'For us, applied feng shui is a language of sightlines, stillness, and air you can trace on a plan — not props on a shelf.',
        content: [
          '<p>On tight urban plots, “gathering energy” is often mistaken for adding objects. At XPRESS DESIGN we translate it into <strong>a sequence of spaces with a calm focal point</strong>, soft background light, and an honest cross-vent path — both culturally legible and climatically sound.</p>',
          '<h2>1. The entry axis: what you see in the first three seconds</h2>',
          '<p>A door that opens straight onto a steep stair or a rear exit breaks visual rest — less about superstition, more about how you orient when tired. A short vestibule, a shifted wall, or a low cabinet creates a turn — and cuts gusts when both doors are open.</p>',
          '<h2>2. Skylight as a vertical spine</h2>',
          '<p>A small skylight over the section brings diffuse light upstairs and helps stack ventilation. We avoid “decorative” shafts without drainage strategy — damp is the fastest killer of quiet rooms.</p>',
          '<h2>3. Kitchen and stair: life rhythm, not only compass logic</h2>',
          '<p>Kitchens need supplemental light, depth planned around cooking frequency, and separation from a direct door gale so smells do not sprint to the living room. Stairs want indirect light; overly dark treads feel unsafe — no mysticism required.</p>',
          '<blockquote>“A good townhouse is one where you exhale on arrival — because of proportion, light, and breeze, not because of a lucky charm.”</blockquote>',
          '<h2>4. Paired with science: WBGT, wind speed, glare</h2>',
          '<p>When owners want cultural alignment and data, we design once for both: the same plan can respect traditional axes and hit cross-vent plus west-wall relief. Two languages, one lived reality.</p>',
          '<p><strong>In closing:</strong> Townhouse feng shui, in our practice, is the discipline of <em>order and afterglow</em>. XPRESS DESIGN prefers moves you can explain to the builder — beauty on paper and calm for years.</p>',
        ].join(''),
        hero_image_url: heroLivingLight,
        reading_time_minutes: 8,
        author_display_name: 'Arch. Minh An Nguyen',
        author_role: 'Head of Architecture Design, XPRESS DESIGN',
        author_bio: 'Over 12 years in premium residential and spatial design.',
      },
      tagSlugs: ['phong-thuy', 'nha-pho'],
      category: catKienThucXD,
    },
    {
      vi: {
        title: '5 Xu hướng thiết kế nội thất định hình năm tới',
        slug: '5-xu-huong-thiet-ke-noi-that-nam-toi',
        excerpt:
          'Từ trát khoáng tay đến cửa ngưỡng thấp “một mặt phẳng” — năm hướng XPRESS DESIGN đang áp dụng cho penthouse, biệt thự và nhà phố cao cấp tại Việt Nam.',
        lead: 'Xu hướng không phải màu của năm, mà là cách vật liệu, ánh sáng và ranh giới trong–ngoài cùng làm một căn nhà “thở” đúng nhịp.',
        content: [
          '<p>Khách hàng 2025–2026 của XPRESS DESIGN thường mang hai yêu cầu song song: <strong>tối giản có hồn</strong> và <strong>bền vững có thể đo</strong>. Dưới đây là năm xu hướng chúng tôi chủ động đề xuất ở giai đoạn concept — trước khi catalogue nội thất chi phối ngân sách.</p>',
          '<h2>1. Bề mặt khoáng tay (tadelakt, limewash, clay): ấm, mờ, chịu ẩm có kiểm soát</h2>',
          '<p>Thay cho sơn bóng toàn phòng, các lớp khoáng mờ tạo chiều sâu dưới ánh 2700–3000K. Ở khu ẩm, chúng tôi chỉ định hệ hoàn thiện có hệ số hút–thở rõ ràng, tránh “tường đẹp nhưng nấm sau 18 tháng”.</p>',
          '<h2>2. Gỗ nan sóng / fluted: nhịp dọc, giảm phản xạ ánh sáng cứng</h2>',
          '<p>Nan gỗ hoặc đá mỏng ghép dọc giúp tường lớn bớt “trống sân khấu”, đồng thời che giấu cửa phòng phụ. Xu hướng này đi cùng ray âm và khe 3mm — đòi hỏi shopdrawing sớm.</p>',
          '<h2>3. Đá khối lớn, vát cạnh mềm: kiến trúc tĩnh trong nội thất</h2>',
          '<p>Bàn bếp, bệ lavabo và bậc cấp dùng đá nguyên khối hoặc ghép ít mối; cạnh vát 2–3mm để ánh sáng trượt. Khách hàng chấp nhận chi phí vận chuyển nếu thấy rõ <em>độ dày và veining</em> trong đời thực, không chỉ trên render.</p>',
          '<h2>4. Ánh sáng ba lớp: nền – điểm – tranh tường</h2>',
          '<p>Một mạch dim chung cho nền, các bát spot độc lập cho tranh/đồ cổ, và một vài đường LED ẩn chỉ để hướng mắt — không để trần thành sân khấu disco. Chúng tôi mockup lux tại hiện trường trước khi đặt cọc điện.</p>',
          '<h2>5. Ngưỡng cửa “một mặt phẳng” với sàn ngoài trời</h2>',
          '<p>Ray cửa lùa chìm, thoát nước dọc mép, và đá sàn trong–ngoài cùng tông: biên giới phòng khách–hiên được làm mờ có chủ đích. Đây là xu hướng sống phổ biến ở biệt thự nhiệt đới sau dịch.</p>',
          '<p><strong>Tổng kết:</strong> Năm xu hướng trên không thay thế nhau — chúng được cân theo <em>quy mô, hướng nắng và nhịp gia đình</em>. XPRESS DESIGN dùng chúng như bảng màu hành vi, không như checklist Instagram.</p>',
        ].join(''),
        hero_image_url: imgBeforeAfter,
        reading_time_minutes: 9,
      },
      en: {
        title: '5 Interior design trends shaping next year',
        slug: '5-interior-trends-next-year',
        excerpt:
          'From hand-trowelled mineral walls to flush thresholds — five directions XPRESS DESIGN is specifying for premium homes right now.',
        lead: 'Trend, for us, is how materials, light, and the indoor–outdoor edge breathe together — not the colour of the season.',
        content: [
          '<p>Our 2025–2026 clients often pair two asks: <strong>quiet minimalism with soul</strong> and <strong>sustainability you can document</strong>. These five moves enter at concept — before furniture catalogues capture the budget.</p>',
          '<h2>1. Mineral finishes: limewash, clay, tadelakt — warm, matte, humidity-aware</h2>',
          '<p>Instead of plastic gloss, mineral skins read depth under 2700–3000K light. In wet zones we specify systems with known breathability — pretty walls that fail at month eighteen are not on-brand.</p>',
          '<h2>2. Fluted timber or stone ribbons</h2>',
          '<p>Vertical rhythm breaks up large planes and hides service doors. It demands early shadow-gap details and coordinated tracks — shop drawings before stone orders.</p>',
          '<h2>3. Mass stone with soft arrises</h2>',
          '<p>Kitchen islands, vanity plinths, and short runs of steps in fewer joints; 2–3mm eased edges so light skims. Clients accept logistics when they see vein and thickness in real life, not only in renders.</p>',
          '<h2>4. Three-layer light: wash, accent, art</h2>',
          '<p>One dimmed wash circuit, independent accents for objects, and a few hidden grazers for direction — ceilings should not read as nightclub grids. We lux-test on site before locking circuits.</p>',
          '<h2>5. Flush thresholds to exterior decks</h2>',
          '<p>Recessed sliders, linear drain at the edge, and inside–outside stone in one tone: the living room and the terrace share one plane by intent. Post-pandemic tropical villas ask for this daily.</p>',
          '<p><strong>Wrap:</strong> These five do not cancel each other — we weight them against orientation, scale, and family rhythm. XPRESS DESIGN treats them as a behavioural palette, not an Instagram checklist.</p>',
        ].join(''),
        hero_image_url: imgBeforeAfter,
        reading_time_minutes: 9,
      },
      tagSlugs: ['xu-huong', 'noi-that'],
      category: catKienThucXD,
    },
    {
      vi: {
        title: 'Vật liệu tái chế: Xu hướng bền vững cho ngôi nhà hiện đại',
        slug: 'vat-lieu-tai-che-xu-huong-ben-vung',
        excerpt:
          'Gạch gốm nghiền, kính cullet, gỗ thu hồi và đá tận dụng — checklist kỹ thuật XPRESS DESIGN dùng khi CĐT muốn “xanh có chứng từ”, không chỉ moodboard.',
        lead: 'Tái chế trong thi công cao cấp là câu chuyện về nguồn gốc, độ biến dạng và bảo trì — ba thứ phải viết rõ trong hồ sơ mời thầu.',
        content: [
          '<p>Nhiều dự án yêu cầu “vật liệu xanh” nhưng chưa định nghĩa chỉ số. Tại XPRESS DESIGN, chúng tôi nhóm vật liệu tái chế theo <strong>chuỗi cung ứng có thể kiểm</strong>: CO₂ vận chuyển, độ hút nước, và kịch bản thay thế sau 8–15 năm.</p>',
          '<h2>1. Gạch &amp; gốm nghiền làm lớp nền / trang trí</h2>',
          '<p>Gạch vụn nghiền trộn xi măng có thể làm sàn terrazzo hoặc mảng ốp feature wall. Rủi ro: biên độ màu lô và độ mài. Chúng tôi yêu cầu mockup 2m², ký duyệt lô, và quy ước “sai số màu cho phép” trước khi ốp diện tích lớn.</p>',
          '<h2>2. Kính tái chế (cullet) trong kính dán an toàn</h2>',
          '<p>Tỷ lệ cullet trong lớp kính có giới hạn theo nhà máy. Ở mặt tiền tây, chúng tôi ưu tiên <em>Low-E + cullet</em> thay vì chỉ tăng độ dày — giảm nhiệt trước khi nói về “xanh”.</p>',
          '<h2>3. Gỗ thu hồi: FSC Recycled hoặc chứng từ xuất xứ rõ</h2>',
          '<p>Gỗ cũ cần kiểm ẩm, xử lý mối, và độ võng khi làm sàn. Chúng tôi hạn chế dùng làm kết cấu chịu lực chính; ưu tiên ốp, lam, khung nội thất và chi tiết trang trí có thể thay đợt.</p>',
          '<h2>4. Đá tận dụng từ công trình cũ</h2>',
          '<p>Đá cắt dư được map lại thành bậc, mặt bàn hoặc lát lối — giảm scrap 15–25% trên một số công trình thử nghiệm. Hợp đồng cần dòng “đồng ý biên độ vân và vá” để tránh tranh chấp thẩm mỹ.</p>',
          '<blockquote>“Tái chế đẹp là tái chế có logbook: lô, nhà máy, ngày thử nước, ngày thay keo — không chỉ ảnh Pinterest.”</blockquote>',
          '<h2>5. Checklist chủ đầu tư trước khi ký nhà cung cấp</h2>',
          '<ul><li>Giấy tờ tỷ lệ tái chế tối thiểu theo sản phẩm (%) và phương pháp thử.</li><li>Bảo hành song song: vật liệu + thi công (ai chịu nếu bong sau 6 tháng?).</li><li>Kế hoạch bảo trì: keo, gioăng, sơn bảo vệ — lịch 12/24/60 tháng.</li></ul>',
          '<p><strong>Kết luận:</strong> Vật liệu tái chế không làm giảm đẳng cấp nếu được tích hợp vào <em>hệ chi tiết</em> rõ ràng. XPRESS DESIGN dùng chúng để kể câu chuyện trách nhiệm dài hạn của ngôi nhà.</p>',
        ].join(''),
        hero_image_url: imgSkylightDiagram,
        reading_time_minutes: 9,
      },
      en: {
        title: 'Recycled materials: A sustainable direction for modern homes',
        slug: 'recycled-materials-modern-homes',
        excerpt:
          'Crushed ceramics, cullet glass, reclaimed timber, and stone salvage — the XPRESS DESIGN spec sheet when owners want green with paperwork.',
        lead: 'Recycled material is a story of supply chain, strain limits, and maintenance — all three belong in the tender set.',
        content: [
          '<p>Many briefs ask for “green materials” without metrics. At XPRESS DESIGN we group recycled inputs by <strong>auditable chains</strong>: trucking CO₂, water absorption, and an 8–15 year replacement narrative.</p>',
          '<h2>1. Crushed brick and ceramic in terrazzo and feature planes</h2>',
          '<p>Post-consumer grit in cementitious matrices can floor or clad. Risks: batch colour drift and grind exposure. We require a 2m² mockup, signed batch ranges, and a written tolerance before large-area install.</p>',
          '<h2>2. Cullet in laminated safety glass</h2>',
          '<p>Plant limits cap cullet ratios. On west glass, we prioritise <em>Low-E with cullet</em> rather than thickness alone — cut heat before claiming sustainability.</p>',
          '<h2>3. Reclaimed timber: FSC Recycled or documented salvage</h2>',
          '<p>Old wood needs moisture checks, termite treatment, and deflection limits for flooring. We avoid primary structure roles; prefer screens, joinery, and replaceable accents.</p>',
          '<h2>4. Salvaged stone from demolition</h2>',
          '<p>Offcuts remap into steps, vanity plinths, or garden paths — we have seen 15–25% scrap reduction on pilot sites. Contracts need a “vein and patch tolerance” clause to protect aesthetics and trust.</p>',
          '<blockquote>“Beautiful recycling ships with a logbook: batch, plant, water test date, re-seal date — not only a Pinterest board.”</blockquote>',
          '<h2>5. Owner checklist before signing suppliers</h2>',
          '<ul><li>Declared recycled content (%) and test method.</li><li>Split warranty: material vs installer — who owns a six-month delamination?</li><li>Maintenance calendar: sealants, gaskets, protective coats at 12/24/60 months.</li></ul>',
          '<p><strong>In closing:</strong> Recycled content does not cheapen luxury when embedded in a <em>detail system</em>. XPRESS DESIGN uses it to narrate long-term stewardship.</p>',
        ].join(''),
        hero_image_url: imgSkylightDiagram,
        reading_time_minutes: 9,
      },
      tagSlugs: ['ben-vung', 'vat-lieu'],
      category: catKienThucXD,
    },
    {
      vi: {
        title: 'Ánh sáng tự nhiên: Bản giao hưởng của không gian',
        slug: 'anh-sang-tu-nhien-ban-giao-huong-cua-khong-gian',
        excerpt:
          'Một ghi chép thiết kế từ XPRESS DESIGN: cách chúng tôi dùng giếng trời, rèm lọc sáng, vật liệu mờ và mặt cắt để ánh sáng đi sâu vào nhà mà không gây nóng, chói hay mỏi mắt.',
        lead: 'Ánh sáng tự nhiên không phải “mở cửa càng lớn càng tốt”. Với nhà ở nhiệt đới, ánh sáng cần được lọc, phản xạ và dẫn hướng theo nhịp sinh hoạt trong ngày.',
        reading_time_minutes: 6,
        publishedAt: new Date('2025-04-15T02:00:00.000Z'),
        hero_image_url: heroLivingLight,
        author_display_name: 'KTS. Nguyễn Minh An',
        author_role: 'Trưởng phòng Thiết kế Kiến trúc, XPRESS DESIGN',
        author_bio:
          'Hơn 12 năm kinh nghiệm trong lĩnh vực thiết kế không gian sống, chuyên sâu về tối ưu ánh sáng tự nhiên và phong thủy ứng dụng.',
        seo_title: 'Ánh sáng tự nhiên: Bản giao hưởng của không gian | XPRESS DESIGN',
        seo_description:
          'Bố trí giếng trời, cửa sổ và vật liệu phản quang để ngôi nhà tràn ngập ánh sáng và cảm xúc.',
        content: [
          `<p>Trong các buổi khảo sát nhà phố và biệt thự, chúng tôi thường yêu cầu gia chủ giữ nguyên hiện trạng ít nhất một buổi sáng. Lý do rất đơn giản: bản vẽ mặt bằng nói được diện tích, nhưng chỉ ánh sáng thật mới cho thấy căn nhà đang “thở” ở đâu và đang bí ở đâu.</p>`,
          `<figure><img src="${imgSkylightDiagram}" alt="Sơ đồ minh họa giếng trời" /><figcaption>Ghi chú concept: giếng trời không chỉ lấy sáng, mà còn là trục thoát nhiệt và điểm neo thị giác.</figcaption></figure>`,
          `<h2>1. Không bắt đầu bằng cửa kính lớn</h2>`,
          `<p>Một mảng kính lớn ở hướng nắng gắt có thể làm phòng khách sáng hơn trong ảnh render, nhưng lại tăng nhiệt, gây chói và khiến rèm luôn phải kéo. Với nhà nhiệt đới, XPRESS DESIGN thường ưu tiên <strong>ánh sáng gián tiếp</strong>: hiên sâu, lam dọc, rèm hai lớp, hoặc tường phản xạ màu ấm để ánh sáng đi vào mềm hơn.</p>`,
          `<h2>2. Giếng trời cần có vai trò trong mặt cắt</h2>`,
          `<p>Giếng trời tốt không nằm ở kích thước lớn hay nhỏ, mà ở vị trí trong mặt cắt. Nếu đặt gần cầu thang, nó có thể kéo sáng xuống tầng thấp và đẩy khí nóng lên trên. Nếu đặt giữa bếp và bàn ăn, nó trở thành nhịp sinh hoạt trong ngày. Nếu đặt sai, nó chỉ là một ô nóng và khó bảo trì.</p>`,
          `<blockquote>Ánh sáng đẹp không phải ánh sáng nhiều. Đó là ánh sáng đến đúng nơi, đúng cường độ, đúng thời điểm trong ngày.</blockquote>`,
          `<h2>3. Vật liệu mờ thường sang hơn vật liệu bóng</h2>`,
          `<p>Chúng tôi hạn chế dùng bề mặt bóng lớn ở những không gian cần nghỉ ngơi. Sơn khoáng, gỗ dầu mờ, đá honed, vải linen và kính mờ giúp ánh sáng dừng lại thành lớp, thay vì bật ngược vào mắt. Chính lớp mờ này tạo cảm giác sâu và đắt, nhất là khi kết hợp ánh đèn 2700–3000K vào buổi tối.</p>`,
          `<figure><img src="${imgBeforeAfter}" alt="Không gian trước và sau khi tối ưu ánh sáng" /><figcaption>Ghi chú nội bộ: cùng một phòng có thể thay đổi cảm giác lớn nhỏ chỉ bằng cách mở trục sáng và giảm bề mặt phản chiếu mạnh.</figcaption></figure>`,
          `<h2>4. Mỗi phòng cần một “kịch bản sáng” riêng</h2>`,
          `<p>Phòng khách cần ánh sáng nền để sinh hoạt và một vài điểm nhấn cho tranh, cây hoặc bề mặt đá. Phòng ngủ cần tránh sáng trực diện vào đầu giường. Bếp cần sáng rõ trên mặt thao tác nhưng không nên biến toàn bộ trần thành lưới downlight. Khi làm concept, chúng tôi luôn vẽ kịch bản sáng ngày và đêm cùng lúc.</p>`,
          `<h2>5. Cách gia chủ tự kiểm tra trước khi cải tạo</h2>`,
          `<ul><li>Chụp cùng một góc nhà vào 8h, 12h và 16h để thấy vùng nào quá sáng hoặc quá tối.</li><li>Đứng ở vị trí ngồi chính: sofa, bàn ăn, bàn làm việc; kiểm tra có bị chói trực tiếp không.</li><li>Quan sát tường sau 15h: nếu tường nóng và sáng gắt, cần xử lý bóng đổ trước khi chọn màu sơn.</li></ul>`,
          `<p><strong>Kết luận:</strong> Ánh sáng tự nhiên là vật liệu đầu tiên của kiến trúc. Khi được dẫn đúng, nó làm không gian rộng hơn, vật liệu đẹp hơn và nhịp sống trong nhà chậm lại một cách tự nhiên.</p>`,
        ].join(''),
      },
      en: {
        title: 'Natural light: A symphony of space',
        slug: 'natural-light-symphony-of-space',
        excerpt:
          'A design note from XPRESS DESIGN: how skylights, filtered curtains, matte finishes, and section strategy bring daylight deep into the house without heat, glare, or eye fatigue.',
        lead: 'Daylight is not a matter of “make the glass bigger”. In tropical homes, light has to be filtered, reflected, and timed around the way people actually live.',
        reading_time_minutes: 6,
        publishedAt: new Date('2025-04-15T02:00:00.000Z'),
        hero_image_url: heroLivingLight,
        author_display_name: 'Arch. Minh An Nguyen',
        author_role: 'Head of Architecture Design, XPRESS DESIGN',
        author_bio:
          'Over 12 years crafting residential spaces, with a focus on daylight optimization and applied spatial balance.',
        seo_title: 'Natural light: A symphony of space | XPRESS DESIGN',
        seo_description:
          'Skylights, windows, and reflective surfaces — how we choreograph daylight in tropical homes.',
        content: [
          `<p>During surveys we often ask owners to leave the house untouched for one full morning. A floor plan gives us area; daylight tells us where the house is breathing, where it is overexposed, and where the section needs help.</p>`,
          `<figure><img src="${imgSkylightDiagram}" alt="Skylight diagram" /><figcaption>Concept note: a skylight is a heat-release spine and a visual anchor, not just an opening.</figcaption></figure>`,
          `<h2>1. We do not start with bigger glass</h2>`,
          `<p>Large glazing on a hard sun face may look good in renders, but can create heat, glare, and permanently closed curtains. In tropical homes we usually start with <strong>indirect light</strong>: deep eaves, vertical screens, layered curtains, and warm reflective walls that bring light in softly.</p>`,
          `<h2>2. A skylight has to work in section</h2>`,
          `<p>The success of a skylight is not its size. It is its position in section. Near a stair, it can draw light down and pull hot air up. Between the kitchen and dining room, it becomes a daily rhythm. In the wrong place, it is only a hot hole that is hard to maintain.</p>`,
          `<blockquote>Beautiful daylight is not more daylight. It is light arriving at the right place, in the right strength, at the right time of day.</blockquote>`,
          `<h2>3. Matte surfaces often feel more expensive than glossy ones</h2>`,
          `<p>We avoid large glossy planes in rooms intended for rest. Mineral paint, oiled timber, honed stone, linen, and translucent glass let light settle into layers instead of bouncing into the eye. That soft stop is where depth and luxury begin.</p>`,
          `<figure><img src="${imgBeforeAfter}" alt="Living room before and after daylight intervention" /><figcaption>Internal note: the same room can feel larger once the light axis is opened and harsh reflections are reduced.</figcaption></figure>`,
          `<h2>4. Every room needs a daylight script</h2>`,
          `<p>The living room needs ambient light and a few anchors for art, plants, or stone. Bedrooms should avoid direct glare at the headboard. Kitchens need light on the work surface without turning the ceiling into a grid. We draw day and night lighting together from concept stage.</p>`,
          `<h2>5. A simple owner check before renovation</h2>`,
          `<ul><li>Photograph the same corner at 8:00, 12:00, and 16:00.</li><li>Sit where you actually live: sofa, dining chair, desk; check for direct glare.</li><li>Touch the west wall after 15:00. If it is hot and bright, solve shadow before choosing paint.</li></ul>`,
          `<p><strong>In closing:</strong> Natural light is architecture’s first material. When guided well, it makes rooms feel larger, materials look richer, and daily life slow down without effort.</p>`,
        ].join(''),
      },
      tagSlugs: ['anh-sang', 'kien-truc', 'gieng-troi'],
      category: catKienThucXD,
    },
  ];

  applyArticleEditorialPass(articles, {
    heroLivingLight,
    imgSkylightDiagram,
    imgBeforeAfter,
  });

  for (const a of articles) {
    const tagIds = (a.tagSlugs || []).map((s) => tagMap.get(s)).filter(Boolean);
    const tagMultiselect = tagIds.length ? tagIds.join(',') : '';
    await upsertBilingual(
      strapi,
      'api::article.article',
      { ...a.vi, category: a.category, tags: tagIds, tag_multiselect: tagMultiselect },
      { ...a.en, category: a.category, tags: tagIds, tag_multiselect: tagMultiselect },
    );
    strapi.log.info(`[seed] ✅ Article: ${a.vi.title} / ${a.en.title}`);
  }
}

function applyArticleEditorialPass(articles, assets) {
  const { heroLivingLight, imgSkylightDiagram, imgBeforeAfter } = assets;
  const bySlug = new Map(articles.map((item) => [item.vi.slug, item]));

  patchBilingual(bySlug.get('5-xu-huong-kien-truc-ben-vung-2025'), {
    vi: {
      excerpt:
        'Năm xu hướng XPRESS DESIGN đang đưa vào hồ sơ concept: ít khẩu hiệu “xanh”, nhiều quyết định cụ thể về bóng đổ, gió, nước, vật liệu và vận hành.',
      content: [
        '<p>Mỗi năm đều có một danh sách xu hướng bền vững mới. Nhưng trên công trường, những gì tồn tại lâu dài thường rất cơ bản: bức tường không quá nóng, căn phòng có gió, nước mưa không bị xem là rác, và vật liệu có thể bảo trì sau vài mùa nắng ẩm.</p>',
        '<p>Với các dự án nhà ở và nghỉ dưỡng mà XPRESS DESIGN xử lý gần đây, chúng tôi không xem bền vững là một lớp trang trí. Nó là chuỗi quyết định kỹ thuật xuất hiện từ bản phác mặt cắt đầu tiên.</p>',
        '<blockquote>“Một công trình bền vững trước hết phải dễ sống, dễ bảo trì và ít phụ thuộc vào thiết bị để sửa lỗi thiết kế.”</blockquote>',
        '<h2>1. Mặt đứng biết tạo bóng</h2>',
        '<p>Lam, ban công đệm, hiên sâu và cây leo không còn là chi tiết phụ. Chúng quyết định nhiệt bức xạ lên tường, mức chói trong phòng và tần suất rèm phải đóng. Một mặt đứng tốt là mặt đứng giúp người ở mở cửa nhiều hơn.</p>',
        '<h2>2. Thông gió được vẽ như một tuyến giao thông</h2>',
        '<p>Chúng tôi không chỉ ký hiệu mũi tên gió trên mặt bằng. Tuyến gió cần có cửa vào, cửa ra, chênh cao và vùng đệm. Ở nhà phố, cầu thang và giếng trời thường là phần quan trọng nhất của hệ thông gió tự nhiên.</p>',
        '<h2>3. Vật liệu địa phương nhưng không dễ dãi</h2>',
        '<p>Đá, gỗ, gạch, sơn khoáng hay bê tông mài đều cần được chọn theo cách chúng già đi trong khí hậu nóng ẩm. Vật liệu địa phương chỉ thật sự bền vững khi nguồn cung rõ, thi công ổn định và có hướng dẫn bảo trì cụ thể.</p>',
        '<h2>4. Nước mưa trở thành một phần thiết kế</h2>',
        '<p>Rãnh thấm, bồn chứa, mái dốc, vỉa thấm nước và khu trồng cây không nên được xử lý sau cùng. Chúng là một hệ nhỏ giúp giảm ngập cục bộ, làm mát sân và giữ cảnh quan sống ổn định hơn trong mùa khô.</p>',
        '<h2>5. Vận hành đơn giản, đo được, bàn giao được</h2>',
        '<p>Cảm biến, dimmer, điều khiển vùng và lịch bảo trì có giá trị khi người dùng hiểu cách sử dụng. Chúng tôi ưu tiên những hệ có thể giải thích trong một buổi bàn giao, thay vì một “nhà thông minh” phức tạp nhưng ít ai dùng hết.</p>',
        '<p><strong>Kết luận:</strong> Xu hướng bền vững đáng tin nhất là xu hướng làm công trình dễ sống hơn. Khi bóng, gió, nước và vật liệu được xử lý đúng, phần công nghệ phía sau sẽ nhẹ nhàng hơn rất nhiều.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'Five moves XPRESS DESIGN is bringing into concept work: less green language, more specific decisions about shade, air, water, material, and operation.',
      content: [
        '<p>Every year comes with a new sustainability list. On site, however, the ideas that last are usually simple: a wall that does not overheat, a room that can breathe, rainwater that is not treated as waste, and materials that can be maintained after several humid seasons.</p>',
        '<p>In recent residential and hospitality work, XPRESS DESIGN treats sustainability not as a decorative layer, but as a chain of decisions that begins in the first section sketch.</p>',
        '<blockquote>“A sustainable building should first be easy to live in, easy to maintain, and less dependent on equipment to correct design mistakes.”</blockquote>',
        '<h2>1. Facades that know how to cast shade</h2>',
        '<p>Louvers, buffer balconies, deep eaves, and climbing plants are no longer secondary details. They shape wall temperature, interior glare, and how often curtains stay open. A good facade lets people use openings more often.</p>',
        '<h2>2. Ventilation drawn like circulation</h2>',
        '<p>Wind arrows are not enough. Air needs an entry, an exit, a height difference, and a buffer zone. In townhouses, the stair and skylight often carry the whole natural ventilation strategy.</p>',
        '<h2>3. Local materials, but with discipline</h2>',
        '<p>Stone, timber, brick, mineral paint, and polished concrete must be selected for how they age in heat and humidity. Local material is only truly sustainable when supply is clear, installation is consistent, and maintenance is written down.</p>',
        '<h2>4. Rainwater as part of design</h2>',
        '<p>Swales, tanks, roof falls, permeable paving, and planting beds should not be added at the end. They cool courtyards, reduce local flooding, and keep landscape healthier through dry months.</p>',
        '<h2>5. Simple operations that can be handed over</h2>',
        '<p>Sensors, dimmers, zoning, and maintenance schedules matter only when people understand them. We prefer systems that can be explained in one handover session over “smart” layers that remain unused.</p>',
        '<p><strong>In closing:</strong> The most credible sustainability trend is the one that makes a building easier to live with. When shade, air, water, and materials are right, the technology behind them can be lighter.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('noi-that-toi-gian'), {
    vi: {
      excerpt:
        'Tối giản không phải là làm căn nhà trống đi. Đó là cách tổ chức ánh sáng, tủ, tỷ lệ và vật liệu để mọi thứ cần thiết có chỗ đứng yên.',
      content: [
        '<p>Trong nhiều căn hộ và nhà phố cao cấp, yêu cầu “tối giản” thường bắt đầu bằng hình ảnh: ít đồ, tường sáng, mặt phẳng sạch. Nhưng khi bước vào vận hành, câu hỏi thật lại là: dây sạc để đâu, vali để đâu, đồ lau nhà đi đâu, và vì sao căn nhà mới bàn giao đã bắt đầu rối?</p>',
        '<p>Với XPRESS DESIGN, tối giản không phải là phong cách để chụp ảnh. Nó là một hệ thống cất giữ, chiếu sáng và lựa chọn vật liệu đủ kỷ luật để căn nhà giữ được sự yên tĩnh sau nhiều năm sử dụng.</p>',
        '<h2>1. Bắt đầu từ thói quen, không từ moodboard</h2>',
        '<p>Chúng tôi thường hỏi gia chủ về giờ thức dậy, cách nấu ăn, tần suất tiếp khách, số lượng vali, thiết bị làm việc và đồ thể thao. Những dữ liệu rất đời thường này quyết định chiều sâu tủ, vị trí ổ cắm và cách chia khoang tốt hơn bất kỳ hình tham khảo nào.</p>',
        '<h2>2. Tường sạch vì hệ tủ làm việc tốt</h2>',
        '<p>Một bức tường tối giản thường che phía sau nó rất nhiều quyết định: khe kỹ thuật, ray rèm, tủ âm, cửa phẳng, ổ điện thấp và khoảng rỗng cho robot hút bụi. Nếu các phần này không được vẽ sớm, nội thất sẽ phải “chữa cháy” bằng các chi tiết lộ ra ngoài.</p>',
        '<h2>3. Vật liệu cần có độ ấm</h2>',
        '<p>Không gian tối giản dễ lạnh nếu chỉ dùng trắng, xám và đá bóng. Chúng tôi thường thêm gỗ dầu mờ, vải dệt thô, sơn khoáng hoặc đá honed để bề mặt giữ ánh sáng mềm hơn. Căn nhà ít đồ vẫn cần có cảm giác chạm.</p>',
        '<blockquote>“Tối giản thành công là khi gia chủ sống thật trong đó, không phải khi căn nhà trông như chưa ai từng dùng.”</blockquote>',
        '<h2>4. Ánh sáng là phần nội thất quan trọng nhất</h2>',
        '<p>Ánh sáng nền, ánh sáng điểm và ánh sáng trong tủ cần được tách mạch. Một trần nhà ít đèn không đồng nghĩa với ánh sáng nghèo; nó chỉ đòi hỏi vị trí đèn chính xác hơn.</p>',
        '<p><strong>Kết luận:</strong> Ít hơn chỉ có giá trị khi những gì còn lại được đặt đúng chỗ. Tối giản tốt không làm gia chủ phải cẩn thận hơn; nó giúp cuộc sống tự nhiên gọn lại.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'Minimalism is not about making a home empty. It is the discipline of light, storage, proportion, and material so every necessary thing has a quiet place.',
      content: [
        '<p>In many premium apartments and townhouses, the request for “minimal” begins with imagery: fewer objects, pale walls, clean planes. Once the home is lived in, the real questions appear: where do chargers go, where do suitcases live, where is the mop, and why does a new home start to feel cluttered?</p>',
        '<p>For XPRESS DESIGN, minimalism is not a style for photography. It is a storage, lighting, and material system disciplined enough to keep the home calm after years of use.</p>',
        '<h2>1. Start with habits, not mood boards</h2>',
        '<p>We ask about waking hours, cooking routines, guests, luggage, work equipment, and sports gear. These everyday details shape cabinet depth, outlet placement, and storage zones better than any reference image.</p>',
        '<h2>2. Clean walls come from hardworking joinery</h2>',
        '<p>A minimal wall often hides technical gaps, curtain tracks, full-height storage, flush doors, low outlets, and a robot vacuum bay. If these are not drawn early, the interior has to solve problems with visible add-ons later.</p>',
        '<h2>3. Materials need warmth</h2>',
        '<p>Minimal rooms can feel cold when reduced to white, grey, and glossy stone. We introduce oiled timber, woven fabric, mineral paint, or honed stone so light lands more softly. A sparse home still needs touch.</p>',
        '<blockquote>“Minimalism succeeds when people can live honestly in it, not when the room looks untouched.”</blockquote>',
        '<h2>4. Light is the most important furniture</h2>',
        '<p>Ambient, accent, and cabinet lighting should be separated. A ceiling with fewer fixtures does not mean poor light; it means every fixture has to work harder and be placed with intent.</p>',
        '<p><strong>In closing:</strong> Less only matters when what remains is in the right place. Good minimalism does not ask owners to behave more carefully; it helps life become naturally tidier.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('canh-quan-do-thi-va-vi-khi-hau'), {
    vi: {
      excerpt:
        'Cảnh quan đô thị tốt không dừng ở việc “trồng thêm cây”. Nó xử lý bóng, gió, mặt nền, nước mưa và trải nghiệm đi bộ ở cao độ con người.',
      content: [
        '<p>Có những khoảng sân rất đẹp trên phối cảnh nhưng gần như không ai muốn đứng lại vào lúc 14h. Lý do thường không nằm ở thiếu cây, mà ở việc cây, mặt nền, gió và bóng đổ không được xem như một hệ vi khí hậu.</p>',
        '<p>Trong các dự án sảnh, khu đế và sân trong, XPRESS DESIGN bắt đầu bằng câu hỏi: người dùng sẽ dừng ở đâu, chờ ở đâu, đi bộ bao lâu, và bề mặt nào đang hắt nhiệt ngược vào họ?</p>',
        '<h2>1. Bóng đổ là hạ tầng</h2>',
        '<p>Cây lớn, mái nhẹ, lam, hiên và tường thấp đều tạo bóng theo những cách khác nhau. Chúng tôi không chọn cây chỉ vì hình dáng, mà vì tốc độ lớn, biên độ tán, khả năng chịu gió và độ sạch của lá trong vận hành.</p>',
        '<h2>2. Gió cần đường đi</h2>',
        '<p>Một khoảng sân kín bốn phía có thể rất sang nhưng dễ bí. Khi có thể, chúng tôi mở các khe gió ở tầng trệt, dùng hành lang thoáng, lan can rỗng và khoảng rút để tạo đường gió thấp, nơi người thật cảm nhận được.</p>',
        '<h2>3. Mặt nền quyết định cảm giác nóng</h2>',
        '<p>Đá quá sáng có thể chói, asphalt quá tối giữ nhiệt, gạch quá trơn gây nguy hiểm khi mưa. Mặt nền tốt là sự cân bằng giữa thấm nước, độ nhám, khả năng vệ sinh và cách nó phản xạ ánh sáng lên mặt người.</p>',
        '<h2>4. Nước mưa là một phần trải nghiệm</h2>',
        '<p>Rãnh, mương cạn, bồn cây và mặt dốc nhỏ giúp nước đi chậm hơn. Khi thiết kế đúng, người dùng không thấy một hệ thoát nước khô cứng; họ chỉ thấy sân mát hơn, cây khỏe hơn và lối đi sạch hơn sau mưa.</p>',
        '<h2>5. Đo bằng hành vi, không chỉ bằng bản vẽ</h2>',
        '<p>Một không gian ngoài trời thành công khi nhân viên chọn đi bộ qua đó, cư dân đứng chờ mà không né nắng, trẻ con có chỗ ngồi, và bảo vệ không phải tự che tạm bằng dù. Những hành vi nhỏ này nói thật hơn nhiều so với render.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'Good urban landscape is not simply “more planting”. It handles shade, air, ground surface, rainwater, and pedestrian comfort at human height.',
      content: [
        '<p>Some courtyards look beautiful in renderings yet no one wants to stand there at 2 p.m. The issue is usually not a lack of plants, but the absence of a micro-climate system: shade, ground, wind, and water working together.</p>',
        '<p>For lobbies, podiums, and courtyards, XPRESS DESIGN starts with use: where people stop, where they wait, how long they walk, and which surfaces throw heat back at them.</p>',
        '<h2>1. Shade is infrastructure</h2>',
        '<p>Trees, light roofs, screens, eaves, and low walls all cast different kinds of shade. We choose planting not only for form, but for growth rate, canopy spread, wind tolerance, and maintenance cleanliness.</p>',
        '<h2>2. Wind needs a path</h2>',
        '<p>A four-sided courtyard can feel premium yet airless. Where possible, we open low-level wind slots, use breathable corridors, porous guardrails, and setbacks to create air movement people can actually feel.</p>',
        '<h2>3. The ground decides heat comfort</h2>',
        '<p>Stone that is too bright can glare, dark asphalt stores heat, and polished paving becomes dangerous in rain. A good ground plane balances permeability, grip, cleaning, and how it reflects light onto the face.</p>',
        '<h2>4. Rainwater shapes experience</h2>',
        '<p>Channels, shallow swales, planters, and subtle falls slow water down. Done well, users do not see drainage infrastructure; they simply experience a cooler court, healthier planting, and cleaner paths after rain.</p>',
        '<h2>5. Measure by behavior, not only drawings</h2>',
        '<p>An outdoor space works when staff choose to walk through it, residents wait without avoiding the sun, children find a seat, and security teams do not invent temporary umbrellas. These behaviors are more honest than a rendering.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('tinh-tinh-lang-spa-wellness'), {
    vi: {
      excerpt:
        'Một phòng wellness tại gia không được tạo ra bằng nhiều thiết bị hơn, mà bằng âm thanh, ánh sáng, độ ẩm, mùi và cảm giác chạm được kiểm soát đủ tinh tế.',
      content: [
        '<p>Rất nhiều phòng tắm cao cấp được đầu tư mạnh vào đá, sen cây và bồn ngâm, nhưng lại thiếu cảm giác nghỉ. Người dùng bước vào vẫn thấy sáng gắt, vang tiếng nước, mùi ẩm trong tủ và các khe kỹ thuật bị xử lý muộn.</p>',
        '<p>Với XPRESS DESIGN, wellness tại gia bắt đầu từ câu hỏi nhỏ hơn: sau một ngày dài, điều gì giúp cơ thể chậm lại trong 15 phút?</p>',
        '<h2>1. Âm thanh là vật liệu đầu tiên</h2>',
        '<p>Đá, kính và sứ phản âm mạnh. Nếu tất cả bề mặt đều cứng, tiếng nước sẽ sắc và mệt. Chúng tôi thường phối bề mặt khoáng mờ, trần có lớp hấp thụ âm, rèm hoặc gỗ ở vùng khô để tiếng trong phòng mềm hơn.</p>',
        '<h2>2. Ánh sáng phải có mức thấp</h2>',
        '<p>Một phòng wellness không nên chỉ có hai trạng thái: sáng hết hoặc tắt hết. Các mạch dim êm, ánh 2700K, đèn hắt thấp và ánh gương riêng giúp người dùng chọn được trạng thái phù hợp: tắm nhanh, thư giãn, chăm sóc da hoặc đọc trước khi ngủ.</p>',
        '<h2>3. Độ ẩm quyết định tuổi thọ cảm giác sang</h2>',
        '<p>Mùi ẩm phá trải nghiệm rất nhanh. Thông gió, khe hở đáy tủ, độ dốc sàn, vị trí phễu thu và vật liệu chống nấm cần được khóa trước khi chọn mẫu đá. Đây là phần không đẹp trên moodboard nhưng quyết định phòng có bền hay không.</p>',
        '<blockquote>“Wellness không nằm ở số lượng thiết bị. Nó nằm ở việc cơ thể không bị làm phiền bởi ánh sáng, tiếng vang, mùi ẩm và bề mặt lạnh.”</blockquote>',
        '<h2>4. Mẫu thử nhỏ đáng tiền hơn sửa sai lớn</h2>',
        '<p>Với các phòng tắm quan trọng, chúng tôi khuyến nghị mockup một góc thật: đá, đèn, vòi, khe thoát và gương. Chỉ khi đứng trong ánh sáng thật, nghe tiếng nước thật, gia chủ mới biết phòng có đủ tĩnh hay chưa.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'A home wellness room is not made by more equipment. It comes from careful control of sound, light, humidity, scent, and touch.',
      content: [
        '<p>Many premium bathrooms spend heavily on stone, showers, and tubs, yet still fail to feel restful. The light is too sharp, water sounds hard, cabinets smell damp, and technical gaps are solved too late.</p>',
        '<p>For XPRESS DESIGN, home wellness starts with a smaller question: after a long day, what helps the body slow down for fifteen minutes?</p>',
        '<h2>1. Sound is the first material</h2>',
        '<p>Stone, glass, and porcelain reflect sound strongly. If every surface is hard, water becomes sharp and tiring. We combine matte mineral finishes, acoustic ceiling layers, fabric or timber in dry zones so the room sounds softer.</p>',
        '<h2>2. Light needs a low setting</h2>',
        '<p>A wellness room should not have only two states: fully bright or completely off. Smooth dimming, 2700K light, low-level glow, and separate mirror light let users choose between a quick shower, rest, skincare, or reading before bed.</p>',
        '<h2>3. Humidity decides whether luxury lasts</h2>',
        '<p>Damp smell ruins the room quickly. Ventilation, cabinet gaps, floor falls, drain position, and anti-mold finishes should be resolved before stone selection. This is not the beautiful part of the mood board, but it decides longevity.</p>',
        '<blockquote>“Wellness is not the number of devices. It is the absence of irritation from glare, echo, dampness, and cold surfaces.”</blockquote>',
        '<h2>4. Small mockups beat large corrections</h2>',
        '<p>For important bathrooms, we recommend a real corner mockup: stone, light, mixer, drain gap, and mirror. Only in real light, with real water sound, can owners tell whether the room is quiet enough.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('phong-thuy-nha-pho-nguyen-tac-vang'), {
    vi: {
      excerpt:
        'Phong thủy nhà phố, khi nhìn bằng ngôn ngữ kiến trúc, là câu chuyện về trục nhìn, nhịp chuyển tiếp, ánh sáng, gió và cảm giác an tâm khi trở về.',
      content: [
        '<p>Chúng tôi không tiếp cận phong thủy như một bộ công thức đặt vật phẩm. Trong nhà phố, nhiều nguyên tắc truyền thống thật ra có thể đọc lại bằng kiến trúc: cửa vào cần điểm dừng, cầu thang cần sáng, bếp cần kín gió mạnh, phòng ngủ cần yên và nhà cần một nhịp thở ở giữa.</p>',
        '<h2>1. Cửa chính cần một khoảng chuyển tiếp</h2>',
        '<p>Khi mở cửa là nhìn xuyên thẳng ra cuối nhà, người ở thường có cảm giác thiếu riêng tư. Một vách lệch, tủ thấp, khoảng foyer nhỏ hoặc thay đổi vật liệu sàn có thể tạo nhịp chậm lại trước khi bước vào không gian chính.</p>',
        '<h2>2. Giếng trời là điểm tụ ánh sáng</h2>',
        '<p>Ở nhà phố dài và hẹp, giếng trời không chỉ lấy sáng. Nó gom ánh sáng, tạo điểm nhớ trong nhà và giúp khí nóng thoát lên cao. Cây xanh ở đây cần được chọn theo khả năng sống trong bán râm, không chỉ theo hình dáng.</p>',
        '<h2>3. Bếp cần ổn định, không phô trương</h2>',
        '<p>Một căn bếp tốt có luồng đi rõ, đủ sáng trên mặt thao tác và không nằm ngay đường gió xuyên từ cửa chính. Điều này vừa phù hợp với cảm giác “giữ lửa”, vừa đúng về công năng và mùi.</p>',
        '<h2>4. Phòng ngủ cần giảm thông tin</h2>',
        '<p>Đầu giường tránh cửa ra vào trực diện, gương không đối diện giường, ánh sáng không rọi thẳng mắt. Những điều này không cần thần bí hóa; chúng giúp cơ thể nghỉ tốt hơn.</p>',
        '<p><strong>Kết luận:</strong> Phong thủy ứng dụng tốt là khi gia chủ thấy nhà dễ ở hơn, đội thi công hiểu được lý do, và mọi quyết định đều có thể chuyển thành chi tiết kiến trúc rõ ràng.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'Townhouse feng shui, read through architecture, is about sightlines, thresholds, daylight, air, and the calm feeling of returning home.',
      content: [
        '<p>We do not approach feng shui as a formula for placing objects. In townhouses, many traditional principles can be translated architecturally: the entry needs a pause, stairs need light, kitchens need protection from strong drafts, bedrooms need quiet, and the house needs a breathing point in the middle.</p>',
        '<h2>1. The entry needs a threshold</h2>',
        '<p>When the front door opens directly to the end of the house, privacy feels thin. A shifted screen, low cabinet, small foyer, or floor material change can slow the sequence before entering the main room.</p>',
        '<h2>2. The skylight gathers light</h2>',
        '<p>In long narrow houses, a skylight is not only for brightness. It creates a memorable center and lets warm air rise. Planting here should be chosen for semi-shade survival, not only appearance.</p>',
        '<h2>3. The kitchen should feel grounded</h2>',
        '<p>A good kitchen has clear movement, enough light on the worktop, and is not placed directly in a strong entry draft. This supports both the traditional idea of keeping the hearth and the practical control of smell and comfort.</p>',
        '<h2>4. Bedrooms should reduce information</h2>',
        '<p>The headboard avoids direct door alignment, mirrors do not face the bed, and light does not hit the eyes. These choices do not need mysticism; they help the body rest.</p>',
        '<p><strong>In closing:</strong> Applied feng shui works when the home becomes easier to live in, builders understand the reason, and each decision can become a clear architectural detail.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('5-xu-huong-thiet-ke-noi-that-nam-toi'), {
    vi: {
      excerpt:
        'Năm xu hướng nội thất đang nổi lên không nằm ở màu sắc nhất thời, mà ở cách ngôi nhà xử lý vật liệu, ánh sáng, lưu trữ và ranh giới trong - ngoài.',
      content: [
        '<p>Các xu hướng nội thất đáng theo dõi thường không xuất hiện như một món đồ mới, mà như một thay đổi trong cách sống. Khách hàng muốn nhà ít ồn hơn, dễ bảo trì hơn, có vật liệu thật hơn và kết nối với ngoài trời một cách tự nhiên hơn.</p>',
        '<h2>1. Bề mặt khoáng và vật liệu có chiều sâu</h2>',
        '<p>Limewash, clay, tadelakt, đá honed và gỗ dầu mờ đang thay thế dần các bề mặt bóng quá phẳng. Chúng không “la” trên ảnh, nhưng tạo độ sâu khi ánh sáng thay đổi trong ngày.</p>',
        '<h2>2. Tủ âm như một phần kiến trúc</h2>',
        '<p>Tủ không còn chỉ là đồ nội thất. Nó giấu kỹ thuật, tạo trục nhìn, làm dày tường và giữ nhịp sống gọn hơn. Đây là xu hướng quan trọng nhất nếu gia chủ thật sự muốn nhà đẹp lâu.</p>',
        '<h2>3. Ánh sáng thấp và có kịch bản</h2>',
        '<p>Nhà cao cấp đang rời xa trần nhiều downlight. Thay vào đó là đèn hắt, đèn điểm, ánh trong tủ, ánh chân tường và các mạch dim theo tình huống: ăn tối, đọc sách, tiếp khách, nghỉ ngơi.</p>',
        '<h2>4. Ranh giới trong - ngoài mềm hơn</h2>',
        '<p>Sàn cùng tông, ray cửa chìm, hiên sâu và cây đặt đúng vị trí giúp phòng khách mở ra sân mà không mất kiểm soát nhiệt, nước và riêng tư.</p>',
        '<h2>5. Vật liệu bền vững phải có hướng dẫn bảo trì</h2>',
        '<p>Gia chủ không chỉ hỏi “có xanh không”, mà hỏi sau ba năm sẽ ra sao. Vật liệu tốt cần có câu trả lời về lau chùi, chống ẩm, thay thế và lão hóa.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'The next interior trends are less about seasonal colors and more about how homes handle material, light, storage, and the indoor-outdoor edge.',
      content: [
        '<p>The trends worth following rarely arrive as a single object. They show up as changes in how people want to live: quieter homes, easier maintenance, more honest materials, and a more natural connection to the outdoors.</p>',
        '<h2>1. Mineral surfaces with depth</h2>',
        '<p>Limewash, clay, tadelakt, honed stone, and oiled timber are replacing overly glossy planes. They do not shout in photos, but they gain depth as daylight changes.</p>',
        '<h2>2. Built-in storage as architecture</h2>',
        '<p>Joinery is no longer only furniture. It hides services, sets sightlines, thickens walls, and keeps daily life calmer. It is the most important trend for homes that need to stay beautiful.</p>',
        '<h2>3. Lower light with scenarios</h2>',
        '<p>Premium homes are moving away from ceilings filled with downlights. Instead: wall wash, accent light, cabinet light, low-level glow, and dimmed circuits for dinner, reading, hosting, and rest.</p>',
        '<h2>4. Softer indoor-outdoor edges</h2>',
        '<p>Matched floor tones, recessed tracks, deep eaves, and planting in the right place allow living rooms to open out while still controlling heat, water, and privacy.</p>',
        '<h2>5. Sustainable materials with maintenance guidance</h2>',
        '<p>Owners are no longer asking only whether something is green. They ask what it looks like after three years. Good material choices answer cleaning, moisture, replacement, and aging.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('vat-lieu-tai-che-xu-huong-ben-vung'), {
    vi: {
      excerpt:
        'Vật liệu tái chế chỉ thật sự thuyết phục khi có nguồn gốc rõ, chi tiết thi công đúng và kế hoạch bảo trì đủ cụ thể.',
      content: [
        '<p>Trong thiết kế nhà ở cao cấp, vật liệu tái chế không nên được dùng như một tuyên bố đạo đức chung chung. Nếu chọn sai, nó có thể nhanh xuống cấp, khó bảo trì và làm công trình trông tạm bợ. Nếu chọn đúng, nó tạo ra một câu chuyện vật liệu rất riêng.</p>',
        '<h2>1. Gạch, gốm và đá vụn cần được kiểm soát lô</h2>',
        '<p>Terrazzo hoặc mảng ốp từ vật liệu nghiền có vẻ tự nhiên, nhưng biên độ màu và độ mài cần được thống nhất trước. Chúng tôi luôn yêu cầu mẫu thật đủ lớn, không chỉ một miếng nhỏ trên tay.</p>',
        '<h2>2. Gỗ thu hồi cần hồ sơ xử lý</h2>',
        '<p>Gỗ cũ đẹp vì có vết thời gian, nhưng cũng cần kiểm ẩm, chống mối và xác định rõ vị trí sử dụng. Chúng tôi ưu tiên dùng cho lam, tủ, trần hoặc chi tiết trang trí hơn là kết cấu chịu lực chính.</p>',
        '<h2>3. Kính và kim loại tái chế phải đi cùng tiêu chuẩn mới</h2>',
        '<p>Với mặt tiền hoặc lan can, yếu tố an toàn luôn đứng trước câu chuyện tái chế. Vật liệu có hàm lượng tái chế vẫn cần đạt yêu cầu về chịu lực, chống ăn mòn và bảo hành.</p>',
        '<h2>4. Đừng che giấu nguồn gốc vật liệu</h2>',
        '<p>Điểm hay của vật liệu tái chế là câu chuyện của nó. Một bậc đá tận dụng, một mảng gỗ cũ hay một mặt bàn từ vụn gạch nên được thiết kế để người dùng hiểu và trân trọng, không phải để giả làm vật liệu mới.</p>',
        '<p><strong>Kết luận:</strong> Vật liệu tái chế chuyên nghiệp không bắt đầu bằng cảm hứng, mà bằng kiểm tra, mockup và hồ sơ bảo trì.</p>',
      ].join(''),
    },
    en: {
      excerpt:
        'Recycled materials become convincing only when their origin is clear, their details are correct, and their maintenance plan is specific.',
      content: [
        '<p>In premium residential design, recycled material should not be used as a vague moral statement. Chosen poorly, it can age badly and feel temporary. Chosen well, it gives a home a material story no catalogue can provide.</p>',
        '<h2>1. Crushed brick, ceramic, and stone need batch control</h2>',
        '<p>Terrazzo or cladding made from crushed material can look beautifully natural, but color range and grinding depth must be agreed early. We always ask for a large enough real sample, not only a small hand piece.</p>',
        '<h2>2. Reclaimed timber needs treatment records</h2>',
        '<p>Old timber is beautiful because of time, but it still needs moisture checks, termite treatment, and a clear placement strategy. We prefer it for screens, joinery, ceilings, or accents rather than primary structural roles.</p>',
        '<h2>3. Recycled glass and metal still need new standards</h2>',
        '<p>For facades or balustrades, safety comes before the recycling story. Recycled content still has to meet strength, corrosion, and warranty requirements.</p>',
        '<h2>4. Do not hide the material history</h2>',
        '<p>The value of recycled material is its story. A salvaged stone step, a reclaimed timber wall, or a tabletop made from ceramic fragments should be detailed so users understand and appreciate it, not so it pretends to be new.</p>',
        '<p><strong>In closing:</strong> Professional use of recycled material begins with testing, mockups, and maintenance records, not inspiration alone.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('anh-sang-tu-nhien-ban-giao-huong-cua-khong-gian'), {
    vi: {
      hero_image_url: heroLivingLight,
      content: [
        `<p>Trong các buổi khảo sát nhà phố và biệt thự, chúng tôi thường yêu cầu gia chủ giữ nguyên hiện trạng ít nhất một buổi sáng. Lý do rất đơn giản: bản vẽ mặt bằng nói được diện tích, nhưng chỉ ánh sáng thật mới cho thấy căn nhà đang “thở” ở đâu và đang bí ở đâu.</p>`,
        `<figure><img src="${imgSkylightDiagram}" alt="Sơ đồ minh họa giếng trời" /><figcaption>Ghi chú concept: giếng trời không chỉ lấy sáng, mà còn là trục thoát nhiệt và điểm neo thị giác.</figcaption></figure>`,
        '<h2>1. Không bắt đầu bằng cửa kính lớn</h2>',
        '<p>Một mảng kính lớn ở hướng nắng gắt có thể làm phòng khách sáng hơn trong ảnh render, nhưng lại tăng nhiệt, gây chói và khiến rèm luôn phải kéo. Với nhà nhiệt đới, XPRESS DESIGN thường ưu tiên ánh sáng gián tiếp: hiên sâu, lam dọc, rèm hai lớp, hoặc tường phản xạ màu ấm để ánh sáng đi vào mềm hơn.</p>',
        '<h2>2. Giếng trời cần có vai trò trong mặt cắt</h2>',
        '<p>Giếng trời tốt không nằm ở kích thước lớn hay nhỏ, mà ở vị trí trong mặt cắt. Nếu đặt gần cầu thang, nó kéo sáng xuống tầng thấp và đẩy khí nóng lên trên. Nếu đặt giữa bếp và bàn ăn, nó trở thành nhịp sinh hoạt trong ngày.</p>',
        '<blockquote>Ánh sáng đẹp không phải ánh sáng nhiều. Đó là ánh sáng đến đúng nơi, đúng cường độ, đúng thời điểm trong ngày.</blockquote>',
        '<h2>3. Vật liệu mờ thường sang hơn vật liệu bóng</h2>',
        '<p>Sơn khoáng, gỗ dầu mờ, đá honed, vải linen và kính mờ giúp ánh sáng dừng lại thành lớp, thay vì bật ngược vào mắt. Chính lớp mờ này tạo cảm giác sâu và đắt khi kết hợp ánh đèn 2700-3000K vào buổi tối.</p>',
        `<figure><img src="${imgBeforeAfter}" alt="Không gian trước và sau khi tối ưu ánh sáng" /><figcaption>Ghi chú nội bộ: cùng một phòng có thể thay đổi cảm giác lớn nhỏ bằng cách mở trục sáng và giảm bề mặt phản chiếu mạnh.</figcaption></figure>`,
        '<h2>4. Mỗi phòng cần một kịch bản sáng riêng</h2>',
        '<p>Phòng khách cần ánh sáng nền và vài điểm nhấn. Phòng ngủ cần tránh sáng trực diện vào đầu giường. Bếp cần sáng rõ trên mặt thao tác nhưng không nên biến toàn bộ trần thành lưới downlight.</p>',
        '<p><strong>Kết luận:</strong> Ánh sáng tự nhiên là vật liệu đầu tiên của kiến trúc. Khi được dẫn đúng, nó làm không gian rộng hơn, vật liệu đẹp hơn và nhịp sống trong nhà chậm lại.</p>',
      ].join(''),
    },
    en: {
      hero_image_url: heroLivingLight,
      content: [
        '<p>During surveys we often ask owners to leave the house untouched for one full morning. A floor plan gives us area; daylight tells us where the house is breathing, where it is overexposed, and where the section needs help.</p>',
        `<figure><img src="${imgSkylightDiagram}" alt="Skylight diagram" /><figcaption>Concept note: a skylight is a heat-release spine and a visual anchor, not just an opening.</figcaption></figure>`,
        '<h2>1. We do not start with bigger glass</h2>',
        '<p>Large glazing on a hard sun face may look good in renders, but can create heat, glare, and permanently closed curtains. In tropical homes we usually start with indirect light: deep eaves, vertical screens, layered curtains, and warm reflective walls.</p>',
        '<h2>2. A skylight has to work in section</h2>',
        '<p>The success of a skylight is not its size. It is its position in section. Near a stair, it can draw light down and pull hot air up. Between kitchen and dining, it becomes a daily rhythm.</p>',
        '<blockquote>Beautiful daylight is not more daylight. It is light arriving at the right place, in the right strength, at the right time of day.</blockquote>',
        '<h2>3. Matte surfaces often feel more expensive than glossy ones</h2>',
        '<p>Mineral paint, oiled timber, honed stone, linen, and translucent glass let light settle into layers instead of bouncing into the eye. That soft stop is where depth begins.</p>',
        `<figure><img src="${imgBeforeAfter}" alt="Living room before and after daylight intervention" /><figcaption>Internal note: the same room can feel larger once the light axis is opened and harsh reflections are reduced.</figcaption></figure>`,
        '<h2>4. Every room needs a daylight script</h2>',
        '<p>The living room needs ambient light and a few anchors. Bedrooms should avoid direct glare at the headboard. Kitchens need light on the work surface without turning the ceiling into a grid.</p>',
        '<p><strong>In closing:</strong> Natural light is architecture’s first material. When guided well, it makes rooms feel larger, materials look richer, and daily life slow down.</p>',
      ].join(''),
    },
  });
}

function patchBilingual(target, patch) {
  if (!target) return;
  if (patch.vi) Object.assign(target.vi, patch.vi);
  if (patch.en) Object.assign(target.en, patch.en);
}

async function seedNews(strapi, tagMap) {
  const heroAward =
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80';
  const imgStageAward =
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  const imgVilla =
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80';
  const heroDaLat =
    'https://images.unsplash.com/photo-1600596542815-27b88e7a4d53?auto=format&fit=crop&w=1600&q=80';
  const heroSingapore =
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';
  const heroWorkshop =
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80';
  const heroCSR =
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80';

  const items = [
    {
      vi: {
        title: "Dự án 'Villa Sen Vàng' của XPRESS DESIGN đoạt giải Kiến trúc Xanh 2025",
        slug: 'villa-sen-vang-giai-kien-truc-xanh-2025',
        excerpt:
          "Dự án Villa Sen Vàng được ghi nhận trong nhóm công trình nhà ở có giải pháp khí hậu tốt nhờ cách xử lý mặt đứng, giếng trời và thông gió chéo phù hợp với điều kiện đô thị nhiệt đới.",
        lead: 'Với Villa Sen Vàng, XPRESS DESIGN không bắt đầu từ hình ảnh một biệt thự “xanh”, mà từ bài toán rất cụ thể: làm sao để một ngôi nhà đô thị có thể sáng, thoáng và riêng tư mà không phụ thuộc hoàn toàn vào điều hòa.',
        source: 'XPRESS DESIGN Studio Journal',
        badge_label: 'Giải thưởng',
        hero_image_url: heroAward,
        event_award_category: 'Công trình sử dụng năng lượng hiệu quả',
        content: [
          `<p>Villa Sen Vàng là một hồ sơ nhà ở mà đội ngũ XPRESS DESIGN dùng để kiểm chứng cách kết hợp giữa mặt đứng hai lớp, khoảng rỗng trung tâm và vật liệu hoàn thiện có độ hấp thụ nhiệt thấp. Thay vì thêm “mảng xanh” ở cuối dự án, chiến lược bền vững được đưa vào ngay từ mặt cắt đầu tiên.</p>`,
          `<figure><img src="${imgStageAward}" alt="Không gian sự kiện công bố dự án" /><figcaption>Khoảnh khắc công bố hồ sơ Villa Sen Vàng trong chương trình tổng kết thiết kế xanh 2025.</figcaption></figure>`,
          `<figure><img src="${imgVilla}" alt="Villa Sen Vàng" /><figcaption>Villa Sen Vàng tập trung vào bóng đổ, giếng trời và thông gió tự nhiên thay vì chỉ tạo hình mặt tiền.</figcaption></figure>`,
          `<h2>Điểm đáng chú ý của hồ sơ</h2>`,
          `<ul><li>Mặt đứng hướng nắng được xử lý bằng lam sâu và ban công đệm, giúp giảm bức xạ trực tiếp vào không gian sinh hoạt.</li><li>Giếng trời giữa nhà vừa lấy sáng vừa tạo luồng thoát khí nóng lên cao.</li><li>Vật liệu đá, gỗ và sơn khoáng được chọn theo khả năng lão hóa đẹp, dễ bảo trì và phù hợp khí hậu ẩm.</li></ul>`,
          `<h2>Từ giải pháp kỹ thuật đến cảm giác sống</h2>`,
          `<p>Điểm chúng tôi muốn giữ lại ở Villa Sen Vàng không phải là một hình ảnh “xanh” để truyền thông, mà là cảm giác sống chậm hơn: phòng khách đủ sáng vào ban ngày, hành lang có gió nhẹ, bề mặt tường không nóng gắt vào cuối chiều và cây xanh có vai trò thật trong việc tạo bóng.</p>`,
          `<h2>Chia sẻ từ nhóm thiết kế</h2>`,
          `<p>Đại diện nhóm thiết kế cho biết: <em>“Điều quan trọng nhất là biến khái niệm bền vững thành các chi tiết có thể thi công: lam dày bao nhiêu, khe thoáng ở đâu, nước mưa đi về đâu và gia chủ bảo trì thế nào sau ba năm.”</em></p>`,
          `<p><strong>Ghi chú:</strong> Hồ sơ Villa Sen Vàng sẽ tiếp tục được XPRESS DESIGN dùng như một bộ tham chiếu nội bộ cho các dự án nhà ở nhiệt đới có yêu cầu cao về riêng tư, ánh sáng và vận hành.</p>`,
        ].join(''),
        location: 'Nhà hát Lớn Hà Nội',
        publishedAt: new Date('2025-04-15T02:00:00.000Z'),
      },
      en: {
        title: "XPRESS DESIGN's 'Villa Sen Vàng' wins Green Architecture Award 2025",
        slug: 'villa-sen-vang-green-architecture-award-2025',
        excerpt:
          "Villa Sen Vàng is recognised among residential projects with a strong climate response, using facade depth, skylight strategy, and cross ventilation for dense tropical living.",
        lead: 'With Villa Sen Vàng, XPRESS DESIGN did not begin with the image of a “green villa”. The brief was more practical: how can an urban home be bright, breathable, and private without relying entirely on air-conditioning?',
        source: 'XPRESS DESIGN Studio Journal',
        badge_label: 'Award',
        hero_image_url: heroAward,
        event_award_category: 'Energy-efficient building',
        content: [
          `<p>Villa Sen Vàng is a residential file XPRESS DESIGN used to test the relationship between a two-layer facade, a central void, and finishes with lower heat absorption. Sustainability was not added as a visual layer at the end; it entered the first section sketch.</p>`,
          `<figure><img src="${imgStageAward}" alt="Project announcement event" /><figcaption>Project note: Villa Sen Vàng was presented in the studio's 2025 green design review.</figcaption></figure>`,
          `<figure><img src="${imgVilla}" alt="Villa Sen Vàng exterior" /><figcaption>Villa Sen Vàng focuses on shade, skylight, and natural airflow before facade styling.</figcaption></figure>`,
          `<h2>What the submission highlighted</h2>`,
          `<ul><li>Sun-facing elevations use deep screens and buffer balconies to reduce direct radiation into living spaces.</li><li>The central skylight brings daylight down while allowing warm air to escape upward.</li><li>Stone, timber, and mineral coatings were selected for graceful aging, maintenance clarity, and humid-climate performance.</li></ul>`,
          `<h2>From detail to daily comfort</h2>`,
          `<p>The value of Villa Sen Vàng is not a “green” image. It is a slower way of living: a living room bright enough by day, corridors with a slight breeze, walls that do not feel harsh in late afternoon, and planting that performs as shade rather than decoration.</p>`,
          `<h2>Design team note</h2>`,
          `<p>The team shared: <em>“The real work is turning sustainability into buildable details: how deep the louvre is, where the air gap sits, where the rainwater goes, and how the owner maintains it after year three.”</em></p>`,
          `<p><strong>In closing:</strong> Villa Sen Vàng will remain a reference file for XPRESS DESIGN when developing tropical homes that need privacy, daylight, and long-term operational comfort.</p>`,
        ].join(''),
        location: 'Hanoi Opera House',
        publishedAt: new Date('2025-04-15T02:00:00.000Z'),
      },
      shared: {
        type: 'event',
        event_date: new Date('2025-04-14T12:00:00.000Z'),
        show_event_info_box: true,
      },
      tagSlugs: ['ben-vung', 'kien-truc', 'nam-2025'],
    },
    {
      vi: {
        title: 'Khởi công dự án Biệt thự Xanh Đà Lạt',
        slug: 'khoi-cong-biet-thu-xanh-da-lat',
        excerpt:
          'XPRESS DESIGN và Green Hill Group chính thức khởi công cọc móng biệt thự bền vững trên sườn đồi Đà Lạt — chuyển giai đoạn thiết kế sang thi công sau thẩm duyệt tỉnh.',
        lead: 'Lễ khởi công đánh dấu cam kết hiện trường: tối ưu nhiệt mặt tây, thu nước mưa mái và quy trình bê tông có log batch.',
        source: 'Ban Truyền thông XPRESS DESIGN',
        badge_label: 'Sự kiện',
        hero_image_url: heroDaLat,
        publishedAt: new Date('2025-03-10T03:00:00.000Z'),
        event_award_category: 'Khởi công & thi công giai đoạn 1',
        content: [
          '<p><strong>Đà Lạt, 10/3/2025</strong> — Sáng nay, XPRESS DESIGN cùng chủ đầu tư Green Hill Group và tư vấn giám sát đã tổ chức lễ <em>khởi công cọc móng</em> tại thửa công trình trên sườn đồi thông, tầm nhìn thung lũng hướng tây bắc. Đây là dấu mốc chuyển dự án từ giai đoạn thiết kế tăng tốc thành mặt công thực, sau khi thông qua thẩm duyệt cấp tỉnh hồi cuối 2024.</p>',
          '<h2>Diễn biến nghi thức & phân kỳ thi công 90 ngày tới</h2>',
          '<p>Block đầu tập trung: cọc khoan nhồi đường kính 600–800mm, đài móng bệ tách ẩm, ống thoát tầng 1, và tuyến cấp tưới nước mưa thu ở mái. An toàn: rào tuyến công, camera trạm, kiểm tra tải tạm khi vận chuyển cọc vượt 12% dốc ổ cấp.</p>',
          '<h2>Cam kết bền vững tại hiện trường</h2>',
          '<ul><li>Sổ theo dõi tải tường nóng mặt tây, xử lý lam + dàn leo trước tầng 2.</li><li>Tối thiểu 60% bê tông tại trạm, trộn ổn định độ, batch log 14 ngày.</li><li>Hoàn ủ đất khoan, tách rác ủ lân bãi, không thải lẫn lộn xuống thung lũng.</li></ul>',
          '<h2>Thông điệp từ studio</h2>',
          '<p>“Chúng tôi bước vào công trường với tư duy: mỗi tấn bê tông cần lý do nhiệt, mỗi tấc đường ống cần tính 10 năm. Biệt thự Xanh không chỉ là tên, mà sẽ lộ ở mái, lam, tưới, và cách ánh sáng buổi chiều chạm lên đá hồ bơi.” — KTS trưởng dự án, XPRESS DESIGN.</p>',
          '<p><em>Tiếp theo</em>: báo cáo tiến độ 45 ngày, site walk mở cho báo chí tháng 5/2025.</p>',
        ].join(''),
        location: 'Đà Lạt, Lâm Đồng',
      },
      en: {
        title: 'Groundbreaking of Green Villa Da Lat',
        slug: 'groundbreaking-green-villa-da-lat',
        excerpt:
          'XPRESS DESIGN and Green Hill Group break ground on a sustainable hill villa in Da Lat — moving from design acceleration into construction after provincial approval.',
        lead: 'The ceremony commits the site to west-elevation heat control, roof rainwater harvesting, and batch-logged concrete discipline.',
        source: 'XPRESS DESIGN Communications',
        badge_label: 'Event',
        hero_image_url: heroDaLat,
        publishedAt: new Date('2025-03-10T03:00:00.000Z'),
        event_award_category: 'Groundbreaking & phase-one works',
        content: [
          '<p><strong>Da Lat, 10 Mar 2025</strong> — This morning, XPRESS DESIGN with Green Hill Group and the supervision team marked the <em>pile and foundation</em> start on a pine-hill lot with a north-western valley view. The project moved from a fast-track design package into the ground after provincial approval late in 2024.</p>',
          '<h2>Ceremony note & the first 90-day work window</h2>',
          '<p>Phase 1: 600–800mm bored piles, split raft where damp, level-1 drainage runs, and first-flush cistern tie-ins. Safety: a fenced work line, a site camera, and a haul route check for pile trucks on 12% temporary ramps.</p>',
          '<h2>On-site sustainability commitments</h2>',
          '<ul><li>West-elevation heat log, lam and climbing planned before the level-2 close-in.</li><li>60%+ readymix at the batching plant, traceable 14-day logs.</li><li>Spoil and organic waste split — no down-slope co-mingling to the valley.</li></ul>',
          '<h2>Statement</h2>',
          '<p>“We do not only pour; every cubic metre needs a heat story, and every line set needs a 10-year story. The ‘green’ in this house will show in the roof, the louvres, the irrigation, and the way afternoon light skims the pool stone.” — lead architect, XPRESS DESIGN.</p>',
          '<p><em>Next up</em>: a 45-day progress report and a press site-walk penciled for late May 2025.</p>',
        ].join(''),
        location: 'Da Lat, Lam Dong',
      },
      shared: {
        type: 'event',
        event_date: new Date('2025-03-10T09:00:00.000Z'),
        show_event_info_box: true,
      },
      tagSlugs: ['xu-huong', 'vat-lieu', 'ben-vung'],
    },
    {
      vi: {
        title: 'Công ty đoạt giải thiết kế bền vững 2025',
        slug: 'giai-thiet-ke-ben-vung-2025',
        excerpt:
          'XPRESS DESIGN nhận hạng Bronze tại Sustainable Design Awards 2025 (Đông Nam Á) với nhà phố miền Trung — hồ sơ chứng minh giảm nhiệt tường tây và thông gió chéo có số liệu.',
        lead: 'Giải thưởng ghi nhận quy trình thiết kế dựa trên đo đạc trước và sau concept, phù hợp mô hình Design–Build và EPC.',
        source: 'Ban Truyền thông XPRESS DESIGN',
        badge_label: 'Giải thưởng',
        hero_image_url: heroSingapore,
        publishedAt: new Date('2025-06-02T02:00:00.000Z'),
        content: [
          '<p><strong>Singapore, 1/6/2025</strong> — XPRESS DESIGN được trao hạng <strong>Bronze</strong> tại hạng mục công trình dân cư hạt nhỏ, <em>Sustainable Design Awards 2025</em> (Khu vực Đông Nam Á), với công trình mẫu: nhà phố 3,5 tầng tại miền Trung, thí điểm tường tây rút 40% ánh sáng trực xạ, thông gió chéo 2,5m/s ở giao điểm cầu thang–bếp theo số liệu đo trước/ sau concept.</p>',
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
        excerpt:
          'XPRESS DESIGN receives Bronze at the Southeast Asia Sustainable Design Awards 2025 for a Central Vietnam tube house — documented west-wall heat cuts and cross ventilation.',
        lead: 'The jury recognised a process built on pre/post metrics, suited to design–build and EPC briefs.',
        source: 'XPRESS DESIGN Communications',
        badge_label: 'Award',
        hero_image_url: heroSingapore,
        publishedAt: new Date('2025-06-02T02:00:00.000Z'),
        content: [
          '<p><strong>Singapore, 1 Jun 2025</strong> — XPRESS DESIGN received a <strong>Bronze</strong> in the small residential class at the <em>Sustainable Design Awards 2025</em> (Southeast Asia), for a 3.5-level tube-house case in Central Vietnam. The entry proved a 40% cut in west-wall direct insolation, 2.5m/s cross air at the stair–kitchen node (pre/post concept metrics).</p>',
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
      tagSlugs: ['ben-vung', 'kien-truc', 'xu-huong'],
    },
    {
      vi: {
        title: 'Workshop: Vật liệu bản địa & hoàn thiện tại công trường',
        slug: 'workshop-vat-lieu-ban-dia',
        excerpt:
          'Workshop kín 40 suất tại văn phòng Quận 1: XPRESS DESIGN cùng đối tác đá và gỗ làm rõ tải, khí hậu và chi tiết ốp trước khi đặt hàng tấm lớn.',
        lead: 'Chương trình 150 phút: từ rãnh thấm và ốc tới demo vật lý trên bàn — ưu tiên quyết định dựa trên thử chứ không phải render.',
        source: 'Ban Truyền thông XPRESS DESIGN',
        badge_label: 'Sự kiện',
        hero_image_url: heroWorkshop,
        publishedAt: new Date('2025-08-21T02:00:00.000Z'),
        event_award_category: 'Vật liệu & hoàn thiện hiện trường',
        content: [
          '<p><strong>TP.HCM, 20/8/2025, 14:00</strong> — Sự kiện kín, dành cho 40 suất (KTS, chủ đầu tư, nhà cung ứng đá) tại văn phòng XPRESS DESIGN, Quận 1. Mục tiêu: <em>làm rõ cách chọn đá/ gỗ theo tải, khí hậu, công tác ốp, trước khi bấm số tấm ốp ở công trường</em> — thay vì đổi mẫu trên 3D.</p>',
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
        excerpt:
          'Invitation-only workshop in District 1: XPRESS DESIGN, stone and timber partners align loads, climate, and fixing logic before large-format orders.',
        lead: 'A 150-minute run sheet from weeps and screws to a physical bench demo — decisions from testing, not renders.',
        source: 'XPRESS DESIGN Communications',
        badge_label: 'Event',
        hero_image_url: heroWorkshop,
        publishedAt: new Date('2025-08-21T02:00:00.000Z'),
        event_award_category: 'Materials & site finishes',
        content: [
          '<p><strong>Ho Chi Minh City, 20 Aug 2025, 14:00</strong> — A closed, 40-seat session for architects, owners, and stone suppliers at the XPRESS DESIGN D1 office. The purpose: to align <em>structural, climate, and fixings logic before slab count</em> on site — not to swap 3D patterns late.</p>',
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
        show_event_info_box: true,
      },
      tagSlugs: ['vat-lieu', 'xu-huong'],
    },
    {
      vi: {
        title: 'Chương trình “Cùng sửa chữa mái” cho hộ dân vùng lũ tại Nghệ An',
        slug: 'cung-sua-mai-cho-ho-dan',
        excerpt:
          'Chương trình CSR của XPRESS DESIGN tại Diễn Châu: 4 tuần, 12 hộ, mái an toàn trước mùa bão — kết hợp tình nguyện viên và chuyên môn kết cấu nhẹ.',
        lead: 'Ưu tiên hộ dễ bị tổn thương, quy ước an toàn mái dốc, và bàn giao tài liệu bảo trì một trang cho chính quyền địa phương.',
        source: 'Ban CSR XPRESS DESIGN',
        badge_label: 'Cộng đồng',
        hero_image_url: heroCSR,
        publishedAt: new Date('2024-10-15T02:00:00.000Z'),
        content: [
          '<p><strong>Diễn Châu, Nghệ An, tháng 10/2024</strong> — Trong 4 tuần, 32 tình nguyện viên, 2 nhà cung ứng ngói, 1 sản xuất tấm OSB, và kỹ sư tình nguyện XPRESS DESIGN cùng hỗ trợ <strong>12 hộ</strong> ổn định kết cấu mái, chống dột trước mùa mưa bão. Tổng vật chất gần 420 triệu (giá ước, gồm vận chuyển 18%) — 60% từ quyên góp nội bộ, 40% từ đối tác vật liệu &amp; vận tải ưu tiên tuyến dốc mềm.</p>',
          '<h2>Chọn hộ, quy ước thi công, an toàn</h2>',
          '<p>Ưu tiên: hộ nữ đơn thân, người già, mái tôn gỉ 5 năm+, nhà ống 3–3,2m bề ngang, có nguy cơ nước bốc hơi xuống hốc treo. Mỗi hộ: bản 2 A3 khung, kèo, ốc, 6–8 tấm OSB, màng, cao su gioăng, mũ, dây, đinh phạm. Không thi công khi tốc gió 7 bậc trở lên, không tập kết 300kg+ trên mái 15°.</p>',
          '<h2>Đóng góp chuyên môn XPRESS DESIGN</h2>',
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
        excerpt:
          'XPRESS DESIGN CSR in Dien Chau: four weeks, twelve households, storm-ready roofs — volunteer labour plus light-structure pro-bono design.',
        lead: 'Vulnerable households first, strict rules for steep roofs, and a one-page O&M handover for local authorities.',
        source: 'XPRESS DESIGN CSR',
        badge_label: 'Community',
        hero_image_url: heroCSR,
        publishedAt: new Date('2024-10-15T02:00:00.000Z'),
        content: [
          '<p><strong>Dien Chau, Nghe An, Oct 2024</strong> — In four weeks, 32 volunteers, two tile partners, an OSB mill, and a pro-bono XPRESS DESIGN crew helped <strong>12 households</strong> stabilise their roofs before the storm list. In-kind and cash value: ~420M VND (incl. 18% steep-route haul). 60% from internal staff giving, 40% from material partners and soft-rate trucking.</p>',
          '<h2>Selection, site rules, safety</h2>',
          '<p>Priority: single mothers, the elderly, 5+ year corroded metal roofs, 3.0–3.2m tube houses, moisture risk. Each house: 2xA3 frame drawings, brackets, 6–8 OSB boards, membrane, gaskets, PPE, cord. No work at Beaufort 7+, no 300kg+ point loads on 15° roofs.</p>',
          '<h2>What XPRESS DESIGN contributed</h2>',
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
      tagSlugs: ['ben-vung', 'do-thi', 'wellness'],
    },
  ];

  applyNewsEditorialPass(items, {
    imgStageAward,
    imgVilla,
  });

  for (const n of items) {
    const tagIds = (n.tagSlugs || []).map((s) => tagMap.get(s)).filter(Boolean);
    const tagMultiselect = tagIds.length ? tagIds.join(',') : '';
    await upsertBilingual(
      strapi,
      'api::news.news',
      { ...n.vi, ...n.shared, tags: tagIds, tag_multiselect: tagMultiselect },
      { ...n.en, ...n.shared, tags: tagIds, tag_multiselect: tagMultiselect },
    );
    strapi.log.info(`[seed] ✅ News: ${n.vi.title} / ${n.en.title}`);
  }

  await syncNewsTagsInDatabase(strapi, tagMap, items);
}

function applyNewsEditorialPass(items, assets) {
  const { imgStageAward, imgVilla } = assets;
  const bySlug = new Map(items.map((item) => [item.vi.slug, item]));

  patchBilingual(bySlug.get('villa-sen-vang-giai-kien-truc-xanh-2025'), {
    vi: {
      source: 'XPRESS DESIGN Studio Journal',
      excerpt:
        'Villa Sen Vàng được ghi nhận như một hồ sơ nhà ở có giải pháp khí hậu tốt: mặt đứng hai lớp, giếng trời trung tâm và thông gió chéo được xử lý như phần lõi của thiết kế.',
      lead:
        'Điểm đáng chú ý của Villa Sen Vàng không nằm ở hình ảnh “xanh” bên ngoài, mà ở cách các chi tiết nhỏ cùng làm việc để căn nhà sáng, thoáng và dễ vận hành hơn.',
      content: [
        '<p>Villa Sen Vàng là một trong những hồ sơ nhà ở mà XPRESS DESIGN dùng để hệ thống lại cách tiếp cận kiến trúc nhiệt đới cho lô đất đô thị. Từ giai đoạn concept, nhóm thiết kế đặt mục tiêu giảm nắng gắt, tăng thông gió tự nhiên và giữ sự riêng tư cho gia chủ.</p>',
        `<figure><img src="${imgStageAward}" alt="Không gian sự kiện công bố dự án" /><figcaption>Hồ sơ Villa Sen Vàng được chia sẻ trong buổi tổng kết các dự án nhà ở bền vững của studio.</figcaption></figure>`,
        `<figure><img src="${imgVilla}" alt="Villa Sen Vàng" /><figcaption>Thiết kế ưu tiên bóng đổ, khoảng rỗng và vật liệu có khả năng lão hóa ổn định trong khí hậu nóng ẩm.</figcaption></figure>`,
        '<h2>Điều làm hồ sơ nổi bật</h2>',
        '<p>Thay vì dùng cây xanh như lớp trang trí cuối cùng, Villa Sen Vàng đưa cây, lam và khoảng rỗng vào cấu trúc không gian. Mặt đứng có chiều sâu hơn, phòng sinh hoạt nhận ánh sáng gián tiếp và giếng trời trở thành điểm thoát nhiệt tự nhiên.</p>',
        '<h2>Ý nghĩa với các dự án tiếp theo</h2>',
        '<p>Nhóm thiết kế xem dự án này như một bộ tham chiếu cho các nhà ở có yêu cầu cao về riêng tư nhưng vẫn cần sáng và thoáng. Nhiều chi tiết trong hồ sơ đã được chuẩn hóa lại cho các dự án nhà phố và villa sau đó.</p>',
        '<h2>Ghi chú từ nhóm thiết kế</h2>',
        '<p>“Bền vững không nên là một câu khẩu hiệu. Nó phải trả lời được câu hỏi rất cụ thể: buổi chiều tường có nóng không, hành lang có gió không, cây có sống được không và gia chủ bảo trì thế nào.”</p>',
      ].join(''),
    },
    en: {
      source: 'XPRESS DESIGN Studio Journal',
      excerpt:
        'Villa Sen Vàng is recognised as a residential file with a strong climate response: a layered facade, central skylight, and cross ventilation are treated as the core of the design.',
      lead:
        'The value of Villa Sen Vàng is not a green image from the outside, but the way small details work together to make the house brighter, more breathable, and easier to operate.',
      content: [
        '<p>Villa Sen Vàng is one of the residential files XPRESS DESIGN uses to refine its tropical design approach for urban plots. From concept stage, the team focused on reducing harsh sun, increasing natural airflow, and preserving privacy for the family.</p>',
        `<figure><img src="${imgStageAward}" alt="Project announcement event" /><figcaption>Villa Sen Vàng was shared during the studio review of sustainable residential work.</figcaption></figure>`,
        `<figure><img src="${imgVilla}" alt="Villa Sen Vàng exterior" /><figcaption>The design prioritises shade, voids, and materials that age well in a humid climate.</figcaption></figure>`,
        '<h2>Why the file stood out</h2>',
        '<p>Instead of adding planting as a final decorative layer, Villa Sen Vàng integrates plants, screens, and voids into the spatial structure. The facade gains depth, living areas receive indirect light, and the skylight becomes a natural heat-release spine.</p>',
        '<h2>What it means for future projects</h2>',
        '<p>The design team treats this file as a reference for homes that require privacy while remaining bright and breathable. Several details have since been standardised for later townhouse and villa projects.</p>',
        '<h2>Design team note</h2>',
        '<p>“Sustainability should not be a slogan. It has to answer specific questions: does the wall overheat in the afternoon, is there air in the corridor, can the planting survive, and how will the owner maintain it?”</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('khoi-cong-biet-thu-xanh-da-lat'), {
    vi: {
      source: 'XPRESS DESIGN Project Update',
      excerpt:
        'Biệt thự Xanh Đà Lạt bước vào giai đoạn thi công đầu tiên với trọng tâm là nền móng, thoát nước sườn dốc và bảo vệ cảnh quan hiện hữu.',
      lead:
        'Dự án trên sườn đồi Đà Lạt đặt ra yêu cầu không chỉ về hình ảnh nghỉ dưỡng, mà còn về cách công trình bám đất, thoát nước và hạn chế tác động lên địa hình.',
      content: [
        '<p>XPRESS DESIGN cùng đối tác triển khai giai đoạn thi công đầu tiên cho Biệt thự Xanh Đà Lạt sau thời gian hoàn thiện hồ sơ kỹ thuật. Ở một khu đất dốc, phần móng và thoát nước được xem là giai đoạn quan trọng nhất, vì nó quyết định độ bền của toàn bộ trải nghiệm kiến trúc phía trên.</p>',
        '<h2>Trọng tâm của giai đoạn đầu</h2>',
        '<p>Đội dự án ưu tiên kiểm tra cao độ tự nhiên, hướng nước chảy, vị trí cây giữ lại và các điểm cần gia cố trước khi mở rộng mặt bằng thi công. Những quyết định này giúp giảm can thiệp không cần thiết vào địa hình.</p>',
        '<h2>Cách tiếp cận thiết kế - thi công</h2>',
        '<p>Khối nhà được tổ chức theo nguyên tắc bám sườn, mở tầm nhìn nhưng tránh phô trương. Các hiên sâu, mái đua và khoảng đệm ngoài trời sẽ được triển khai cùng hệ thu nước mưa để giảm áp lực lên hạ tầng thoát nước tại chỗ.</p>',
        '<h2>Ghi chú hiện trường</h2>',
        '<p>Ở Đà Lạt, một công trình đẹp không thể chỉ nhìn từ phối cảnh. Nó phải đứng được trong sương, trong mưa dài ngày và trong sự thay đổi nhiệt độ rõ rệt giữa sáng và tối.</p>',
        '<p>XPRESS DESIGN sẽ tiếp tục cập nhật các mốc thi công chính khi dự án bước sang phần kết cấu và hoàn thiện mặt ngoài.</p>',
      ].join(''),
    },
    en: {
      source: 'XPRESS DESIGN Project Update',
      excerpt:
        'Green Villa Da Lat enters its first construction phase with a focus on foundations, hillside drainage, and protection of the existing landscape.',
      lead:
        'The hillside site requires more than a resort image. It asks how the building touches the ground, manages water, and limits impact on the terrain.',
      content: [
        '<p>XPRESS DESIGN and project partners have started the first construction phase of Green Villa Da Lat after completing the technical package. On a sloped site, foundation and drainage work is the most important stage because it determines the durability of the architectural experience above.</p>',
        '<h2>Focus of the first phase</h2>',
        '<p>The team is prioritising natural levels, water flow, retained trees, and areas requiring reinforcement before expanding the work platform. These decisions help reduce unnecessary intervention into the landform.</p>',
        '<h2>Design-build approach</h2>',
        '<p>The house is organised to sit with the slope, open to the view, and avoid excessive display. Deep eaves, outdoor buffers, and rainwater capture will be developed alongside the exterior envelope.</p>',
        '<h2>Site note</h2>',
        '<p>In Da Lat, a house cannot be judged only by renderings. It has to stand through mist, long rain, and the clear temperature change between morning and evening.</p>',
        '<p>XPRESS DESIGN will continue to update key milestones as the project moves into structure and exterior completion.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('giai-thiet-ke-ben-vung-2025'), {
    vi: {
      source: 'XPRESS DESIGN Studio Journal',
      excerpt:
        'Sự ghi nhận dành cho XPRESS DESIGN nhấn mạnh một hướng làm việc nhất quán: thiết kế bền vững phải bắt đầu từ khí hậu, vận hành và chi tiết có thể thi công.',
      lead:
        'Thay vì xem giải thưởng là điểm kết thúc, studio xem đây là dịp rà soát lại cách những quyết định nhỏ trong thiết kế tạo ra giá trị dài hạn cho người sử dụng.',
      content: [
        '<p>XPRESS DESIGN được ghi nhận trong mùa giải thiết kế bền vững 2025 với một hồ sơ nhà ở quy mô nhỏ, tập trung vào xử lý nhiệt, thông gió và lựa chọn vật liệu có kế hoạch bảo trì rõ ràng.</p>',
        '<h2>Không chỉ là câu chuyện giải thưởng</h2>',
        '<p>Điều quan trọng với studio không phải là danh xưng, mà là việc các nguyên tắc thiết kế đang đi đúng hướng: giảm tải cho hệ cơ điện, ưu tiên bóng đổ, kiểm soát nước mưa và chọn vật liệu có vòng đời rõ.</p>',
        '<h2>Những điểm được nhóm thiết kế rút ra</h2>',
        '<ul><li>Hồ sơ bền vững cần trình bày bằng mặt cắt, chi tiết và vận hành, không chỉ bằng phối cảnh xanh.</li><li>Những quyết định nhỏ như độ sâu lam, vị trí cửa thoát gió hoặc độ dốc sàn thường quan trọng hơn một thiết bị đắt tiền.</li><li>Khách hàng ngày càng quan tâm đến chi phí vận hành sau bàn giao, không chỉ chi phí thi công.</li></ul>',
        '<h2>Hướng tiếp theo</h2>',
        '<p>XPRESS DESIGN sẽ tiếp tục chuẩn hóa các checklist khí hậu, vật liệu và bảo trì cho nhóm dự án nhà phố, villa và không gian nghỉ dưỡng nhỏ.</p>',
      ].join(''),
    },
    en: {
      source: 'XPRESS DESIGN Studio Journal',
      excerpt:
        'The recognition highlights XPRESS DESIGN’s consistent approach: sustainable design begins with climate, operation, and buildable details.',
      lead:
        'Rather than treating the award as an endpoint, the studio sees it as a moment to review how small design decisions create long-term value for users.',
      content: [
        '<p>XPRESS DESIGN was recognised in the 2025 sustainable design season for a small residential file focused on heat control, ventilation, and materials with a clear maintenance plan.</p>',
        '<h2>More than an award story</h2>',
        '<p>The value for the studio is not the title itself, but the confirmation that the design principles are moving in the right direction: reducing mechanical load, prioritising shade, controlling rainwater, and selecting materials with a clear life cycle.</p>',
        '<h2>Lessons from the design team</h2>',
        '<ul><li>A sustainable file should be explained through sections, details, and operations, not only green renderings.</li><li>Small decisions such as louver depth, exhaust position, or floor fall can matter more than expensive equipment.</li><li>Clients increasingly care about operating cost after handover, not only construction cost.</li></ul>',
        '<h2>What comes next</h2>',
        '<p>XPRESS DESIGN will continue standardising climate, material, and maintenance checklists for townhouse, villa, and small hospitality projects.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('workshop-vat-lieu-ban-dia'), {
    vi: {
      source: 'XPRESS DESIGN Workshop Notes',
      excerpt:
        'Workshop nội bộ về vật liệu bản địa tập trung vào câu hỏi thực tế: vật liệu đẹp trên mẫu sẽ thi công, bảo trì và lão hóa thế nào ngoài công trường?',
      lead:
        'Buổi chia sẻ được tổ chức cho nhóm thiết kế, kỹ thuật và đối tác thi công nhằm thống nhất cách ra quyết định trước khi đặt hàng vật liệu hoàn thiện.',
      content: [
        '<p>XPRESS DESIGN tổ chức workshop về vật liệu bản địa và hoàn thiện tại công trường như một buổi làm việc thực tế hơn là một sự kiện trưng bày. Trên bàn không chỉ có mẫu đá, gỗ và bề mặt hoàn thiện, mà còn có vít, keo, khe co giãn, bản vẽ chi tiết và các lỗi thi công thường gặp.</p>',
        '<h2>Vì sao cần workshop vật liệu?</h2>',
        '<p>Nhiều quyết định vật liệu bị đưa ra quá muộn, khi thiết kế đã đẹp trên hình nhưng chi tiết thi công chưa đủ rõ. Workshop giúp nhóm dự án thống nhất trước về độ dày, cách bắt vít, khe thoát nước, bề mặt chống trơn và chu kỳ bảo trì.</p>',
        '<h2>Nội dung chính</h2>',
        '<ul><li>So sánh đá, gỗ và sơn khoáng theo khí hậu từng vùng.</li><li>Rà soát các lỗi thường gặp khi dùng tấm lớn, đặc biệt là cong vênh, nứt mạch và sai lệch màu.</li><li>Thử cách đọc mẫu dưới ánh sáng ngày và ánh sáng 3000K.</li><li>Thống nhất cách ghi chú bảo trì trong hồ sơ bàn giao.</li></ul>',
        '<h2>Kết quả sau buổi làm việc</h2>',
        '<p>Nhóm thiết kế cập nhật lại thư viện chi tiết hoàn thiện và bổ sung một checklist kiểm tra vật liệu trước khi chốt shopdrawing. Đây là phần nhỏ, nhưng giúp giảm rất nhiều rủi ro trong giai đoạn thi công.</p>',
      ].join(''),
    },
    en: {
      source: 'XPRESS DESIGN Workshop Notes',
      excerpt:
        'The local materials workshop focused on a practical question: how will a beautiful sample be installed, maintained, and aged on site?',
      lead:
        'The session brought design, technical, and construction partners together to align decisions before finish materials are ordered.',
      content: [
        '<p>XPRESS DESIGN organised the local materials and site finishes workshop as a working session rather than a display event. The table included not only stone, timber, and finish samples, but also screws, adhesives, movement joints, detail drawings, and common site defects.</p>',
        '<h2>Why a material workshop?</h2>',
        '<p>Many material decisions happen too late, when the design already looks good in images but construction details remain unclear. The workshop aligns thickness, fixing method, water gaps, slip resistance, and maintenance cycle early.</p>',
        '<h2>Main topics</h2>',
        '<ul><li>Comparing stone, timber, and mineral finishes across regional climates.</li><li>Reviewing common risks with large-format panels: warping, joint cracking, and color variation.</li><li>Testing samples under daylight and 3000K interior light.</li><li>Agreeing how maintenance notes should appear in handover documents.</li></ul>',
        '<h2>Outcome</h2>',
        '<p>The design team updated its finish-detail library and added a material check before shop drawing approval. It is a small workflow change, but it reduces many risks during construction.</p>',
      ].join(''),
    },
  });

  patchBilingual(bySlug.get('cung-sua-mai-cho-ho-dan'), {
    vi: {
      source: 'XPRESS DESIGN Community Notes',
      excerpt:
        'Chương trình sửa mái tại Nghệ An là hoạt động cộng đồng quy mô nhỏ, tập trung vào an toàn, chống dột và hướng dẫn bảo trì dễ hiểu cho hộ dân.',
      lead:
        'Với XPRESS DESIGN, trách nhiệm xã hội không nhất thiết phải bắt đầu bằng công trình lớn. Đôi khi, một mái nhà khô ráo trước mùa mưa đã là thay đổi đủ quan trọng.',
      content: [
        '<p>Trong chương trình “Cùng sửa chữa mái”, nhóm XPRESS DESIGN phối hợp với tình nguyện viên và đối tác vật liệu để hỗ trợ một số hộ dân tại Nghệ An kiểm tra, gia cố và xử lý chống dột trước mùa mưa.</p>',
        '<h2>Cách chọn phạm vi hỗ trợ</h2>',
        '<p>Nhóm ưu tiên các mái có nguy cơ thấm dột cao, hộ khó tự sửa chữa và những trường hợp cần tư vấn kỹ thuật đơn giản nhưng đúng cách. Mục tiêu không phải làm mới toàn bộ nhà, mà xử lý đúng phần đang ảnh hưởng trực tiếp đến an toàn và sinh hoạt.</p>',
        '<h2>Vai trò chuyên môn của studio</h2>',
        '<p>Đội kỹ thuật hỗ trợ kiểm tra khung mái, vị trí bắt vít, hướng thoát nước và các điểm dễ thấm. Với mỗi hộ, nhóm cố gắng để lại một hướng dẫn bảo trì ngắn, đủ dễ hiểu để người dân có thể tự kiểm tra sau các đợt mưa lớn.</p>',
        '<h2>Điều học được</h2>',
        '<p>Những công việc nhỏ như thay vít đúng loại, xử lý mép tôn, nâng lại độ dốc hoặc bổ sung gioăng có thể tạo khác biệt rõ rệt. Đây cũng là lời nhắc cho đội thiết kế: chi tiết cơ bản, nếu làm đúng, có giá trị xã hội rất cụ thể.</p>',
        '<p>XPRESS DESIGN dự kiến tiếp tục duy trì các hoạt động cộng đồng có quy mô vừa phải, nơi chuyên môn thiết kế - kỹ thuật có thể tạo tác động trực tiếp.</p>',
      ].join(''),
    },
    en: {
      source: 'XPRESS DESIGN Community Notes',
      excerpt:
        'The roof repair program in Nghe An was a small community effort focused on safety, leak prevention, and easy maintenance guidance for households.',
      lead:
        'For XPRESS DESIGN, social responsibility does not always begin with a large project. Sometimes, a dry roof before the rainy season is meaningful enough.',
      content: [
        '<p>Through the “Roof repair together” program, XPRESS DESIGN worked with volunteers and material partners to help several households in Nghe An inspect, reinforce, and improve leak protection before the rainy season.</p>',
        '<h2>How the scope was chosen</h2>',
        '<p>The team prioritised roofs with high leakage risk, households with limited ability to repair by themselves, and cases where simple technical guidance could make an immediate difference. The goal was not to rebuild houses, but to solve the part affecting safety and daily life most directly.</p>',
        '<h2>Studio contribution</h2>',
        '<p>The technical team helped check roof frames, screw positions, water direction, and common weak points. For each household, the team aimed to leave a short maintenance guide that residents could understand and use after heavy rain.</p>',
        '<h2>What we learned</h2>',
        '<p>Small works such as using the right screws, treating sheet edges, correcting roof falls, or adding gaskets can make a visible difference. It also reminds the design team that basic details, when done properly, carry real social value.</p>',
        '<p>XPRESS DESIGN plans to continue modest community activities where design and technical knowledge can create direct impact.</p>',
      ].join(''),
    },
  });
}

/**
 * Ghi chắc chắn quan hệ `tags` + cột `tag_multiselect` lên DB cho từng bản vi/en
 * (kể cả bản ghi đã có từ trước khi thêm tag — upsert đôi khi không cập nhật M2M đúng).
 */
async function syncNewsTagsInDatabase(strapi, tagMap, items) {
  try {
    for (const n of items) {
      const tagIds = (n.tagSlugs || []).map((s) => tagMap.get(s)).filter(Boolean);
      const tagMultiselect = tagIds.length ? tagIds.join(',') : '';
      const pairs = [
        { slug: n.vi.slug, locale: 'vi' },
        { slug: n.en.slug, locale: 'en' },
      ];
      for (const { slug, locale } of pairs) {
        const row = await strapi.db.query('api::news.news').findOne({
          where: { slug, locale },
        });
        if (!row) {
          strapi.log.warn(`[seed] News không tìm thấy để gán tag: ${slug} (${locale})`);
          continue;
        }
        await strapi.entityService.update('api::news.news', row.id, {
          data: { tags: tagIds, tag_multiselect: tagMultiselect },
        });
      }
    }
    strapi.log.info('[seed] ✅ Đã đồng bộ tag tin tức vào DB (tags + tag_multiselect, vi/en)');
  } catch (err) {
    strapi.log.error('[seed] Lỗi đồng bộ tag News vào DB:', err.message);
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
