import { supabase } from './supabaseClient';
import { Option, Sondage } from '../types';
import {
  addPrototypeSondage,
  closePrototypeSondage,
  getPrototypeSondage,
  listPrototypeSondages,
} from './prototypeStore';

export async function fetchSondages() {
  const prototypeSondages = listPrototypeSondages();

  try {
    const { data, error } = await supabase
      .from<Sondage>('sondage')
      .select('*, option(*)')
      .order('date_creation', { ascending: false });

    if (!error && data) {
      const supabaseIds = new Set(data.map((sondage) => sondage.id));
      const localOnlySondages = prototypeSondages.filter((sondage) => !supabaseIds.has(sondage.id));

      return {
        data: [...localOnlySondages, ...data],
        error: null,
        source: 'supabase' as const,
      };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  return { data: prototypeSondages, error: null, source: 'prototype' as const };
}

export async function fetchSondageById(id: string) {
  try {
    const { data, error } = await supabase
      .from<Sondage>('sondage')
      .select('*, option(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      return { data, error: null, source: 'supabase' as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  const data = getPrototypeSondage(id);
  return {
    data,
    error: data ? null : { message: 'Sondage introuvable.' },
    source: 'prototype' as const,
  };
}

export async function createSondage(
  sondage: Omit<Sondage, 'id' | 'date_creation' | 'est_actif'>,
  options: Omit<Option, 'id'>[]
) {
  const hasSupabaseAuthor = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    sondage.id_auteur
  );

  try {
    if (!hasSupabaseAuthor) {
      throw new Error('Connectez-vous avec un compte Supabase avant de publier dans la base de données.');
    }

    const { data: sondageData, error: sondageError } = await supabase
      .from('sondage')
      .insert([{ ...sondage, est_actif: true }])
      .select('id')
      .single();

    if (sondageError || !sondageData?.id) {
      throw sondageError ?? new Error('La création du sondage a échoué.');
    }

    const optionRows = options.map((option) => ({
      ...option,
      id_sondage: sondageData.id,
    }));

    const { data: optionData, error: optionError } = await supabase
      .from('option')
      .insert(optionRows);

    if (optionError) {
      throw optionError;
    }

    return { data: optionData, error: null, source: 'supabase' as const };
  } catch (error) {
    const localSondage = addPrototypeSondage(sondage, options);

    return {
      data: localSondage,
      error: null,
      source: 'prototype' as const,
      warning:
        error instanceof Error
          ? error.message
          : 'Le sondage a été créé localement, mais pas dans Supabase.',
    };
  }
}

export async function fermerSondage(id: string) {
  try {
    const { data, error } = await supabase
      .from('sondage')
      .update({
        est_actif: false,
        play: false,
        date_fermeture: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, option(*)')
      .single();

    if (!error && data) {
      return { data, error: null, source: 'supabase' as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  const data = closePrototypeSondage(id);
  return {
    data,
    error: data ? null : { message: 'Impossible de fermer ce sondage.' },
    source: 'prototype' as const,
  };
}
