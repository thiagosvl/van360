import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/services/queryClient";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_SESSION";

export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
}

export type Session = {
  access_token: string;
  refresh_token: string;
  user?: AuthUser | null;
} | null;

export type AuthListener = {
  subscription: {
    unsubscribe: () => void;
  };
};

class SessionManager {
  private listeners: ((event: AuthChangeEvent, session: Session) => void)[] = [];
  private currentSession: Session = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    // We only store the tokens. User details are fetched via /me/profile usually.
    // Ideally we might store user basic info too if needed.
    // For now, let's look for what the Login saves.
    // The previous implementation used supabase.auth.setSession which auto-persisted.
    // We need to persist manually now.
    
    // NOTE: Supabase client uses a specific key format. We will switch to a simple key.
    const stored = localStorage.getItem("van360_auth_session");
    if (stored) {
      try {
        this.currentSession = JSON.parse(stored);
        // Sync with Supabase Client (for Realtime)
        if (this.currentSession) {
             supabase.auth.setSession({
                 access_token: this.currentSession.access_token,
                 refresh_token: this.currentSession.refresh_token
             }).catch(() => {/* Ignore errors dealing with supabase internally */});
        }
      } catch (e) {
        this.currentSession = null;
      }
    }
  }

  async getSession(): Promise<{ data: { session: Session } }> {
    return { data: { session: this.currentSession } };
  }

  async setSession(access_token: string, refresh_token: string, user: AuthUser | null = null) {
    const newSession = { access_token, refresh_token, user };
    this.currentSession = newSession;
    localStorage.setItem("van360_auth_session", JSON.stringify(newSession));
    
    // Sync with Supabase Client (for Realtime)
    await supabase.auth.setSession({ access_token, refresh_token });

    // Defer notification to next tick to ensure storage is committed and stack is clear
    setTimeout(() => {
        this.notifyListeners("SIGNED_IN", newSession);
    }, 0);
    
    return { error: null };
  }

  private refreshPromise: Promise<{ success: boolean }> | null = null;

  async refreshToken(): Promise<{ success: boolean }> {
    if (this.refreshPromise) return this.refreshPromise;

    if (!this.currentSession?.refresh_token) return { success: false };

    this.refreshPromise = (async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: this.currentSession?.refresh_token }), // Use conditional access just in case
          });

          if (!response.ok) {
            return { success: false };
          }

          const data = await response.json();
          // Update session locally
          await this.setSession(data.access_token, data.refresh_token, data.user);
          return { success: true };
        } catch (err) {
          return { success: false };
        } finally {
            this.refreshPromise = null;
        }
    })();

    return this.refreshPromise;
  }

  async signOut() {
    this.currentSession = null;
    localStorage.removeItem("van360_auth_session");
    clearAppSession(); // Clears other app keys
    
    // Clear React Query cache to remove any stale user data (profiles, etc)
    // This prevents components from remounting with old/error data immediately after login
    queryClient.clear();
    
    // Sync with Supabase Client
    await supabase.auth.signOut();

    this.notifyListeners("SIGNED_OUT", null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session) => void): { data: AuthListener } {
    this.listeners.push(callback);
    // Emit initial event immediately
    callback("INITIAL_SESSION", this.currentSession);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }

  private notifyListeners(event: AuthChangeEvent, session: Session) {
    this.listeners.forEach(cb => cb(event, session));
  }
}

export const sessionManager = new SessionManager();
