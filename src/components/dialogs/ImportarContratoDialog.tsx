import { useState, useRef, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useImportarContrato } from "@/hooks/api/useContratos";
import { useSession } from "@/hooks/business/useSession";
import { toast } from "@/utils/notifications/toast";
import { UploadCloud, FileText, X, User, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { formatShortName } from "@/utils/formatters";
import { formatFirstName } from "@/utils/formatters/name";

interface ImportarContratoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId?: string;
  passageiro?: Passageiro;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function ImportarContratoDialog({
  isOpen,
  onClose,
  passageiroId,
  passageiro,
  onSuccess,
}: ImportarContratoDialogProps) {
  const { user } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialPassageiroId = passageiroId || passageiro?.id || "";
  const [selectedPassageiroId, setSelectedPassageiroId] = useState<string>(initialPassageiroId);
  const [searchPassageiro, setSearchPassageiro] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Content, setBase64Content] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isFixedPassageiro = Boolean(initialPassageiroId);

  const { data: fetchedFixedPassageiro, isLoading: isLoadingFixed } = usePassageiro(initialPassageiroId, {
    enabled: isFixedPassageiro && isOpen && !passageiro,
  });

  const fixedPassageiro = passageiro || fetchedFixedPassageiro;

  const { data: passageirosResponse, isLoading: isLoadingPassageiros } = usePassageiros(
    { usuarioId: user?.id || "", status: "true", limit: 500 },
    { enabled: !isFixedPassageiro && isOpen && Boolean(user?.id) }
  );

  const passageirosList = useMemo(() => {
    const list = passageirosResponse?.list || [];
    return list.filter((p) => {
      const isAssinado =
        p.contrato_status === ContratoStatus.ASSINADO ||
        p.status_contrato === ContratoStatus.ASSINADO ||
        p.contrato_provider === ContratoProvider.IMPORTADO;
      return !isAssinado;
    });
  }, [passageirosResponse]);

  const filteredPassageiros = useMemo(() => {
    if (!searchPassageiro.trim()) return passageirosList;
    const term = searchPassageiro.toLowerCase();
    return passageirosList.filter((p) => {
      const nomeMatch = p.nome?.toLowerCase().includes(term);
      const respMatch = (p.responsavel_principal?.nome || p.responsaveis?.[0]?.nome || "")
        .toLowerCase()
        .includes(term);
      const escolaMatch = (p.escola?.nome || p.escola_nome || "").toLowerCase().includes(term);
      return nomeMatch || respMatch || escolaMatch;
    });
  }, [passageirosList, searchPassageiro]);

  const currentSelectedPassageiro = useMemo(() => {
    if (isFixedPassageiro) return fixedPassageiro;
    return passageirosList.find((p) => p.id === selectedPassageiroId) || null;
  }, [isFixedPassageiro, fixedPassageiro, passageirosList, selectedPassageiroId]);

  const importarMutation = useImportarContrato();

  useEffect(() => {
    if (isOpen) {
      setSelectedPassageiroId(passageiroId || passageiro?.id || "");
      setSearchPassageiro("");
      setSelectedFile(null);
      setBase64Content(null);
    }
  }, [isOpen, passageiroId, passageiro?.id]);

  const handleFileProcess = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Formato inválido. Apenas documentos no formato PDF (.pdf) são permitidos.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Arquivo muito grande. O tamanho máximo permitido é 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64Content(result);
      setSelectedFile(file);
    };
    reader.onerror = () => {
      toast.error("Erro ao ler o arquivo selecionado.");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setBase64Content(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const targetId = isFixedPassageiro ? passageiroId : selectedPassageiroId;
    if (!targetId) {
      toast.error("Selecione o aluno para vincular o contrato.");
      return;
    }

    if (!base64Content || !selectedFile) {
      toast.error("Selecione o arquivo PDF do contrato.");
      return;
    }

    try {
      await importarMutation.mutateAsync({
        passageiroId: targetId,
        arquivoBase64: base64Content,
        nomeArquivo: selectedFile.name,
      });
      onSuccess?.();
      onClose();
    } catch {
      // noop
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isFormValid = Boolean(
    (isFixedPassageiro ? passageiroId : selectedPassageiroId) && selectedFile && base64Content
  );

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} maxWidth="md" lockClose>
      <BaseDialog.Header
        title="Importar Contrato"
        icon={<FileText className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-5 py-2">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Aluno <span className="text-red-500">*</span>
          </label>

          {isFixedPassageiro || currentSelectedPassageiro ? (
            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#1a3a5c]/10 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-[#1a3a5c]/15">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#1a3a5c] truncate">
                    {isLoadingFixed ? "Carregando..." : formatShortName(currentSelectedPassageiro?.nome, true)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {currentSelectedPassageiro?.responsavel_principal?.nome
                      ? formatFirstName(currentSelectedPassageiro.responsavel_principal.nome)
                      : "Aluno selecionado"}
                  </p>
                </div>
              </div>
              {!isFixedPassageiro && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPassageiroId("")}
                  className="h-8 px-3 text-xs font-bold text-[#1a3a5c] hover:bg-slate-100 rounded-xl shrink-0 border border-slate-200 bg-white shadow-2xs cursor-pointer"
                >
                  Trocar
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Buscar por nome ou responsável..."
                  value={searchPassageiro}
                  onChange={(e) => setSearchPassageiro(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] pl-9 pr-8"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchPassageiro && (
                  <button
                    type="button"
                    onClick={() => setSearchPassageiro("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isLoadingPassageiros ? (
                <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">Carregando alunos...</span>
                </div>
              ) : filteredPassageiros.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Nenhum aluno encontrado
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin border border-slate-100 rounded-xl p-1 bg-slate-50/30">
                  {filteredPassageiros.map((p) => {
                    const respNome = p.responsavel_principal?.nome || p.responsaveis?.[0]?.nome;
                    const respPrimeiroNome = respNome ? formatFirstName(respNome) : null;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPassageiroId(p.id)}
                        className="w-full bg-white hover:bg-blue-50/50 active:bg-blue-50 border border-slate-100 hover:border-blue-200/60 p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1a3a5c] group-hover:text-blue-900 truncate">
                            {formatShortName(p.nome, true)}
                          </p>
                          {respPrimeiroNome && (
                            <p className="text-[10.5px] text-slate-400 font-medium mt-0.5 truncate">
                              {respPrimeiroNome}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-1 rounded-lg transition-colors shrink-0">
                          Selecionar
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Arquivo do Contrato <span className="text-red-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 gap-2.5",
                isDragging
                  ? "border-[#1a3a5c] bg-blue-50/50 scale-[1.01]"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-[#1a3a5c]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Clique ou arraste o arquivo PDF aqui
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Apenas formato PDF (máximo 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 transition-all animate-in fade-in-50 duration-200">
              <div className="w-11 h-11 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center shrink-0 border border-red-200/40 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    PDF Pronto
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                title="Remover arquivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} />
        <BaseDialog.Action
          label="Salvar"
          onClick={handleSubmit}
          disabled={!isFormValid || importarMutation.isPending}
          isLoading={importarMutation.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
