// sheet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SheetService {
  private apiKey = 'AIzaSyA-CWFxmHUOL0nTwmUyTShDyVH6jrsQLPA';
  private sheetId = '1GcSPjk_WgQ_0qaVH-aejVUmsfhu9z5Px65Y0bGEgZpQ';
  private hikesRange = 'Sommets!A1:I86'; //Mes randonnées
  private toposRange = 'Topos!A:M'; //Topos

  constructor(private http: HttpClient) {}

  getSheetData(): Observable<any> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.hikesRange}?key=${this.apiKey}`;
    console.log(url);
    return this.http.get(url);
  }

  getToposSheetData(): Observable<any> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.toposRange}?key=${this.apiKey}`;
    console.log(url);
    return this.http.get(url);
  }

}
