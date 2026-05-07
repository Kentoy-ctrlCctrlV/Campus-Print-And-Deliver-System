import { Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup';
import { DashboardComponent } from './components/dashboard/dashboard';
import { OrderSelectionComponent } from './components/order-selection/order-selection';
import { AdminViewComponent } from './components/admin-dashboard/admin-dashboard';
import { AdminAuthGuard } from './services/admin-auth.guard';

export const routes: Routes = [
  { path: '', component: SignupComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'order', component: OrderSelectionComponent },
  { path: 'admin-dashboard', component: AdminViewComponent, canActivate: [AdminAuthGuard] },
  { path: '**', redirectTo: '' },
];
