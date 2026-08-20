import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { TipoResponsavel } from "@/types/enums";

export function mapearCarteirinhaParaPassageiro(carteirinha: ResponsavelCarteirinhaData): Passageiro {
  return {
    id: carteirinha.id,
    usuario_id: carteirinha.usuario_id || "",
    nome: carteirinha.nome,
    genero: (carteirinha.genero as Passageiro["genero"]) || undefined,
    data_nascimento: carteirinha.data_nascimento || undefined,
    periodo: carteirinha.periodo || undefined,
    modalidade: (carteirinha.modalidade as Passageiro["modalidade"]) || undefined,
    turma: carteirinha.turma || undefined,
    nome_professor: carteirinha.nome_professor || undefined,
    logradouro: carteirinha.logradouro || undefined,
    numero: carteirinha.numero || undefined,
    bairro: carteirinha.bairro || undefined,
    cidade: carteirinha.cidade || undefined,
    estado: carteirinha.estado || undefined,
    cep: carteirinha.cep || undefined,
    complemento: carteirinha.complemento || undefined,
    referencia: carteirinha.referencia || undefined,
    observacoes: carteirinha.observacoes || undefined,
    ativo: carteirinha.ativo,
    isento: carteirinha.isento,
    valor_cobranca: carteirinha.valor_cobranca ?? undefined,
    dia_vencimento: carteirinha.dia_vencimento ?? undefined,
    data_inicio_cobranca: carteirinha.data_inicio_cobranca || undefined,
    data_fim_cobranca: carteirinha.data_fim_cobranca || undefined,
    created_at: carteirinha.created_at || undefined,
    responsavel_principal: carteirinha.responsavel_principal || undefined,
    responsavel_logado_id: carteirinha.responsavel_logado_id || undefined,
    token_acesso: carteirinha.token_acesso || undefined,
    escola: carteirinha.escola_nome
      ? { id: "", nome: carteirinha.escola_nome, created_at: "", updated_at: "", usuario_id: "" }
      : undefined,
    veiculo: carteirinha.veiculo_placa
      ? { id: "", placa: carteirinha.veiculo_placa, modelo: carteirinha.veiculo_modelo || "", created_at: "", updated_at: "", usuario_id: "" }
      : undefined,
    usuario: carteirinha.motorista_nome
      ? { id: "", nome: carteirinha.motorista_nome, apelido: carteirinha.motorista_nome, telefone: carteirinha.motorista_telefone || "", created_at: "", updated_at: "" }
      : undefined,
    status_contrato: (carteirinha.contrato?.status as Passageiro["status_contrato"]) || undefined,
    contrato_id: carteirinha.contrato?.id || undefined,
    responsaveis: [
      ...(carteirinha.responsavel_principal?.id || carteirinha.responsavel_principal?.nome ? [{
        id: carteirinha.responsavel_principal.id || "resp-principal",
        responsavel_id: carteirinha.responsavel_principal.id,
        passageiro_id: carteirinha.id,
        nome: carteirinha.responsavel_principal.nome || "",
        telefone: carteirinha.responsavel_principal.telefone || "",
        cpf: carteirinha.responsavel_principal.cpf || "",
        email: carteirinha.responsavel_principal.email || undefined,
        parentesco: (carteirinha.responsavel_principal.parentesco as PassageiroResponsavel["parentesco"]) || undefined,
        tipo: TipoResponsavel.PRINCIPAL,
        logradouro: carteirinha.responsavel_principal.logradouro || undefined,
        numero: carteirinha.responsavel_principal.numero || undefined,
        bairro: carteirinha.responsavel_principal.bairro || undefined,
        cidade: carteirinha.responsavel_principal.cidade || undefined,
        estado: carteirinha.responsavel_principal.estado || undefined,
        cep: carteirinha.responsavel_principal.cep || undefined,
        referencia: carteirinha.responsavel_principal.referencia || undefined,
        complemento: carteirinha.responsavel_principal.complemento || undefined,
      }] : []),
      ...(carteirinha.responsaveis || [])
        .filter((r) => !carteirinha.responsavel_principal?.id || r.id !== carteirinha.responsavel_principal.id)
        .map((r) => ({
          id: r.id,
          passageiro_id: r.passageiro_id || carteirinha.id,
          nome: r.nome,
          telefone: r.telefone || "",
          cpf: r.cpf || "",
          email: r.email || undefined,
          parentesco: (r.parentesco as PassageiroResponsavel["parentesco"]) || undefined,
          tipo: (r as { tipo?: TipoResponsavel }).tipo || TipoResponsavel.ADICIONAL,
          logradouro: r.logradouro || undefined,
          numero: r.numero || undefined,
          bairro: r.bairro || undefined,
          cidade: r.cidade || undefined,
          estado: r.estado || undefined,
          cep: r.cep || undefined,
          referencia: r.referencia || undefined,
          complemento: r.complemento || undefined,
          pin_acesso: r.pin_acesso || undefined,
        })),
    ],
  } as Passageiro;
}
