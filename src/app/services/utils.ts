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

  convertTimeToMinutes(timeString: string): number {
    if (!timeString) {
      return 0;
    }

    let totalMinutes = 0;

    // Convertir la chaîne en minuscules et supprimer les espaces multiples et trim
    const cleanedTimeString = timeString.toLowerCase().replace(/\s+/g, ' ').trim();

    // --- PARTIE 1: EXTRAIRE LES JOURS ---
    // Recherche le motif "X j" ou "X jour(s)" au début de la chaîne
    const daysMatch = cleanedTimeString.match(/^(\d+)\s*(jour(s)?|j)\s*/);
    let remainingTimeString = cleanedTimeString; // Ce qui reste après extraction des jours

    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      if (days < 0) { // Valider que les jours ne sont pas négatifs
          console.warn(`Nombre de jours invalide: "${timeString}"`);
          return 0;
      }
      totalMinutes += days * 24 * 60; // 1 jour = 24 heures * 60 minutes
      remainingTimeString = cleanedTimeString.substring(daysMatch[0].length).trim(); // Le reste de la chaîne
    }

    // --- PARTIE 2: EXTRAIRE LES HEURES ET MINUTES (logique existante, adaptée) ---
    // Si la chaîne restante est vide après les jours (ex: "1 jour"), on retourne les minutes des jours.
    if (!remainingTimeString) {
      return totalMinutes;
    }

    // Recherche le motif "HHhMM", "HH:MM", "HHh", "HH", "MM"
    // Note: cette regex est plus permissive, elle cherche Heures et Minutes
    const timeMatch = remainingTimeString.match(/^(\d{1,2})(?:h|:)?(\d{0,2})$|^(\d{1,2})$/);
    // Explication de la regex:
    // ^(\d{1,2})(?:h|:)?(\d{0,2})$  ->  (HH)(h ou :)?(MM)
    // |                            -> OU
    // ^(\d{1,2})$                  -> (HH) si seulement des heures sont données

    if (timeMatch) {
      let hours = 0;
      let minutes = 0;

      if (timeMatch[1]) { // Cas où le format HHhMM ou HH:MM est matché
        hours = parseInt(timeMatch[1], 10);
        minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      } else if (timeMatch[3]) { // Cas où seulement HH est matché
        hours = parseInt(timeMatch[3], 10);
      }

      // Validation basique des plages d'heures et minutes
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        totalMinutes += (hours * 60) + minutes;
        return totalMinutes;
      }
    }

    // Si on arrive ici, c'est que le format est invalide ou qu'il reste du texte non parsé
    console.warn(`Format de temps invalide ou résidu non parsé: "${timeString}". Reste: "${remainingTimeString}"`);
    return 0;
  }

}
