// sheet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Topo } from '../models/topo';
import { UtilsService } from '../services/utils'

@Injectable({ providedIn: 'root' })
export class SheetService {
  private apiKey = 'AIzaSyA-CWFxmHUOL0nTwmUyTShDyVH6jrsQLPA';
  private sheetId = '1GcSPjk_WgQ_0qaVH-aejVUmsfhu9z5Px65Y0bGEgZpQ';
  private toposRange = 'Topos!A:L'; //Topos
  private utilsService: UtilsService = inject(UtilsService);

  constructor(private http: HttpClient) {}

  getToposSheetData(): Observable<any> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.toposRange}?key=${this.apiKey}`;
    console.log(url);
    return this.http.get(url);
  }

  getToposSheetFormatedData(): Observable<Topo[]> {
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}` +
                   `?ranges=${this.toposRange}` +
                   `&fields=sheets(data(rowData(values(formattedValue,hyperlink))))` +
                   `&key=${this.apiKey}`;
    
    // Effectue la requête HTTP GET
    return this.http.get<any>(apiUrl).pipe(
      // Utilise l'opérateur 'map' de RxJS pour transformer la réponse brute de l'API
      map(response => {
        let oneTopos: any = {};
        const topos: Topo[] = [];
        let indice: number = 0;
        for (let index = 0; index < response.sheets.length; index++) {
          const data = response.sheets[index].data;
          for (let index2 = 0; index2 < data.length; index2++) {
            const rowData = data[index2].rowData;
            for (let index3 = 1; index3 < rowData.length; index3++) {
              const values = rowData[index3].values;
              oneTopos.id = index3;
              for (let index4 = 0; index4 < values.length; index4++) {
                const cell = values[index4];
                //ALTITUDE 	RANDONNÉES	NIVEAUX	TEMPS	DÉNIVELÉ	KILOMÈTRES	TYPE	RÉGIONS	VALLÉES	PANORAMIQUE 	DÉPART	FAIT
                switch (index4) {
                  case 0: oneTopos.altitude = cell.formattedValue.replace(".",""); break;
                  case 1: 
                    oneTopos.name = cell.formattedValue;
                    oneTopos.link = cell.hyperlink || ''
                    break;
                  case 2: oneTopos.level = cell.formattedValue; break;
                  case 3: oneTopos.duration = this.utilsService.convertTimeToMinutes(cell.formattedValue); break;
                  case 4: oneTopos.elevation = cell.formattedValue.replace(".",""); break;
                  case 5: oneTopos.kilometers = cell.formattedValue; break;
                  case 6: oneTopos.type = cell.formattedValue; break;
                  case 7: oneTopos.region = cell.formattedValue; break;
                  case 8: oneTopos.valley = cell.formattedValue; break;
                  case 9: oneTopos.panoramique = cell.formattedValue; break;
                  case 10: oneTopos.start = cell.formattedValue; break;
                  case 11: oneTopos.done = cell.formattedValue; break;
                  default:
                    break;
                }
              }
              topos.push(oneTopos);
              oneTopos = {};       
            }
          }
        }
        //console.log(topos);
        return topos; // Retourne le tableau d'objets LinkData
      })
    );

  }

}

