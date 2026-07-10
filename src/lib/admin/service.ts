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
};
