import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addPrototypeParticipation,
  addPrototypeVote,
  countPrototypeVotes,
  hasPrototypeParticipation,
} from "./prototypeStore";
import { supabase } from "./supabaseClient";

const VOTED_SURVEYS_STORAGE_KEY = "@feedback-anonyme-voted-surveys";

async function getOfflineVotedSurveys(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(VOTED_SURVEYS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function markSurveyAsVotedOffline(id_sondage: string) {
  try {
    const current = await getOfflineVotedSurveys();
    const updated = Array.from(new Set([...current, id_sondage]));
    await AsyncStorage.setItem(
      VOTED_SURVEYS_STORAGE_KEY,
      JSON.stringify(updated),
    );
  } catch {
    // ignore write failures
  }
}

async function hasAlreadyVotedOffline(id_sondage: string) {
  const current = await getOfflineVotedSurveys();
  return current.includes(id_sondage);
}

export async function hasAlreadyVoted(
  id_sondage: string,
  id_utilisateur?: string,
) {
  if (id_utilisateur) {
    try {
      const { data, error } = await supabase
        .from("participation")
        .select("id")
        .eq("id_utilisateur", id_utilisateur)
        .eq("id_sondage", id_sondage)
        .limit(1);

      if (!error && data && data.length > 0) {
        return true;
      }
    } catch {
      // ignore Supabase read failures for offline fallback
    }

    if (hasPrototypeParticipation(id_utilisateur, id_sondage)) {
      return true;
    }
  }

  return await hasAlreadyVotedOffline(id_sondage);
}

export async function submitVote(
  id_sondage: string,
  id_option: string,
  jeton_anonyme: string,
  id_utilisateur?: string,
) {
  if (await hasAlreadyVoted(id_sondage, id_utilisateur)) {
    return {
      data: null,
      error: new Error("Vous avez déjà participé à ce sondage."),
      source: "local" as const,
    };
  }

  try {
    const { data, error } = await supabase.from("vote").insert([
      {
        id_sondage,
        id_option,
        jeton_anonyme,
      },
    ]);

    if (!error) {
      if (id_utilisateur) {
        const participation = await createParticipation(
          id_utilisateur,
          id_sondage,
          jeton_anonyme,
        );

        if (participation.error) {
          return {
            data: null,
            error: participation.error,
            source: "supabase" as const,
          };
        }
      }

      await markSurveyAsVotedOffline(id_sondage);
      return { data, error: null, source: "supabase" as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  addPrototypeVote(id_sondage, id_option, jeton_anonyme);

  if (id_utilisateur) {
    await createParticipation(id_utilisateur, id_sondage, jeton_anonyme);
  }

  await markSurveyAsVotedOffline(id_sondage);
  return { data: null, error: null, source: "prototype" as const };
}

export async function createParticipation(
  id_utilisateur: string,
  id_sondage: string,
  jeton_anonyme: string,
) {
  try {
    const { data, error } = await supabase.from("participation").insert([
      {
        id_utilisateur,
        id_sondage,
        jeton_anonyme,
      },
    ]);

    if (!error) {
      return { data, error: null, source: "supabase" as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  addPrototypeParticipation(id_utilisateur, id_sondage, jeton_anonyme);
  return { data: null, error: null, source: "prototype" as const };
}

export async function fetchResults(id_sondage: string) {
  try {
    const { data, error } = await supabase
      .from("vote")
      .select("*")
      .eq("id_sondage", id_sondage);

    if (!error && data?.length) {
      const counts = data.reduce<Record<string, number>>((acc, vote) => {
        acc[vote.id_option] = (acc[vote.id_option] || 0) + 1;
        return acc;
      }, {});

      return { data: counts, error: null, source: "supabase" as const };
    }
  } catch {
    // Le prototype reste utilisable sans connexion Supabase.
  }

  return {
    data: countPrototypeVotes(id_sondage),
    error: null,
    source: "prototype" as const,
  };
}
