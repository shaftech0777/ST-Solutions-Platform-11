import { apiClient } from "../client.js";
import { Payment, PaymentStatus } from "../../types/index.js";

export interface PaymentStatisticsData {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  statusBreakdown?: Array<{
    status: PaymentStatus;
    count: number;
    totalAmount: number;
  }>;
}

export const paymentsService = {
  async getAll(params?: {
    status?: PaymentStatus | string;
    search?: string;
    clientId?: string;
    projectId?: string;
    paymentMethod?: string;
    currency?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return apiClient<Payment[]>("/payments", { params });
  },

  async getStatistics() {
    return apiClient<PaymentStatisticsData>("/payments/statistics");
  },

  async getById(id: string) {
    return apiClient<Payment>(`/payments/${id}`);
  },

  async create(data: {
    clientId: string;
    projectId?: string | null;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    transactionReference?: string;
    paymentStatus?: PaymentStatus | string;
    approvalNotes?: string;
  }) {
    return apiClient<Payment>("/payments", {
      method: "POST",
      body: data,
    });
  },

  async update(
    id: string,
    data: {
      clientId?: string;
      projectId?: string | null;
      amount?: number;
      currency?: string;
      paymentMethod?: string | null;
      transactionReference?: string | null;
      approvalNotes?: string | null;
    }
  ) {
    return apiClient<Payment>(`/payments/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async updateStatus(id: string, paymentStatus: PaymentStatus | string, approvalNotes?: string) {
    return apiClient<Payment>(`/payments/${id}/status`, {
      method: "PATCH",
      body: { paymentStatus, approvalNotes },
    });
  },

  async delete(id: string) {
    return apiClient(`/payments/${id}`, {
      method: "DELETE",
    });
  },
};

