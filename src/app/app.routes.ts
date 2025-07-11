import { Routes } from '@angular/router';
import { ToposList } from './topos-list/topos-list';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: ToposList },
];
