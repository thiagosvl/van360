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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-white tracking-tight uppercase">
            Artigos do Blog
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            {total} artigo{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="rounded-xl h-11 bg-blue-600 text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:bg-blue-500 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar artigo por título..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-11 h-11 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-0 focus:border-blue-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
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
                    <tr className="border-b border-slate-800/80">
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Título</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tags</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-slate-800/40 hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => onEdit(post.id)}
                      >
                        <td className="py-4">
                          <p className="text-sm font-bold text-slate-100 max-w-[300px] truncate">
                            {post.title}
                          </p>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {post.tags.length > 0 ? (
                              post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          {post.status === BlogPostStatus.PUBLISHED ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-lg">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px] rounded-lg">
                              Rascunho
                            </Badge>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-slate-400">
                            {new Date(post.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-blue-400 hover:bg-blue-500/10"
                              onClick={() => onEdit(post.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4 mb-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onEdit(post.id)}
                    className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-left cursor-pointer hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.status === BlogPostStatus.PUBLISHED ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-lg shrink-0">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px] rounded-lg shrink-0">
                          Rascunho
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Data</span>
                        <span className="font-semibold text-slate-200">
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-blue-400 hover:bg-blue-500/10 h-8 px-3"
                        onClick={() => onEdit(post.id)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-red-400 hover:bg-red-500/10 h-8 px-3"
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
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
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
