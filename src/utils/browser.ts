import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { NavigationApp } from "@/constants/navigation";

/**
 * Abre um link no navegador externo no mobile (Capacitor)
 * ou em uma nova aba no desktop (Web).
 */
export const openBrowserLink = async (url: string) => {
  if (!url) return;

  try {
    if (Capacitor.isNativePlatform()) {
      // Melhoria para WhatsApp no Android/iOS:
      if (url.includes('wa.me/')) {
        const nativeUrl = url
          .replace('https://wa.me/', 'whatsapp://send?phone=')
          .replace('?text=', '&text=');

        window.location.href = nativeUrl;
        return;
      }

      await Browser.open({ url });
    } else {
      // Para Web/PWA, simular um clique em um link real
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Erro ao abrir link:', error);
    try {
      if (Capacitor.isNativePlatform()) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      window.location.href = url;
    }
  }
};

/**
 * Abre navegação GPS externa (Google Maps ou Waze) com fallbacks
 * inteligentes para Web (Desktop/Mobile) e App Nativo (Capacitor/Android).
 */
export const openExternalNavigation = (
  app: NavigationApp | "maps" | "waze",
  address: string,
  lat?: number,
  lng?: number
) => {
  if (!address && !lat && !lng) return;

  const isNative = Capacitor.isNativePlatform();
  let url = "";

  if (app === NavigationApp.GOOGLE_MAPS || app === "maps") {
    if (lat && lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
  } else if (app === NavigationApp.WAZE || app === "waze") {
    if (lat && lng) {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else {
      url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    }
  }

  if (!url) return;

  try {
    if (isNative) {
      // No App Nativo (Capacitor/Android), atribuir a window.location.href aciona a Intent nativa do sistema operacional
      window.location.href = url;
    } else {
      // No navegador Web/Mobile, simula clique em link com target _blank para evitar bloqueios de popup
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error("Erro ao abrir app de navegação:", err);
    window.open(url, "_blank", "noopener,noreferrer");
  }
};