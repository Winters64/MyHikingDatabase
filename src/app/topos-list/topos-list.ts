import { Component, inject, ViewChild } from '@angular/core';
import { SheetService } from '../services/gsheet';
import { Topo } from '../models/topo';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-topos-list',
  imports: [MatTableModule, MatChipsModule, MatSortModule ],
  templateUrl: './topos-list.html',
  styleUrl: './topos-list.scss'
})
export class ToposList {

  protected title = 'Liste des topos';
  private sheetService: SheetService = inject(SheetService);
  private initialToposList: Topo[] = [];
  dataSource = new MatTableDataSource<Topo>();
  displayedColumns: string[] = ['altitude', 'name', 'level', 'duration', 'elevation', 'kilometers', 'type', 'region', 'valley', 'panoramique', 'start'];
  protected valleys: string[] = []

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.sheetService.getToposSheetData().subscribe((res: any) => {
      this.initialToposList = [];
      for (let index = 1; index < res.values.length; index++) {
        if (res.values[index] && res.values[index].length >= 1) {
          this.valleys.push(res.values[index][8])
          this.initialToposList.push({
            id: index + 1,
            altitude: res.values[index][0],
            name: res.values[index][1],
            level: res.values[index][2],
            duration: res.values[index][3],
            elevation: res.values[index][4],
            kilometers: res.values[index][5],
            type: res.values[index][6],
            region: res.values[index][7],
            valley: res.values[index][8],
            panoramique: res.values[index][9],
            start: res.values[index][10],
          });
        } else {
          console.warn(`Skipping row ${index}: Data is incomplete or missing.`);
        }
      }
      this.valleys = Array.from(new Set(this.valleys));
      this.valleys.sort((a, b) => a.localeCompare(b));
      this.dataSource.data = this.initialToposList;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // // Tri personnalisé (exemple pour une colonne 'date' qui est une chaîne)
    // this.dataSource.sortingDataAccessor = (item: ElementData, header: string) => {
    //   switch (header) {
    //     case 'date': return new Date(item.date); // Convertir la chaîne en Date pour un tri correct
    //     case 'nom': return item.nom.toLowerCase(); // Ignorer la casse pour le tri des noms
    //     default: return (item as any)[header]; // Comportement par défaut pour les autres colonnes
    //   }
    // };
  }

   onValleyChange(event: MatChipListboxChange) {
    const valleySelected: string[] = event.value;
    if(valleySelected.length > 0) {
      const filteredTopos: Topo[] = this.initialToposList.filter(topo => {
        const hasValleys = valleySelected.some(s => s === topo.valley);
        return hasValleys;
      });
      this.dataSource.data = filteredTopos;
    } else{
      this.dataSource.data = this.initialToposList;
    }
  }

}
