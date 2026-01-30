import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/services/queryClient";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import { Session as SupabaseSession } from "@supabase/supabase-js";

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_SESSION" | "TOKEN_REFRESHED" | "USER_UPDATED" | "PASSWORD_RECOVERY";

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
  private currentSession: Session = null;

  constructor() {
    // Initial load from Supabase client
    supabase.auth.getSession().then(({ data }) => {
      this.currentSession = this.mapSupabaseSession(data.session);
    });

    // Subscribe to Supabase auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentSession = this.mapSupabaseSession(session);
      
      if (event === 'SIGNED_OUT') {
        clearAppSession();
        queryClient.clear();
      }
    });
  }

  private mapSupabaseSession(session: SupabaseSession | null): Session {
    if (!session) return null;
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user ? {
        id: session.user.id,
        email: session.user.email,
        ...session.user.user_metadata
      } : null
    };
  }

  async getSession(): Promise<{ data: { session: Session } }> {
    const { data } = await supabase.auth.getSession();
    return { data: { session: this.mapSupabaseSession(data.session) } };
  }

  // Deprecated: Login should use supabase.auth.signInWith... directly, 
  // but keeping for compatibility if customized login flow uses it.
  async setSession(access_token: string, refresh_token: string, user: AuthUser | null = null) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    return { error };
  }

  async refreshToken(): Promise<{ success: boolean }> {
    // Supabase handles auto-refresh. 
    // If manual refresh is absolutely needed, we can try getting the session which refreshes if needed.
    const { data, error } = await supabase.auth.getSession();
    return { success: !error && !!data.session };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session) => void): { data: AuthListener } {
    // We proxy the supabase listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const mappedSession = this.mapSupabaseSession(session);
      // Map Supabase events to valid AuthChangeEvent if strictly typed
      const mappedEvent = event as AuthChangeEvent; 
      callback(mappedEvent, mappedSession);
    });
    
    // We rely on Supabase's native INITIAL_SESSION event which is fired immediately 
    // upon subscription with the current session state.

    return {
      data: {
        subscription
      }
    };
  }
}

export const sessionManager = new SessionManager();

