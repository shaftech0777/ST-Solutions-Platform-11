import { apiClient } from "../client.js";
import { Payment, PaymentStatus } from "../../types/index.js";

export const paymentsService = {
  async getAll(params?: { status?: PaymentStatus; search?: string; page?: number; limit?: number }) {
    return apiClient<Payment[]>("/payments", { params });
  },

  async getById(id: string) {
    return apiClient<Payment>(`/payments/${id}`);
  },

  async create(data: {
    projectId: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    transactionReference?: string;
  }) {
    return apiClient<Payment>("/payments", {
      method: "POST",
      body: data,
    });
  },

  async updateStatus(id: string, paymentStatus: PaymentStatus) {
    return apiClient<Payment>(`/payments/${id}/status`, {
      method: "PATCH",
      body: { paymentStatus },
    });
  },
};
