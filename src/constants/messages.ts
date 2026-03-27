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
    confirmar: {
      excluir: "Excluir veículo?",
      excluirDescricao: "Tem certeza que deseja excluir este veículo? Essa ação não poderá ser desfeita.",
      desativar: "Desativar veículo?",
      desativarDescricao: "O veículo deixará de aparecer nas listagens ativas. Você poderá reativá-lo depois.",
      ativar: "Ativar veículo?",
      ativarDescricao: "O veículo voltará a aparecer nas listagens ativas.",
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
      criada: "Solicitação enviada com sucesso!",
    },
    info: {
      dadosMantidos: "Dados mantidos!",
      dadosMantidosDescricao: "Para agilizar, mantivemos os dados do responsável e endereço. Preencha apenas os dados do novo passageiro.",
      confirmarExclusao: "Excluir solicitação?",
      confirmarExclusaoDescricao: "Tem certeza que deseja excluir esta solicitação? Essa ação não poderá ser desfeita.",
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
    confirmar: {
      excluir: "Excluir escola?",
      excluirDescricao: "Tem certeza que deseja excluir esta escola? Essa ação não poderá ser desfeita.",
      desativar: "Desativar escola?",
      desativarDescricao: "A escola deixará de aparecer nas listagens ativas. Você poderá reativá-lo depois.",
      ativar: "Ativar escola?",
      ativarDescricao: "A escola voltará a aparecer nas listagens ativas.",
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
      copiarPix: "Erro ao copiar código PIX.",
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
      linkExpirado: "O link de redefinição expirou ou é inválido. Solicite um novo.",
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
    recuperacao: {
      titulo: "Recuperar Senha",
      descricao: "Informe seu CPF para receber um código de validação no WhatsApp.",
      validacaoTitulo: "Verificação",
      novaSenhaTitulo: "Nova Senha",
      novaSenhaDescricao: "Defina uma nova senha segura para sua conta.",
      botaoSolicitar: "Receber Código no WhatsApp",
      botaoValidar: "Validar Código",
      botaoResetar: "Redefinir Senha",
      alterarCpf: "Alterar CPF ou reenviar",
      sucessoSolicitar: "Código enviado com sucesso!",
    },
    info: {
      informeCpf: "Informe seu CPF.",
      informeCpfDescricao: "Digite o CPF cadastrado para receber o link de redefinição em seu e-mail.",
    },
    labels: {
      login: "Entrar",
      loginProcessando: "Entrando...",
      acessar: "Acessar Carteirinha",
      acessando: "Acessando...",
      redefinirSenha: "Redefinir senha",
      redefinirSenhaProcessando: "Salvando...",
      voltarLogin: "Voltar ao login",
      cadastreSe: "Cadastre-se",
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
      copiado: "Código Copiado!",
    },
    info: {
      pendente: "Ainda pendente. Aguarde mais um pouco.",
      jaValidada: "Esta chave já está validada e atualizada.",
      copiar: "Copiar código PIX",
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
      consultarCep: "Erro ao consultar CEP.",
      enviarDados: "Erro ao enviar dados.",
      linkInvalidoDescricao: "Este link de cadastro não é válido.",
      gerarDependencias: "Erro ao gerar dependências automáticas.",
      sessaoExpirada: "Erro de sessão. Tente recarregar a página.",
      motoristaNaoIdentificado: "Motorista não identificado na URL.",
      gerarCadastroAutomatico: "Não foi possível obter escola ou veículo para criação automática.",
      atualizacao: "Ocorreu um erro ao atualizar o aplicativo.",
      atualizacaoDescricao: "Não foi possível aplicar a atualização. Tente novamente.",
    },
    atualizacao: {
      titulo: "Nova versão disponível",
      descricao: "Uma nova versão do aplicativo está disponível. O aplicativo será atualizado agora para garantir o melhor funcionamento.",
      processando: "Atualizando o aplicativo...",
      progresso: "{{PERCENTUAL}}% concluído",
    },
    sucesso: {
      linkCopiado: "Link copiado!",
      linkCopiadoDescricao: "Envie para os pais.",
      processando: "Processando...",
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

  // ========== HOME ==========
  home: {
    info: {
      saudacaoPadrao: "Olá, Motorista",
      semPendencias: "Nenhuma pendência hoje",
      passageirosEmAtraso: "passageiro(s) em atraso",
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
      excluir: "Erro ao excluir contrato.",
      substituir: "Erro ao gerar novo contrato.",
      reenviar: "Erro ao reenviar notificação.",
      cancelar: "Erro ao cancelar contrato.",
      baixar: "Erro ao baixar contrato.",
      semUrl: "Contrato sem URL.",
      semUrlDescricao: "Não foi possível encontrar o link deste contrato.",
      assinaturaNecessaria: "Por favor, desenhe sua assinatura.",
      assinaturaVazia: "Por favor, desenhe sua assinatura.",
      assinar: "Erro ao assinar contrato.",
    },
    sucesso: {
      gerado: "Contrato gerado com sucesso!",
      removido: "Contrato removido com sucesso!",
      substituido: "Novo contrato gerado com sucesso!",
      reenviado: "Notificação reenviada com sucesso!",
      cancelado: "Contrato cancelado com sucesso!",
      baixado: "Contrato baixado com sucesso!",
    },
  },

  // ========== COMUM ==========
  comum: {
    confirmar: {
      excluir: "Excluir?",
      excluirDescricao: "Tem certeza que deseja excluir? Essa ação não poderá ser desfeita.",
      desativar: "Desativar?",
      desativarDescricao: "Deseja realmente desativar? Você poderá reativar futuramente.",
      ativar: "Ativar?",
      ativarDescricao: "Deseja realmente ativado?",
    },
    aguarde: {
      aguarde: "Aguarde..."
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
  | `auth.labels.${keyof typeof messages.auth.labels}`
  | `cadastro.erro.${keyof typeof messages.cadastro.erro}`
  | `cadastro.sucesso.${keyof typeof messages.cadastro.sucesso}`
  | `validacao.${keyof typeof messages.validacao}`
  | `sistema.erro.${keyof typeof messages.sistema.erro}`
  | `sistema.sucesso.${keyof typeof messages.sistema.sucesso}`
  | `sistema.info.${keyof typeof messages.sistema.info}`
  | `usuario.erro.${keyof typeof messages.usuario.erro}`
  | `usuario.sucesso.${keyof typeof messages.usuario.sucesso}`
  | `prePassageiro.erro.${keyof typeof messages.prePassageiro.erro}`
  | `prePassageiro.sucesso.${keyof typeof messages.prePassageiro.sucesso}`
  | `prePassageiro.info.${keyof typeof messages.prePassageiro.info}`
  | `auth.recuperacao.${keyof typeof messages.auth.recuperacao}`
  | `contrato.erro.${keyof typeof messages.contrato.erro}`
  | `contrato.sucesso.${keyof typeof messages.contrato.sucesso}`
  | `home.info.${keyof typeof messages.home.info}`
  | `pix.erro.${keyof typeof messages.pix.erro}`
  | `pix.sucesso.${keyof typeof messages.pix.sucesso}`
  | `pix.info.${keyof typeof messages.pix.info}`
  | `comum.${keyof typeof messages.comum}`
  | `comum.confirmar.${keyof typeof messages.comum.confirmar}`
  | `comum.aguarde.${keyof typeof messages.comum.aguarde}`
  | `veiculo.confirmar.${keyof typeof messages.veiculo.confirmar}`
  | `escola.confirmar.${keyof typeof messages.escola.confirmar}`;

/**
 * Função helper para obter mensagem por chave com suporte a parâmetros
 */
export function getMessage(key: MessageKey | string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: unknown = messages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key;
    }
  }

  if (typeof value !== 'string') return key;

  if (params) {
    let msg = value;
    Object.entries(params).forEach(([k, v]) => {
      msg = msg.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });
    return msg;
  }

  return value;
}

