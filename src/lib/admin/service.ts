import { apiRequest } from "../api/client";

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
};
