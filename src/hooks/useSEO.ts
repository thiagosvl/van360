import { useEffect } from "react";

/**
 * Hook para gerenciar meta tags de SEO, especialmente robots
 * @param options - Opções de configuração SEO
 * @param options.noindex - Se true, adiciona noindex, nofollow. Se false, remove ou não adiciona.
 * @param options.title - Título da página (opcional)
 * @param options.description - Descrição da página (opcional)
 */
export function useSEO({
  noindex = false,
  title,
  description,
}: {
  noindex?: boolean;
  title?: string;
  description?: string;
} = {}) {
  useEffect(() => {
    // Gerenciar meta tag robots
    let robotsMeta = document.querySelector('meta[name="robots"]');
    
    if (noindex) {
      // Adicionar ou atualizar meta tag para não indexar
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else {
      // Remover meta tag robots se existir (permite indexação)
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }

    // Gerenciar título
    if (title) {
      document.title = title;
    }

    // Gerenciar descrição
    if (description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement("meta");
        descMeta.setAttribute("name", "description");
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute("content", description);
    }

    // Cleanup: remover meta tag robots ao desmontar se foi adicionada
    return () => {
      if (noindex) {
        const robotsMetaOnUnmount = document.querySelector('meta[name="robots"]');
        if (robotsMetaOnUnmount) {
          robotsMetaOnUnmount.remove();
        }
      }
    };
  }, [noindex, title, description]);
}

