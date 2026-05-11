import { supabase } from './supabaseClient';
import { Vote } from '../types';
import {
  addPrototypeParticipation,
  addPrototypeVote,
  countPrototypeVotes,
} from './prototypeStore';

export async function submitVote(
  id_sondage: string,
  id_option: string,
  jeton_anonyme: string
) {
  try {
    const { data, error } = await supabase.from<Vote>('vote').insert([
      {
        id_sondage,
        id_option,
        jeton_anonyme,
      },
    ]);

    if (!error) {
      return { data, error: null, source: 'supabase' as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  addPrototypeVote(id_sondage, id_option, jeton_anonyme);
  return { data: null, error: null, source: 'prototype' as const };
}

export async function createParticipation(
  id_utilisateur: string,
  id_sondage: string,
  jeton_anonyme: string
) {
  try {
    const { data, error } = await supabase.from('participation').insert([
      {
        id_utilisateur,
        id_sondage,
        jeton_anonyme,
      },
    ]);

    if (!error) {
      return { data, error: null, source: 'supabase' as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  addPrototypeParticipation(id_utilisateur, id_sondage, jeton_anonyme);
  return { data: null, error: null, source: 'prototype' as const };
}

export async function fetchResults(id_sondage: string) {
  try {
    const { data, error } = await supabase.from<Vote>('vote').select('*').eq('id_sondage', id_sondage);

    if (!error && data?.length) {
      const counts = data.reduce<Record<string, number>>((acc, vote) => {
        acc[vote.id_option] = (acc[vote.id_option] || 0) + 1;
        return acc;
      }, {});

      return { data: counts, error: null, source: 'supabase' as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  return { data: countPrototypeVotes(id_sondage), error: null, source: 'prototype' as const };
}
