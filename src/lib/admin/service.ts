import { apiRequest, parseApiResponse } from "../api/client";
import { API_BASE_URL, TENANT_ID } from "../api/config";
import { authStorage } from "../auth/storage";

export type NameCount = {
  key: string;
  label: string;
  count: number;
};

export type DashboardSummary = {
  totalUsers: number;
  newUsersToday: number;
  newUsers7d: number;
  newUsers30d: number;
  paidUsers: number;
  subscriptionsByPlan: NameCount[];
  creditsBalance: number;
  creditsFrozen: number;
  creditsLifetimeEarned: number;
  creditsLifetimeUsed: number;
  creditsConsumedToday: number;
  creditsConsumed7d: number;
  creditsConsumed30d: number;
  revenueTotal: number;
  revenue30d: number;
  paidOrders: number;
};

export type FeatureUsage = {
  totalTasks: number;
  tasksToday: number;
  tasks7d: number;
  tasks30d: number;
  byFeature: NameCount[];
  imageTotal: number;
  imageSuccess: number;
  imageByType: NameCount[];
  videoTotal: number;
  videoSuccess: number;
  videoByType: NameCount[];
  videoByModel: NameCount[];
};

export type PageResult<T> = {
  list: T[];
  total: number;
};

export type CreditAccount = {
  userId: number;
  email: string | null;
  availableCredits: number;
  frozenCredits: number;
  lifetimeEarnedCredits: number;
  lifetimeUsedCredits: number;
  createTime: string | null;
  updateTime: string | null;
};

export type CreditLedger = {
  id: number;
  userId: number;
  email: string | null;
  bizType: number;
  bizTypeLabel: string;
  taskType: number | null;
  changeCredits: number;
  availableAfter: number;
  frozenAfter: number;
  title: string | null;
  description: string | null;
  createTime: string | null;
};

export type CreditRuleItem = {
  model: string;
  resolution: string;
  duration: string;
  sound: string;
  credits: number;
  remark: string | null;
};

export type CreditRules = {
  imageRules: CreditRuleItem[];
  videoRules: CreditRuleItem[];
};

export type CreditAccountQuery = {
  keyword?: string;
  userId?: number;
  pageNo?: number;
  pageSize?: number;
};

export type CreditLedgerQuery = {
  keyword?: string;
  userId?: number;
  bizType?: number;
  beginTime?: string;
  endTime?: string;
  pageNo?: number;
  pageSize?: number;
};

export type CreditAdjustPayload = {
  userId?: number;
  email?: string;
  mode: "set" | "delta";
  amount: number;
  reason?: string;
};

// ==================== 用户管理 ====================

export type AdminUser = {
  userId: number;
  nickname: string | null;
  email: string | null;
  loginType: string | null;
  registerTime: string | null;
  subscriptionStatus: string | null;
  planId: string | null;
  billingInterval: string | null;
  currentPeriodEnd: string | null;
  availableCredits: number;
  frozenCredits: number;
  lifetimeEarnedCredits: number;
  lifetimeUsedCredits: number;
};

export type AdminUserQuery = {
  keyword?: string;
  subscriptionStatus?: string;
  planId?: string;
  pageNo?: number;
  pageSize?: number;
};

export type AdminContent = {
  id: number;
  userId: number;
  email: string | null;
  kind: "video" | "image";
  taskNo: string | null;
  generateType: number | null;
  generateTypeLabel: string | null;
  model: string | null;
  prompt: string | null;
  resolution: string | null;
  aspectRatio: string | null;
  status: number;
  statusLabel: string | null;
  coverUrl: string | null;
  resultUrls: string[];
  credits: number | null;
  errorMessage: string | null;
  submitTime: string | null;
  finishTime: string | null;
  createTime: string | null;
};

export type AdminOrder = {
  id: number;
  userId: number;
  email: string | null;
  orderType: "subscription" | "credit_pack";
  orderTypeLabel: string | null;
  planId: string | null;
  bizNo: string | null;
  credits: number | null;
  amount: number | null;
  currency: string | null;
  title: string | null;
  description: string | null;
  createTime: string | null;
};

export type AdminUserDetail = {
  user: AdminUser;
  recentVideos: AdminContent[];
  recentImages: AdminContent[];
  recentLedger: CreditLedger[];
  orders: AdminOrder[];
};

// ==================== 订单管理 ====================

export type AdminOrderQuery = {
  keyword?: string;
  userId?: number;
  pageNo?: number;
  pageSize?: number;
};

// ==================== 内容管理 ====================

export type AdminVideoContentQuery = {
  keyword?: string;
  userId?: number;
  generateType?: number;
  model?: string;
  status?: number;
  beginTime?: string;
  endTime?: string;
  pageNo?: number;
  pageSize?: number;
};

export type AdminImageContentQuery = {
  keyword?: string;
  userId?: number;
  generateType?: number;
  status?: number;
  beginTime?: string;
  endTime?: string;
  pageNo?: number;
  pageSize?: number;
};

// ==================== 任务管理 ====================

export type AdminTask = {
  id: number;
  userId: number;
  email: string | null;
  kind: "video" | "image";
  taskNo: string | null;
  model: string | null;
  generateTypeLabel: string | null;
  status: number;
  statusLabel: string | null;
  credits: number | null;
  reservationStatus: number | null;
  reservationStatusLabel: string | null;
  errorMessage: string | null;
  submitTime: string | null;
  finishTime: string | null;
  createTime: string | null;
};

export type AdminTaskQuery = {
  taskKind?: "video" | "image";
  keyword?: string;
  userId?: number;
  status?: number;
  pageNo?: number;
  pageSize?: number;
};

export type AdminTaskDetail = {
  task: AdminTask;
  content: AdminContent;
  ledger: CreditLedger[];
};

// ==================== 配置管理（套餐 / 积分包） ====================

export type BillingProduct = {
  id: number;
  productType: number;
  code: string;
  name: string;
  badge: string | null;
  positioning: string | null;
  monthlyCredits: number | null;
  yearlyCredits: number | null;
  priceMonthlyAmount: number | null;
  priceYearlyAmount: number | null;
  priceOnetimeAmount: number | null;
  currency: string | null;
  stripePriceMonthly: string | null;
  stripePriceYearly: string | null;
  stripePriceOnetime: string | null;
  features: string[];
  parallelTasks: number | null;
  buttonText: string | null;
  status: number;
  sort: number;
  remark: string | null;
  createTime: string | null;
  updateTime: string | null;
};

export type BillingProductQuery = {
  productType?: number;
  status?: number;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
};

export type BillingProductPayload = {
  id?: number;
  productType: number;
  code: string;
  name: string;
  badge?: string | null;
  positioning?: string | null;
  monthlyCredits?: number | null;
  yearlyCredits?: number | null;
  priceMonthlyAmount?: number | null;
  priceYearlyAmount?: number | null;
  priceOnetimeAmount?: number | null;
  currency?: string | null;
  stripePriceMonthly?: string | null;
  stripePriceYearly?: string | null;
  stripePriceOnetime?: string | null;
  features?: string[];
  parallelTasks?: number | null;
  buttonText?: string | null;
  status?: number;
  sort?: number;
  remark?: string | null;
};

// ==================== SEO 管理 ====================

export type SeoMeta = {
  id: number;
  pageKey: string;
  locale?: string | null;
  pageGroup: string | null;
  path: string | null;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
  noIndex: number;
  status: number;
  sort: number;
  remark: string | null;
  createTime: string | null;
  updateTime: string | null;
};

export type SeoMetaQuery = {
  group?: string;
  status?: number;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
};

export type SeoMetaPayload = {
  id?: number;
  pageKey: string;
  locale?: string;
  pageGroup?: string | null;
  path?: string | null;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonical?: string | null;
  noIndex?: number;
  status?: number;
  sort?: number;
  remark?: string | null;
};

// ==================== 模板页面管理 ====================

export type TemplateBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

export type PageType = "template" | "tool" | "model" | "blog";

export type TemplatePage = {
  id: number;
  slug: string;
  pageType: string;
  pageFamilyId?: string | null;
  locale?: string | null;
  source?: string | null;
  name: string;
  templateType: string;
  contentJson: string | null;
  status: number;
  sort: number;
  remark: string | null;
  createTime: string | null;
  updateTime: string | null;
};

export type TemplatePageQuery = {
  pageType?: string;
  templateType?: string;
  status?: number;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
};

export type TemplatePagePayload = {
  id?: number;
  slug: string;
  pageType?: string;
  pageFamilyId?: string | null;
  locale?: string | null;
  name: string;
  templateType?: string;
  contentJson?: string | null;
  status?: number;
  sort?: number;
  remark?: string | null;
};

export type CmsApiKey = {
  id: number;
  name: string;
  subjectLabel: string | null;
  keyPrefix: string;
  status: number;
  scopes: string;
  uploadDailyCountLimit: number;
  uploadDailyBytesLimit: number;
  generateDailyLimit: number;
  remark: string | null;
  lastUsedAt: string | null;
  createTime: string | null;
};

export type CmsApiKeyCreatePayload = {
  name: string;
  subjectLabel?: string;
  scopes?: string[];
  uploadDailyCountLimit?: number;
  uploadDailyBytesLimit?: number;
  generateDailyLimit?: number;
  remark?: string;
};

export type CmsApiAuditLog = {
  id: number;
  keyId: number;
  action: string;
  pageType: string | null;
  slug: string | null;
  locale: string | null;
  summary: string | null;
  createTime: string | null;
};

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminService = {
  async checkAdmin(): Promise<boolean> {
    try {
      const result = await apiRequest<boolean>("/ai/lazykiwi/admin/check");
      return Boolean(result);
    } catch {
      return false;
    }
  },
  async getSummary(): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>("/ai/lazykiwi/admin/dashboard/summary");
  },
  async getFeatureUsage(): Promise<FeatureUsage> {
    return apiRequest<FeatureUsage>("/ai/lazykiwi/admin/dashboard/feature-usage");
  },
  async getCreditAccountPage(query: CreditAccountQuery = {}): Promise<PageResult<CreditAccount>> {
    return apiRequest<PageResult<CreditAccount>>(
      `/ai/lazykiwi/admin/credit/account/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getCreditLedgerPage(query: CreditLedgerQuery = {}): Promise<PageResult<CreditLedger>> {
    return apiRequest<PageResult<CreditLedger>>(
      `/ai/lazykiwi/admin/credit/ledger/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getCreditRules(): Promise<CreditRules> {
    return apiRequest<CreditRules>("/ai/lazykiwi/admin/credit/rules");
  },
  async adjustCredit(payload: CreditAdjustPayload): Promise<CreditAccount> {
    return apiRequest<CreditAccount>("/ai/lazykiwi/admin/credit/adjust", {
      method: "POST",
      body: payload,
    });
  },

  // ==================== 用户管理 ====================
  async getUserPage(query: AdminUserQuery = {}): Promise<PageResult<AdminUser>> {
    return apiRequest<PageResult<AdminUser>>(
      `/ai/lazykiwi/admin/user/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getUserDetail(userId: number): Promise<AdminUserDetail> {
    return apiRequest<AdminUserDetail>(`/ai/lazykiwi/admin/user/detail?userId=${userId}`);
  },

  // ==================== 订单管理 ====================
  async getSubscriptionOrderPage(query: AdminOrderQuery = {}): Promise<PageResult<AdminOrder>> {
    return apiRequest<PageResult<AdminOrder>>(
      `/ai/lazykiwi/admin/order/subscription/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getCreditPackOrderPage(query: AdminOrderQuery = {}): Promise<PageResult<AdminOrder>> {
    return apiRequest<PageResult<AdminOrder>>(
      `/ai/lazykiwi/admin/order/credit-pack/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },

  // ==================== 内容管理 ====================
  async getVideoContentPage(query: AdminVideoContentQuery = {}): Promise<PageResult<AdminContent>> {
    return apiRequest<PageResult<AdminContent>>(
      `/ai/lazykiwi/admin/content/video/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getImageContentPage(query: AdminImageContentQuery = {}): Promise<PageResult<AdminContent>> {
    return apiRequest<PageResult<AdminContent>>(
      `/ai/lazykiwi/admin/content/image/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },

  // ==================== 任务管理 ====================
  async getTaskPage(query: AdminTaskQuery = {}): Promise<PageResult<AdminTask>> {
    return apiRequest<PageResult<AdminTask>>(
      `/ai/lazykiwi/admin/task/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getTaskDetail(taskKind: "video" | "image", taskId: number): Promise<AdminTaskDetail> {
    return apiRequest<AdminTaskDetail>(
      `/ai/lazykiwi/admin/task/detail?taskKind=${taskKind}&taskId=${taskId}`,
    );
  },

  // ==================== 配置管理（套餐 / 积分包） ====================
  async getProductPage(query: BillingProductQuery = {}): Promise<PageResult<BillingProduct>> {
    return apiRequest<PageResult<BillingProduct>>(
      `/ai/lazykiwi/admin/config/product/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getProduct(id: number): Promise<BillingProduct> {
    return apiRequest<BillingProduct>(`/ai/lazykiwi/admin/config/product/get?id=${id}`);
  },
  async createProduct(payload: BillingProductPayload): Promise<number> {
    return apiRequest<number>("/ai/lazykiwi/admin/config/product/create", {
      method: "POST",
      body: payload,
    });
  },
  async updateProduct(payload: BillingProductPayload): Promise<boolean> {
    return apiRequest<boolean>("/ai/lazykiwi/admin/config/product/update", {
      method: "PUT",
      body: payload,
    });
  },
  async deleteProduct(id: number): Promise<boolean> {
    return apiRequest<boolean>(`/ai/lazykiwi/admin/config/product/delete?id=${id}`, {
      method: "DELETE",
    });
  },
  async updateProductStatus(id: number, status: number): Promise<boolean> {
    return apiRequest<boolean>(
      `/ai/lazykiwi/admin/config/product/status?id=${id}&status=${status}`,
      { method: "PUT" },
    );
  },

  // ==================== SEO 管理 ====================
  async getSeoPage(query: SeoMetaQuery = {}): Promise<PageResult<SeoMeta>> {
    return apiRequest<PageResult<SeoMeta>>(
      `/ai/lazykiwi/admin/seo/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getSeo(id: number): Promise<SeoMeta> {
    return apiRequest<SeoMeta>(`/ai/lazykiwi/admin/seo/get?id=${id}`);
  },
  async createSeo(payload: SeoMetaPayload): Promise<number> {
    return apiRequest<number>("/ai/lazykiwi/admin/seo/create", {
      method: "POST",
      body: payload,
    });
  },
  async updateSeo(payload: SeoMetaPayload): Promise<boolean> {
    return apiRequest<boolean>("/ai/lazykiwi/admin/seo/update", {
      method: "PUT",
      body: payload,
    });
  },
  async deleteSeo(id: number): Promise<boolean> {
    return apiRequest<boolean>(`/ai/lazykiwi/admin/seo/delete?id=${id}`, {
      method: "DELETE",
    });
  },
  async updateSeoStatus(id: number, status: number): Promise<boolean> {
    return apiRequest<boolean>(
      `/ai/lazykiwi/admin/seo/status?id=${id}&status=${status}`,
      { method: "PUT" },
    );
  },

  // ==================== 模板页面管理 ====================
  async getTemplatePagePage(query: TemplatePageQuery = {}): Promise<PageResult<TemplatePage>> {
    return apiRequest<PageResult<TemplatePage>>(
      `/ai/lazykiwi/admin/template-page/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async getTemplatePage(id: number): Promise<TemplatePage> {
    return apiRequest<TemplatePage>(`/ai/lazykiwi/admin/template-page/get?id=${id}`);
  },
  async createTemplatePage(payload: TemplatePagePayload): Promise<number> {
    return apiRequest<number>("/ai/lazykiwi/admin/template-page/create", {
      method: "POST",
      body: payload,
    });
  },
  async updateTemplatePage(payload: TemplatePagePayload): Promise<boolean> {
    return apiRequest<boolean>("/ai/lazykiwi/admin/template-page/update", {
      method: "PUT",
      body: payload,
    });
  },
  async deleteTemplatePage(id: number): Promise<boolean> {
    return apiRequest<boolean>(`/ai/lazykiwi/admin/template-page/delete?id=${id}`, {
      method: "DELETE",
    });
  },
  async updateTemplatePageStatus(id: number, status: number): Promise<boolean> {
    return apiRequest<boolean>(
      `/ai/lazykiwi/admin/template-page/status?id=${id}&status=${status}`,
      { method: "PUT" },
    );
  },
  async getTemplatePageFamily(pageType: string, slug: string): Promise<TemplatePage[]> {
    return apiRequest<TemplatePage[]>(
      `/ai/lazykiwi/admin/template-page/family?pageType=${encodeURIComponent(pageType)}&slug=${encodeURIComponent(slug)}`,
    );
  },

  // ==================== CMS Agent API Keys ====================
  async getCmsApiKeyPage(query: { pageNo?: number; pageSize?: number } = {}): Promise<PageResult<CmsApiKey>> {
    return apiRequest<PageResult<CmsApiKey>>(
      `/ai/lazykiwi/admin/cms-api-key/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },
  async createCmsApiKey(payload: CmsApiKeyCreatePayload): Promise<string> {
    return apiRequest<string>("/ai/lazykiwi/admin/cms-api-key/create", {
      method: "POST",
      body: payload,
    });
  },
  async updateCmsApiKeyStatus(id: number, status: number): Promise<boolean> {
    return apiRequest<boolean>(
      `/ai/lazykiwi/admin/cms-api-key/status?id=${id}&status=${status}`,
      { method: "PUT" },
    );
  },
  async deleteCmsApiKey(id: number): Promise<boolean> {
    return apiRequest<boolean>(`/ai/lazykiwi/admin/cms-api-key/delete?id=${id}`, {
      method: "DELETE",
    });
  },
  async getCmsApiAuditPage(query: { keyId?: number; pageNo?: number; pageSize?: number } = {}): Promise<PageResult<CmsApiAuditLog>> {
    return apiRequest<PageResult<CmsApiAuditLog>>(
      `/ai/lazykiwi/admin/cms-api-key/audit/page${buildQuery(query as Record<string, unknown>)}`,
    );
  },

  // ==================== 文件上传（复用 infra 上传接口，返回 OSS 直链） ====================
  async uploadFile(file: File, directory = "template-page"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);
    const headers: Record<string, string> = { "tenant-id": TENANT_ID };
    const token = authStorage.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/infra/file/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    return parseApiResponse(response, true) as Promise<string>;
  },
};
