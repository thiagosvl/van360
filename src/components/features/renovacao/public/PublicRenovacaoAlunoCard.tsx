import { Edit3, GraduationCap, HeartPulse, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cleanProfessor, cleanSala } from "@/utils/formatters";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoAlunoCardProps {
  passageiro: PublicRenovacaoResponse["passageiro"];
  responsavel?: PublicRenovacaoResponse["responsavel"];
  condicoes: PublicRenovacaoResponse["condicoes"];
  enderecoFormatado: string;
  canEdit: boolean;
  onEditarDados: () => void;
}

export function PublicRenovacaoAlunoCard({
  passageiro,
  responsavel,
  condicoes,
  enderecoFormatado,
  canEdit,
  onEditarDados,
}: PublicRenovacaoAlunoCardProps) {
  const turmaExibicao = condicoes.turma?.novo || passageiro.turma;
  const salaExibicao = condicoes.sala?.novo || passageiro.sala;
  const professorExibicao = condicoes.nome_professor?.novo || passageiro.nome_professor;
  const temInformacoesEscolares = Boolean(turmaExibicao || salaExibicao || professorExibicao);

  return (
    <article className="bg-white rounded-[24px] border border-border p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border font-semibold text-base">
            {passageiro.nome.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate mt-0.5">
              {passageiro.nome}
            </h2>
            {responsavel?.nome && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
                <span className="font-medium text-foreground">{responsavel.nome}</span>
              </p>
            )}
          </div>
        </div>

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditarDados}
            className="w-full sm:w-auto h-9 px-3 text-xs font-medium gap-1.5 rounded-[18px] border border-border bg-white hover:bg-muted/40 text-foreground shadow-none shrink-0 cursor-pointer justify-center"
          >
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Atualizar Dados</span>
          </Button>
        )}
      </div>

      <div className="bg-muted/30 rounded-[18px] p-3.5 border border-border space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5 text-muted-foreground">
          <MapPin className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-foreground block">Endereço de Embarque:</span>
            <span className="text-muted-foreground block leading-relaxed font-normal">
              {enderecoFormatado || "Endereço não informado"}
            </span>
            {responsavel?.referencia && (
              <span className="text-muted-foreground italic block mt-0.5">
                Ref: {responsavel.referencia}
              </span>
            )}
          </div>
        </div>

        {temInformacoesEscolares && (
          <div className="flex items-start gap-2.5 text-muted-foreground pt-2 border-t border-border">
            <GraduationCap className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="font-semibold text-foreground block">Sala e Turma:</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground font-normal">
                {turmaExibicao && (
                  <span>
                    Turma: <strong className="text-foreground font-medium">{turmaExibicao}</strong>
                  </span>
                )}
                {salaExibicao && (
                  <span>
                    Sala: <strong className="text-foreground font-medium">{cleanSala(salaExibicao)}</strong>
                  </span>
                )}
                {professorExibicao && (
                  <span>
                    Prof.: <strong className="text-foreground font-medium">{cleanProfessor(professorExibicao)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {passageiro.observacoes && (
          <div className="flex items-start gap-2.5 text-muted-foreground pt-2 border-t border-border">
            <HeartPulse className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-foreground block">Cuidados Especiais / Saúde:</span>
              <span className="text-muted-foreground block font-normal leading-relaxed">
                {passageiro.observacoes}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
