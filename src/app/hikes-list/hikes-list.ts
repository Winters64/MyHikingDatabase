// import { Component, OnInit } from '@angular/core';
// import { SheetService } from '../services/gsheet';
// import { Hike } from '..//models/hike';
// import { MatTableModule } from '@angular/material/table';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-hikes-list',
//   imports: [MatTableModule, MatIconModule],
//   templateUrl: './hikes-list.html',
//   styleUrl: './hikes-list.scss'
// })
// export class HikesList implements OnInit{
//   protected title = 'Liste des randonnées du 64';
//   hikes: Hike[] = [];
//   displayedColumns: string[] = ['done', 'name', 'valley', 'altitude', 'date', 'albumLink', 'topoLink', 'garminink', 'observations'];

//   constructor(private sheetService: SheetService) {}
  
//   ngOnInit() {
//     this.sheetService.getSheetData().subscribe((res: any) => {
//       console.log(res.values)
//       for (let index = 1; index < res.values.length; index++) {
//         //['FAIT ?', 'ALT', 'RANDONNÉES', 'VALLÉES', 'DATE', 'PHOTOS', 'TOPOS', 'GARMIN', 'Observations']            
//         this.hikes.push({
//           id: index+1,
//           done: res.values[index][0],
//           altitude: res.values[index][1],
//           name:res.values[index][2],
//           valley: res.values[index][3],
//           date: res.values[index][4],
//           albumLink: res.values[index][5],
//           topoLink: res.values[index][6],
//           garminink: res.values[index][7],
//           observations: res.values[index][8],
//         });
//       }
//     });
//   }

// }



import { Component, inject, OnInit } from '@angular/core';
import { SheetService } from '../services/gsheet';
import { Hike } from '..//models/hike';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hikes-list',
  standalone: true, // Add standalone: true if this is a standalone component
  imports: [MatTableModule, MatIconModule, MatChipsModule, MatSliderModule, FormsModule, MatFormFieldModule],
  templateUrl: './hikes-list.html',
  styleUrl: './hikes-list.scss',
})
export class HikesList implements OnInit {
  protected title = 'Liste des randonnées du 64';

  private initialHikesList: Hike[] = [];
  dataSource = new MatTableDataSource<Hike>();
  displayedColumns: string[] = ['done', 'name', 'valley', 'altitude', 'date', 'albumLink', 'topoLink', 'garminink', 'observations'];
  private sheetService: SheetService = inject(SheetService);

  // Liste des catégories disponibles
  valleys: string[] = []
  selectedCategories: string[] = [];

  constructor() {}
  
  ngOnInit() {
    this.sheetService.getSheetData().subscribe((res: any) => {
      this.initialHikesList = [];
      for (let index = 1; index < res.values.length; index++) {
        if (res.values[index] && res.values[index].length >= 1) {
          this.valleys.push(res.values[index][3])
          this.initialHikesList.push({
            id: index + 1,
            done: res.values[index][0],
            altitude: res.values[index][1],
            name: res.values[index][2],
            valley: res.values[index][3],
            date: res.values[index][4],
            albumLink: res.values[index][5],
            topoLink: res.values[index][6],
            garminink: res.values[index][7],
            observations: res.values[index][8],
          });
        } else {
          console.warn(`Skipping row ${index}: Data is incomplete or missing.`);
        }
      }
      this.valleys = Array.from(new Set(this.valleys));
      this.valleys.sort((a, b) => a.localeCompare(b));
      this.dataSource.data = this.initialHikesList;
    });
  }


  onValleyChange(event: MatChipListboxChange) {
    const valleySelected: string[] = event.value;
    if(valleySelected.length > 0) {
      const filteredHikes: Hike[] = this.initialHikesList.filter(hike => {
        const hasValleys = valleySelected.some(s => s === hike.valley);
        return hasValleys;
      });
      this.dataSource.data = filteredHikes;
    } else{
      this.dataSource.data = this.initialHikesList;
    }
  }

  onAltitudeChange(startValue: string, endValue: string){
    const filteredHikes: Hike[] = this.initialHikesList.filter(hike => {
      const startOK = hike.altitude >= Number(startValue);
      const endOK = hike.altitude <= Number(endValue);
      return startOK && endOK;
    });
    this.dataSource.data = filteredHikes;
  }

}

