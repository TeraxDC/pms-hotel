import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';
import { CustomSwitchComponent } from '../../../shared/components/custom-switch/custom-switch.component';

@Component({
  selector: 'app-pms-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, CustomSelectComponent, CustomSwitchComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="users" [size]="24" class="text-amber-600"></app-icon>
            Gestión de Usuarios & Roles RBAC
          </h1>
          <p class="text-xs text-slate-500">
            Administración del personal del hotel, asignación de roles, control de accesos y PINs de autorización.
          </p>
        </div>

        <button
          *ngIf="activeTab() === 'users'"
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <app-icon name="plus" [size]="16" class="text-amber-400"></app-icon>
          Nuevo Usuario
        </button>
      </div>

      <!-- TABS: USUARIOS / MATRIZ RBAC -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          (click)="activeTab.set('users')"
          [ngClass]="activeTab() === 'users' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <app-icon name="users" [size]="15"></app-icon>
          Personal & Cuentas ({{ users().length }})
        </button>

        <button
          type="button"
          (click)="activeTab.set('matrix')"
          [ngClass]="activeTab() === 'matrix' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <app-icon name="shield" [size]="15" class="text-amber-400"></app-icon>
          Matriz de Permisos por Rol (RBAC)
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: LISTADO DE USUARIOS                               -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'users'" class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-6 py-4">Usuario / Nombre</th>
                <th class="px-6 py-4">Correo Electrónico</th>
                <th class="px-6 py-4">Rol Asignado</th>
                <th class="px-6 py-4">PIN Rápido</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let user of users()" class="hover:bg-slate-50/80 transition-colors">
                
                <!-- Nombre -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <app-icon name="user" [size]="16"></app-icon>
                    </div>
                    <div>
                      <span class="font-bold text-slate-900 block">{{ user.full_name }}</span>
                      <span class="text-[11px] text-slate-400 block">{{ user.phone || 'Sin teléfono' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Correo -->
                <td class="px-6 py-4 font-medium text-slate-700">
                  {{ user.email }}
                </td>

                <!-- Rol -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border shadow-2xs"
                    [ngClass]="{
                      'bg-purple-50 text-purple-700 border-purple-200': user.role?.name === 'SUPERADMIN',
                      'bg-blue-50 text-blue-700 border-blue-200': user.role?.name === 'ADMIN',
                      'bg-amber-50 text-amber-700 border-amber-200': user.role?.name === 'RECEPTIONIST',
                      'bg-emerald-50 text-emerald-700 border-emerald-200': user.role?.name === 'HOUSEKEEPING'
                    }"
                  >
                    <app-icon [name]="getRoleIcon(user.role?.name)" [size]="12"></app-icon>
                    {{ user.role?.display_name || user.role?.name }}
                  </span>
                </td>

                <!-- PIN -->
                <td class="px-6 py-4 font-mono font-bold text-slate-500 tracking-widest">
                  {{ showPins() ? user.pin_code : '••••' }}
                </td>

                <!-- Estado Activo/Inactivo -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    [ngClass]="user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="user.is_active ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    {{ user.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right space-x-2">
                  <button
                    type="button"
                    (click)="openEditModal(user)"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Editar
                  </button>

                  <button
                    *ngIf="user.role?.name !== 'SUPERADMIN'"
                    type="button"
                    (click)="toggleActive(user)"
                    class="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                    [ngClass]="user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'"
                  >
                    {{ user.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: MATRIZ DE PERMISOS POR ROL (RBAC)                  -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'matrix'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- ROL 1: SUPERADMIN -->
          <div class="bg-white rounded-3xl border border-purple-100 shadow-2xs p-6 space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <app-icon name="shield" [size]="20"></app-icon>
                </div>
                <div>
                  <h3 class="font-black text-slate-900 text-base">Superadministrador (SUPERADMIN)</h3>
                  <span class="text-[11px] text-purple-700 font-bold uppercase tracking-wider">Acceso Global Irrestricto</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold font-mono">
                Permiso: *
              </span>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              Control absoluto y auditoría del sistema: configuración del hotel, gestión de roles, estados y códigos HEX, usuarios, reportes, caja, tarifas y CMS.
            </p>

            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Configuración de Hotel & Wizard</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Gestión de Usuarios, Roles & PINs</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Estados & Colores HEX Administrables</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Reportes Gerenciales & Exportación Excel</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
            </div>
          </div>

          <!-- ROL 2: ADMIN -->
          <div class="bg-white rounded-3xl border border-blue-100 shadow-2xs p-6 space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <app-icon name="sliders" [size]="20"></app-icon>
                </div>
                <div>
                  <h3 class="font-black text-slate-900 text-base">Administrador General (ADMIN)</h3>
                  <span class="text-[11px] text-blue-700 font-bold uppercase tracking-wider">Gestión Operativa & Gerencial</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold font-mono">
                Nivel 2
              </span>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              Supervisión de operaciones hoteleras, tarifas de habitaciones, arqueo de caja chica, reportes ejecutivos, CMS informativo y supervisión de personal.
            </p>

            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Habitaciones & Edición de Tarifas</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Editor Web CMS & Ofertas</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Caja Chica, Turnos & Liquidaciones</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Total</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Estados & Colores HEX</span>
                <span class="font-bold text-slate-400 flex items-center gap-1"><app-icon name="x" [size]="14"></app-icon> Solo Lectura</span>
              </div>
            </div>
          </div>

          <!-- ROL 3: RECEPTIONIST -->
          <div class="bg-white rounded-3xl border border-amber-100 shadow-2xs p-6 space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <app-icon name="bed" [size]="20"></app-icon>
                </div>
                <div>
                  <h3 class="font-black text-slate-900 text-base">Recepcionista (RECEPTIONIST)</h3>
                  <span class="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Atención de Mostrador & Huéspedes</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold font-mono">
                Front-Desk
              </span>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              Gestión diaria de check-in con reserva o walk-in, check-out, folios de huéspedes, consumo de frigobar, cobros y aperturas/cierres de turnos de caja.
            </p>

            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Rack, Walk-In, Check-In & Check-Out</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Permitido</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Folios, Cargos Frigobar & Pagos</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Permitido</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Turno de Caja Chica en Mostrador</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Permitido</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Usuarios, Roles & Configuración</span>
                <span class="font-bold text-red-500 flex items-center gap-1"><app-icon name="x" [size]="14"></app-icon> Bloqueado</span>
              </div>
            </div>
          </div>

          <!-- ROL 4: HOUSEKEEPING -->
          <div class="bg-white rounded-3xl border border-emerald-100 shadow-2xs p-6 space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <app-icon name="sparkles" [size]="20"></app-icon>
                </div>
                <div>
                  <h3 class="font-black text-slate-900 text-base">Personal de Limpieza (HOUSEKEEPING)</h3>
                  <span class="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Camarería & Gobernanza Móvil</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold font-mono">
                Móvil PWA
              </span>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              Vista móvil optimizada para camareras. Marcado de habitaciones como limpias o en aseo (protegidas si hay check-in activo) y consulta visual del mapa de pisos.
            </p>

            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Módulo de Housekeeping Móvil</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Permitido</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Rack de Habitaciones (Mapa de Pisos)</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1"><app-icon name="check" [size]="14"></app-icon> Lectura</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Limpieza en Habitación con Check-In</span>
                <span class="font-bold text-amber-600 flex items-center gap-1"><app-icon name="lock" [size]="14"></app-icon> Protegida</span>
              </div>
              <div class="flex items-center justify-between text-slate-700 py-1">
                <span>Caja, Reservas & Configuración</span>
                <span class="font-bold text-red-500 flex items-center gap-1"><app-icon name="x" [size]="14"></app-icon> Bloqueado</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- MODAL CREAR / EDITAR USUARIO -->
      <div
        *ngIf="showModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="user" [size]="18" class="text-amber-500"></app-icon>
              {{ isEditing() ? 'Editar Usuario' : 'Nuevo Usuario del Sistema' }}
            </h3>
            <button (click)="showModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveUser()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre Completo *
              </label>
              <input
                type="text"
                [(ngModel)]="userForm.full_name"
                name="fullName"
                required
                placeholder="Ej. María Sánchez"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  [(ngModel)]="userForm.email"
                  name="email"
                  required
                  placeholder="recepcion@hotelsjb.com"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teléfono / Móvil
                </label>
                <input
                  type="text"
                  [(ngModel)]="userForm.phone"
                  name="phone"
                  placeholder="+51 987654321"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rol del Sistema (Permisos) *
              </label>
              <app-custom-select
                [options]="roleOptions"
                [(ngModel)]="userForm.role_id"
                name="roleId"
                placeholder="Seleccione el rol"
              ></app-custom-select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña {{ isEditing() ? '(Opcional)' : '*' }}
                </label>
                <input
                  type="password"
                  [(ngModel)]="userForm.password"
                  name="password"
                  [required]="!isEditing()"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PIN Rápido (4 Dígitos)
                </label>
                <input
                  type="text"
                  maxlength="4"
                  [(ngModel)]="userForm.pin_code"
                  name="pinCode"
                  placeholder="1234"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center tracking-widest text-slate-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div class="pt-2">
              <app-custom-switch [(ngModel)]="userForm.is_active" name="isActive">
                <span class="text-xs text-slate-700 font-semibold">Usuario Activo con Permiso de Ingreso</span>
              </app-custom-switch>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showModal.set(false)"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {{ isEditing() ? 'Guardar Cambios' : 'Crear Usuario' }}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  activeTab = signal<'users' | 'matrix'>('users');
  users = signal<any[]>([]);
  roles = signal<any[]>([]);
  roleOptions: SelectOption[] = [];

  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  selectedUserId: number | null = null;
  showPins = signal<boolean>(false);

  userForm = {
    full_name: '',
    email: '',
    phone: '',
    role_id: 3,
    password: '',
    pin_code: '1234',
    is_active: true
  };

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles() {
    this.api.get<any[]>('users/roles').subscribe((data) => {
      this.roles.set(data);
      this.roleOptions = data.map((r) => ({
        value: r.id,
        label: r.display_name || r.name,
        sublabel: r.description
      }));
    });
  }

  loadUsers() {
    this.api.get<any[]>('users').subscribe({
      next: (data) => this.users.set(data),
      error: () => this.toast.error('No se pudo cargar la lista de usuarios')
    });
  }

  getRoleIcon(roleName?: string): string {
    switch (roleName) {
      case 'SUPERADMIN': return 'shield';
      case 'ADMIN': return 'sliders';
      case 'RECEPTIONIST': return 'bed';
      case 'HOUSEKEEPING': return 'sparkles';
      default: return 'user';
    }
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.selectedUserId = null;
    this.userForm = {
      full_name: '',
      email: '',
      phone: '',
      role_id: this.roles().find((r) => r.name === 'RECEPTIONIST')?.id || 3,
      password: '',
      pin_code: '1234',
      is_active: true
    };
    this.showModal.set(true);
  }

  openEditModal(user: any) {
    this.isEditing.set(true);
    this.selectedUserId = user.id;
    this.userForm = {
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role_id: user.role_id,
      password: '',
      pin_code: user.pin_code || '1234',
      is_active: user.is_active
    };
    this.showModal.set(true);
  }

  async toggleActive(user: any) {
    const action = user.is_active ? 'desactivar' : 'activar';
    const confirm = await this.dialog.confirm({
      title: `${action.toUpperCase()} Usuario`,
      message: `¿Está seguro de ${action} la cuenta de ${user.full_name}?`,
      type: user.is_active ? 'warning' : 'info',
      confirmText: `Sí, ${action}`
    });
    if (!confirm) return;

    this.api.put(`users/${user.id}/toggle-active`, {}).subscribe({
      next: () => {
        this.toast.success(`Usuario ${action}do correctamente`);
        this.loadUsers();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al cambiar estado de usuario');
      }
    });
  }

  saveUser() {
    if (!this.userForm.full_name.trim() || !this.userForm.email.trim() || !this.userForm.role_id) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }

    if (!this.isEditing() && (!this.userForm.password || this.userForm.password.length < 6)) {
      this.toast.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.isEditing()) {
      const payload: any = {
        full_name: this.userForm.full_name,
        email: this.userForm.email,
        phone: this.userForm.phone,
        role_id: this.userForm.role_id,
        pin_code: this.userForm.pin_code,
        is_active: this.userForm.is_active
      };
      if (this.userForm.password && this.userForm.password.length >= 6) {
        payload.password = this.userForm.password;
      }

      this.api.put(`users/${this.selectedUserId}`, payload).subscribe({
        next: () => {
          this.toast.success('Usuario actualizado exitosamente');
          this.showModal.set(false);
          this.loadUsers();
        },
        error: (err) => this.toast.error(err?.error?.message || 'Error al actualizar usuario')
      });
    } else {
      this.api.post('users', this.userForm).subscribe({
        next: () => {
          this.toast.success('Usuario creado exitosamente');
          this.showModal.set(false);
          this.loadUsers();
        },
        error: (err) => this.toast.error(err?.error?.message || 'Error al crear usuario')
      });
    }
  }
}
