import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  normalizeString(str: string): string {
    // 1. Convertir en minuscules pour ignorer la casse
    // 2. Normaliser la chaîne en forme de décomposition canonique (séparant les caractères de leurs diacritiques)
    // 3. Supprimer tous les caractères Unicode de la catégorie "Mark" (M), qui sont les diacritiques.
    // 4. Remplacer les ligatures ou caractères spéciaux qui ne seraient pas gérés par normalize (comme œ, æ) si nécessaire.
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques
      .replace(/oe/g, "oe") // Gère spécifiquement 'œ'
      .replace(/ae/g, "ae"); // Gère spécifiquement 'æ'
      // Vous pouvez ajouter d'autres remplacements spécifiques si votre jeu de caractères l'exige
  }

}
