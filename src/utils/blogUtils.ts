import { AdminBlogPostItem } from "@/services/api/admin/admin-blog.api";
import { slugify } from "@/utils/string";

export function formatBlogSlug(title: string): string {
  if (!title) return "";
  return slugify(title);
}

export function filterPostsByTag(
  posts: AdminBlogPostItem[],
  selectedTag?: string | null
): AdminBlogPostItem[] {
  if (!selectedTag || selectedTag.trim() === "" || selectedTag.toLowerCase() === "todos") {
    return posts;
  }
  const normalizedTag = selectedTag.trim().toLowerCase();
  return posts.filter((post) =>
    post.tags?.some((t) => t.toLowerCase() === normalizedTag)
  );
}
