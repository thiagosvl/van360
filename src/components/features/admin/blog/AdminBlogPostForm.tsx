import { useState, useEffect } from "react";
import {
  useAdminBlogPostDetails,
  useCreateBlogPost,
  useUpdateBlogPost,
} from "@/hooks/api/adminHooks";
import { BlogPostStatus } from "@/types/enums";
import { supabase } from "@/integrations/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Undo2,
  Redo2,
  X,
  ArrowLeft,
  Loader2,
  Save,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminBlogPostFormProps {
  postId: string | null;
  isEdit: boolean;
  onCancel: () => void;
}

export default function AdminBlogPostForm({
  postId,
  isEdit,
  onCancel,
}: AdminBlogPostFormProps) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<BlogPostStatus>(BlogPostStatus.DRAFT);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { data: post, isLoading: isLoadingDetails } = useAdminBlogPostDetails(
    postId ?? ""
  );

  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setCoverImageUrl("");
  };

  const addImage = () => {
    if (!editor) return;
    const url = window.prompt("URL da Imagem:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-2xl my-6 mx-auto block shadow-md",
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate focus:outline-none max-w-none min-h-[350px] px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (isEdit && post) {
      setTitle(post.title);
      setExcerpt(post.excerpt ?? "");
      setStatus(post.status);
      setTags(post.tags ?? []);
      setCoverImageUrl(post.cover_image_url ?? "");
      setPreviewUrl(post.cover_image_url ?? "");
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(post.content);
      }
    }
  }, [post, isEdit, editor]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do Link:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleMagicFill = () => {
    setTitle("5 Dicas Essenciais para Organizar Rotas de Vans Escolares");
    setExcerpt(
      "A otimização de rotas de transporte escolar ajuda a economizar combustível, reduzir o tempo de trânsito e garantir a pontualidade e segurança dos alunos."
    );
    setTags(["rotas", "organizacao", "escolar", "economia"]);
    setCoverImageUrl("https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=60");
    setPreviewUrl("https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=60");
    setStatus(BlogPostStatus.PUBLISHED);
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(
        `<h2>Como otimizar a sua rotina diária no transporte escolar</h2>
        <p>Planejar trajetos eficientes é um dos maiores desafios de quem trabalha com transporte escolar. Com o aumento do tráfego urbano e o preço dos combustíveis, a otimização de rotas não é mais um necessidade.</p>
        <h3>1. Agrupe pontos por proximidade geográfica</h3>
        <p>Evite cruzar a cidade desnecessariamente. Tente planejar o trajeto em formato de circuito (anél), minimizando o tempo que a van circula vazia.</p>
        <h3>2. Defina tolerâncias de atraso com os pais</h3>
        <p>A pontualidade é crucial. Alinhe com os responsáveis um limite máximo de tolerância de 2 a 3 minutos em cada parada, de modo que atrasos individuais não prejudiquem toda a rota.</p>
        <p>Utilize ferramentas como o <strong>Van360</strong> para gerenciar seus passageiros, mensalidades e rotas escolares de forma centralizada e profissional!</p>`
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !editor) return;

    const content = editor.getHTML();

    try {
      let finalCoverUrl = coverImageUrl;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error } = await supabase.storage
          .from("blog-covers")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("blog-covers")
          .getPublicUrl(filePath);

        finalCoverUrl = publicUrl;
      }

      if (isEdit && postId) {
        await updateMutation.mutateAsync({
          id: postId,
          data: {
            title,
            content,
            excerpt,
            tags,
            status,
            cover_image_url: finalCoverUrl || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title,
          content,
          excerpt,
          tags,
          status,
          cover_image_url: finalCoverUrl || null,
        });
      }
      onCancel();
    } catch (err) {
      console.error("Erro ao salvar artigo:", err);
      alert("Falha ao salvar o artigo. Se selecionou uma imagem, verifique se o bucket 'blog-covers' foi criado no console do Supabase.");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingDetails) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lista
        </Button>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleMagicFill}
            className="rounded-xl border-dashed border-purple-300 hover:border-purple-400 text-purple-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs uppercase"
          >
            <Wand2 className="h-4 w-4 text-purple-500 animate-pulse" />
            Magic Fill
          </Button>
          <h2 className="text-xl font-bold text-[#1a3a5c] uppercase font-headline">
            {isEdit ? "Editar Artigo" : "Novo Artigo"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-left">
        <Card className="border-0 shadow-diff-shadow rounded-[2rem]">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Título do Artigo *
              </Label>
              <Input
                id="title"
                required
                placeholder="Ex: Como organizar rotas de vans escolares..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resumo Curto (SEO / Excerpt)
              </Label>
              <Textarea
                id="excerpt"
                placeholder="Insira um pequeno resumo explicativo que aparecerá na listagem dos posts e motores de busca..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Imagem de Capa (Destaque)
              </Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <div className="h-28 aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative shrink-0">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview da capa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      id="cover-file-input"
                      onChange={handleImageSelection}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("cover-file-input")?.click()}
                      className="rounded-xl border-slate-200 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                      Escolher Imagem
                    </Button>
                    
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ou cole uma URL</span>
                  </div>
                  <Input
                    placeholder="Cole a URL pública da imagem de destaque..."
                    value={coverImageUrl}
                    onChange={(e) => {
                      setCoverImageUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    className="h-9 rounded-xl bg-white border-slate-200 text-xs focus-visible:ring-0 focus:border-[#1a3a5c]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status de Publicação
                </Label>
                <Select
                  value={status}
                  onValueChange={(val: BlogPostStatus) => setStatus(val)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#1a3a5c]/10">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={BlogPostStatus.DRAFT} className="rounded-lg">Rascunho</SelectItem>
                    <SelectItem value={BlogPostStatus.PUBLISHED} className="rounded-lg">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tags (Pressione Enter ou vírgula para adicionar)
                </Label>
                <div className="space-y-2">
                  <Input
                    id="tags"
                    placeholder="Adicione tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10"
                  />
                  <div className="flex flex-wrap gap-1.5 min-h-[30px] pt-1">
                    {tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:bg-slate-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Conteúdo do Artigo *
              </Label>
              {editor && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 border-b border-slate-200">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("bold") ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("italic") ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("heading", { level: 2 }) ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("heading", { level: 3 }) ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    <span className="w-px h-6 bg-slate-200 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("bulletList") ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("orderedList") ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={setLink}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("link") ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      className={`h-8 w-8 p-0 rounded-lg ${editor.isActive("blockquote") ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "text-slate-600"}`}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addImage}
                      className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:bg-[#1a3a5c]/10"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <span className="w-px h-6 bg-slate-200 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                      className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-40"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                      className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-40"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-xl border-slate-200 text-slate-500 font-bold uppercase tracking-wider"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/95 font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? "Salvar Artigo" : "Publicar Artigo"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
