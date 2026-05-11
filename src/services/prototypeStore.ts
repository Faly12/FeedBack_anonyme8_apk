import { Option, Participation, Sondage, Vote } from '../types';

const AUTHOR_ID = 'prototype-admin';

const sondages: Sondage[] = [
  {
    id: 'sondage-1',
    titre: 'Ambiance de la classe',
    description: 'Exprimez anonymement votre ressenti sur le climat de travail cette semaine.',
    date_creation: '2026-05-06T09:00:00.000Z',
    date_fermeture: '2026-05-15T18:00:00.000Z',
    est_actif: true,
    est_public: true,
    passkey: null,
    id_auteur: AUTHOR_ID,
    max_choix: 1,
    type_vote: 'unique',
    play: true,
    option: [
      { id: 'option-1', libelle: 'Très positif', id_sondage: 'sondage-1', ordre_affichage: 1 },
      { id: 'option-2', libelle: 'Correct', id_sondage: 'sondage-1', ordre_affichage: 2 },
      { id: 'option-3', libelle: 'À améliorer', id_sondage: 'sondage-1', ordre_affichage: 3 },
    ],
  },
  {
    id: 'sondage-2',
    titre: 'Choix du prochain atelier',
    description: 'Votez pour le thème que vous voulez traiter au prochain atelier pratique.',
    date_creation: '2026-05-07T14:30:00.000Z',
    date_fermeture: null,
    est_actif: true,
    est_public: true,
    passkey: 'atelier2026',
    id_auteur: AUTHOR_ID,
    max_choix: 1,
    type_vote: 'unique',
    play: true,
    option: [
      { id: 'option-4', libelle: 'Sécurité mobile', id_sondage: 'sondage-2', ordre_affichage: 1 },
      { id: 'option-5', libelle: 'Design UI/UX', id_sondage: 'sondage-2', ordre_affichage: 2 },
      { id: 'option-6', libelle: 'Backend Supabase', id_sondage: 'sondage-2', ordre_affichage: 3 },
    ],
  },
  {
    id: 'sondage-3',
    titre: 'Sondage clôturé',
    description: 'Exemple de sondage terminé pour consulter uniquement les résultats.',
    date_creation: '2026-05-01T10:00:00.000Z',
    date_fermeture: '2026-05-05T18:00:00.000Z',
    est_actif: false,
    est_public: true,
    passkey: null,
    id_auteur: AUTHOR_ID,
    max_choix: 1,
    type_vote: 'unique',
    play: false,
    option: [
      { id: 'option-7', libelle: 'Option A', id_sondage: 'sondage-3', ordre_affichage: 1 },
      { id: 'option-8', libelle: 'Option B', id_sondage: 'sondage-3', ordre_affichage: 2 },
    ],
  },
];

const votes: Vote[] = [
  { id: 'vote-1', id_sondage: 'sondage-1', id_option: 'option-1', jeton_anonyme: 'anon-a' },
  { id: 'vote-2', id_sondage: 'sondage-1', id_option: 'option-1', jeton_anonyme: 'anon-b' },
  { id: 'vote-3', id_sondage: 'sondage-1', id_option: 'option-2', jeton_anonyme: 'anon-c' },
  { id: 'vote-4', id_sondage: 'sondage-2', id_option: 'option-6', jeton_anonyme: 'anon-d' },
  { id: 'vote-5', id_sondage: 'sondage-2', id_option: 'option-5', jeton_anonyme: 'anon-e' },
  { id: 'vote-6', id_sondage: 'sondage-3', id_option: 'option-8', jeton_anonyme: 'anon-f' },
];

const participations: Participation[] = [];

function cloneSondage(sondage: Sondage): Sondage {
  return {
    ...sondage,
    option: [...(sondage.option ?? [])].sort((a, b) => a.ordre_affichage - b.ordre_affichage),
  };
}

export function listPrototypeSondages() {
  return sondages
    .filter((sondage) => sondage.est_public)
    .sort((a, b) => (b.date_creation ?? '').localeCompare(a.date_creation ?? ''))
    .map(cloneSondage);
}

export function getPrototypeSondage(id: string) {
  const sondage = sondages.find((item) => item.id === id);
  return sondage ? cloneSondage(sondage) : null;
}

export function addPrototypeSondage(
  sondage: Omit<Sondage, 'id' | 'date_creation' | 'est_actif'>,
  options: Omit<Option, 'id'>[]
) {
  const id = `sondage-${Date.now()}`;
  const newSondage: Sondage = {
    ...sondage,
    id,
    date_creation: new Date().toISOString(),
    est_actif: true,
    option: options.map((option, index) => ({
      ...option,
      id: `option-${Date.now()}-${index}`,
      id_sondage: id,
    })),
  };

  sondages.unshift(newSondage);
  return cloneSondage(newSondage);
}

export function closePrototypeSondage(id: string) {
  const sondage = sondages.find((item) => item.id === id);

  if (!sondage) {
    return null;
  }

  sondage.est_actif = false;
  sondage.play = false;
  sondage.date_fermeture = new Date().toISOString();
  return cloneSondage(sondage);
}

export function addPrototypeVote(id_sondage: string, id_option: string, jeton_anonyme: string) {
  votes.push({
    id: `vote-${Date.now()}`,
    id_sondage,
    id_option,
    jeton_anonyme,
    date_vote: new Date().toISOString(),
  });
}

export function addPrototypeParticipation(
  id_utilisateur: string,
  id_sondage: string,
  jeton_anonyme: string
) {
  participations.push({
    id: `participation-${Date.now()}`,
    id_utilisateur,
    id_sondage,
    jeton_anonyme,
    date_participation: new Date().toISOString(),
  });
}

export function countPrototypeVotes(id_sondage: string) {
  return votes
    .filter((vote) => vote.id_sondage === id_sondage)
    .reduce<Record<string, number>>((acc, vote) => {
      acc[vote.id_option] = (acc[vote.id_option] || 0) + 1;
      return acc;
    }, {});
}
