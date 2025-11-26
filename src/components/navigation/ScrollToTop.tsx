import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll no window (para páginas sem PullToRefreshWrapper)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Scroll no main content
    const mainContent = document.querySelector('main') || 
                        document.querySelector('.app-content-wrapper');
    
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // Scroll em containers com overflow-y-auto (PullToRefreshWrapper e outros)
    // Busca todos os elementos com overflow-y-auto que podem ter scroll
    const scrollableContainers = document.querySelectorAll('[class*="overflow-y-auto"], [style*="overflow-y: auto"]');
    scrollableContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
    
  }, [pathname]);

  return null;
}

