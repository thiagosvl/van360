import { useState } from "react";
import { useAdminBlogPosts, useDeleteBlogPost } from "@/hooks/api/adminHooks";
import { BlogPostStatus } from "@/types/enums";
import { useLayout } from "@/contexts/LayoutContext";
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

interface AdminBlogListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function AdminBlogList({ onEdit, onCreate }: AdminBlogListProps) {
  const { openConfirmationDialog } = useLayout();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useAdminBlogPosts({
    page,
    limit,
    status: undefined, // Lists all statuses
  });

  const deleteMutation = useDeleteBlogPost();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Filter posts locally for simplicity since search parameter is optional
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    openConfirmationDialog({
      title: "Excluir Artigo",
      description: "Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
            Artigos do Blog
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            {total} artigo{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="rounded-xl h-11 bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar artigo por título..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-sm font-semibold text-slate-400">
                Nenhum artigo encontrado.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Título</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tags</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Visualizações</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => onEdit(post.id)}
                      >
                        <td className="py-4">
                          <p className="text-sm font-bold text-slate-800 max-w-[300px] truncate">
                            {post.title}
                          </p>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {post.tags.length > 0 ? (
                              post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-semibold">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-semibold text-slate-600">
                            {post.views}
                          </span>
                        </td>
                        <td className="py-4">
                          {post.status === BlogPostStatus.PUBLISHED ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold text-[10px] rounded-lg">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 font-bold text-[10px] rounded-lg">
                              Rascunho
                            </Badge>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10"
                              onClick={() => onEdit(post.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-600 hover:bg-red-50"
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
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.status === BlogPostStatus.PUBLISHED ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold text-[10px] rounded-lg shrink-0">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 font-bold text-[10px] rounded-lg shrink-0">
                          Rascunho
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Visualizações</span>
                        <span className="font-semibold text-slate-600">{post.views}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Data</span>
                        <span className="font-semibold text-slate-600">
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-8 px-3"
                        onClick={() => onEdit(post.id)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-red-600 hover:bg-red-50 h-8 px-3"
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
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-xl border-slate-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl border-slate-200"
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
