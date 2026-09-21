import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const mainContent = document.querySelector('main') || 
                        document.querySelector('.app-content-wrapper');
    
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    const scrollableContainers = document.querySelectorAll('[class*="overflow-y-auto"], [style*="overflow-y: auto"]');
    scrollableContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
    
  }, [pathname]);

  return null;
}

