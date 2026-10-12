import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';
import { ReceiptCanvasService, GeneratedReceipt, ReceiptData } from '../../../core/services/receipt-canvas.service';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-pms-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    StatusBadgeComponent,
    CustomSelectComponent,
    ReceiptModalComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title and Action Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="calendar" [size]="24" class="text-amber-600"></app-icon>
            Recepción: Reservas, Check-In & Folios
          </h1>
          <p class="text-xs text-slate-500">
            Control de ingresos de huéspedes con y sin reserva (Walk-in), cargos a habitación, caja y check-out.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <!-- Botón Check-In Walk-In (Sin Reserva) -->
          <button
            type="button"
            (click)="openWalkInModal()"
            class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="key" [size]="16" class="text-slate-950"></app-icon>
            Check-In Inmediato (Walk-In)
          </button>

          <!-- Botón Nueva Reserva Anticipada -->
          <button
            type="button"
            (click)="openNewReservationModal()"
            class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="plus" [size]="16" class="text-amber-400"></app-icon>
            Nueva Reserva Futura
          </button>
        </div>
      </div>

      <!-- FILTERS AND SEARCH BAR -->
      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Status Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            (click)="filterTab.set('ALL')"
            [ngClass]="filterTab() === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Todas ({{ reservations().length }})
          </button>
          <button
            type="button"
            (click)="filterTab.set('PENDING')"
            [ngClass]="filterTab() === 'PENDING' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Por Ingresar ({{ getCountByStatusGroup('PENDING') }})
          </button>
          <button
            type="button"
            (click)="filterTab.set('CHECKED_IN')"
            [ngClass]="filterTab() === 'CHECKED_IN' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            En Estadía ({{ getCountByStatusGroup('CHECKED_IN') }})
          </button>
          <button
            type="button"
            (click)="filterTab.set('CHECKED_OUT')"
            [ngClass]="filterTab() === 'CHECKED_OUT' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Finalizadas ({{ getCountByStatusGroup('CHECKED_OUT') }})
          </button>
          <button
            type="button"
            (click)="filterTab.set('CANCELLED')"
            [ngClass]="filterTab() === 'CANCELLED' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Canceladas ({{ getCountByStatusGroup('CANCELLED') }})
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-72">
          <app-icon name="search" [size]="16" class="absolute left-3 top-2.5 text-slate-400"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por huésped, DNI o código..."
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      <!-- RESERVATIONS TABLE -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-6 py-4">Código / Tipo</th>
                <th class="px-6 py-4">Huésped Titular</th>
                <th class="px-6 py-4">Habitación</th>
                <th class="px-6 py-4">Estadía (Noches)</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4">Total / Saldo</th>
                <th class="px-6 py-4 text-right">Acciones de Recepción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let res of filteredReservations()" class="hover:bg-slate-50/80 transition-colors">
                <!-- Código -->
                <td class="px-6 py-4 font-mono font-bold text-slate-900">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="res.reservation_code.startsWith('WLK') ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'"
                    >
                      {{ res.reservation_code.startsWith('WLK') ? 'WALK-IN' : 'RESERVA' }}
                    </span>
                    <span>{{ res.reservation_code }}</span>
                  </div>
                </td>

                <!-- Huésped -->
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900">
                    {{ res.main_guest?.first_name }} {{ res.main_guest?.last_name }}
                  </div>
                  <div class="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Doc: {{ res.main_guest?.document_number }}</span>
                    <span *ngIf="res.main_guest?.phone">• Tel: {{ res.main_guest?.phone }}</span>
                  </div>
                </td>

                <!-- Habitación y Estado de Limpieza -->
                <td class="px-6 py-4">
                  <div *ngFor="let rr of res.rooms" class="space-y-1">
                    <div class="font-bold text-slate-800 flex items-center gap-1.5">
                      <app-icon name="bed" [size]="14" class="text-amber-600"></app-icon>
                      Hab. {{ rr.room?.room_number }} ({{ rr.room?.room_type?.name }})
                    </div>
                    <!-- Badge de Limpieza -->
                    <div *ngIf="rr.room?.housekeeping_status" class="inline-block">
                      <app-status-badge
                        [text]="rr.room?.housekeeping_status?.name"
                        [colorHex]="rr.room?.housekeeping_status?.color_hex"
                        [bgHex]="rr.room?.housekeeping_status?.badge_bg_hex"
                        [textHex]="rr.room?.housekeeping_status?.badge_text_hex"
                        [iconName]="rr.room?.housekeeping_status?.icon_name"
                      ></app-status-badge>
                    </div>
                  </div>
                </td>

                <!-- Estadía -->
                <td class="px-6 py-4">
                  <div class="font-semibold text-slate-800">{{ res.check_in_date }}</div>
                  <div class="text-[11px] text-slate-400">al {{ res.check_out_date }} ({{ calculateNights(res.check_in_date, res.check_out_date) }} noches)</div>
                </td>

                <!-- Estado de Reserva -->
                <td class="px-6 py-4">
                  <app-status-badge
                    [text]="res.status?.name"
                    [colorHex]="res.status?.color_hex"
                    [bgHex]="res.status?.badge_bg_hex"
                    [textHex]="res.status?.badge_text_hex"
                    [iconName]="res.status?.icon_name"
                  ></app-status-badge>
                </td>

                <!-- Total y Saldo -->
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900">S/. {{ res.total_amount }}</div>
                  <div
                    class="text-[11px] font-semibold"
                    [ngClass]="getPendingBalance(res) > 0 ? 'text-amber-600' : 'text-emerald-600'"
                  >
                    Saldo: S/. {{ getPendingBalance(res) }}
                  </div>
                  <span
                    *ngIf="res.total_discount > 0"
                    class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-1"
                  >
                    Oferta: -S/. {{ res.total_discount }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right space-x-1.5">
                  <!-- Botón Check-In si está confirmada / pendiente -->
                  <button
                    *ngIf="res.status?.code === 'CONFIRMED' || res.status?.code === 'PENDING'"
                    type="button"
                    (click)="openCheckInModal(res)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <app-icon name="key" [size]="14"></app-icon>
                    Check-In
                  </button>

                  <!-- Botón Check-Out si está en estadía -->
                  <button
                    *ngIf="res.status?.code === 'CHECKED_IN'"
                    type="button"
                    (click)="openCheckOutModal(res)"
                    class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <app-icon name="log-out" [size]="14"></app-icon>
                    Check-Out
                  </button>

                  <!-- Botón Folio -->
                  <button
                    type="button"
                    (click)="openFolioModal(res)"
                    class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <app-icon name="shopping-bag" [size]="14"></app-icon>
                    Folio
                  </button>

                  <!-- Botón Comprobante WhatsApp -->
                  <button
                    type="button"
                    (click)="openReceiptModal(res)"
                    class="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-900 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                    title="Emitir comprobante en imagen para WhatsApp"
                  >
                    <app-icon name="image" [size]="14" class="text-amber-700"></app-icon>
                    <span>Comprobante</span>
                  </button>

                  <!-- Botón Cancelar si no está finalizada ni cancelada -->
                  <button
                    *ngIf="res.status?.code !== 'CHECKED_OUT' && res.status?.code !== 'CANCELLED'"
                    type="button"
                    (click)="openCancelModal(res)"
                    class="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                    title="Cancelar reserva"
                  >
                    <app-icon name="x-circle" [size]="14" class="text-rose-600"></app-icon>
                    Cancelar
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredReservations().length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                  <app-icon name="calendar" [size]="32" class="mx-auto mb-2 text-slate-300"></app-icon>
                  No se encontraron reservas con el criterio seleccionado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL 1: CHECK-IN CON RESERVA PREVIA                      -->
      <!-- ======================================================== -->
      <div
        *ngIf="showCheckInModal() && checkInTarget()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <app-icon name="key" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">
                  Procesar Check-In de Huésped
                </h3>
                <span class="text-xs text-slate-400 font-mono">
                  Reserva: {{ checkInTarget()!.reservation_code }}
                </span>
              </div>
            </div>

            <button (click)="showCheckInModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Huésped y Datos de Estadía -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Huésped Titular</span>
                <span class="text-sm font-bold text-slate-900">
                  {{ checkInTarget()!.main_guest?.first_name }} {{ checkInTarget()!.main_guest?.last_name }}
                </span>
              </div>
              <span class="text-xs text-slate-600 font-mono font-medium">
                Doc: {{ checkInTarget()!.main_guest?.document_number }}
              </span>
            </div>

            <div class="text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200/50">
              <span>Fechas: {{ checkInTarget()!.check_in_date }} al {{ checkInTarget()!.check_out_date }}</span>
              <span class="font-bold text-slate-800">{{ calculateNights(checkInTarget()!.check_in_date, checkInTarget()!.check_out_date) }} noche(s)</span>
            </div>
          </div>

          <!-- Habitación Asignada & Validación de Limpieza -->
          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Habitación Asignada y Estado de Limpieza
            </label>

            <div *ngFor="let rr of checkInTarget()!.rooms" class="p-3.5 rounded-2xl border mb-2 flex items-center justify-between"
              [ngClass]="isRoomClean(rr.room) ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'">
              
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 text-sm">
                  {{ rr.room?.room_number }}
                </div>
                <div>
                  <span class="font-bold text-slate-900 text-xs block">
                    Habitación {{ rr.room?.room_number }} — {{ rr.room?.room_type?.name }}
                  </span>
                  <span class="text-[11px] text-slate-500">
                    Piso {{ rr.room?.floor }} • Tarifa por noche: S/. {{ rr.price_per_night }}
                  </span>
                </div>
              </div>

              <div>
                <app-status-badge
                  [text]="rr.room?.housekeeping_status?.name || 'Limpia'"
                  [colorHex]="rr.room?.housekeeping_status?.color_hex"
                  [bgHex]="rr.room?.housekeeping_status?.badge_bg_hex"
                  [textHex]="rr.room?.housekeeping_status?.badge_text_hex"
                  [iconName]="rr.room?.housekeeping_status?.icon_name"
                ></app-status-badge>
              </div>
            </div>

            <!-- Alerta si NO está limpia -->
            <div *ngIf="!areAllRoomsClean(checkInTarget()!)" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs mt-2 space-y-2">
              <div class="flex items-center gap-2 font-bold text-amber-800">
                <app-icon name="alert-triangle" [size]="16" class="text-amber-600"></app-icon>
                Atención: La habitación no está reportada como LIMPIA por camarería.
              </div>
              <p class="text-[11px] text-amber-700">
                El sistema recomienda asignar una habitación limpia antes de entregar la llave. Si el recepcionista tiene confirmación verbal de gobernanza, marque la casilla para autorizar.
              </p>
              <label class="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" [(ngModel)]="checkInForm.force" class="rounded text-amber-600" />
                <span class="text-xs font-semibold text-amber-900">Autorizar Check-In excepcional</span>
              </label>
            </div>
          </div>

          <!-- Balance Financiero y Cobro al Check-In -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Total Estancia:</span>
              <span class="font-bold text-slate-900">S/. {{ checkInTarget()!.total_amount }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Anticipos Registrados:</span>
              <span class="font-bold text-emerald-600">S/. {{ checkInTarget()!.paid_amount }}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200/50">
              <span class="text-slate-800">Saldo Pendiente por Cobrar:</span>
              <span [ngClass]="getPendingBalance(checkInTarget()!) > 0 ? 'text-amber-600 font-black text-sm' : 'text-emerald-600'">
                S/. {{ getPendingBalance(checkInTarget()!) }}
              </span>
            </div>

            <!-- Formulario de Cobro Inmediato si hay saldo -->
            <div *ngIf="getPendingBalance(checkInTarget()!) > 0" class="pt-3 border-t border-slate-200/50 space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="checkInForm.registerPayment" class="rounded text-emerald-600" />
                <span class="text-xs font-bold text-slate-800">Registrar Cobro al Check-In</span>
              </label>

              <div *ngIf="checkInForm.registerPayment" class="space-y-3 pt-1">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Monto a Cobrar (S/.) *</label>
                    <input
                      type="number"
                      step="0.5"
                      [(ngModel)]="checkInForm.amount"
                      class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Método de Pago *</label>
                    <app-custom-select
                      [options]="payMethodOptions"
                      [(ngModel)]="checkInForm.payment_method_id"
                    ></app-custom-select>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Nº Operación / Comprobante</label>
                  <input
                    type="text"
                    [(ngModel)]="checkInForm.reference_code"
                    placeholder="OP-12345 o Efectivo en mostrador"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="showCheckInModal.set(false)"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              (click)="confirmCheckIn()"
              [disabled]="!areAllRoomsClean(checkInTarget()!) && !checkInForm.force"
              [ngClass]="(!areAllRoomsClean(checkInTarget()!) && !checkInForm.force) ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer'"
              class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <app-icon name="key" [size]="16"></app-icon>
              Confirmar Check-In y Entregar Llave
            </button>
          </div>

        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL 2: CHECK-IN INMEDIATO (WALK-IN SIN RESERVA)         -->
      <!-- ======================================================== -->
      <div
        *ngIf="showWalkInModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <app-icon name="key" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">
                  Check-In Inmediato en Mostrador (Walk-In)
                </h3>
                <span class="text-xs text-slate-400">
                  Huésped sin reserva previa: asignación directa, cobro y entrega de habitación.
                </span>
              </div>
            </div>

            <button (click)="showWalkInModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="submitWalkIn()" class="space-y-4">
            
            <!-- Huésped -->
            <div class="border-b border-slate-100 pb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">1. Datos del Huésped</span>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">DNI / Pasaporte *</label>
                  <div class="flex gap-1.5">
                    <input
                      type="text"
                      [(ngModel)]="walkInForm.guest.document_number"
                      (blur)="lookupGuest(walkInForm.guest.document_number)"
                      name="wiDocNum"
                      required
                      placeholder="Ej. 74829102"
                      class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      (click)="lookupGuest(walkInForm.guest.document_number)"
                      class="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
                      title="Buscar huésped previo"
                    >
                      <app-icon name="search" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    [(ngModel)]="walkInForm.guest.phone"
                    name="wiPhone"
                    required
                    placeholder="+51 987654321"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Nombres *</label>
                  <input
                    type="text"
                    [(ngModel)]="walkInForm.guest.first_name"
                    name="wiFirstName"
                    required
                    placeholder="Carlos Alberto"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    [(ngModel)]="walkInForm.guest.last_name"
                    name="wiLastName"
                    required
                    placeholder="Sánchez Rivera"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <!-- Estadía y Habitación Limpia Disponible -->
            <div class="border-b border-slate-100 pb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">2. Habitación y Estadía</span>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Fecha Entrada (Hoy)</label>
                  <input
                    type="date"
                    [(ngModel)]="walkInForm.check_in_date"
                    name="wiInDate"
                    (change)="recalculateWalkInTotal()"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Fecha Salida *</label>
                  <input
                    type="date"
                    [(ngModel)]="walkInForm.check_out_date"
                    name="wiOutDate"
                    (change)="recalculateWalkInTotal()"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Seleccionar Habitación Disponible (Limpia) *</label>
                <app-custom-select
                  [options]="availableCleanRoomOptions"
                  [(ngModel)]="walkInForm.selectedRoomId"
                  (ngModelChange)="onWalkInRoomChange($event)"
                  name="wiRoom"
                  placeholder="Seleccione habitación limpia"
                ></app-custom-select>
              </div>

              <!-- Resumen Calculado de Noches -->
              <div *ngIf="walkInCalculatedTotal >= 0" class="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span class="text-amber-900 font-medium">
                  {{ walkInCalculatedNights }} noche(s) x S/. {{ walkInRoomPrice }}/noche
                </span>
                <span class="font-black text-amber-950 text-sm">
                  Total Hospedaje: S/. {{ walkInCalculatedTotal }}
                </span>
              </div>

              <!-- Descuento y Código Promocional Walk-In -->
              <div class="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Descuento / Oferta (S/.)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    [(ngModel)]="walkInForm.discount_amount"
                    (ngModelChange)="recalculateWalkInTotal()"
                    name="wiDiscount"
                    placeholder="0.00"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Cupón o Motivo de Oferta</label>
                  <input
                    type="text"
                    [(ngModel)]="walkInForm.discount_reason"
                    name="wiReason"
                    placeholder="Ej: PROMO-FINDE, PROMO-CORP"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold uppercase text-slate-800"
                  />
                </div>
              </div>
            </div>

            <!-- Cobro Inmediato (Recomendado en Walk-in) -->
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">3. Cobro en Recepción</span>
              
              <label class="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" [(ngModel)]="walkInForm.registerPayment" name="wiPayCheck" class="rounded text-emerald-600" />
                <span class="text-xs font-bold text-slate-800">Registrar Cobro Inmediato (Recomendado)</span>
              </label>

              <div *ngIf="walkInForm.registerPayment" class="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Monto Pagado (S/.) *</label>
                    <input
                      type="number"
                      step="0.5"
                      [(ngModel)]="walkInForm.payment.amount"
                      name="wiAmount"
                      class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Método de Pago *</label>
                    <app-custom-select
                      [options]="payMethodOptions"
                      [(ngModel)]="walkInForm.payment.payment_method_id"
                      name="wiPayMethod"
                    ></app-custom-select>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Nº Comprobante / Voucher</label>
                  <input
                    type="text"
                    [(ngModel)]="walkInForm.payment.reference_code"
                    name="wiRef"
                    placeholder="Ej. OP-449102 o Efectivo Recepción"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showWalkInModal.set(false)"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <app-icon name="key" [size]="16"></app-icon>
                Completar Check-In Walk-In
              </button>
            </div>

          </form>

        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL 3: CHECK-OUT Y SALIDA DE HUÉSPED                    -->
      <!-- ======================================================== -->
      <div
        *ngIf="showCheckOutModal() && checkOutTarget()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <app-icon name="log-out" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">
                  Check-Out y Entrega de Habitación
                </h3>
                <span class="text-xs text-slate-400 font-mono">
                  Folio: {{ checkOutTarget()!.reservation_code }}
                </span>
              </div>
            </div>

            <button (click)="showCheckOutModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Resumen de Cuenta / Folio -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Huésped:</span>
              <span class="font-bold text-slate-900">{{ checkOutTarget()!.main_guest?.first_name }} {{ checkOutTarget()!.main_guest?.last_name }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Total Hospedaje:</span>
              <span class="font-semibold text-slate-800">S/. {{ checkOutTarget()!.total_accommodation }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Consumos Frigobar / Extras:</span>
              <span class="font-semibold text-amber-600">+S/. {{ checkOutTarget()!.total_extras }}</span>
            </div>
            <div *ngIf="checkOutTarget()!.total_discount > 0" class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Descuento / Oferta:</span>
              <span class="font-semibold text-emerald-600">-S/. {{ checkOutTarget()!.total_discount }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Pagos / Abonos Recibidos:</span>
              <span class="font-semibold text-emerald-600">-S/. {{ checkOutTarget()!.paid_amount }}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200/50">
              <span class="text-slate-900">Saldo Pendiente a Liquidar:</span>
              <span
                class="text-sm font-black"
                [ngClass]="getPendingBalance(checkOutTarget()!) > 0 ? 'text-red-600' : 'text-emerald-600'"
              >
                S/. {{ getPendingBalance(checkOutTarget()!) }}
              </span>
            </div>
          </div>

          <!-- Si hay saldo pendiente, formulario de cobro -->
          <div *ngIf="getPendingBalance(checkOutTarget()!) > 0" class="border border-red-200 bg-red-50/40 p-4 rounded-2xl mb-4 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold text-red-800">
              <app-icon name="alert-triangle" [size]="16" class="text-red-600"></app-icon>
              El huésped debe liquidar su cuenta antes de retirarse.
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Monto a Cobrar (S/.) *</label>
                <input
                  type="number"
                  step="0.5"
                  [(ngModel)]="checkOutForm.amount"
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Método de Pago *</label>
                <app-custom-select
                  [options]="payMethodOptions"
                  [(ngModel)]="checkOutForm.payment_method_id"
                ></app-custom-select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">Nº Operación / Voucher</label>
              <input
                type="text"
                [(ngModel)]="checkOutForm.reference_code"
                placeholder="OP-98765"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <label class="flex items-center gap-2 cursor-pointer pt-1">
              <input type="checkbox" [(ngModel)]="checkOutForm.force" class="rounded text-red-600" />
              <span class="text-xs font-semibold text-red-800">Forzar Check-Out con saldo pendiente (Autorizado)</span>
            </label>
          </div>

          <div *ngIf="getPendingBalance(checkOutTarget()!) === 0" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 mb-4">
            <app-icon name="check-circle" [size]="16" class="text-emerald-600"></app-icon>
            Cuenta totalmente saldada. La habitación se marcará en estado SUCIA para limpieza inmediata.
          </div>

          <!-- Actions -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="showCheckOutModal.set(false)"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              (click)="confirmCheckOut()"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="log-out" [size]="16" class="text-amber-400"></app-icon>
              Confirmar Salida y Liberar Habitación
            </button>
          </div>

        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL 4: NUEVA RESERVA FUTURA                             -->
      <!-- ======================================================== -->
      <div
        *ngIf="showNewReservationModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="calendar" [size]="18" class="text-amber-500"></app-icon>
              Registrar Reserva Futura
            </h3>
            <button (click)="showNewReservationModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="submitNewReservation()" class="space-y-4">
            <div class="border-b border-slate-100 pb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Huésped Titular</span>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">DNI / Pasaporte *</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.document_number"
                    (blur)="lookupGuest(newForm.guest.document_number, 'new')"
                    name="resDocNum"
                    required
                    placeholder="74829102"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.phone"
                    name="resPhone"
                    placeholder="+51 987654321"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Nombres *</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.first_name"
                    name="resFirstName"
                    required
                    placeholder="Juan Carlos"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.last_name"
                    name="resLastName"
                    required
                    placeholder="Pérez Gómez"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Fechas y Habitación</span>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Fecha Entrada *</label>
                  <input
                    type="date"
                    [(ngModel)]="newForm.check_in_date"
                    name="resInDate"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Fecha Salida *</label>
                  <input
                    type="date"
                    [(ngModel)]="newForm.check_out_date"
                    name="resOutDate"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Seleccionar Habitación *</label>
                <app-custom-select
                  [options]="roomOptions"
                  [(ngModel)]="newForm.selectedRoomId"
                  name="resRoom"
                  placeholder="Seleccione la habitación"
                ></app-custom-select>
              </div>

              <!-- Descuento y Código Promocional Nueva Reserva -->
              <div class="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Descuento / Oferta (S/.)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    [(ngModel)]="newForm.discount_amount"
                    name="resDiscount"
                    placeholder="0.00"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Cupón o Motivo de Oferta</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.discount_reason"
                    name="resReason"
                    placeholder="Ej: PROMO-ANTICIPADA"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold uppercase text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showNewReservationModal.set(false)"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Guardar Reserva Confirmada
              </button>
            </div>
          </form>

        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL 5: FOLIO COMPLETO & CARGOS EXTRAS                   -->
      <!-- ======================================================== -->
      <div
        *ngIf="showFolioModal() && currentFolio()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-mono text-xs font-bold">
                  {{ currentFolio()!.reservation_code }}
                </span>
                <h3 class="text-base font-bold text-slate-900">
                  Folio: {{ currentFolio()!.main_guest?.first_name }} {{ currentFolio()!.main_guest?.last_name }}
                </h3>
              </div>
              <span class="text-xs text-slate-400">
                Estadía: {{ currentFolio()!.check_in_date }} al {{ currentFolio()!.check_out_date }}
              </span>
            </div>

            <button (click)="showFolioModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Aviso de Cuenta Liquidada / Check-Out Finalizado -->
          <div
            *ngIf="currentFolio()!.status?.code === 'CHECKED_OUT' || currentFolio()!.status?.code === 'CANCELLED'"
            class="mb-4 p-3.5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-700"
          >
            <app-icon name="lock" [size]="18" class="text-amber-600 shrink-0"></app-icon>
            <div>
              <span class="font-bold text-slate-900 block">Cuenta Liquidada • Check-Out Finalizado</span>
              <span class="text-slate-600">Por control contable y auditoría de egresos, no está permitido ingresar consumos adicionales ni alterar ofertas tras la salida del huésped.</span>
            </div>
          </div>

          <!-- Totals Ribbon -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-center">
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Total Estancia</span>
              <span class="text-base font-black text-slate-900 block">S/. {{ currentFolio()!.total_accommodation }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Cargos Extras</span>
              <span class="text-base font-black text-amber-600 block">+S/. {{ currentFolio()!.total_extras }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Descuento</span>
              <span class="text-base font-black text-emerald-600 block">-S/. {{ currentFolio()!.total_discount || 0 }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Saldo Pendiente</span>
              <span
                class="text-base font-black block"
                [ngClass]="getPendingBalance(currentFolio()!) > 0 ? 'text-red-600' : 'text-emerald-600'"
              >
                S/. {{ getPendingBalance(currentFolio()!) }}
              </span>
            </div>
          </div>

          <!-- Consumos Extras / Frigobar -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <app-icon name="shopping-bag" [size]="16" class="text-amber-600"></app-icon>
                Consumos Extras / Frigobar
              </h4>
              <button
                *ngIf="currentFolio()!.status?.code !== 'CHECKED_OUT' && currentFolio()!.status?.code !== 'CANCELLED'"
                type="button"
                (click)="showAddExtra.set(true)"
                class="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
              >
                + Agregar Consumo
              </button>
            </div>

            <div class="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div *ngFor="let charge of currentFolio()!.extra_charges" class="p-3 bg-white flex items-center justify-between border-b border-slate-50">
                <div>
                  <span class="font-bold text-slate-900 block">{{ charge.concept }}</span>
                  <span class="text-[10px] text-slate-400">{{ charge.category?.name || 'Consumo' }} (Cant: {{ charge.quantity }})</span>
                </div>
                <span class="font-bold text-slate-800">S/. {{ charge.total_price }}</span>
              </div>
              <div *ngIf="!currentFolio()!.extra_charges || currentFolio()!.extra_charges.length === 0" class="p-3 text-center text-slate-400">
                Sin cargos extras registrados
              </div>
            </div>
          </div>

          <!-- Descuentos y Ofertas Promocionales -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <app-icon name="sparkles" [size]="16" class="text-emerald-600"></app-icon>
                Descuentos & Ofertas Aplicadas
              </h4>
              <button
                *ngIf="currentFolio()!.status?.code !== 'CHECKED_OUT' && currentFolio()!.status?.code !== 'CANCELLED'"
                type="button"
                (click)="showAddDiscount.set(true)"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
              >
                + Aplicar Descuento / Oferta
              </button>
            </div>

            <div class="p-3.5 bg-white border border-slate-100 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-900 block">
                  {{ (currentFolio()!.total_discount > 0) ? 'Descuento Activo en Cuenta' : 'Sin descuento promocional aplicado' }}
                </span>
                <span class="text-[11px] text-slate-500">
                  {{ currentFolio()!.notes || 'Tarifa general de sistema' }}
                </span>
              </div>
              <span class="font-black text-sm" [ngClass]="currentFolio()!.total_discount > 0 ? 'text-emerald-600' : 'text-slate-400'">
                -S/. {{ currentFolio()!.total_discount || 0 }}
              </span>
            </div>
          </div>

          <!-- Pagos y Abonos -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <app-icon name="credit-card" [size]="16" class="text-emerald-600"></app-icon>
                Pagos & Abonos Realizados
              </h4>
              <button
                *ngIf="currentFolio()!.status?.code !== 'CHECKED_OUT' || getPendingBalance(currentFolio()!) > 0"
                type="button"
                (click)="showAddPayment.set(true)"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
              >
                + Registrar Pago
              </button>
            </div>

            <div class="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div *ngFor="let pay of currentFolio()!.payments" class="p-3 bg-white flex items-center justify-between border-b border-slate-50">
                <div>
                  <span class="font-bold text-slate-900 block">{{ pay.payment_method?.name || 'Pago' }}</span>
                  <span class="text-[10px] text-slate-400">{{ pay.paid_at | date:'short' }} {{ pay.reference_code ? '• Ref: ' + pay.reference_code : '' }}</span>
                </div>
                <span class="font-bold text-emerald-600">+S/. {{ pay.amount }}</span>
              </div>
              <div *ngIf="!currentFolio()!.payments || currentFolio()!.payments.length === 0" class="p-3 text-center text-slate-400">
                No hay pagos registrados aún
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              (click)="openReceiptModal()"
              [disabled]="isGeneratingReceipt()"
              class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="image" [size]="16" class="text-slate-950"></app-icon>
              <span>{{ isGeneratingReceipt() ? 'Generando Imagen...' : 'Comprobante / WhatsApp' }}</span>
            </button>

            <button
              type="button"
              (click)="showFolioModal.set(false)"
              class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Folio
            </button>
          </div>

        </div>
      </div>

      <!-- MODAL AGREGAR CONSUMO EXTRA -->
      <div
        *ngIf="showAddExtra()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-slate-800">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Agregar Consumo de Frigobar / Servicio</h3>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Concepto *</label>
              <input
                type="text"
                [(ngModel)]="extraForm.concept"
                placeholder="Ej. Agua Mineral con Gas 500ml"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  [(ngModel)]="extraForm.quantity"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Precio Unit. (S/.) *</label>
                <input
                  type="number"
                  step="0.5"
                  [(ngModel)]="extraForm.unit_price"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="showAddExtra.set(false)"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="saveExtraCharge()"
              class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Guardar Cargo
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL REGISTRAR PAGO DIRECTO EN FOLIO -->
      <div
        *ngIf="showAddPayment()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-slate-800">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Registrar Pago / Abono a la Cuenta</h3>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Monto a Cobrar (S/.) *</label>
              <input
                type="number"
                step="0.5"
                [(ngModel)]="directPaymentForm.amount"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Método de Pago *</label>
              <app-custom-select
                [options]="payMethodOptions"
                [(ngModel)]="directPaymentForm.payment_method_id"
              ></app-custom-select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Nº Operación / Voucher</label>
              <input
                type="text"
                [(ngModel)]="directPaymentForm.reference_code"
                placeholder="OP-987654"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="showAddPayment.set(false)"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="saveDirectPayment()"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Cobrar Abono
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL APLICAR DESCUENTO / OFERTA EN FOLIO -->
      <div
        *ngIf="showAddDiscount()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-slate-800">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <app-icon name="sparkles" [size]="16" class="text-amber-600"></app-icon>
              Aplicar Descuento / Oferta
            </h3>
            <button (click)="showAddDiscount.set(false)" class="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Monto de Descuento (S/.) *</label>
              <input
                type="number"
                step="1"
                min="1"
                [(ngModel)]="discountForm.discount_amount"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Código Promocional o Motivo</label>
              <input
                type="text"
                [(ngModel)]="discountForm.reason"
                placeholder="Ej: PROMO-FINDE, PROMO-CORP, Cortesía"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold uppercase text-slate-800"
              />
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="showAddDiscount.set(false)"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="saveDiscount()"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Aplicar Descuento
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL 6: CANCELAR RESERVA                                -->
      <!-- ======================================================== -->
      <div
        *ngIf="showCancelModal() && cancelTarget()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <app-icon name="x-circle" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">Cancelar Reserva</h3>
                <p class="text-xs text-slate-400">
                  {{ cancelTarget()?.reservation_code }} — {{ cancelTarget()?.main_guest?.first_name }} {{ cancelTarget()?.main_guest?.last_name }}
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeCancelModal()"
              class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <!-- Alert -->
          <div class="my-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <app-icon name="alert-triangle" [size]="18" class="text-amber-600 shrink-0 mt-0.5"></app-icon>
            <div>
              <p class="font-bold">Liberación inmediata de habitaciones</p>
              <p class="mt-0.5 text-amber-800">
                Al confirmar la cancelación, la reserva pasará a estado <strong>Cancelada</strong> y todas las habitaciones asociadas quedarán <strong>Disponibles</strong> de inmediato en el Rack y Cotizador.
              </p>
            </div>
          </div>

          <!-- Body Form -->
          <div class="space-y-4">
            <!-- Motivo de Cancelación -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Motivo de Cancelación <span class="text-rose-500">*</span>
              </label>
              <select
                [(ngModel)]="cancelReason"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Cancelación solicitada por el huésped">Cancelación solicitada por el huésped</option>
                <option value="No-Show / Huésped no se presentó">No-Show / Huésped no se presentó</option>
                <option value="Cambio de fechas o itinerario">Cambio de fechas o itinerario</option>
                <option value="Problemas personales o de fuerza mayor">Problemas personales o de fuerza mayor</option>
                <option value="Error de registro o duplicidad">Error de registro o duplicidad</option>
                <option value="Otro motivo">Otro motivo</option>
              </select>
            </div>

            <!-- Observaciones adicionales -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Detalles u Observaciones (Opcional)</label>
              <textarea
                [(ngModel)]="cancelNotes"
                rows="3"
                placeholder="Indique detalles adicionales sobre la cancelación (ej. solicitud por WhatsApp/teléfono, acuerdos de reembolso, etc.)..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition-all"
              ></textarea>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="closeCancelModal()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Regresar
            </button>
            <button
              type="button"
              (click)="confirmCancellation()"
              [disabled]="isCancelling()"
              class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <app-icon *ngIf="!isCancelling()" name="x-circle" [size]="16"></app-icon>
              <span *ngIf="isCancelling()">Cancelando...</span>
              <span *ngIf="!isCancelling()">Confirmar Cancelación</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL COMPROBANTE EN FORMATO IMAGEN PARA WHATSAPP       -->
      <!-- ======================================================== -->
      <app-receipt-modal
        [receipt]="generatedReceipt()"
        (close)="generatedReceipt.set(null)"
      ></app-receipt-modal>

    </div>
  `
})
export class ReservationsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receiptCanvas = inject(ReceiptCanvasService);

  generatedReceipt = signal<GeneratedReceipt | null>(null);
  hotelSettings = signal<any | null>(null);
  isGeneratingReceipt = signal<boolean>(false);

  reservations = signal<any[]>([]);
  rooms = signal<any[]>([]);
  
  roomOptions: SelectOption[] = [];
  availableCleanRoomOptions: SelectOption[] = [];
  payMethodOptions: SelectOption[] = [];

  filterTab = signal<string>('ALL'); // ALL, PENDING, CHECKED_IN, CHECKED_OUT
  searchQuery: string = '';

  // Modals state
  showCheckInModal = signal<boolean>(false);
  checkInTarget = signal<any | null>(null);

  showWalkInModal = signal<boolean>(false);
  showCheckOutModal = signal<boolean>(false);
  checkOutTarget = signal<any | null>(null);

  showNewReservationModal = signal<boolean>(false);
  showCancelModal = signal<boolean>(false);
  cancelTarget = signal<any | null>(null);
  cancelReason: string = 'Cancelación solicitada por el huésped';
  cancelNotes: string = '';
  isCancelling = signal<boolean>(false);

  showFolioModal = signal<boolean>(false);
  showAddExtra = signal<boolean>(false);
  showAddPayment = signal<boolean>(false);
  showAddDiscount = signal<boolean>(false);

  currentFolio = signal<any | null>(null);

  // Forms
  checkInForm = {
    registerPayment: true,
    amount: 0,
    payment_method_id: 1,
    reference_code: '',
    force: false
  };

  walkInForm = {
    guest: {
      document_type_id: 1,
      document_number: '',
      first_name: '',
      last_name: '',
      phone: ''
    },
    check_in_date: new Date().toISOString().substring(0, 10),
    check_out_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
    selectedRoomId: null as number | null,
    total_guests: 1,
    discount_amount: 0,
    discount_reason: '',
    registerPayment: true,
    payment: {
      amount: 0,
      payment_method_id: 1,
      reference_code: ''
    }
  };

  walkInCalculatedNights: number = 1;
  walkInRoomPrice: number = 0;
  walkInCalculatedTotal: number = 0;

  checkOutForm = {
    amount: 0,
    payment_method_id: 1,
    reference_code: '',
    force: false
  };

  newForm = {
    guest: {
      document_type_id: 1,
      document_number: '',
      first_name: '',
      last_name: '',
      phone: ''
    },
    check_in_date: new Date().toISOString().substring(0, 10),
    check_out_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
    selectedRoomId: null as number | null,
    total_guests: 1,
    discount_amount: 0,
    discount_reason: ''
  };

  discountForm = {
    discount_amount: 10,
    reason: ''
  };

  extraForm = {
    concept: '',
    quantity: 1,
    unit_price: 5.0
  };

  directPaymentForm = {
    amount: 50.0,
    payment_method_id: 1,
    reference_code: ''
  };

  ngOnInit() {
    this.loadPaymentMethods();
    this.loadRooms();
    this.loadHotelSettings();
    this.loadReservations(() => {
      this.checkUrlParams();
    });
  }

  loadReservations(callback?: () => void) {
    this.api.get<any[]>('reservations').subscribe({
      next: (data) => {
        this.reservations.set(data);
        if (this.currentFolio()) {
          const currentId = this.currentFolio()!.id;
          const updated = data.find((r) => r.id === currentId);
          if (updated) {
            this.currentFolio.set({
              ...this.currentFolio()!,
              ...updated,
              extra_charges: updated.extra_charges || this.currentFolio()!.extra_charges,
              payments: updated.payments || this.currentFolio()!.payments
            });
          }
        }
        if (callback) callback();
      },
      error: () => this.toast.error('No se pudieron cargar las reservas')
    });
  }

  loadRooms() {
    this.api.get<any[]>('rooms').subscribe((data) => {
      this.rooms.set(data);
      this.roomOptions = data.map((r) => ({
        value: r.id,
        label: `Habitación ${r.room_number} - ${r.room_type?.name} (S/. ${r.room_type?.base_price})`,
        sublabel: `Piso ${r.floor} • ${r.operational_status?.name} • ${r.housekeeping_status?.name}`
      }));

      // Filtrar para Walk-in: solo habitaciones Disponibles y Limpias
      this.availableCleanRoomOptions = data
        .filter((r) => r.operational_status?.code === 'AVAILABLE' && r.housekeeping_status?.code === 'CLEAN')
        .map((r) => ({
          value: r.id,
          label: `Hab. ${r.room_number} - ${r.room_type?.name} (S/. ${r.room_type?.base_price}/noche)`,
          sublabel: `Piso ${r.floor} • Lista para entrega`
        }));
    });
  }

  loadPaymentMethods() {
    this.api.get<any[]>('statuses/payment-methods').subscribe((data) => {
      this.payMethodOptions = data.map((pm) => ({
        value: pm.id,
        label: pm.name
      }));
    });
  }

  checkUrlParams() {
    this.route.queryParams.subscribe((params) => {
      const action = params['action'];
      const roomId = params['room_id'] ? parseInt(params['room_id'], 10) : null;
      const resId = params['res_id'] ? parseInt(params['res_id'], 10) : null;

      if (action === 'walkin') {
        this.openWalkInModal(roomId);
      } else if (action === 'new') {
        this.openNewReservationModal(roomId);
      } else if (action === 'checkin' && resId) {
        const found = this.reservations().find((r) => r.id === resId);
        if (found) this.openCheckInModal(found);
      } else if (action === 'checkout' && resId) {
        const found = this.reservations().find((r) => r.id === resId);
        if (found) this.openCheckOutModal(found);
      } else if (action === 'folio' && resId) {
        const found = this.reservations().find((r) => r.id === resId);
        if (found) this.openFolioModal(found);
      }
    });
  }

  filteredReservations(): any[] {
    return this.reservations().filter((res) => {
      // Filtro por tab
      const code = res.status?.code;
      if (this.filterTab() === 'PENDING' && code !== 'CONFIRMED' && code !== 'PENDING') return false;
      if (this.filterTab() === 'CHECKED_IN' && code !== 'CHECKED_IN') return false;
      if (this.filterTab() === 'CHECKED_OUT' && code !== 'CHECKED_OUT') return false;
      if (this.filterTab() === 'CANCELLED' && code !== 'CANCELLED') return false;

      // Filtro por búsqueda
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const guestName = `${res.main_guest?.first_name || ''} ${res.main_guest?.last_name || ''}`.toLowerCase();
        const doc = (res.main_guest?.document_number || '').toLowerCase();
        const resCode = (res.reservation_code || '').toLowerCase();
        return guestName.includes(q) || doc.includes(q) || resCode.includes(q);
      }

      return true;
    });
  }

  getCountByStatusGroup(group: string): number {
    return this.reservations().filter((res) => {
      const code = res.status?.code;
      if (group === 'PENDING') return code === 'CONFIRMED' || code === 'PENDING';
      if (group === 'CHECKED_IN') return code === 'CHECKED_IN';
      if (group === 'CHECKED_OUT') return code === 'CHECKED_OUT';
      if (group === 'CANCELLED') return code === 'CANCELLED';
      return true;
    }).length;
  }

  calculateNights(dIn: string, dOut: string): number {
    if (!dIn || !dOut) return 1;
    const t1 = new Date(dIn).getTime();
    const t2 = new Date(dOut).getTime();
    return Math.max(1, Math.round((t2 - t1) / (1000 * 3600 * 24)));
  }

  getPendingBalance(res: any): number {
    if (!res) return 0;
    return Math.max(0, Number(res.total_amount || 0) - Number(res.paid_amount || 0));
  }

  isRoomClean(room: any): boolean {
    if (!room) return false;
    return room.housekeeping_status?.code === 'CLEAN';
  }

  areAllRoomsClean(res: any): boolean {
    if (!res || !res.rooms) return true;
    return res.rooms.every((rr: any) => this.isRoomClean(rr.room));
  }

  lookupGuest(docNumber: string, targetForm: 'walkin' | 'new' = 'walkin') {
    if (!docNumber || docNumber.trim().length < 4) return;
    this.api.get<any[]>('reservations/guests', { q: docNumber.trim() }).subscribe((guests) => {
      if (guests && guests.length > 0) {
        const match = guests.find((g) => g.document_number === docNumber.trim()) || guests[0];
        if (targetForm === 'walkin') {
          this.walkInForm.guest.first_name = match.first_name;
          this.walkInForm.guest.last_name = match.last_name;
          this.walkInForm.guest.phone = match.phone || '';
          this.toast.info(`Huésped recurrente encontrado: ${match.first_name} ${match.last_name}`);
        } else {
          this.newForm.guest.first_name = match.first_name;
          this.newForm.guest.last_name = match.last_name;
          this.newForm.guest.phone = match.phone || '';
          this.toast.info(`Huésped recurrente encontrado: ${match.first_name} ${match.last_name}`);
        }
      }
    });
  }

  // ==========================================
  // FLUJO 1: CHECK-IN CON RESERVA PREVIA
  // ==========================================
  openCheckInModal(res: any) {
    this.api.get<any>(`reservations/${res.id}`).subscribe({
      next: (full) => {
        this.checkInTarget.set(full);
        const pending = this.getPendingBalance(full);
        this.checkInForm.amount = pending;
        this.checkInForm.registerPayment = pending > 0;
        this.checkInForm.payment_method_id = this.payMethodOptions[0]?.value || 1;
        this.checkInForm.reference_code = '';
        this.checkInForm.force = false;
        this.showCheckInModal.set(true);
      },
      error: () => this.toast.error('Error al cargar datos de la reserva')
    });
  }

  confirmCheckIn() {
    const res = this.checkInTarget();
    if (!res) return;

    const payload: any = {
      force: this.checkInForm.force
    };

    if (this.checkInForm.registerPayment && Number(this.checkInForm.amount) > 0) {
      payload.payment = {
        amount: Number(this.checkInForm.amount),
        payment_method_id: this.checkInForm.payment_method_id,
        reference_code: this.checkInForm.reference_code,
        notes: 'Pago en Check-In'
      };
    }

    this.api.post(`reservations/${res.id}/checkin`, payload).subscribe({
      next: () => {
        this.toast.success(`Check-In exitoso para la reserva ${res.reservation_code}. Habitación ocupada.`);
        this.showCheckInModal.set(false);
        this.loadReservations();
        this.loadRooms();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al procesar el Check-In');
      }
    });
  }

  // ==========================================
  // FLUJO 2: CHECK-IN INMEDIATO (WALK-IN)
  // ==========================================
  openWalkInModal(preSelectedRoomId?: number | null) {
    this.loadRooms();
    const today = new Date().toISOString().substring(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().substring(0, 10);

    this.walkInForm = {
      guest: {
        document_type_id: 1,
        document_number: '',
        first_name: '',
        last_name: '',
        phone: ''
      },
      check_in_date: today,
      check_out_date: tomorrow,
      selectedRoomId: preSelectedRoomId || (this.availableCleanRoomOptions[0]?.value as number) || null,
      total_guests: 1,
      discount_amount: 0,
      discount_reason: '',
      registerPayment: true,
      payment: {
        amount: 0,
        payment_method_id: this.payMethodOptions[0]?.value || 1,
        reference_code: ''
      }
    };

    this.recalculateWalkInTotal();
    this.showWalkInModal.set(true);
  }

  onWalkInRoomChange(roomId: number) {
    this.walkInForm.selectedRoomId = roomId;
    this.recalculateWalkInTotal();
  }

  recalculateWalkInTotal() {
    const nights = this.calculateNights(this.walkInForm.check_in_date, this.walkInForm.check_out_date);
    this.walkInCalculatedNights = nights;

    const r = this.rooms().find((rm) => rm.id === this.walkInForm.selectedRoomId);
    if (r) {
      this.walkInRoomPrice = Number(r.room_type?.base_price || 0);
      const subtotal = this.walkInRoomPrice * nights;
      const discount = Number(this.walkInForm.discount_amount || 0);
      this.walkInCalculatedTotal = Math.max(0, subtotal - discount);
      this.walkInForm.payment.amount = this.walkInCalculatedTotal;
    } else {
      this.walkInRoomPrice = 0;
      this.walkInCalculatedTotal = 0;
    }
  }

  submitWalkIn() {
    if (!this.walkInForm.guest.document_number || !this.walkInForm.guest.first_name || !this.walkInForm.selectedRoomId) {
      this.toast.warning('Complete los campos obligatorios del huésped y habitación');
      return;
    }

    const payload: any = {
      is_walk_in: true,
      guest: this.walkInForm.guest,
      room_ids: [this.walkInForm.selectedRoomId],
      check_in_date: this.walkInForm.check_in_date,
      check_out_date: this.walkInForm.check_out_date,
      total_guests: this.walkInForm.total_guests || 1,
      discount_amount: Number(this.walkInForm.discount_amount || 0)
    };

    if (this.walkInForm.discount_reason) {
      payload.notes = `Descuento: ${this.walkInForm.discount_reason}`;
    }

    if (this.walkInForm.registerPayment && Number(this.walkInForm.payment.amount) > 0) {
      payload.payment = {
        amount: Number(this.walkInForm.payment.amount),
        payment_method_id: this.walkInForm.payment.payment_method_id,
        reference_code: this.walkInForm.payment.reference_code,
        notes: 'Cobro Check-In Inmediato Walk-In'
      };
    }

    this.api.post<any>('reservations', payload).subscribe({
      next: (created) => {
        this.toast.success(`Check-In Walk-In registrado (${created.reservation_code}). Habitación ocupada.`);
        this.showWalkInModal.set(false);
        this.loadReservations();
        this.loadRooms();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al completar el Walk-In');
      }
    });
  }

  // ==========================================
  // FLUJO 3: CHECK-OUT Y SALIDA DE HUÉSPED
  // ==========================================
  openCheckOutModal(res: any) {
    this.api.get<any>(`reservations/${res.id}`).subscribe({
      next: (full) => {
        this.checkOutTarget.set(full);
        const pending = this.getPendingBalance(full);
        this.checkOutForm.amount = pending;
        this.checkOutForm.payment_method_id = this.payMethodOptions[0]?.value || 1;
        this.checkOutForm.reference_code = '';
        this.checkOutForm.force = false;
        this.showCheckOutModal.set(true);
      },
      error: () => this.toast.error('Error al cargar datos para Check-Out')
    });
  }

  confirmCheckOut() {
    const res = this.checkOutTarget();
    if (!res) return;

    const payload: any = {
      force: this.checkOutForm.force
    };

    if (Number(this.checkOutForm.amount) > 0) {
      payload.payment = {
        amount: Number(this.checkOutForm.amount),
        payment_method_id: this.checkOutForm.payment_method_id,
        reference_code: this.checkOutForm.reference_code,
        notes: 'Liquidación saldo en Check-Out'
      };
    }

    this.api.post(`reservations/${res.id}/checkout`, payload).subscribe({
      next: () => {
        this.toast.success(`Check-Out finalizado para ${res.reservation_code}. Habitación liberada y marcada para limpieza.`);
        this.showCheckOutModal.set(false);
        this.loadReservations();
        this.loadRooms();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al procesar el Check-Out');
      }
    });
  }

  // ==========================================
  // RESERVA FUTURA REGULAR
  // ==========================================
  openNewReservationModal(preSelectedRoomId?: number | null) {
    this.newForm = {
      guest: {
        document_type_id: 1,
        document_number: '',
        first_name: '',
        last_name: '',
        phone: ''
      },
      check_in_date: new Date().toISOString().substring(0, 10),
      check_out_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
      selectedRoomId: preSelectedRoomId || (this.rooms()[0]?.id as number) || null,
      total_guests: 1,
      discount_amount: 0,
      discount_reason: ''
    };
    this.showNewReservationModal.set(true);
  }

  submitNewReservation() {
    if (!this.newForm.guest.document_number || !this.newForm.guest.first_name || !this.newForm.selectedRoomId) {
      this.toast.warning('Complete los datos obligatorios del huésped y habitación');
      return;
    }

    const payload: any = {
      is_walk_in: false,
      guest: this.newForm.guest,
      room_ids: [this.newForm.selectedRoomId],
      check_in_date: this.newForm.check_in_date,
      check_out_date: this.newForm.check_out_date,
      total_guests: 1,
      discount_amount: Number(this.newForm.discount_amount || 0)
    };

    if (this.newForm.discount_reason) {
      payload.notes = `Descuento: ${this.newForm.discount_reason}`;
    }

    this.api.post('reservations', payload).subscribe({
      next: () => {
        this.toast.success('Reserva futura confirmada exitosamente');
        this.showNewReservationModal.set(false);
        this.loadReservations();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al guardar reserva');
      }
    });
  }

  // ==========================================
  // FOLIO & CARGOS EXTRAS
  // ==========================================
  openFolioModal(res: any) {
    this.api.get(`reservations/${res.id}`).subscribe({
      next: (full) => {
        this.currentFolio.set(full);
        this.directPaymentForm.amount = this.getPendingBalance(full);
        this.showFolioModal.set(true);
      }
    });
  }

  saveExtraCharge() {
    const folio = this.currentFolio();
    if (!folio) return;

    if (folio.status?.code === 'CHECKED_OUT' || folio.status?.code === 'CANCELLED') {
      this.toast.error('No se pueden registrar cargos adicionales en una reserva con Check-Out finalizado.');
      this.showAddExtra.set(false);
      return;
    }

    if (!this.extraForm.concept || !this.extraForm.unit_price) {
      this.toast.warning('Complete el concepto y precio');
      return;
    }

    this.api.post<any>(`reservations/${folio.id}/extras`, {
      concept: this.extraForm.concept,
      quantity: this.extraForm.quantity,
      unit_price: this.extraForm.unit_price
    }).subscribe({
      next: (updated) => {
        this.toast.success('Consumo extra agregado al folio');
        this.currentFolio.set(updated);
        this.showAddExtra.set(false);
        this.extraForm = { concept: '', quantity: 1, unit_price: 5.0 };
        this.loadReservations();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al registrar cargo extra')
    });
  }

  saveDirectPayment() {
    const folio = this.currentFolio();
    if (!folio) return;

    if (!this.directPaymentForm.amount || !this.directPaymentForm.payment_method_id) {
      this.toast.warning('Ingrese el monto y método de pago');
      return;
    }

    this.api.post<any>(`reservations/${folio.id}/payments`, this.directPaymentForm).subscribe({
      next: (updated) => {
        this.toast.success('Pago abonado correctamente');
        this.currentFolio.set(updated);
        this.showAddPayment.set(false);
        this.loadReservations();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al registrar pago')
    });
  }

  saveDiscount() {
    const folio = this.currentFolio();
    if (!folio) return;

    if (folio.status?.code === 'CHECKED_OUT' || folio.status?.code === 'CANCELLED') {
      this.toast.error('No se pueden aplicar ofertas ni descuentos en una reserva con Check-Out finalizado.');
      this.showAddDiscount.set(false);
      return;
    }

    if (Number(this.discountForm.discount_amount) <= 0) {
      this.toast.warning('Ingrese un monto de descuento válido mayor a 0');
      return;
    }

    this.api.post<any>(`reservations/${folio.id}/discount`, {
      discount_amount: Number(this.discountForm.discount_amount),
      reason: this.discountForm.reason || 'Descuento / Oferta especial'
    }).subscribe({
      next: (updated) => {
        this.toast.success('Descuento aplicado al folio exitosamente');
        this.currentFolio.set(updated);
        this.showAddDiscount.set(false);
        this.discountForm = { discount_amount: 10, reason: '' };
        this.loadReservations();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al aplicar descuento')
    });
  }

  loadHotelSettings() {
    this.api.get<any>('hotel/settings').subscribe({
      next: (res) => this.hotelSettings.set(res),
      error: () => console.warn('No se pudo cargar la configuración del hotel para el comprobante')
    });
  }

  printReceipt() {
    this.openReceiptModal();
  }

  async openReceiptModal(reservation?: any) {
    const target = reservation || this.currentFolio();
    if (!target) {
      this.toast.warning('No hay una reserva seleccionada para emitir comprobante');
      return;
    }

    this.isGeneratingReceipt.set(true);
    try {
      const settings = this.hotelSettings();
      const receiptPayload: ReceiptData = {
        hotel: {
          name: settings?.hotel_name || 'HOTEL SAN JUAN BAUTISTA',
          trade_name: settings?.trade_name,
          tax_id: settings?.tax_id || '',
          address: settings?.address || 'Cusco',
          city: settings?.city || 'Cusco',
          country: settings?.country || 'Perú',
          phone: settings?.phone || '',
          whatsapp: settings?.whatsapp || '',
          email: settings?.email || '',
          logo_url: settings?.logo_url || '',
          currency_symbol: settings?.currency_symbol || 'S/.'
        },
        reservation: {
          id: target.id,
          reservation_code: target.reservation_code,
          created_at: target.created_at,
          check_in_date: target.check_in_date,
          check_out_date: target.check_out_date,
          total_accommodation: Number(target.total_accommodation || 0),
          total_extras: Number(target.total_extras || 0),
          total_discount: Number(target.total_discount || 0),
          total_amount: Number(target.total_amount || 0),
          paid_amount: Number(target.paid_amount || 0),
          notes: target.notes,
          guest: {
            first_name: target.main_guest?.first_name || '',
            last_name: target.main_guest?.last_name || '',
            document_type: target.main_guest?.document_type?.name || 'DNI',
            document_number: target.main_guest?.document_number || '',
            phone: target.main_guest?.phone || '',
            email: target.main_guest?.email || '',
            nationality: target.main_guest?.nationality || ''
          },
          rooms: (target.rooms || []).map((r: any) => ({
            room_number: r.room?.room_number || '',
            room_type_name: r.room?.room_type?.name || '',
            price_per_night: Number(r.price_per_night || 0)
          })),
          extra_charges: (target.extra_charges || []).map((c: any) => ({
            concept: c.concept,
            category_name: c.category?.name,
            quantity: Number(c.quantity || 1),
            unit_price: Number(c.unit_price || 0),
            total_price: Number(c.total_price || 0)
          })),
          payments: (target.payments || []).map((p: any) => ({
            paid_at: p.paid_at,
            method_name: p.payment_method?.name || 'Pago',
            reference_code: p.reference_code,
            amount: Number(p.amount || 0)
          }))
        }
      };

      const generated = await this.receiptCanvas.generateReceiptImage(receiptPayload);
      this.generatedReceipt.set(generated);
    } catch (err) {
      console.error('Error generando comprobante:', err);
      this.toast.error('No se pudo generar la imagen del comprobante');
    } finally {
      this.isGeneratingReceipt.set(false);
    }
  }

  openCancelModal(res: any) {
    this.cancelTarget.set(res);
    this.cancelReason = 'Cancelación solicitada por el huésped';
    this.cancelNotes = '';
    this.showCancelModal.set(true);
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.cancelTarget.set(null);
  }

  confirmCancellation() {
    const target = this.cancelTarget();
    if (!target) return;

    this.isCancelling.set(true);
    this.api
      .post(`reservations/${target.id}/cancel`, {
        reason: this.cancelReason,
        notes: this.cancelNotes
      })
      .subscribe({
        next: () => {
          this.toast.success(`Reserva ${target.reservation_code} cancelada exitosamente y habitaciones liberadas.`);
          this.closeCancelModal();
          this.isCancelling.set(false);
          this.loadReservations();
          this.loadRooms();
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'Error al cancelar la reserva');
          this.isCancelling.set(false);
        }
      });
  }
}
