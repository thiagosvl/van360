import { Clock, DoorClosed, GraduationCap, MapPin, School, UserCheck } from "lucide-react";
import { cleanProfessor, cleanSala, formatModalidade, formatPeriodo } from "@/utils/formatters";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoEscolaCardProps {
  condicoes: PublicRenovacaoResponse["condicoes"];
  passageiro?: PublicRenovacaoResponse["passageiro"];
}

export function PublicRenovacaoEscolaCard({ condicoes, passageiro }: PublicRenovacaoEscolaCardProps) {
  const turmaExibicao = condicoes.turma?.novo || passageiro?.turma;
  const salaExibicao = condicoes.sala?.novo || passageiro?.sala;
  const professorExibicao = condicoes.nome_professor?.novo || passageiro?.nome_professor;

  return (
    <article className="bg-white rounded-[24px] border border-border p-5 sm:p-6 shadow-xs space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <School className="w-4 h-4 text-foreground" />
        Escola e Turno
      </h3>

      <div className="divide-y divide-border space-y-3 pt-1">
        <div className="flex items-center justify-between pt-3 first:pt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Escola</span>
            </div>
          </div>

          <div className="text-right max-w-[55%]">
            {condicoes.escola.alterado ? (
              <div className="space-y-0.5">
                {condicoes.escola.atual && (
                  <span className="line-through text-destructive text-xs block truncate font-normal">
                    {condicoes.escola.atual}
                  </span>
                )}
                <span className="text-foreground font-semibold text-xs sm:text-sm block truncate">
                  {condicoes.escola.novo}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                {condicoes.escola.novo}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Turno</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.periodo.alterado ? (
              <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                <span className="line-through text-destructive text-xs sm:text-sm font-normal capitalize">
                  {formatPeriodo(condicoes.periodo.atual)}
                </span>
                <span className="text-foreground font-semibold text-xs sm:text-sm capitalize">
                  {formatPeriodo(condicoes.periodo.novo)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-xs sm:text-sm capitalize">
                {formatPeriodo(condicoes.periodo.novo)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Modalidade</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.modalidade.alterado ? (
              <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                <span className="line-through text-destructive text-xs sm:text-sm font-normal">
                  {formatModalidade(condicoes.modalidade.atual)}
                </span>
                <span className="text-foreground font-semibold text-xs sm:text-sm">
                  {formatModalidade(condicoes.modalidade.novo)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-xs sm:text-sm">
                {formatModalidade(condicoes.modalidade.novo)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Turma</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.turma?.alterado ? (
              <div className="space-y-0.5">
                {condicoes.turma.atual && (
                  <span className="line-through text-destructive text-xs block font-normal">
                    {condicoes.turma.atual}
                  </span>
                )}
                <span className="text-foreground font-semibold text-xs sm:text-sm block">
                  {condicoes.turma.novo}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-xs sm:text-sm block">
                {turmaExibicao || "A definir"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <DoorClosed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Sala</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.sala?.alterado ? (
              <div className="space-y-0.5">
                {condicoes.sala.atual && (
                  <span className="line-through text-destructive text-xs block font-normal">
                    {cleanSala(condicoes.sala.atual)}
                  </span>
                )}
                <span className="text-foreground font-semibold text-xs sm:text-sm block">
                  {cleanSala(condicoes.sala.novo)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-xs sm:text-sm block">
                {salaExibicao ? cleanSala(salaExibicao) : "A definir"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Professor(a)</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.nome_professor?.alterado ? (
              <div className="space-y-0.5">
                {condicoes.nome_professor.atual && (
                  <span className="line-through text-destructive text-xs block font-normal">
                    {cleanProfessor(condicoes.nome_professor.atual)}
                  </span>
                )}
                <span className="text-foreground font-semibold text-xs sm:text-sm block">
                  {cleanProfessor(condicoes.nome_professor.novo)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-xs sm:text-sm block">
                {professorExibicao ? cleanProfessor(professorExibicao) : "A definir"}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
