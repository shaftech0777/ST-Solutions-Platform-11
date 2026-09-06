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
  async getPublicProjects(params?: { category?: string; search?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.featured !== undefined) query.append("featured", String(params.featured));
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiClient<ShowcaseProject[]>(`/showcase-projects${qs}`);
  },

  /**
   * Fetch a single published showcase project by ID or Slug
   */
  async getPublicProject(idOrSlug: string) {
    return apiClient<ShowcaseProject>(`/showcase-projects/${idOrSlug}`);
  },

  /**
   * Fetch showcase categories
   */
  async getCategories() {
    return apiClient<ShowcaseCategory[]>("/showcase-projects/categories");
  },

  /**
   * Admin: Get all showcase projects (drafts included)
   */
  async getAdminProjects() {
    return apiClient<ShowcaseProject[]>("/showcase-projects/admin/all");
  },

  /**
   * Admin: Create a new showcase project
   */
  async createProject(data: Partial<ShowcaseProject>) {
    return apiClient<ShowcaseProject>("/showcase-projects", {
      method: "POST",
      body: data,
    });
  },

  /**
   * Admin: Update a showcase project
   */
  async updateProject(id: string, data: Partial<ShowcaseProject>) {
    return apiClient<ShowcaseProject>(`/showcase-projects/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  /**
   * Admin: Delete a showcase project
   */
  async deleteProject(id: string) {
    return apiClient<{ id: string }>(`/showcase-projects/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Admin: Reorder showcase projects
   */
  async reorderProjects(items: { id: string; displayOrder: number }[]) {
    return apiClient<{ success: boolean }>("/showcase-projects/reorder", {
      method: "POST",
      body: { items },
    });
  },
};
