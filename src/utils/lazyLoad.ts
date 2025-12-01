import { lazy } from "react";

/**
 * Wrapper around React.lazy to handle chunk load errors.
 * If a dynamic import fails (e.g., due to a new deployment invalidating old chunks),
 * this will automatically reload the page once to fetch the new version.
 */
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await importFunc();
    } catch (error: any) {
      console.error("Lazy load error:", error);
      
      // Check for common chunk load errors
      const isChunkError = 
        error.message?.includes("Failed to fetch dynamically imported module") ||
        error.message?.includes("Importing a module script failed") ||
        error.name === "ChunkLoadError" ||
        error.message?.includes("loading chunk");

      if (isChunkError) {
        const storageKey = "lazy_reload_lock";
        const lastReload = sessionStorage.getItem(storageKey);
        const now = Date.now();

        // If we reloaded less than 10 seconds ago, don't reload again to avoid infinite loop
        if (lastReload && now - parseInt(lastReload) < 10000) {
          console.error("Reload loop detected, stopping reload.");
          throw error;
        }

        sessionStorage.setItem(storageKey, now.toString());
        window.location.reload();
        
        // Return a promise that never resolves while we reload
        return new Promise(() => {});
      }

      throw error;
    }
  });
};
