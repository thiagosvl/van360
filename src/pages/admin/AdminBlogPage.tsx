import { useState, useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import AdminBlogList from "@/components/features/admin/blog/AdminBlogList";
import AdminBlogPostForm from "@/components/features/admin/blog/AdminBlogPostForm";

import { BlogPageView } from "@/types/enums";

export default function AdminBlogPage() {
  const { setPageTitle } = useLayout();
  const [view, setView] = useState<BlogPageView>(BlogPageView.LIST);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    setPageTitle("Blog");
  }, [setPageTitle]);

  const handleEdit = (id: string) => {
    setSelectedPostId(id);
    setView(BlogPageView.EDIT);
  };

  const handleCreate = () => {
    setSelectedPostId(null);
    setView(BlogPageView.CREATE);
  };

  const handleCancel = () => {
    setSelectedPostId(null);
    setView(BlogPageView.LIST);
  };

  return (
    <div className="w-full">
      {view === BlogPageView.LIST ? (
        <AdminBlogList onEdit={handleEdit} onCreate={handleCreate} />
      ) : (
        <AdminBlogPostForm
          postId={selectedPostId}
          isEdit={view === BlogPageView.EDIT}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
