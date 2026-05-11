import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const offlinePrototypeUser = {
  id: 'prototype-admin',
  email: 'admin.prototype@feedback.local',
  user_metadata: {
    nom: 'Auteur du sondage',
  },
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
      } catch {
        setUser(offlinePrototypeUser);
      }
      setLoading(false);
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
