export type Option = {
  label: ReactNode;
  id: string;
  libelle: string;
  id_sondage: string;
  ordre_affichage: number;
};

export type Sondage = {
  id: string;
  titre: string;
  description?: string | null;
  date_creation?: string;
  date_fermeture?: string | null;
  est_actif?: boolean;
  est_public?: boolean;
  passkey?: string | null;
  id_auteur: string;
  max_choix?: number;
  type_vote?: string;
  play?: boolean;
  option?: Option[];
};

export type Vote = {
  id: string;
  id_option: string;
  id_sondage: string;
  jeton_anonyme: string;
  date_vote?: string;
};

export type Participation = {
  id: string;
  id_utilisateur: string;
  id_sondage: string;
  jeton_anonyme: string;
  date_participation?: string;
};

export type Profile = {
  id: string;
  nom: string;
  avatar_url?: string | null;
  date_inscription?: string;
  est_actif?: boolean;
};
