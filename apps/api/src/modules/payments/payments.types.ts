import { PaymentStatus } from "@prisma/client";

export interface PaymentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  projectId?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "amount" | "paymentStatus" | "submittedAt" | "approvedAt";
  sortOrder?: "asc" | "desc";
}

export interface PaymentClientSummary {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phoneNumber: string;
}

export interface PaymentProjectSummary {
  id: string;
  title: string;
  category: string | null;
  projectStatus: string;
}

export interface PaymentUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
}

export interface PaymentResponse {
  id: string;
  clientId: string;
  projectId: string | null;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  transactionReference: string | null;
  paymentStatus: PaymentStatus;
  approvedById: string | null;
  approvalNotes: string | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client: PaymentClientSummary | null;
  project: PaymentProjectSummary | null;
  approvedBy: PaymentUserSummary | null;
}

export interface CreatePaymentInput {
  clientId: string;
  projectId?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  transactionReference?: string;
  paymentStatus?: PaymentStatus;
  approvalNotes?: string;
  submittedAt?: string | Date;
  approvedAt?: string | Date;
  approvedById?: string;
}

export interface UpdatePaymentInput {
  clientId?: string;
  projectId?: string | null;
  amount?: number;
  currency?: string;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  approvalNotes?: string | null;
  submittedAt?: string | Date | null;
}

export interface UpdatePaymentStatusInput {
  paymentStatus: PaymentStatus;
  approvalNotes?: string;
}

export interface PaymentStatistics {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number; // Amount of APPROVED payments
  pendingAmount: number; // Amount of PENDING & SUBMITTED payments
  rejectedAmount: number; // Amount of REJECTED payments
  statusBreakdown: Array<{
    status: PaymentStatus;
    count: number;
    totalAmount: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
  currencyBreakdown: Array<{
    currency: string;
    count: number;
    totalAmount: number;
  }>;
  recentPaymentsTotal: number;
}
