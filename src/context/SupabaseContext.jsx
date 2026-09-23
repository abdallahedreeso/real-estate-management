import { createContext, useContext, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { useSession } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

export const SupabaseContext = createContext(null);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SupabaseProvider = ({ children }) => {
  const { session } = useSession();
  const sessionRef = useRef(session);
  sessionRef.current = session;
  
  // Create a single, stable client instance
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase Client: Missing URL or Anon Key. Fallback to null.");
      return null;
    }
    return createClient(supabaseUrl, supabaseKey, {
      accessToken: async () => sessionRef.current?.getToken({ template: "supabase" }) ?? null,
    });
  }, []);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};
SupabaseProvider.propTypes = { children: PropTypes.node };

export const useSupabaseClient = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseClient must be used within a SupabaseProvider");
  }
  return context;
};
