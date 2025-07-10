import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeConverter'
})
export class TimeConverterPipe implements PipeTransform {

  /**
   * Convertit une durée totale (en minutes) depuis une chaîne ou un nombre
   * vers un format "Jours Hh Mm".
   * N'affiche pas les unités (jours, heures, minutes) si leur valeur est zéro,
   * sauf si la durée totale est exactement 0 (affiche alors "0m").
   *
   * @param value La durée totale en minutes, sous forme de chaîne, nombre, null ou undefined.
   * @returns Une chaîne de caractères formatée (ex: "1j 2h", "1h 5m", "25m", "0m")
   * ou une chaîne vide si l'entrée est invalide ou ne peut pas être parsée.
   */
  transform(value: string | number | null | undefined): string {
    let totalMinutes: number;

    // --- Étape 1 : Analyser la valeur d'entrée en un nombre ---
    if (typeof value === 'string') {
      totalMinutes = Number(value);
    } else if (typeof value === 'number') {
      totalMinutes = value;
    } else {
      // Gère les entrées null ou undefined directement
      return '';
    }

    // --- Étape 2 : Valider le nombre analysé ---
    // Vérifie si c'est NaN (résultat d'une conversion de chaîne invalide) ou un nombre négatif.
    if (isNaN(totalMinutes) || totalMinutes < 0) {
      return ''; // Retourne une chaîne vide pour les entrées numériques invalides
    }

    // --- Étape 3 : Effectuer la logique de conversion ---
    // Cas spécial pour zéro minutes : affiche "0m"
    if (totalMinutes === 0) {
      return '0m';
    }

    const minutesInHour = 60;
    const minutesInDay = 24 * minutesInHour; // 1440 minutes par jour

    const days = Math.floor(totalMinutes / minutesInDay);
    let remainingMinutes = totalMinutes % minutesInDay;

    const hours = Math.floor(remainingMinutes / minutesInHour);
    remainingMinutes %= minutesInHour;

    const minutes = remainingMinutes;

    const resultParts: string[] = [];

    // Ajoute les jours si > 0
    if (days > 0) {
      if (days > 1) {
        resultParts.push(`${days} jours`);
      }else{
        resultParts.push(`${days} jour`);
      }
    }

    // Ajoute les heures si > 0
    if (hours > 0) {
      resultParts.push(`${hours} h`);
    }

    // Ajoute les minutes si > 0
    // Cette condition est la clé : les minutes ne s'affichent PLUS si elles sont 0,
    // même s'il y a des jours ou des heures.
    // Cependant, si la durée totale est par exemple 25 minutes (days=0, hours=0, minutes=25),
    // nous voulons bien afficher "25m". C'est pourquoi la condition est "minutes > 0 OU (days === 0 && hours === 0)".
    if (minutes > 0 || (days === 0 && hours === 0)) {
      resultParts.push(`${minutes} min`);
    }

    // Si resultParts est vide (cela ne devrait arriver que si l'entrée est 0, géré plus haut,
    // ou si days, hours et minutes sont tous 0, ce qui est le cas de 0 minute),
    // retourne '0m' ou une chaîne vide selon la préférence.
    // Ici, le cas 0 minute est déjà géré, donc si nous arrivons ici, resultParts ne devrait pas être vide
    // pour des totalMinutes > 0.
    return resultParts.join(' ').trim();
  }

}