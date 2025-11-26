/**
 * Sistema padronizado de notificações usando Sonner
 * 
 * Permite usar mensagens padronizadas ou mensagens customizadas
 * Tanto o título quanto a descrição podem ser chaves de mensagem ou texto customizado
 * 
 * Exemplos:
 * - toast.success('veiculo.sucesso.criado')
 * - toast.error('erro.generico', { description: 'Detalhes do erro' })
 * - toast.info('sistema.info.cepNaoEncontrado', { description: 'sistema.info.cepNaoEncontradoDescricao' })
 * - toast.success('Veículo criado com sucesso!') // mensagem customizada
 * - toast.success('veiculo.sucesso.criado', { description: 'Descrição customizada' }) // título chave, descrição customizada
 */

import { toast as sonnerToast } from "sonner";
import { getMessage, type MessageKey } from "@/constants/messages";

type ToastOptions = {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
};

/**
 * Verifica se uma string é uma chave de mensagem padronizada
 */
function isMessageKey(message: string): message is MessageKey {
  return message.includes('.') && !message.includes(' ');
}

/**
 * Obtém a mensagem (padronizada ou customizada)
 */
function getToastMessage(message: string): string {
  if (isMessageKey(message)) {
    return getMessage(message);
  }
  return message;
}

/**
 * Obtém a description processada (pode ser chave de mensagem ou texto customizado)
 */
function getToastDescription(description?: string): string | undefined {
  if (!description) return undefined;
  return getToastMessage(description);
}

/**
 * Sistema de toast padronizado
 */
export const toast = {
  /**
   * Exibe uma notificação de sucesso
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(getToastMessage(message), {
      description: getToastDescription(options?.description),
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Exibe uma notificação de erro
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(getToastMessage(message), {
      description: getToastDescription(options?.description),
      duration: options?.duration || 5000, // Erros ficam mais tempo por padrão
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Exibe uma notificação de informação
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(getToastMessage(message), {
      description: getToastDescription(options?.description),
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Exibe uma notificação de aviso
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(getToastMessage(message), {
      description: getToastDescription(options?.description),
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Exibe uma notificação de loading (promise)
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: getToastMessage(messages.loading),
      success: (data) => {
        const message = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        return getToastMessage(message);
      },
      error: (error) => {
        const message = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error;
        return getToastMessage(message);
      },
      ...options,
      description: getToastDescription(options?.description),
    });
  },

  /**
   * Exibe uma notificação customizada
   */
  custom: (message: string, options?: ToastOptions & { type?: 'success' | 'error' | 'info' | 'warning' }) => {
    const type = options?.type || 'info';
    return toast[type](message, options);
  },

  /**
   * Remove uma notificação específica
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Remove todas as notificações
   */
  dismissAll: () => {
    sonnerToast.dismiss();
  },
};

export default toast;

