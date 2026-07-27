import { apiClient } from "../client";
import { BlogPostStatus } from "@/types/enums";

export interface AdminBlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  status: BlogPostStatus;
  author_id: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPostListResponse {
  posts: AdminBlogPostItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBlogPostPayload {
  title: string;
  content: string;
  excerpt?: string | null;
  tags?: string[];
  status?: BlogPostStatus;
  cover_image_url?: string | null;
}

export interface UpdateBlogPostPayload {
  title?: string;
  content?: string;
  excerpt?: string | null;
  tags?: string[];
  status?: BlogPostStatus;
  published_at?: string | null;
  cover_image_url?: string | null;
}

const BASE = "/admin";

export const adminBlogApi = {
  getBlogPosts: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<AdminBlogPostListResponse>(`${BASE}/blog/posts`, { params }).then(r => r.data),

  getBlogPostDetails: (id: string) =>
    apiClient.get<AdminBlogPostItem>(`${BASE}/blog/posts/${id}`).then(r => r.data),

  createBlogPost: (data: CreateBlogPostPayload) =>
    apiClient.post<AdminBlogPostItem>(`${BASE}/blog/posts`, data).then(r => r.data),

  updateBlogPost: (id: string, data: UpdateBlogPostPayload) =>
    apiClient.put<AdminBlogPostItem>(`${BASE}/blog/posts/${id}`, data).then(r => r.data),

  deleteBlogPost: (id: string) =>
    apiClient.delete(`${BASE}/blog/posts/${id}`).then(r => r.data),

  uploadBlogPostCover: (file: string, filename: string) =>
    apiClient.post<{ url: string }>(`${BASE}/blog/posts/upload`, { file, filename }).then(r => r.data),
};
