import { Routes } from '@angular/router';
import { setupGuard } from './core/guards/setup.guard';
import { authGuard } from './core/guards/auth.guard';
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
      { path: 'rack', component: RackComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'housekeeping', component: HousekeepingComponent },
      { path: 'cash', component: CashComponent },
      { path: 'users', component: UsersComponent },
      { path: 'statuses', component: StatusesManagerComponent },
      { path: 'cms', component: CmsAdminComponent },
    ]
  },
  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
