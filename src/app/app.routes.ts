import { Routes } from '@angular/router';
import { HikesList } from './hikes-list/hikes-list';
import { ToposList } from './topos-list/topos-list';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HikesList },
    { path: 'topos', component: ToposList }
];
