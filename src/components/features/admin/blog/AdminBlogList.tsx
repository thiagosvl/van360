import { useState } from "react";
import { useAdminBlogPosts, useDeleteBlogPost } from "@/hooks/api/adminHooks";
import { BlogPostStatus } from "@/types/enums";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Edit2,
  Trash2,
  Loader2,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";

interface AdminBlogListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function AdminBlogList({ onEdit, onCreate }: AdminBlogListProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useAdminBlogPosts({
    page,
    limit,
    status: undefined,
  });

  const deleteMutation = useDeleteBlogPost();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    openConfirmationDialog({
      title: "Excluir Artigo",
      description: "Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          closeConfirmationDialog();
          toast.success("Artigo excluído com sucesso!");
        } catch (err) {
          console.error("Erro ao excluir artigo:", err);
          toast.error("Falha ao excluir o artigo. Tente novamente.");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Artigos do blog
          </h1>
          <p className="text-xs text-muted-foreground">
            {total} artigo{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="rounded-lg h-9 bg-primary text-xs font-medium shadow-xs hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Novo artigo
        </Button>
      </div>

      <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigo por título..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <AdminEmptyState
              icon={FileText}
              title="Nenhum artigo encontrado"
              description={
                search
                  ? "Nenhum artigo atende ao título pesquisado."
                  : "Ainda não há artigos do blog cadastrados no sistema."
              }
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Título</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Tags</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Data</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-border/60 hover:bg-secondary/40 transition-colors cursor-pointer"
                        onClick={() => onEdit(post.id)}
                      >
                        <td className="py-3.5">
                          <p className="text-xs font-semibold text-foreground max-w-[300px] truncate">
                            {post.title}
                          </p>
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {post.tags.length > 0 ? (
                              post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-secondary text-foreground border border-border">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5">
                          {post.status === BlogPostStatus.PUBLISHED ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[10px] rounded-md">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border border-border font-medium text-[10px] rounded-md">
                              Rascunho
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-primary hover:bg-secondary h-8 w-8 p-0"
                              onClick={() => onEdit(post.id)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-3 mb-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onEdit(post.id)}
                    className="p-3.5 bg-card rounded-xl border border-border space-y-2.5 text-left cursor-pointer hover:bg-secondary/40 transition-colors shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2">
                        {post.title}
                      </h3>
                      {post.status === BlogPostStatus.PUBLISHED ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[10px] rounded-md shrink-0">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border border-border font-medium text-[10px] rounded-md shrink-0">
                          Rascunho
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0.5 rounded-md font-medium bg-secondary text-foreground border border-border">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        <span className="text-[9px] font-medium text-muted-foreground block">Data</span>
                        <span className="font-normal text-foreground">
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-primary hover:bg-secondary h-8 px-2.5 text-xs font-medium border-border"
                        onClick={() => onEdit(post.id)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive hover:bg-destructive/10 h-8 px-2.5 text-xs font-medium border-border"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-xs font-normal text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="h-8 w-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-8 w-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
