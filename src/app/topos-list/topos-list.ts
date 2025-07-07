import { Component, inject, ViewChild } from '@angular/core';
import { SheetService } from '../services/gsheet';
import { Topo } from '../models/topo';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topos-list',
  imports: [MatTableModule, MatChipsModule, MatSortModule, MatIconModule, MatPaginator, MatFormFieldModule, MatSliderModule, FormsModule],
  templateUrl: './topos-list.html',
  styleUrl: './topos-list.scss'
})
export class ToposList {

  protected title = 'Liste des topos';
  private sheetService: SheetService = inject(SheetService);
  private initialToposList: Topo[] = [];
  dataSource = new MatTableDataSource<Topo>();
  displayedColumns: string[] = ['altitude', 'name', 'level', 'duration', 'elevation', 'kilometers', 'type', 'region', 'valley', 'panoramique', 'start', 'link'];
  
  //Champs pour la recherche
  protected valleys: string[] = []
  protected levels: string[] = []
  protected maxAltitude: number = 0;
  protected maxElevation: number = 0;
  selectedValleys: string[] = [];
  selectedLevels: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.sheetService.getToposSheetData().subscribe((res: any) => {
      this.initialToposList = [];
      for (let index = 1; index < res.values.length; index++) {
        if (res.values[index] && res.values[index].length >= 1) {
          this.valleys.push(res.values[index][8])
          this.levels.push(res.values[index][2])
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
            link: res.values[index][11],
          });
        } else {
          console.warn(`Skipping row ${index}: Data is incomplete or missing.`);
        }
      }

      //Initial valleys list
      this.valleys = Array.from(new Set(this.valleys));
      this.valleys.sort((a, b) => a.localeCompare(b));

      //Initial levels list
      this.levels = Array.from(new Set(this.levels));
      this.levels.sort((a, b) => a.localeCompare(b));

      //Initial max altitude list
      const maxAltitudeTopo = this.initialToposList.reduce((prev, current) => {
        return (Number(prev.altitude) > Number(current.altitude)) ? prev : current;
      });
      this.maxAltitude = Number(maxAltitudeTopo.altitude);
      if (Math.abs(this.maxAltitude) % 500 !== 0){
        this.maxAltitude += 500;
      }

      //Initial max elevation list
      const maxElevationTopo = this.initialToposList.reduce((prev, current) => {
        return (Number(prev.elevation) > Number(current.elevation)) ? prev : current;
      });
      this.maxElevation = Number(maxElevationTopo.elevation);
      if (Math.abs(this.maxElevation) % 500 !== 0){
        this.maxElevation += 500;
      }

      //Initial topo lis data source
      this.dataSource.data = this.initialToposList;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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

  // --- Gestion des changements de filtre ---
  onValleyChange(event: MatChipListboxChange): void {
    this.selectedValleys = event.value;
    console.log('Vallées sélectionnées:', this.selectedValleys);
    this.applyAllFilters();
  }

  onLevelChange(event: MatChipListboxChange): void {
    this.selectedLevels = event.value;
    console.log('Niveaux sélectionnés:', this.selectedValleys);
    this.applyAllFilters();
  }

  // --- Logique d'application des filtres croisés ---
  applyAllFilters(): void {
    //On remet tous les enregistrements initiaux
    let tempFilteredData = [...this.initialToposList];
    // Appliquer le filtre par Vallée si des vallées sont sélectionnées
    if (this.selectedValleys.length > 0) {
      tempFilteredData = tempFilteredData.filter(product =>
        this.selectedValleys.includes(product.valley)
      );
    }
    // Appliquer le filtre par Niveau si des niveaux sont sélectionnées
    if (this.selectedLevels.length > 0) {
      tempFilteredData = tempFilteredData.filter(product =>
        this.selectedLevels.includes(product.level)
      );
    }
    // Mettre à jour le tableau affiché
    this.dataSource.data = tempFilteredData;
    console.log('Données filtrées:', this.dataSource.data.length, 'éléments');
    //On se repositionne à  la page 1
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  onAltitudeChange(startValue: string, endValue: string){
    const filteredTopos: Topo[] = this.initialToposList.filter(topo => {
      const startOK = topo.altitude >= Number(startValue);
      const endOK = topo.altitude <= Number(endValue);
      return startOK && endOK;
    });
    this.dataSource.data = filteredTopos;
  }

  onElevationChange(startValue: string, endValue: string){
    const filteredTopos: Topo[] = this.initialToposList.filter(topo => {
      const startOK = topo.elevation >= Number(startValue);
      const endOK = topo.elevation <= Number(endValue);
      return startOK && endOK;
    });
    this.dataSource.data = filteredTopos;
  }

}
