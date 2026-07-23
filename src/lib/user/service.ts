import { apiRequest } from "../api/client";

export type UserProfile = {
  id: number;
  nickname: string;
  email?: string;
  avatar?: string;
  sex?: number;
  point: number;
};

export type UserProfileUpdatePayload = {
  nickname?: string;
  avatar?: string;
  email?: string;
  sex?: number;
};

export type CreditAccount = {
  availableCredits?: number;
};

export type CreditLedgerRecord = {
  id: number;
  bizType?: number;
  taskType?: number;
  taskId?: number;
  model?: string;
  title?: string;
  description?: string;
  changeCredits: number;
  availableAfter?: number;
  createTime?: string;
};

export type CreditLedgerPage = {
  list: CreditLedgerRecord[];
  total: number;
};

export const userService = {
  async getProfile() {
    return apiRequest<UserProfile>("/member/user/get");
  },

  async updateProfile(payload: UserProfileUpdatePayload) {
    return apiRequest<boolean>("/member/user/update", {
      method: "PUT",
      body: payload,
    });
  },

  async getCreditAccount() {
    return apiRequest<CreditAccount>("/ai/lazykiwi/credits/account");
  },

  async getCreditLedgerRecords(pageNo = 1, pageSize = 20) {
    return apiRequest<CreditLedgerPage>(
      `/ai/lazykiwi/credits/ledger-page?pageNo=${pageNo}&pageSize=${pageSize}`,
    );
  },
};
