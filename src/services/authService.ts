import { supabase } from './supabaseClient';

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = SignInPayload & {
  nom: string;
  avatar_url?: string;
};

export async function signIn({ email, password }: SignInPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return { data, error };
}

export async function signUp({ email, password, nom, avatar_url }: SignUpPayload) {
  const cleanEmail = email.trim();
  const cleanNom = nom.trim();
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        nom: cleanNom,
        avatar_url,
      },
    },
  });

  if (error) {
    return { data: null, error };
  }

  const userId = data.user?.id;

  if (userId) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      nom: cleanNom,
      avatar_url,
      est_actif: true,
    });

    if (profileError) {
      return {
        data,
        error: {
          message:
            'Compte Auth créé, mais le profil utilisateur n’a pas été enregistré. Vérifiez les policies RLS de la table profiles.',
        },
      };
    }
  }

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}
