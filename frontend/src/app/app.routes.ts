import { Routes } from '@angular/router';
import { setupGuard } from './core/guards/setup.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PublicWebComponent } from './features/public-web/public-web.component';
import { SetupWizardComponent } from './features/setup-wizard/setup-wizard.component';
import { LoginComponent } from './features/login/login.component';
import { PmsLayoutComponent } from './features/pms/pms-layout.component';
import { RackComponent } from './features/pms/rack/rack.component';
import { ReservationsComponent } from './features/pms/reservations/reservations.component';
import { HousekeepingComponent } from './features/pms/housekeeping/housekeeping.component';
import { StatusesManagerComponent } from './features/pms/statuses/statuses-manager.component';
import { UsersComponent } from './features/pms/users/users.component';
import { CashComponent } from './features/pms/cash/cash.component';
import { CmsAdminComponent } from './features/pms/cms/cms-admin.component';

export const routes: Routes = [
  // Portal público informativo
  {
    path: '',
    component: PublicWebComponent,
    canActivate: [setupGuard],
    pathMatch: 'full'
  },
  // Wizard de configuración inicial de primer arranque
  {
    path: 'setup',
    component: SetupWizardComponent,
    canActivate: [setupGuard]
  },
  // Acceso administrativo protegido
  {
    path: 'login',
    component: LoginComponent
  },
  // Panel PMS del hotel
  {
    path: 'pms',
    component: PmsLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'rack', pathMatch: 'full' },
      { path: 'rack', component: RackComponent, canActivate: [roleGuard], data: { module: 'rack' } },
      {
        path: 'rooms',
        loadComponent: () => import('./features/pms/rooms/rooms-manager.component').then(m => m.RoomsManagerComponent),
        canActivate: [roleGuard],
        data: { module: 'rooms' }
      },
      { path: 'reservations', component: ReservationsComponent, canActivate: [roleGuard], data: { module: 'reservations' } },
      { path: 'housekeeping', component: HousekeepingComponent, canActivate: [roleGuard], data: { module: 'housekeeping' } },
      { path: 'cash', component: CashComponent, canActivate: [roleGuard], data: { module: 'cash' } },
      {
        path: 'reports',
        loadComponent: () => import('./features/pms/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [roleGuard],
        data: { module: 'reports' }
      },
      { path: 'users', component: UsersComponent, canActivate: [roleGuard], data: { module: 'users' } },
      { path: 'statuses', component: StatusesManagerComponent, canActivate: [roleGuard], data: { module: 'statuses' } },
      { path: 'cms', component: CmsAdminComponent, canActivate: [roleGuard], data: { module: 'cms' } },
      {
        path: 'hotel-info',
        loadComponent: () => import('./features/pms/hotel-info/hotel-info.component').then(m => m.HotelInfoComponent),
        canActivate: [roleGuard],
        data: { module: 'hotel_settings' }
      },
    ]
  },
  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
