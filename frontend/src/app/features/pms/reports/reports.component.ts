import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pms-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title and Action Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="bar-chart" [size]="24" class="text-amber-600"></app-icon>
            Reportes Gerenciales & Exportación
          </h1>
          <p class="text-xs text-slate-500">
            Métricas de ocupación, facturación, auditoría de folios, cierres de caja y exportación de datos.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Botón Exportar CSV -->
          <button
            type="button"
            (click)="exportCurrentViewCsv()"
            class="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="download" [size]="16" class="text-emerald-600"></app-icon>
            Exportar CSV / Excel
          </button>

          <!-- Botón Imprimir Reporte / PDF -->
          <button
            type="button"
            (click)="printReport()"
            class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="printer" [size]="16" class="text-amber-400"></app-icon>
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      <!-- PRINT HEADER (Solo visible al imprimir) -->
      <div class="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-black text-slate-900">hotelSJB — INFORME GERENCIAL</h1>
            <p class="text-xs text-slate-600">Reporte Ejecutivo de Operaciones y Rendimiento Financiero</p>
          </div>
          <div class="text-right text-xs text-slate-500">
            <div>Fecha de emisión: {{ todayFormatted }}</div>
            <div>Período: {{ dateFilter.startDate || 'Inicio' }} al {{ dateFilter.endDate || 'Actual' }}</div>
          </div>
        </div>
      </div>

      <!-- DATE RANGE & FILTER BAR -->
      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <!-- Date Inputs -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Desde</label>
            <input
              type="date"
              [(ngModel)]="dateFilter.startDate"
              (change)="loadKpis()"
              class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hasta</label>
            <input
              type="date"
              [(ngModel)]="dateFilter.endDate"
              (change)="loadKpis()"
              class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <!-- Quick Presets -->
          <div class="flex items-center gap-1 self-end pt-2 sm:pt-0">
            <button
              type="button"
              (click)="setPreset('today')"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Hoy
            </button>
            <button
              type="button"
              (click)="setPreset('week')"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Esta Semana
            </button>
            <button
              type="button"
              (click)="setPreset('month')"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Este Mes
            </button>
            <button
              type="button"
              (click)="setPreset('all')"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Todo
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 self-start md:self-auto">
          <button
            type="button"
            (click)="activeTab.set('occupancy')"
            [ngClass]="activeTab() === 'occupancy' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Ocupación & Habitaciones
          </button>
          <button
            type="button"
            (click)="activeTab.set('reservations')"
            [ngClass]="activeTab() === 'reservations' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Auditoría de Reservas
          </button>
          <button
            type="button"
            (click)="activeTab.set('cash')"
            [ngClass]="activeTab() === 'cash' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Caja & Turnos
          </button>
        </div>
      </div>

      <!-- KPI METRIC CARDS RIBBON -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Ocupación Actual -->
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tasa de Ocupación</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <app-icon name="bed" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 tracking-tight">
            {{ kpiData()?.occupancy?.occupancy_rate || 0 }}%
          </div>
          <div class="text-[11px] text-slate-500 mt-1">
            {{ kpiData()?.occupancy?.occupied_rooms || 0 }} de {{ kpiData()?.occupancy?.total_rooms || 0 }} habitaciones ocupadas
          </div>
        </div>

        <!-- Total Facturado -->
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Facturado</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <app-icon name="dollar-sign" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 tracking-tight">
            \${{ kpiData()?.financials?.total_amount || 0 }}
          </div>
          <div class="text-[11px] text-slate-500 mt-1">
            Estadía: \${{ kpiData()?.financials?.total_accommodation || 0 }} • Extras: \${{ kpiData()?.financials?.total_extras || 0 }}
          </div>
        </div>

        <!-- Total Cobrado en Caja -->
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cobrado / Recaudado</span>
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <app-icon name="credit-card" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-3xl font-black text-emerald-600 tracking-tight">
            \${{ kpiData()?.financials?.total_paid || 0 }}
          </div>
          <div class="text-[11px] text-slate-500 mt-1">
            Ingresos ingresados al sistema
          </div>
        </div>

        <!-- Saldo Pendiente por Cobrar -->
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Saldo por Cobrar</span>
            <div class="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <app-icon name="alert-triangle" [size]="16"></app-icon>
            </div>
          </div>
          <div
            class="text-3xl font-black tracking-tight"
            [ngClass]="(kpiData()?.financials?.pending_balance || 0) > 0 ? 'text-amber-600' : 'text-slate-900'"
          >
            \${{ kpiData()?.financials?.pending_balance || 0 }}
          </div>
          <div class="text-[11px] text-slate-500 mt-1">
            Cuentas abiertas en mostrador
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: RENDIMIENTO Y OCUPACIÓN DE HABITACIONES            -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'occupancy'" class="space-y-6">
        
        <!-- Summary by status -->
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <app-icon name="sparkles" [size]="16" class="text-amber-500"></app-icon>
            Estado del Inventario de Habitaciones
          </h3>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <span class="text-xs font-bold text-emerald-800 block">Disponibles</span>
              <span class="text-2xl font-black text-emerald-900">{{ kpiData()?.occupancy?.available_rooms || 0 }}</span>
            </div>
            <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <span class="text-xs font-bold text-blue-800 block">Ocupadas</span>
              <span class="text-2xl font-black text-blue-900">{{ kpiData()?.occupancy?.occupied_rooms || 0 }}</span>
            </div>
            <div class="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <span class="text-xs font-bold text-amber-800 block">Limpias / Listas</span>
              <span class="text-2xl font-black text-amber-900">{{ kpiData()?.occupancy?.clean_rooms || 0 }}</span>
            </div>
            <div class="p-4 rounded-xl bg-red-50 border border-red-100">
              <span class="text-xs font-bold text-red-800 block">Sucias (Por Limpiar)</span>
              <span class="text-2xl font-black text-red-900">{{ kpiData()?.occupancy?.dirty_rooms || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Room Performance Table -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Rendimiento Financiero por Habitación
            </h3>
            <span class="text-xs text-slate-400">
              {{ kpiData()?.room_performance?.length || 0 }} habitaciones registradas
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="px-6 py-3.5">Habitación</th>
                  <th class="px-6 py-3.5">Categoría / Tipo</th>
                  <th class="px-6 py-3.5">Piso</th>
                  <th class="px-6 py-3.5">Tarifa Base</th>
                  <th class="px-6 py-3.5">Ocupación Actual</th>
                  <th class="px-6 py-3.5">Gobernanza</th>
                  <th class="px-6 py-3.5 text-center">Reservas</th>
                  <th class="px-6 py-3.5 text-right">Ingresos Generados</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let room of kpiData()?.room_performance" class="hover:bg-slate-50/60">
                  <td class="px-6 py-3.5 font-bold text-slate-900 font-mono text-sm">
                    Hab. {{ room.room_number }}
                  </td>
                  <td class="px-6 py-3.5 font-medium text-slate-800">
                    {{ room.room_type }}
                  </td>
                  <td class="px-6 py-3.5 text-slate-500">
                    Piso {{ room.floor }}
                  </td>
                  <td class="px-6 py-3.5 font-semibold text-slate-800">
                    \${{ room.base_price }}
                  </td>
                  <td class="px-6 py-3.5">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      [ngClass]="room.operational_status === 'Ocupada' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'"
                    >
                      {{ room.operational_status }}
                    </span>
                  </td>
                  <td class="px-6 py-3.5">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      [ngClass]="room.housekeeping_status === 'Sucia' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
                    >
                      {{ room.housekeeping_status }}
                    </span>
                  </td>
                  <td class="px-6 py-3.5 text-center font-bold text-slate-800">
                    {{ room.total_bookings }}
                  </td>
                  <td class="px-6 py-3.5 text-right font-black text-slate-900">
                    \${{ room.total_revenue }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: AUDITORÍA DETALLADA DE RESERVAS                    -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'reservations'" class="space-y-6">
        
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Auditoría de Folios & Estadías
              </h3>
              <p class="text-xs text-slate-400">Detalle de reservas registradas en el período seleccionado</p>
            </div>

            <button
              type="button"
              (click)="exportReservationsCsv()"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <app-icon name="download" [size]="14"></app-icon>
              Exportar Reservas CSV
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="px-6 py-3.5">Código</th>
                  <th class="px-6 py-3.5">Huésped Titular</th>
                  <th class="px-6 py-3.5">Documento</th>
                  <th class="px-6 py-3.5">Habitación</th>
                  <th class="px-6 py-3.5">Check-In / Out</th>
                  <th class="px-6 py-3.5">Estado</th>
                  <th class="px-6 py-3.5">Total</th>
                  <th class="px-6 py-3.5">Cobrado</th>
                  <th class="px-6 py-3.5 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let res of kpiData()?.reservations" class="hover:bg-slate-50/60">
                  <td class="px-6 py-3.5 font-bold text-slate-900 font-mono">
                    {{ res.code }}
                  </td>
                  <td class="px-6 py-3.5 font-semibold text-slate-800">
                    {{ res.guest_name }}
                  </td>
                  <td class="px-6 py-3.5 text-slate-500 font-mono text-[11px]">
                    {{ res.guest_doc }}
                  </td>
                  <td class="px-6 py-3.5 font-medium text-slate-800">
                    {{ res.rooms }}
                  </td>
                  <td class="px-6 py-3.5 text-slate-600">
                    {{ res.check_in }} al {{ res.check_out }}
                  </td>
                  <td class="px-6 py-3.5 font-semibold">
                    {{ res.status }}
                  </td>
                  <td class="px-6 py-3.5 font-bold text-slate-900">
                    \${{ res.total_amount }}
                  </td>
                  <td class="px-6 py-3.5 font-bold text-emerald-600">
                    \${{ res.paid_amount }}
                  </td>
                  <td
                    class="px-6 py-3.5 text-right font-bold"
                    [ngClass]="res.pending_amount > 0 ? 'text-amber-600' : 'text-slate-400'"
                  >
                    \${{ res.pending_amount }}
                  </td>
                </tr>

                <tr *ngIf="!kpiData()?.reservations || kpiData()?.reservations.length === 0">
                  <td colspan="9" class="px-6 py-12 text-center text-slate-400">
                    No se encontraron reservas en el rango de fechas seleccionado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ======================================================== -->
      <!-- TAB 3: AUDITORÍA DE CAJA CHICA & TURNOS                  -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'cash'" class="space-y-6">
        
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Historial de Turnos de Caja & Arqueos
              </h3>
              <p class="text-xs text-slate-400">Control de fondos de apertura, ingresos, egresos y cuadres de caja</p>
            </div>

            <button
              type="button"
              (click)="exportCashCsv()"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <app-icon name="download" [size]="14"></app-icon>
              Exportar Turnos CSV
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="px-6 py-3.5">Turno</th>
                  <th class="px-6 py-3.5">Cajero / Usuario</th>
                  <th class="px-6 py-3.5">Apertura</th>
                  <th class="px-6 py-3.5">Cierre</th>
                  <th class="px-6 py-3.5">Fondo Inicial</th>
                  <th class="px-6 py-3.5">Ingresos</th>
                  <th class="px-6 py-3.5">Egresos</th>
                  <th class="px-6 py-3.5">Esperado</th>
                  <th class="px-6 py-3.5">Real Declarado</th>
                  <th class="px-6 py-3.5 text-right">Diferencia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let s of cashReportData()?.shifts" class="hover:bg-slate-50/60">
                  <td class="px-6 py-3.5 font-bold text-slate-900 font-mono">
                    #{{ s.id }} ({{ s.status }})
                  </td>
                  <td class="px-6 py-3.5 font-semibold text-slate-800">
                    {{ s.user_name }}
                  </td>
                  <td class="px-6 py-3.5 text-slate-500">
                    {{ s.opened_at | date:'short' }}
                  </td>
                  <td class="px-6 py-3.5 text-slate-500">
                    {{ s.closed_at ? (s.closed_at | date:'short') : 'Abierto actualmente' }}
                  </td>
                  <td class="px-6 py-3.5 font-medium">
                    \${{ s.initial_cash }}
                  </td>
                  <td class="px-6 py-3.5 font-bold text-emerald-600">
                    +\${{ s.total_incomes }}
                  </td>
                  <td class="px-6 py-3.5 font-bold text-red-600">
                    -\${{ s.total_expenses }}
                  </td>
                  <td class="px-6 py-3.5 font-black text-slate-900">
                    \${{ s.expected_cash }}
                  </td>
                  <td class="px-6 py-3.5 font-bold text-slate-800">
                    {{ s.actual_cash ? '\$' + s.actual_cash : '—' }}
                  </td>
                  <td
                    class="px-6 py-3.5 text-right font-black"
                    [ngClass]="s.difference < 0 ? 'text-red-600' : s.difference > 0 ? 'text-blue-600' : 'text-slate-700'"
                  >
                    {{ s.difference !== null ? (s.difference >= 0 ? '+\$' + s.difference : '-\$' + (s.difference * -1)) : '—' }}
                  </td>
                </tr>

                <tr *ngIf="!cashReportData()?.shifts || cashReportData()?.shifts.length === 0">
                  <td colspan="10" class="px-6 py-12 text-center text-slate-400">
                    No hay turnos de caja registrados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- SIGNATURE BLOCK (Solo visible al imprimir) -->
      <div class="hidden print:block pt-16 mt-12 border-t border-slate-300">
        <div class="grid grid-cols-2 gap-16 text-center text-xs text-slate-700">
          <div>
            <div class="border-t border-slate-400 w-48 mx-auto mb-2"></div>
            <p class="font-bold">Administrador General</p>
            <p class="text-slate-400">Firma y Sello</p>
          </div>
          <div>
            <div class="border-t border-slate-400 w-48 mx-auto mb-2"></div>
            <p class="font-bold">Recepción y Caja</p>
            <p class="text-slate-400">Responsable de Turno</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  activeTab = signal<'occupancy' | 'reservations' | 'cash'>('occupancy');
  kpiData = signal<any | null>(null);
  cashReportData = signal<any | null>(null);

  dateFilter = {
    startDate: '',
    endDate: ''
  };

  todayFormatted: string = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  ngOnInit() {
    this.loadKpis();
    this.loadCashReport();
  }

  loadKpis() {
    const params: any = {};
    if (this.dateFilter.startDate) params.start_date = this.dateFilter.startDate;
    if (this.dateFilter.endDate) params.end_date = this.dateFilter.endDate;

    this.api.get<any>('reports/kpis', params).subscribe({
      next: (data) => {
        this.kpiData.set(data);
      },
      error: () => this.toast.error('Error al cargar datos del reporte')
    });
  }

  loadCashReport() {
    this.api.get<any>('reports/cash').subscribe({
      next: (data) => {
        this.cashReportData.set(data);
      }
    });
  }

  setPreset(preset: 'today' | 'week' | 'month' | 'all') {
    const now = new Date();
    if (preset === 'today') {
      const today = now.toISOString().substring(0, 10);
      this.dateFilter.startDate = today;
      this.dateFilter.endDate = today;
    } else if (preset === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().substring(0, 10);
      this.dateFilter.startDate = sevenDaysAgo;
      this.dateFilter.endDate = now.toISOString().substring(0, 10);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
      this.dateFilter.startDate = firstDay;
      this.dateFilter.endDate = now.toISOString().substring(0, 10);
    } else {
      this.dateFilter.startDate = '';
      this.dateFilter.endDate = '';
    }
    this.loadKpis();
  }

  printReport() {
    window.print();
  }

  exportCurrentViewCsv() {
    if (this.activeTab() === 'cash') {
      this.exportCashCsv();
    } else {
      this.exportReservationsCsv();
    }
  }

  exportReservationsCsv() {
    const reservations = this.kpiData()?.reservations;
    if (!reservations || reservations.length === 0) {
      this.toast.warning('No hay datos de reservas para exportar');
      return;
    }

    const headers = ['Codigo', 'Huesped', 'Documento', 'Habitacion', 'Check-In', 'Check-Out', 'Estado', 'Total ($)', 'Pagado ($)', 'Saldo ($)'];
    const rows = reservations.map((r: any) => [
      `"${r.code}"`,
      `"${r.guest_name}"`,
      `"${r.guest_doc}"`,
      `"${r.rooms}"`,
      `"${r.check_in}"`,
      `"${r.check_out}"`,
      `"${r.status}"`,
      r.total_amount,
      r.paid_amount,
      r.pending_amount
    ]);

    this.downloadCsv('reporte_reservas_hotelSJB.csv', headers, rows);
  }

  exportCashCsv() {
    const shifts = this.cashReportData()?.shifts;
    if (!shifts || shifts.length === 0) {
      this.toast.warning('No hay datos de turnos de caja para exportar');
      return;
    }

    const headers = ['ID Turno', 'Estado', 'Cajero', 'Apertura', 'Cierre', 'Fondo Inicial', 'Ingresos', 'Egresos', 'Esperado', 'Real Declarado', 'Diferencia'];
    const rows = shifts.map((s: any) => [
      s.id,
      `"${s.status}"`,
      `"${s.user_name || ''}"`,
      `"${s.opened_at || ''}"`,
      `"${s.closed_at || ''}"`,
      s.initial_cash,
      s.total_incomes,
      s.total_expenses,
      s.expected_cash,
      s.actual_cash !== null ? s.actual_cash : '',
      s.difference !== null ? s.difference : ''
    ]);

    this.downloadCsv('reporte_caja_hotelSJB.csv', headers, rows);
  }

  private downloadCsv(filename: string, headers: string[], rows: any[][]) {
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toast.success(`Archivo ${filename} descargado exitosamente`);
  }
}
