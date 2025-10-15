import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const mainContent = document.querySelector('main') || 
                        document.querySelector('.app-content-wrapper');
    
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
    
  }, [pathname]);

  return null;
}