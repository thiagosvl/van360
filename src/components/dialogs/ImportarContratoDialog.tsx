import { useState, useRef, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useImportarContrato } from "@/hooks/api/useContratos";
import { useSession } from "@/hooks/business/useSession";
import { toast } from "@/utils/notifications/toast";
import { UploadCloud, FileText, X, User, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { ContratoListItem } from "@/types/contract";
import { Passageiro } from "@/types/passageiro";
import { formatShortName } from "@/utils/formatters";
import { formatFirstName } from "@/utils/formatters/name";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface ImportarContratoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId?: string;
  passageiro?: Passageiro | ContratoListItem;
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
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const rawPass: Passageiro | undefined = (passageiro && "passageiro" in passageiro && passageiro.passageiro)
    ? passageiro.passageiro
    : (passageiro as Passageiro | undefined);

  const initialPassageiroId = passageiroId || rawPass?.id || "";
  const [selectedPassageiroId, setSelectedPassageiroId] = useState<string>(initialPassageiroId);
  const [searchPassageiro, setSearchPassageiro] = useState("");
  const debouncedSearch = useDebounce(searchPassageiro, 300);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Content, setBase64Content] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isFixedPassageiro = Boolean(initialPassageiroId);

  const { data: fetchedFixedPassageiro, isLoading: isLoadingFixed } = usePassageiro(initialPassageiroId, {
    enabled: isFixedPassageiro && isOpen && (!rawPass || !rawPass.nome),
  });

  const fixedPassageiro = (rawPass?.nome ? rawPass : undefined) || fetchedFixedPassageiro;

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
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return [];
    return passageirosList.filter((p) => {
      const nomeMatch = p.nome?.toLowerCase().includes(term);
      const respMatch = (p.responsavel_principal?.nome || p.responsaveis?.[0]?.nome || "")
        .toLowerCase()
        .includes(term);
      const escolaMatch = (p.escola?.nome || p.escola_nome || "").toLowerCase().includes(term);
      return nomeMatch || respMatch || escolaMatch;
    });
  }, [passageirosList, debouncedSearch]);

  const currentSelectedPassageiro = useMemo(() => {
    if (isFixedPassageiro) return fixedPassageiro;
    return passageirosList.find((p) => p.id === selectedPassageiroId) || null;
  }, [isFixedPassageiro, fixedPassageiro, passageirosList, selectedPassageiroId]);

  const importarMutation = useImportarContrato();

  useEffect(() => {
    if (isOpen) {
      setSelectedPassageiroId(passageiroId || rawPass?.id || "");
      setSearchPassageiro("");
      setSelectedFile(null);
      setBase64Content(null);
    }
  }, [isOpen, passageiroId, rawPass?.id]);

  useEffect(() => {
    if (selectedPassageiroId && !isFixedPassageiro) {
      const timer = setTimeout(() => {
        uploadSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedPassageiroId, isFixedPassageiro]);

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

  const handleClose = () => {
    safeCloseDialog(onClose);
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
      handleClose();
    } catch { }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={handleClose} maxWidth="md">
      <BaseDialog.Header
        title="Importar Contrato Assinado"
        icon={<FileText className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-4 py-2">
        <div className="space-y-2 pt-4">
          <label className="text-[12px] font-medium text-[#737373] uppercase tracking-[0.04em] block ml-1">
            Aluno deste Contrato <span className="text-[#e7000b]">*</span>
          </label>

          {isFixedPassageiro || currentSelectedPassageiro ? (
            <div className="flex items-center justify-between gap-3 p-4 bg-[#fafafa] rounded-[20px] border border-[#e5e5e5] transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <User className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0a0a0a] truncate leading-tight">
                    {isLoadingFixed && !currentSelectedPassageiro?.nome
                      ? "Carregando aluno..."
                      : (currentSelectedPassageiro?.nome ? formatShortName(currentSelectedPassageiro.nome, true) : "Aluno selecionado")}
                  </p>
                  <p className="text-xs text-[#737373] font-normal truncate mt-0.5">
                    {currentSelectedPassageiro?.responsavel_principal?.nome
                      ? `${formatFirstName(currentSelectedPassageiro.responsavel_principal.nome)}`
                      : (currentSelectedPassageiro?.nome ? "Responsável não informado" : "Identificando aluno...")}
                  </p>
                </div>
              </div>
              {!isFixedPassageiro && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPassageiroId("");
                    setSelectedFile(null);
                    setBase64Content(null);
                  }}
                  className="h-8 px-3 text-xs font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[18px] shrink-0 border border-[#e5e5e5] bg-white cursor-pointer"
                >
                  Trocar
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Buscar aluno por nome ou responsável..."
                  value={searchPassageiro}
                  onChange={(e) => setSearchPassageiro(e.target.value)}
                  className="h-11 text-sm rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb]/60 focus:bg-white border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] pl-10 pr-9 text-[#0a0a0a] placeholder:text-[#737373] transition-all"
                  autoFocus
                />
                <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchPassageiro && (
                  <button
                    type="button"
                    onClick={() => setSearchPassageiro("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isLoadingPassageiros ? (
                <div className="flex items-center justify-center py-6 text-[#737373] gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0a0a0a]" />
                  <span className="text-xs font-medium">Carregando alunos...</span>
                </div>
              ) : !debouncedSearch.trim() ? (
                <div className="py-6 text-center text-xs text-[#737373] font-medium bg-[#fafafa] rounded-[18px] border border-dashed border-[#e5e5e5] px-4">
                  Digite acima o nome do aluno ou responsável para buscar
                </div>
              ) : filteredPassageiros.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#737373] font-medium bg-[#fafafa] rounded-[18px] border border-dashed border-[#e5e5e5] px-4">
                  Nenhum aluno sem contrato encontrado para "{debouncedSearch}"
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin border border-[#e5e5e5] rounded-[18px] p-1.5 bg-[#fafafa]">
                  {filteredPassageiros.map((p) => {
                    const respNome = p.responsavel_principal?.nome || p.responsaveis?.[0]?.nome;
                    const respPrimeiroNome = respNome ? formatFirstName(respNome) : null;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPassageiroId(p.id);
                          setSearchPassageiro("");
                        }}
                        className="w-full bg-white hover:bg-[#f5f5f5] active:bg-[#ebebeb] border border-[#e5e5e5] p-3 rounded-[14px] flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#0a0a0a] truncate">
                            {formatShortName(p.nome, true)}
                          </p>
                          {respPrimeiroNome && (
                            <p className="text-[11px] text-[#737373] font-normal mt-0.5 truncate">
                              {respPrimeiroNome}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-primary-foreground bg-primary px-2.5 py-1 rounded-[18px] transition-colors shrink-0 shadow-xs">
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

        {(isFixedPassageiro || currentSelectedPassageiro) && (
          <div ref={uploadSectionRef} className="space-y-2 pt-1 animate-in fade-in-50 duration-200">
            <label className="text-[12px] font-medium text-[#737373] uppercase tracking-[0.04em] block ml-1">
              Documento Assinado (PDF) <span className="text-[#e7000b]">*</span>
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
                  "border-2 border-dashed rounded-[22px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 gap-2.5",
                  isDragging
                    ? "border-[#0a0a0a] bg-[#f5f5f5] scale-[1.01]"
                    : "border-[#e5e5e5] hover:border-[#737373]/50 bg-[#fafafa] hover:bg-[#f5f5f5]"
                )}
              >
                <div className="w-12 h-12 rounded-[18px] bg-white shadow-xs border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0a0a0a]">
                    Clique ou arraste o PDF do contrato assinado aqui
                  </p>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Apenas documento assinado em formato PDF (máximo 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-white rounded-[20px] border border-[#e5e5e5] shadow-xs transition-all animate-in fade-in-50 duration-200">
                <div className="w-11 h-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <FileText className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0a0a0a] truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#737373]">
                      {formatFileSize(selectedFile.size)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[18px] bg-primary text-primary-foreground">
                      PDF Pronto
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="w-8 h-8 rounded-[12px] text-[#737373] hover:text-[#e7000b] hover:bg-[#f5f5f5] flex items-center justify-center transition-colors shrink-0"
                  title="Remover arquivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={importarMutation.isPending}
        />
        <BaseDialog.Action
          label="Importar Contrato"
          onClick={handleSubmit}
          isLoading={importarMutation.isPending}
          disabled={!selectedFile || !(isFixedPassageiro ? passageiroId : selectedPassageiroId)}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
