'use strict';

/**
 * Strapi lifecycle hooks.
 * - bootstrap(): chạy 1 lần sau khi Strapi start
 *   + Seed admin user nếu chưa có (từ ENV SEED_ADMIN_*)
 *   + Mở public permissions cho find/findOne các content-type cần thiết
 */

module.exports = {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }) {
    await seedSuperAdmin(strapi);
    await seedLocales(strapi);
    await grantPublicPermissions(strapi);
  },
};

/**
 * Đảm bảo có locale 'en' (ngoài 'vi' mặc định).
 * Chạy mỗi lần start nhưng idempotent.
 */
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

    // Đảm bảo 'vi' là default
    const viLocale = (await localeService.find()).find((l) => l.code === 'vi');
    if (viLocale && !viLocale.isDefault) {
      await localeService.setDefaultLocale({ code: 'vi' });
      strapi.log.info('[seed] ✅ Đặt vi làm default locale');
    }
  } catch (err) {
    strapi.log.error('[seed] Lỗi seed locales:', err.message);
  }
}

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

  // Lấy hoặc tạo role Super Admin
  let superAdminRole = await strapi.db.query('admin::role').findOne({
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

async function grantPublicPermissions(strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[seed] Không tìm thấy role Public');
    return;
  }

  // Các action cho phép public truy cập (read-only)
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
