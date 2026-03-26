import { Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup';
import { DashboardComponent } from './components/dashboard/dashboard';
import { OrderSelectionComponent } from './components/order-selection/order-selection';

export const routes: Routes = [
  { path: '', component: SignupComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'order', component: OrderSelectionComponent },
  { path: '**', redirectTo: '' },
];
