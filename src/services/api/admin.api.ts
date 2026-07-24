import { adminUserApi } from "./admin/admin-user.api";
import { adminLogApi } from "./admin/admin-log.api";
import { adminConfigApi } from "./admin/admin-config.api";
import { adminPlanApi } from "./admin/admin-plan.api";
import { adminWhatsappApi } from "./admin/admin-whatsapp.api";
import { adminBlogApi } from "./admin/admin-blog.api";

export * from "./admin/admin-user.api";
export * from "./admin/admin-log.api";
export * from "./admin/admin-config.api";
export * from "./admin/admin-plan.api";
export * from "./admin/admin-whatsapp.api";
export * from "./admin/admin-blog.api";

export const adminApi = {
  ...adminUserApi,
  ...adminLogApi,
  ...adminConfigApi,
  ...adminPlanApi,
  ...adminWhatsappApi,
  ...adminBlogApi,
};
