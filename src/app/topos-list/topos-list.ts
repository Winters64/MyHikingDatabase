import { Component, inject, ViewChild} from '@angular/core';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { UtilsService } from '../services/utils'
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-topos-list',
  imports: [MatTableModule, MatChipsModule, MatSortModule, MatIconModule, MatPaginator, MatFormFieldModule, MatSliderModule, FormsModule, MatExpansionModule, MatInputModule, CommonModule, MatButtonToggleModule],
  templateUrl: './topos-list.html',
  styleUrl: './topos-list.scss'
})
export class ToposList {

  protected title = 'Liste des topos';
  private sheetService: SheetService = inject(SheetService);
  private utilsService: UtilsService = inject(UtilsService);
  private initialToposList: Topo[] = [];
  dataSource = new MatTableDataSource<Topo>();
  displayedColumns: string[] = ['altitude', 'name', 'level', 'duration', 'elevation', 'kilometers', 'type', 'region', 'valley', 'panoramique', 'start', 'link'];
  
  //Champs pour la recherche
  protected regions: string[] = []
  protected valleysRegions: any[] = []
  protected valleys: string[] = []
  protected levels: string[] = []
  protected maxAltitude: number = 0;
  protected maxElevation: number = 0;
  protected maxkilometer: number = 0;
  protected maxDuration: number = 0;
  selectedName: string = '';
  selectedRegions: string[] = [];
  selectedValleys: string[] = [];
  selectedLevels: string[] = [];
  selectedStartAltitude: number = 0;
  selectedEndAltitude: number = 0;
  selectedStartElevation: number = 0;
  selectedEndElevation: number = 0;
  selectedStartkilometer: number = 0;
  selectedEndkilometer: number = 0;
  selectedStartDuration: number = 0;
  selectedEndDuration: number = 0;
  selectedDone: string = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.sheetService.getToposSheetData().subscribe((res: any) => {
      this.initialToposList = [];
      for (let index = 1; index < res.values.length; index++) {
        if (res.values[index] && res.values[index].length >= 1) {
          this.regions.push(res.values[index][7])
          this.valleysRegions.push({valley: res.values[index][8], region: res.values[index][7]}) //Charger à la selection d'une ou plusieurs region
          this.levels.push(res.values[index][2])
          this.initialToposList.push({
            id: index + 1,
            altitude: res.values[index][0].replace(".",""),
            name: res.values[index][1],
            level: res.values[index][2],
            duration: res.values[index][3],
            elevation: res.values[index][4].replace(".",""),
            kilometers: res.values[index][5],
            type: res.values[index][6],
            region: res.values[index][7],
            valley: res.values[index][8],
            panoramique: res.values[index][9],
            start: res.values[index][10],
            link: res.values[index][11],
            done: res.values[index][12],
          });
        } else {
          console.warn(`Skipping row ${index}: Data is incomplete or missing.`);
        }
      }
      //Initial name
      this.selectedName = '';
      //Initial regions list
      this.regions = Array.from(new Set(this.regions));
      this.regions.sort((a, b) => a.localeCompare(b));
      //Initial valleys regions list
      const stringifiedRows = this.valleysRegions.map(row => JSON.stringify(row));
      const uniqueStringifiedRows = new Set(stringifiedRows);
      this.valleysRegions = Array.from(uniqueStringifiedRows).map(str => JSON.parse(str));
      //Initial levels list
      this.levels = Array.from(new Set(this.levels));
      this.levels.sort((a, b) => a.localeCompare(b));
      //Initial max altitude
      const maxAltitudeTopo = this.initialToposList.reduce((prev, current) => {
        return (Number(prev.altitude) > Number(current.altitude)) ? prev : current;
      });
      this.maxAltitude = Number(maxAltitudeTopo.altitude);
      if (Math.abs(this.maxAltitude) % 100 !== 0){
        this.maxAltitude += 100;
      }
      this.selectedEndAltitude = this.maxAltitude;
      //Initial max elevation
      const maxElevationTopo = this.initialToposList.reduce((prev, current) => {
        return (Number(prev.elevation) > Number(current.elevation)) ? prev : current;
      });
      this.maxElevation = Number(maxElevationTopo.elevation);
      if (Math.abs(this.maxElevation) % 100 !== 0){
        this.maxElevation += 100;
      }
      this.selectedEndElevation = this.maxElevation;
      //Initial max kilometers
      const maxKilometerTopo = this.initialToposList.reduce((prev, current) => {
        return (Number(prev.kilometers) > Number(current.kilometers)) ? prev : current;
      });
      this.maxkilometer = Number(maxKilometerTopo.kilometers);
      if (Math.abs(this.maxkilometer) % 5 !== 0){
        this.maxkilometer += 5;
      }
      this.selectedEndkilometer = this.maxkilometer;
      //Initial max Duration
      const maxDurationTopo = this.initialToposList.reduce((prev, current) => {
        return this.utilsService.convertTimeToMinutes(prev.duration) > this.utilsService.convertTimeToMinutes(current.duration) ? prev : current;
      });
      this.maxDuration = this.utilsService.convertTimeToMinutes(maxDurationTopo.duration);
      if (Math.abs(this.maxDuration) % 15 !== 0){
        this.maxDuration += 15;
      }
      this.selectedEndDuration = this.maxDuration;
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
  onNameChange(): void {
    console.log('Nom saisi:', this.selectedName);
    this.applyAllFilters();
  }
  onRegionChange(event: MatChipListboxChange): void {
    this.selectedRegions = event.value;
    console.log('Régions sélectionnées:', this.selectedRegions);
    //Initial valleys list
    this.valleys = [];
    if (this.selectedRegions.length > 0) {
      for (let index = 0; index < this.valleysRegions.length; index++) {
          if(this.selectedRegions.includes(this.valleysRegions[index].region))
            this.valleys.push(this.valleysRegions[index].valley)
      }
    }
    this.valleys = Array.from(new Set(this.valleys));
    this.valleys.sort((a, b) => a.localeCompare(b));
    //end initial valleys list
    this.applyAllFilters();
  }
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
  onAltitudeChange(startValue: string, endValue: string){
    this.selectedStartAltitude = Number(startValue);
    this.selectedEndAltitude = Number(endValue);
    console.log('Altitude sélectionnés:', this.selectedStartAltitude + " - "+this.selectedEndAltitude);
    this.applyAllFilters();
  }
  onElevationChange(startValue: string, endValue: string){
    this.selectedStartElevation = Number(startValue);
    this.selectedEndElevation = Number(endValue);
    console.log('Dénivelé sélectionnés:', this.selectedStartElevation + " - "+this.selectedEndElevation);
    this.applyAllFilters();
  }
  onkilometerChange(startValue: string, endValue: string){
    this.selectedStartkilometer = Number(startValue);
    this.selectedEndkilometer = Number(endValue);
    console.log('Kilomètre sélectionnés:', this.selectedStartkilometer + " - "+this.selectedEndkilometer);
    this.applyAllFilters();
  }
  onDurationChange(startValue: string, endValue: string){
    this.selectedStartDuration = Number(startValue);
    this.selectedEndDuration = Number(endValue);
    console.log('Durée sélectionnés:', this.selectedStartDuration + " - "+this.selectedEndDuration);
    this.applyAllFilters();
  }
  onDoneChange(value: string): void {
    this.selectedDone = value;
    console.log('Fait ?:', this.selectedDone);
    this.applyAllFilters();
  }

  // --- Logique d'application des filtres croisés ---
  applyAllFilters(): void {
    //On remet tous les enregistrements initiaux
    let tempFilteredData = [...this.initialToposList];
    // Appliquer le filtre par Nom
    if (this.selectedName.length > 0) {
      tempFilteredData = tempFilteredData.filter(topo => {
        const normalizeString = this.utilsService.normalizeString(this.selectedName);
        return this.utilsService.normalizeString(topo.name).includes(normalizeString);
      });
    }
    // Appliquer le filtre par Region
    if (this.selectedRegions.length > 0) {
      tempFilteredData = tempFilteredData.filter(topo =>
        this.selectedRegions.includes(topo.region)
      );
    }
    // Appliquer le filtre par Vallée
    if (this.selectedValleys.length > 0) {
      tempFilteredData = tempFilteredData.filter(topo =>
        this.selectedValleys.includes(topo.valley)
      );
    }
    //Appliquer le filtre par Niveau
    if (this.selectedLevels.length > 0) {
      tempFilteredData = tempFilteredData.filter(topo =>
        this.selectedLevels.includes(topo.level)
      );
    }
    //Appliquer le filtre sur l'Altitude
    tempFilteredData = tempFilteredData.filter(topo => {
      const startOK = topo.altitude >= this.selectedStartAltitude;
      const endOK = topo.altitude <= this.selectedEndAltitude;
      return startOK && endOK;
    });
    //Appliquer le filtre sur le Dénivélé
    tempFilteredData = tempFilteredData.filter(topo => {
      const startOK = topo.elevation >= this.selectedStartElevation;
      const endOK = topo.elevation <= this.selectedEndElevation;
      return startOK && endOK;
    });
    //Appliquer le filtre sur les Kilometres
    tempFilteredData = tempFilteredData.filter(topo => {
      const startOK = topo.kilometers >= this.selectedStartkilometer;
      const endOK = topo.kilometers <= this.selectedEndkilometer;
      return startOK && endOK;
    });
    //Appliquer le filtre sur les Durées
    tempFilteredData = tempFilteredData.filter(topo => {
      const startOK = this.utilsService.convertTimeToMinutes(topo.duration) >= this.selectedStartDuration;
      const endOK = this.utilsService.convertTimeToMinutes(topo.duration) <= this.selectedEndDuration;
      return startOK && endOK;
    });
    //Appliquer le filtre sur les Fait
    if(this.selectedDone !== 'all'){
      tempFilteredData = tempFilteredData.filter(topo => {
        if(this.selectedDone == 'y'){
          return topo.done == true;
        }else{
          return topo.done == false
        }
      });
    }
    // Mettre à jour le tableau affiché
    this.dataSource.data = tempFilteredData;
    console.log('Données filtrées:', this.dataSource.data.length, 'éléments');
    //On se repositionne à  la page 1
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
