import { useCallback } from "react";
import { getPersonDetails, getPersonDetailsInEnglish } from "../services/tmdb";
import type { PersonDetails } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

export interface PersonProfile extends PersonDetails {
  /** A biografia veio em inglês porque o TMDB não tem a versão em português. */
  biographyInEnglish: boolean;
}

/**
 * Perfil com filmografia, fotos e perfis oficiais. Quando não há biografia em português,
 * busca a versão em inglês; se essa segunda consulta falhar, o perfil aparece sem biografia.
 */
export async function loadPerson(id: number | string, signal: AbortSignal): Promise<PersonProfile> {
  const person = await getPersonDetails(id, { signal });
  if (person.biography?.trim()) return { ...person, biographyInEnglish: false };

  try {
    const english = await getPersonDetailsInEnglish(id, { signal });
    const biography = english.biography?.trim() ?? "";
    return { ...person, biography, biographyInEnglish: biography !== "" };
  } catch (error) {
    if (signal.aborted) throw error;
    return { ...person, biography: "", biographyInEnglish: false };
  }
}

export function usePerson(id: number | string): AsyncState<PersonProfile> {
  const loader = useCallback((signal: AbortSignal) => loadPerson(id, signal), [id]);
  return useAsync(loader);
}
