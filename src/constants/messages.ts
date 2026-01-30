/**
 * Mensagens padronizadas do sistema
 * Organizadas por categoria para facilitar manutenção e consistência
 */

export const messages = {
  // ========== ERROS GENÉRICOS ==========
  erro: {
    generico: "Ocorreu um erro inesperado. Tente novamente.",
    carregar: "Erro ao carregar dados.",
    salvar: "Erro ao salvar dados.",
    excluir: "Erro ao excluir.",
    atualizar: "Erro ao atualizar.",
    operacao: "Erro ao realizar operação.",
    conexao: "Erro de conexão. Verifique sua internet.",
    permissao: "Você não tem permissão para realizar esta ação.",
    validacao: {
      generico: "Corrija os erros no formulário.",
      selecionePassageiro: "Selecione um passageiro para continuar.",
    },
  },

  // ========== SUCESSO GENÉRICO ==========
  sucesso: {
    salvar: "Salvo com sucesso.",
    excluir: "Excluído com sucesso.",
    atualizar: "Atualizado com sucesso.",
    operacao: "Operação realizada com sucesso.",
    copiado: "Copiado para a área de transferência.",
  },

  // ========== VEÍCULOS ==========
  veiculo: {
    erro: {
      carregar: "Erro ao carregar veículos.",
      criar: "Erro ao cadastrar veículo.",
      atualizar: "Erro ao atualizar veículo.",
      excluir: "Erro ao excluir veículo.",
      excluirComPassageiros: "Existem passageiros vinculados a este veículo.",
      desativar: "Não é possível desativar.",
      desativarComPassageiros: "Existem passageiros ativos vinculados a este veículo.",
      placaJaCadastrada: "Essa placa já foi cadastrada no sistema.",
      criarDetalhe: "Não foi possível criar o veículo.",
      atualizarDetalhe: "Não foi possível atualizar o veículo.",
      excluirDetalhe: "Não foi possível excluir o veículo.",
      alterarStatusDetalhe: "Não foi possível alterar o status.",
    },
    sucesso: {
      criado: "Veículo cadastrado com sucesso.",
      atualizado: "Veículo atualizado com sucesso.",
      excluido: "Veículo excluído permanentemente.",
      ativado: "Veículo ativado com sucesso.",
      desativado: "Veículo desativado com sucesso.",
    },
  },

  // ========== PASSAGEIROS ==========
  passageiro: {
    erro: {
      carregar: "Erro ao carregar passageiros.",
      criar: "Erro ao cadastrar passageiro.",
      atualizar: "Erro ao atualizar passageiro.",
      excluir: "Erro ao excluir passageiro.",
      naoEncontrado: "Passageiro não encontrado.",
      excluirComCobrancas: "Este passageiro possui mensalidades em seu histórico.",
      ativar: "Erro ao ativar o passageiro.",
      desativar: "Erro ao desativar o passageiro.",
      alterar: "Erro ao buscar alterar passageiro.",
      criarDetalhe: "Não foi possível criar o passageiro.",
      atualizarDetalhe: "Não foi possível atualizar o passageiro.",
      excluirDetalhe: "Não foi possível excluir o passageiro.",
      statusDetalhe: "Não foi possível alterar o status.",
      confirmarDetalhe: "Não foi possível confirmar o cadastro.",
      carregarDetalhe: "Não foi possível obter os dados no momento.",
      escolaNecessaria: "Cadastre pelo menos uma escola ativa antes de continuar.",
      veiculoNecessario: "Cadastre pelo menos um veículo ativo antes de continuar.",
    },
    sucesso: {
      criado: "Passageiro cadastrado com sucesso.",
      atualizado: "Passageiro atualizado com sucesso.",
      excluido: "Passageiro excluído com sucesso.",
      ativado: "Passageiro ativado com sucesso.",
      desativado: "Passageiro desativado com sucesso.",
      observacoesSalvas: "Observações salvas com sucesso.",
    },
  },

  // ========== PRÉ-CADASTROS ==========
  prePassageiro: {
    erro: {
      carregar: "Erro ao carregar pré-cadastros.",
      criar: "Erro ao salvar solicitação.",
      excluir: "Erro ao excluir solicitação.",
      gerarLink: "Falha na Geração do Link.",
    },
    sucesso: {
      linkGerado: "Solicitação salva com sucesso.",
      excluido: "Pré-cadastro excluído com sucesso.",
    },
  },

  // ========== ESCOLAS ==========
  escola: {
    erro: {
      carregar: "Erro ao carregar escolas.",
      criar: "Erro ao cadastrar escola.",
      atualizar: "Erro ao atualizar escola.",
      excluir: "Erro ao excluir escola.",
      excluirComPassageiros: "Existem passageiros vinculados a esta escola.",
      desativar: "Não é possível desativar.",
      desativarComPassageiros: "Existem passageiros ativos vinculados a esta escola.",
      criarDetalhe: "Não foi possível criar a escola.",
      atualizarDetalhe: "Não foi possível atualizar a escola.",
      excluirDetalhe: "Não foi possível excluir a escola.",
      alterarStatusDetalhe: "Não foi possível alterar o status.",
      nomeJaCadastrado: "Já existe uma escola com este nome.",
    },
    sucesso: {
      criada: "Escola cadastrada com sucesso.",
      atualizada: "Escola atualizada com sucesso.",
      excluida: "Escola excluída permanentemente.",
      ativada: "Escola ativada com sucesso.",
      desativada: "Escola desativada com sucesso.",
    },
  },

  // ========== MENSALIDADES ==========
  cobranca: {
    erro: {
      carregar: "Não foi possível carregar as mensalidades.",
      criar: "Erro ao registrar mensalidade.",
      atualizar: "Erro ao atualizar mensalidade.",
      excluir: "Erro ao excluir mensalidade.",
      notificacao: "Erro ao enviar lembrete.",
      alterarNotificacoes: "Erro ao alterar envio de lembretes.",
      pagamento: "Erro ao registrar pagamento.",
      registrarPagamento: "Erro ao registrar pagamento.",
      desfazerPagamento: "Erro ao desfazer pagamento.",
      buscarHistorico: "Erro ao buscar histórico.",
      buscarAnos: "Erro ao buscar anos disponíveis.",
      naoEncontrada: "Mensalidade não encontrada.",
      naoEncontradaDescricao: "Não foi possível encontrar a mensalidade pendente. Por favor, recarregue a página.",
      carregarPagamento: "Erro ao carregar pagamento.",
      listarAno: "Erro ao listar mensalidades para o ano selecionado.",
      processarAcao: "Erro ao processar a ação.",
      linkPagamentoIndisponivel: "Link de pagamento indisponível.",
      jaExiste: "Já existe uma mensalidade registrada para o mês e ano selecionado.",
      selecioneFormaPagamento: "Selecione uma forma de pagamento.",
      criarEnviada: "Mensalidade registrada e enviada com sucesso!",
      criarSucesso: "Mensalidade registrada com sucesso!",
      criarDetalhe: "Não foi possível registrar a mensalidade.",
      atualizarDetalhe: "Não foi possível atualizar a mensalidade.",
      excluirDetalhe: "Não foi possível excluir a mensalidade.",
      notificacaoDetalhe: "Não foi possível enviar a notificação.",
      alterarNotificacoesDetalhe: "Não foi possível alterar as notificações.",
      registrarPagamentoDetalhe: "Não foi possível registrar o pagamento.",
      desfazerPagamentoDetalhe: "Não foi possível desfazer o pagamento.",
    },
    info: {
      nenhumaAlteracao: "Nenhuma alteração detectada.",
      linkPagamentoDescricao: "Informe o condutor sobre o problema.",
    },
    sucesso: {
      criada: "Mensalidade registrada com sucesso.",
      atualizada: "Mensalidade atualizada com sucesso.",
      excluida: "Mensalidade excluída com sucesso.",
      notificacaoEnviada: "Lembrete enviado com sucesso para o responsável.",
      notificacoesAtivadas: "Lembretes automáticos reativados com sucesso.",
      notificacoesDesativadas: "Lembretes automáticos pausados com sucesso.",
      pagamentoRegistrado: "Pagamento registrado com sucesso.",
      pagamentoDesfeito: "Pagamento desfeito com sucesso.",
    },
  },

  // ========== GASTOS ==========
  gasto: {
    erro: {
      carregar: "Erro ao carregar gastos.",
      criar: "Erro ao registrar gasto.",
      atualizar: "Erro ao atualizar gasto.",
      excluir: "Erro ao excluir gasto.",
    },
    sucesso: {
      criado: "Gasto registrado com sucesso.",
      atualizado: "Gasto atualizado com sucesso.",
      excluido: "Gasto excluído com sucesso.",
    },
  },

  // ========== AUTENTICAÇÃO ==========
  auth: {
    erro: {
      login: "Erro ao fazer login. Verifique suas credenciais.",
      senhaIncorreta: "Senha incorreta.",
      usuarioNaoEncontrado: "Usuário não encontrado.",
      cpfNaoEncontrado: "CPF não encontrado.",
      cpfNaoEncontradoDescricao: "Verifique o número informado. Caso tenha dúvidas, fale com o suporte.",
      emailNaoEncontrado: "E-mail não encontrado.",
      sessaoExpirada: "Sua sessão expirou. Faça login novamente.",
      naoAutorizado: "Você não está autorizado a acessar esta página.",
      nenhumPassageiroEncontrado: "Nenhum passageiro foi encontrado vinculado aos dados informados.",
    },
    sucesso: {
      login: "Login realizado com sucesso.",
      logout: "Logout realizado com sucesso.",
      senhaRedefinida: "Senha redefinida com sucesso.",
      senhaAlterada: "Senha alterada com sucesso.",
      redirecionando: "Redirecionando para o sistema...",
      emailEnviado: "E-mail de redefinição enviado com sucesso.",
    },
    info: {
      informeCpf: "Informe seu CPF.",
      informeCpfDescricao: "Digite o CPF cadastrado para receber o link de redefinição em seu e-mail.",
    },
  },

  // ========== CADASTRO ==========
  cadastro: {
    erro: {
      criar: "Erro ao cadastrar usuário.",
      atualizar: "Erro ao atualizar usuário.",
    },
    sucesso: {
      perfilAtualizado: "Atualizado com sucesso.",
      perfilAtualizadoDescricao: "Suas informações foram salvas.",
    },
    info: {
      pagamentoConfirmado: "Pagamento Confirmado.",
      pagamentoConfirmadoDescricao: "Por favor, faça o login manual para acessar a plataforma.",
    },
  },

  // ========== ASSINATURA ==========
  assinatura: {
    erro: {
      carregar: "Erro ao carregar informações da assinatura.",
      processar: "Erro ao processar assinatura.",
      pagamento: "Erro ao processar pagamento.",
      gerarPix: "Erro ao gerar PIX.",
      copiarPix: "Erro ao copiar PIX.",
      copiarPixDescricao: "Não foi possível copiar o código PIX.",
    },
    sucesso: {
      ativada: "Assinatura ativada com sucesso.",
      atualizada: "Assinatura atualizada com sucesso.",
      cobrancasAtivadas: "Cobranças automáticas ativadas.",
      cobrancasAtivadasDescricao: "X passageiros foram ativados automaticamente.",
    },
    info: {
      pendente: "Você possui uma assinatura pendente.",
      quantidadeIgual: "Você já está com este plano ativo.",
      quantidadeIgualDescricao: "Não é necessário fazer alterações. Você já tem esta quantidade de passageiros com cobrança automática.",
    },
  },

  // ========== PLANOS ==========
  plano: {
      erro: {
        carregar: "Erro ao carregar planos.",
        escolher: "Erro ao escolher o plano.",
        selecionarQuantidade: "É necessário escolher a quantidade de cobranças automáticas que deseja.",
        informarQuantidadePersonalizada: "Informe a quantidade de cobranças automáticas que deseja.",
        quantidadeAbaixoMinimo: "A quantidade informada está abaixo do mínimo permitido.",
        cobrancaAutomaticaApenasProfissional: "Cobranças automáticas estão disponíveis apenas no plano Profissional.",
      },
    sucesso: {
      limiteExpandido: "Limite expandido! Agora você pode ativar a cobrança automática.",
    },
    info: {
      limiteAtingido: "Você atingiu o limite do seu plano.",
      upgradeParaCobrancasAutomaticas: "Faça upgrade para o plano Profissional para ativar cobranças automáticas.",
    },
  },

  // ========== PIX ==========
  pix: {
    erro: {
      falhaSalvar: "Falha ao salvar",
      erroAoSalvar: "Erro ao salvar chave PIX.",
      validacaoFalhou: "A validação falhou. Verifique os dados.",
    },
    sucesso: {
      validada: "Chave validada com sucesso!",
    },
    info: {
      pendente: "Ainda pendente. Aguarde mais um pouco.",
      jaValidada: "Esta chave já está validada e atualizada.",
    }
  },

  // ========== VALIDAÇÕES ==========
  validacao: {
    campoObrigatorio: "Campo obrigatório.",
    senhasNaoCoincidem: "As senhas não coincidem.",
    formularioComErros: "Corrija os erros no formulário.",
    selecionePassageiro: "Selecione um passageiro.",
  },

  // ========== SISTEMA ==========
  sistema: {
    erro: {
      copiar: "Erro ao copiar.",
      copiarDescricao: "Não foi possível copiar o texto.",
      falhaCopiar: "Falha ao copiar.",
      falhaCopiarDescricao: "Tente copiar o link manualmente.",
      validarFranquia: "Erro ao validar franquia.",
      validarFranquiaDescricao: "Não foi possível verificar o limite de cobranças automáticas.",
      consultarCep: "Erro ao consultar CEP.",
      enviarDados: "Erro ao enviar dados.",
      linkInvalido: "Link inválido.",
      linkInvalidoDescricao: "Este link de cadastro não é válido.",
      atualizacao: "Erro ao atualizar.",
    },
    sucesso: {
      cobrancasAutomaticasAtivadas: "Cobranças automáticas ativadas com sucesso.",
      cobrancasAutomaticasDesativadas: "Cobranças automáticas desativadas com sucesso.",
    },
    info: {
      cepNaoEncontrado: "CEP não encontrado na base de dados.",
      cepNaoEncontradoDescricao: "Preencha o endereço manualmente.",
      atualizacaoApp: "Atualização de App.",
      atualizacaoAppDescricao: "Baixando melhorias em segundo plano...",
      melhoriasProntas: "Melhorias Prontas.",
      melhoriasProntasDescricao: "A nova versão será aplicada na próxima vez que você abrir o app.",
      appAtualizado: "Pronto.",
      appAtualizadoDescricao: "O aplicativo foi atualizado com sucesso para a versão mais recente.",
    },
  },

  // ========== USUÁRIOS/ADMIN ==========
  usuario: {
    erro: {
      carregar: "Erro ao carregar usuários.",
      criar: "Erro ao cadastrar usuário.",
      atualizar: "Erro ao atualizar usuário.",
      excluir: "Erro ao excluir usuário.",
      cpfJaExiste: "CPF/CNPJ já existe.",
      emailJaExiste: "Email já existe.",
      invalido: "Usuário selecionado é inválido ou não possui um ID de autenticação.",
      atualizacao: "Erro na Atualização.",
    },
    sucesso: {
      atualizado: "Usuário atualizado com sucesso!",
      excluido: "Usuário excluído com sucesso!",
    },
  },

  // ========== CONTRATOS ==========
  contrato: {
    erro: {
      carregar: "Erro ao carregar contratos.",
      criar: "Erro ao criar contrato.",
      remover: "Erro ao remover contrato.",
      substituir: "Erro ao gerar novo contrato.",
      reenviar: "Erro ao reenviar notificação.",
      cancelar: "Erro ao cancelar contrato.",
      baixar: "Erro ao baixar contrato.",
      semUrl: "Contrato sem URL.",
      semUrlDescricao: "Não foi possível encontrar o link deste contrato.",
    },
    sucesso: {
      criado: "Contrato criado com sucesso!",
      removido: "Contrato removido com sucesso!",
      substituido: "Novo contrato gerado com sucesso!",
      reenviado: "Notificação reenviada com sucesso!",
      cancelado: "Contrato cancelado com sucesso!",
      baixado: "Contrato baixado com sucesso!",
    },
  },
} as const;

/**
 * Tipo para as chaves de mensagens (para autocomplete)
 */
export type MessageKey = 
  | `erro.${keyof typeof messages.erro}`
  | `sucesso.${keyof typeof messages.sucesso}`
  | `veiculo.erro.${keyof typeof messages.veiculo.erro}`
  | `veiculo.sucesso.${keyof typeof messages.veiculo.sucesso}`
  | `passageiro.erro.${keyof typeof messages.passageiro.erro}`
  | `passageiro.sucesso.${keyof typeof messages.passageiro.sucesso}`
  | `escola.erro.${keyof typeof messages.escola.erro}`
  | `escola.sucesso.${keyof typeof messages.escola.sucesso}`
  | `cobranca.erro.${keyof typeof messages.cobranca.erro}`
  | `cobranca.sucesso.${keyof typeof messages.cobranca.sucesso}`
  | `cobranca.info.${keyof typeof messages.cobranca.info}`
  | `gasto.erro.${keyof typeof messages.gasto.erro}`
  | `gasto.sucesso.${keyof typeof messages.gasto.sucesso}`
  | `auth.erro.${keyof typeof messages.auth.erro}`
  | `auth.sucesso.${keyof typeof messages.auth.sucesso}`
  | `auth.info.${keyof typeof messages.auth.info}`
  | `cadastro.erro.${keyof typeof messages.cadastro.erro}`
  | `cadastro.sucesso.${keyof typeof messages.cadastro.sucesso}`
  | `assinatura.erro.${keyof typeof messages.assinatura.erro}`
  | `assinatura.sucesso.${keyof typeof messages.assinatura.sucesso}`
  | `assinatura.info.${keyof typeof messages.assinatura.info}`
  | `plano.erro.${keyof typeof messages.plano.erro}`
  | `plano.sucesso.${keyof typeof messages.plano.sucesso}`
  | `plano.info.${keyof typeof messages.plano.info}`
  | `validacao.${keyof typeof messages.validacao}`
  | `sistema.erro.${keyof typeof messages.sistema.erro}`
  | `sistema.sucesso.${keyof typeof messages.sistema.sucesso}`
  | `sistema.info.${keyof typeof messages.sistema.info}`
  | `usuario.erro.${keyof typeof messages.usuario.erro}`
  | `usuario.sucesso.${keyof typeof messages.usuario.sucesso}`
  | `prePassageiro.erro.${keyof typeof messages.prePassageiro.erro}`
  | `prePassageiro.sucesso.${keyof typeof messages.prePassageiro.sucesso}`
  | `contrato.erro.${keyof typeof messages.contrato.erro}`
  | `contrato.sucesso.${keyof typeof messages.contrato.sucesso}`;

/**
 * Função helper para obter mensagem por chave
 * Exemplo: getMessage('veiculo.sucesso.criado') => "Veículo criado com sucesso."
 */
export function getMessage(key: MessageKey | string): string {
  const keys = key.split('.');
  let value: unknown = messages;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Retorna a chave se não encontrar
    }
  }
  
  return typeof value === 'string' ? value : key;
}

