import { apiClient } from "../client.js";

export interface ShowcaseProject {
  id: string;
  title: string;
  slug?: string | null;
  categoryId?: string | null;
  tagline?: string | null;
  description: string;
  fullDescription?: string | null;
  projectType: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
  thumbnailUrl?: string | null;
  coverImage?: string | null;
  galleryImages?: string[] | null;
  videoUrl?: string | null;
  features?: string[] | null;
  benefits?: string[] | null;
  targetAudience?: string | null;
  technologies?: string[] | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  displayOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

export interface ShowcaseCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export const showcaseService = {
  /**
   * Fetch published showcase projects for the public site
   */
  async getPublicProjects(params?: { category?: string; search?: string; featured?: boolean }): Promise<ShowcaseProject[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.featured !== undefined) query.append("featured", String(params.featured));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient<any>(`/showcase-projects${qs}`);
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Fetch a single published showcase project by ID or Slug
   */
  async getPublicProject(idOrSlug: string): Promise<ShowcaseProject | null> {
    const res = await apiClient<any>(`/showcase-projects/${idOrSlug}`);
    return res?.data ?? res ?? null;
  },

  /**
   * Fetch showcase categories
   */
  async getCategories(): Promise<ShowcaseCategory[]> {
    const res = await apiClient<any>("/showcase-projects/categories");
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Admin: Get all showcase projects (drafts included)
   */
  async getAdminProjects(): Promise<ShowcaseProject[]> {
    const res = await apiClient<any>("/showcase-projects/admin/all");
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Admin: Create a new showcase project
   */
  async createProject(data: Partial<ShowcaseProject>) {
    return apiClient<any>("/showcase-projects", {
      method: "POST",
      body: data,
    });
  },

  /**
   * Admin: Update a showcase project
   */
  async updateProject(id: string, data: Partial<ShowcaseProject>) {
    return apiClient<any>(`/showcase-projects/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  /**
   * Admin: Delete a showcase project
   */
  async deleteProject(id: string) {
    return apiClient<any>(`/showcase-projects/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Admin: Reorder showcase projects
   */
  async reorderProjects(items: { id: string; displayOrder: number }[]) {
    return apiClient<any>("/showcase-projects/reorder", {
      method: "POST",
      body: { items },
    });
  },
};
