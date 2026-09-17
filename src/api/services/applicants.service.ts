import { apiClient } from "../client.js";
import { Applicant, ApplicantStatus } from "../../types/index.js";

export const applicantsService = {
  async getAll(params?: {
    status?: ApplicantStatus | string;
    search?: string;
    country?: string;
    city?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return apiClient<Applicant[]>("/applicants", { params });
  },

  async getById(id: string) {
    return apiClient<Applicant>(`/applicants/${id}`);
  },

  async getQuestions() {
    return apiClient<any[]>("/applicants/questions");
  },

  async createQuestion(data: {
    question?: string;
    questionText?: string;
    fieldType?: string;
    isRequired?: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
    category?: string;
    orderNumber?: number;
    orderIndex?: number;
  }) {
    return apiClient<any>("/applicants/questions", {
      method: "POST",
      body: {
        ...data,
        question: data.question || data.questionText,
      },
    });
  },

  async updateQuestion(id: string, data: {
    question?: string;
    questionText?: string;
    fieldType?: string;
    isRequired?: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
    category?: string;
    orderNumber?: number;
    orderIndex?: number;
    isActive?: boolean;
  }) {
    return apiClient<any>(`/applicants/questions/${id}`, {
      method: "PATCH",
      body: {
        ...data,
        question: data.question || data.questionText,
      },
    });
  },

  async deleteQuestion(id: string) {
    return apiClient<any>(`/applicants/questions/${id}`, {
      method: "DELETE",
    });
  },

  async reorderQuestions(questionIds: string[] | Array<{ id: string; orderNumber: number }>) {
    const isArrayOfIds = Array.isArray(questionIds) && (typeof questionIds[0] === "string" || questionIds.length === 0);
    const body = isArrayOfIds ? { questionIds } : { questionOrders: questionIds };
    return apiClient<any[]>("/applicants/questions/reorder", {
      method: "POST",
      body,
    });
  },

  async getAnswers(id: string) {
    return apiClient<any[]>(`/applicants/${id}/answers`);
  },

  async create(data: {
    fullName: string;
    fatherName?: string;
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    country: string;
    city: string;
    address: string;
    positionApplied?: string;
    currentProfession?: string;
    currentQualification?: string;
    skillsDescription?: string;
    heardAboutSTSolutions?: string;
    joiningPurpose?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    notes?: string;
  }) {
    return apiClient<Applicant>("/applicants", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: Partial<Applicant>) {
    return apiClient<Applicant>(`/applicants/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async review(id: string, data: { status?: ApplicantStatus | string; reviewNotes?: string }) {
    return apiClient<Applicant>(`/applicants/${id}/review`, {
      method: "POST",
      body: data,
    });
  },

  async approve(id: string, data: { approvalNotes?: string }) {
    return apiClient<Applicant>(`/applicants/${id}/approve`, {
      method: "POST",
      body: data,
    });
  },

  async reject(id: string, data: { rejectionReason: string }) {
    return apiClient<Applicant>(`/applicants/${id}/reject`, {
      method: "POST",
      body: data,
    });
  },

  async onboard(
    id: string,
    data: {
      organizationId?: string;
      workspaceId?: string;
      roleId?: string;
      accountType?: string;
      temporaryPassword?: string;
    }
  ) {
    return apiClient(`/applicants/${id}/onboard`, {
      method: "POST",
      body: data,
    });
  },

  async delete(id: string) {
    return apiClient<{ success: boolean; id: string }>(`/applicants/${id}`, {
      method: "DELETE",
    });
  },
};

