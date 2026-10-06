import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-public-web',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IconComponent,
    CustomSelectComponent,
  ],
  template: `
    <div class="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      <!-- Top Announcement / Contact Bar -->
      <header class="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-6">
            <span class="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <app-icon name="map-pin" [size]="14" class="text-amber-500"></app-icon>
              {{ hotelInfo()?.address || 'Centro Histórico, Perú' }}
            </span>
            <span class="hidden sm:flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <app-icon name="phone" [size]="14" class="text-amber-500"></app-icon>
              {{ hotelInfo()?.phone || '+51 84 234567' }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <a
              routerLink="/login"
              class="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 font-semibold transition-colors"
            >
              <app-icon name="key" [size]="14" class="text-amber-500"></app-icon>
              Acceso Personal (PMS)
            </a>
          </div>
        </div>
      </header>

      <!-- Main Navigation Bar -->
      <nav class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-md">
              <app-icon name="building" [size]="24"></app-icon>
            </div>
            <div>
              <span class="text-xl font-black text-slate-900 tracking-tight block">
                {{ hotelInfo()?.hotel_name || 'hotelSJB' }}
              </span>
              <span class="text-[11px] uppercase tracking-widest text-slate-400 font-semibold block">
                Hospedaje & Confort
              </span>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#habitaciones" class="hover:text-amber-600 transition-colors">Habitaciones</a>
            <a href="#servicios" class="hover:text-amber-600 transition-colors">Servicios</a>
            <a href="#ubicacion" class="hover:text-amber-600 transition-colors">Ubicación</a>
            <a href="#contacto" class="hover:text-amber-600 transition-colors">Contacto</a>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="openWhatsApp()"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="phone" [size]="16"></app-icon>
              <span>WhatsApp Directo</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- HERO SECTION WITH BOOKING ENGINE -->
      <section class="relative bg-slate-900 text-white py-20 lg:py-28 overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div class="max-w-3xl mb-12">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              <app-icon name="sparkles" [size]="14"></app-icon>
              Tarifa Directa Garantizada Sin Comisiones
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Tu Estancia Perfecta con Máximo Confort
            </h1>
            <p class="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Disfruta de habitaciones climatizadas, WiFi de alta velocidad y atención personalizada en la mejor ubicación de la ciudad.
            </p>
          </div>

          <!-- BOOKING & QUOTE BAR -->
          <div class="bg-white rounded-2xl shadow-2xl p-6 text-slate-900 border border-slate-100 max-w-5xl">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <app-icon name="calendar" [size]="16" class="text-amber-600"></app-icon>
              Cotización y Consulta de Disponibilidad
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Check-In -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Fecha de Llegada</label>
                <div class="relative">
                  <input
                    type="date"
                    [(ngModel)]="searchDates.checkIn"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <!-- Check-Out -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Fecha de Salida</label>
                <div class="relative">
                  <input
                    type="date"
                    [(ngModel)]="searchDates.checkOut"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <!-- Tipo de Habitación -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Categoría</label>
                <app-custom-select
                  [options]="roomTypeOptions"
                  [(ngModel)]="searchDates.selectedTypeId"
                  placeholder="Todas las categorías"
                ></app-custom-select>
              </div>

              <!-- Botón Consultar WhatsApp -->
              <div class="flex items-end">
                <button
                  type="button"
                  (click)="consultBooking()"
                  class="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
                >
                  <app-icon name="search" [size]="16"></app-icon>
                  <span>Consultar Reserva</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ROOM CATALOG SECTION -->
      <section id="habitaciones" class="py-20 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-2xl mx-auto mb-14">
            <h2 class="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Alojamiento Exclusivo</h2>
            <h3 class="text-3xl font-black text-slate-900 tracking-tight">Nuestras Habitaciones & Suites</h3>
            <p class="mt-3 text-sm text-slate-600">
              Espacios pensados para su descanso absoluto, equipados con ropa de cama de alta gama y baño privado.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              *ngFor="let type of roomTypes()"
              class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <!-- Photo Container -->
              <div class="relative h-56 bg-slate-200 overflow-hidden">
                <img
                  [src]="type.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'"
                  [alt]="type.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md">
                  {{ hotelInfo()?.currency_symbol || '$' }}{{ type.base_price }} / noche
                </div>
              </div>

              <!-- Body -->
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <span class="flex items-center gap-1">
                      <app-icon name="users" [size]="14" class="text-amber-500"></app-icon>
                      Hasta {{ type.max_capacity }} huéspedes
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <app-icon name="bed" [size]="14" class="text-amber-500"></app-icon>
                      {{ type.bed_summary || '1 Cama' }}
                    </span>
                  </div>

                  <h4 class="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                    {{ type.name }}
                  </h4>

                  <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {{ type.description }}
                  </p>
                </div>

                <!-- Footer & CTA -->
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-slate-400">
                    <app-icon name="wifi" [size]="16" class="text-slate-500" title="WiFi Gratis"></app-icon>
                    <app-icon name="sparkles" [size]="16" class="text-slate-500" title="Limpieza Diaria"></app-icon>
                    <app-icon name="coffee" [size]="16" class="text-slate-500" title="Servicio"></app-icon>
                  </div>

                  <button
                    type="button"
                    (click)="reserveRoom(type)"
                    class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reservar Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- HOTEL AMENITIES SECTION -->
      <section id="servicios" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <h2 class="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Comodidades</h2>
            <h3 class="text-3xl font-black text-slate-900 tracking-tight">Servicios Incluidos</h3>
            <p class="mt-3 text-sm text-slate-600">
              Cuidamos cada detalle para garantizar una estadía placentera, productiva y segura.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="wifi" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">WiFi de Alta Velocidad</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Conexión de fibra óptica dedicada en todas las áreas y habitaciones.</p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="clock" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Recepción 24 Horas</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Personal calificado para atender registros nocturnos y cualquier solicitud.</p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="sparkles" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Limpieza & Desinfección</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Protocolos rigurosos de gobernanza con cambio de toallas y lencería.</p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="shield" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Seguridad & Custodia</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Cámaras de vigilancia en accesos y resguardo seguro de equipaje.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer id="contacto" class="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 text-white font-bold text-base mb-3">
              <app-icon name="building" [size]="20" class="text-amber-500"></app-icon>
              {{ hotelInfo()?.hotel_name || 'hotelSJB' }}
            </div>
            <p class="text-slate-400 leading-relaxed">
              Sistema integral de alojamiento turístico y servicios hoteleros. Diseñado con estándares de alta calidad y gestión eficiente.
            </p>
          </div>

          <div>
            <h5 class="text-white font-bold text-xs uppercase tracking-wider mb-3">Contacto Directo</h5>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <app-icon name="map-pin" [size]="14" class="text-amber-500"></app-icon>
                {{ hotelInfo()?.address || 'Av. Principal 456' }}
              </li>
              <li class="flex items-center gap-2">
                <app-icon name="phone" [size]="14" class="text-amber-500"></app-icon>
                {{ hotelInfo()?.phone || '+51 84 234567' }}
              </li>
              <li class="flex items-center gap-2">
                <app-icon name="phone" [size]="14" class="text-emerald-500"></app-icon>
                WhatsApp: {{ hotelInfo()?.whatsapp || '+51 984123456' }}
              </li>
            </ul>
          </div>

          <div>
            <h5 class="text-white font-bold text-xs uppercase tracking-wider mb-3">Horarios Hoteleros</h5>
            <p class="mb-1">Check-In: {{ hotelInfo()?.check_in_time || '14:00' }} hrs</p>
            <p class="mb-4">Check-Out: {{ hotelInfo()?.check_out_time || '11:00' }} hrs</p>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <app-icon name="check-circle" [size]="14" class="text-emerald-400"></app-icon>
              PWA Instalable en Móvil
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>© 2026 {{ hotelInfo()?.hotel_name || 'hotelSJB' }}. Todos los derechos reservados.</div>
          <div class="mt-2 sm:mt-0">Suite Tecnológica de Hospedaje</div>
        </div>
      </footer>

    </div>
  `
})
export class PublicWebComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  hotelInfo = signal<any>(null);
  roomTypes = signal<any[]>([]);

  searchDates = {
    checkIn: new Date().toISOString().substring(0, 10),
    checkOut: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
    selectedTypeId: null
  };

  roomTypeOptions: SelectOption[] = [];

  ngOnInit() {
    this.loadHotelData();
    this.loadRoomTypes();
  }

  loadHotelData() {
    this.api.get<{ isConfigured: boolean; hotel?: any }>('onboarding/status').subscribe({
      next: (res) => {
        if (res.hotel) {
          this.hotelInfo.set(res.hotel);
        }
      }
    });
  }

  loadRoomTypes() {
    this.api.get<any[]>('rooms/types').subscribe({
      next: (types) => {
        this.roomTypes.set(types);
        this.roomTypeOptions = [
          { value: null, label: 'Todas las Categorías' },
          ...types.map((t) => ({
            value: t.id,
            label: `${t.name} (${t.base_price}/noche)`,
            sublabel: `Capacidad: ${t.max_capacity} pers.`
          }))
        ];
      }
    });
  }

  openWhatsApp() {
    const wa = this.hotelInfo()?.whatsapp || '+51984123456';
    const cleanWa = wa.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hola, deseo consultar información y disponibilidad para el ${this.hotelInfo()?.hotel_name || 'hotel'}.`);
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  }

  consultBooking() {
    const wa = this.hotelInfo()?.whatsapp || '+51984123456';
    const cleanWa = wa.replace(/[^0-9]/g, '');
    const selectedType = this.roomTypes().find((t) => t.id === this.searchDates.selectedTypeId);
    const typeLabel = selectedType ? selectedType.name : 'Cualquier habitación disponible';

    const msg = encodeURIComponent(
      `Hola ${this.hotelInfo()?.hotel_name || ''}, deseo consultar disponibilidad para:\n` +
      `- Habitación: ${typeLabel}\n` +
      `- Entrada: ${this.searchDates.checkIn}\n` +
      `- Salida: ${this.searchDates.checkOut}`
    );
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  }

  reserveRoom(type: any) {
    const wa = this.hotelInfo()?.whatsapp || '+51984123456';
    const cleanWa = wa.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hola, deseo reservar la habitación: ${type.name} (${this.hotelInfo()?.currency_symbol || '$'}${type.base_price}/noche).`
    );
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  }
}
