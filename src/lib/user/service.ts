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

  async getPointRecords(pageNo = 1, pageSize = 10) {
    return apiRequest<{
      list: Array<{
        id: number;
        title: string;
        description: string;
        point: number;
        totalPoint: number;
        createTime: string;
      }>;
      total: number;
    }>(`/member/point/record/page?pageNo=${pageNo}&pageSize=${pageSize}`);
  },
};
