import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useSession } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

export const SupabaseContext = createContext(null);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SupabaseProvider = ({ children }) => {
  const { session } = useSession();
  
  // Create a single, stable client instance
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase Client: Missing URL or Anon Key. Fallback to null.");
      return null;
    }
    return createClient(supabaseUrl, supabaseKey);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const updateClientSession = async () => {
      if (session) {
        try {
          const token = await session.getToken({ template: "supabase" });
          if (token) {
            // Update auth headers dynamically for Rest & Realtime clients
            supabase.realtime.setAuth(token);
            supabase.rest.headers = {
              ...supabase.rest.headers,
              Authorization: `Bearer ${token}`,
            };
            console.log("Supabase Client: Clerk JWT token injected successfully.");
          }
        } catch (error) {
          console.error("Error setting dynamic Supabase auth token:", error);
        }
      } else {
        // Fallback to anonymous access if no session is active (e.g. signed out)
        delete supabase.rest.headers["Authorization"];
        console.log("Supabase Client: Cleared auth header (Fallback to Anon).");
      }
    };

    if (session !== undefined) {
      updateClientSession();
    }
  }, [session, supabase]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseClient = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseClient must be used within a SupabaseProvider");
  }
  return context;
};
