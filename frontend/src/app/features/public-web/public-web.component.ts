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
    <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      <!-- TOP CONTACT BAR -->
      <header class="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800/80">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-6">
            <span class="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <app-icon name="map-pin" [size]="14" class="text-amber-500"></app-icon>
              {{ hotelInfo()?.address || 'Av. Principal 456, Centro Histórico' }}
            </span>
            <span class="hidden sm:flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <app-icon name="phone" [size]="14" class="text-amber-500"></app-icon>
              {{ hotelInfo()?.phone || '+51 84 234567' }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <app-icon name="shield" [size]="14"></app-icon>
              Garantía de Mejor Tarifa Directa
            </div>
            <a
              routerLink="/login"
              class="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 font-bold transition-colors bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              <app-icon name="key" [size]="13" class="text-amber-500"></app-icon>
              Acceso Staff (PMS)
            </a>
          </div>
        </div>
      </header>

      <!-- NAVIGATION BAR -->
      <nav class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-2xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <!-- Logo Brand -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-md shadow-slate-900/10 border border-slate-800">
              <app-icon name="building" [size]="22"></app-icon>
            </div>
            <div>
              <span class="text-xl font-black text-slate-900 tracking-tight block leading-none">
                {{ hotelInfo()?.hotel_name || 'hotelSJB' }}
              </span>
              <span class="text-[10px] uppercase tracking-widest text-amber-600 font-extrabold block mt-1">
                Hospedaje & Suites
              </span>
            </div>
          </div>

          <!-- Links -->
          <div class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="#inicio" class="hover:text-amber-600 transition-colors">Inicio</a>
            <a href="#habitaciones" class="hover:text-amber-600 transition-colors">Habitaciones</a>
            <a href="#servicios" class="hover:text-amber-600 transition-colors">Servicios</a>
            <a href="#app" class="hover:text-amber-600 transition-colors">App Móvil</a>
            <a href="#contacto" class="hover:text-amber-600 transition-colors">Ubicación</a>
          </div>

          <!-- Direct CTA -->
          <div class="flex items-center gap-2">
            <button
              (click)="openWhatsApp()"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="phone" [size]="15"></app-icon>
              <span>WhatsApp Directo</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- HERO SECTION WITH INTEGRATED BOOKING ENGINE -->
      <section id="inicio" class="relative bg-slate-950 text-white py-20 lg:py-28 overflow-hidden">
        <!-- Background subtle glow -->
        <div class="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-slate-950 opacity-90"></div>
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div class="max-w-3xl mb-12">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-5">
              <app-icon name="sparkles" [size]="14"></app-icon>
              Experiencia & Confort Garantizado
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Tu Refugio de Descanso en el Corazón de la Ciudad
            </h1>
            
            <p class="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Habitaciones climatizadas, camas de máxima ergonomía, WiFi de alta velocidad y atención hospitalaria personalizada sin intermediarios.
            </p>
          </div>

          <!-- BOOKING & QUOTE ENGINE BOX -->
          <div class="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100 max-w-5xl">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div class="flex items-center gap-2">
                <app-icon name="calendar" [size]="18" class="text-amber-600"></app-icon>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cotizador y Consulta de Disponibilidad Inmediata
                </h3>
              </div>
              <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Tarifa Directa Oficial
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Check-In -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Fecha de Entrada</label>
                <input
                  type="date"
                  [(ngModel)]="searchDates.checkIn"
                  (change)="recalculateQuote()"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <!-- Check-Out -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Fecha de Salida</label>
                <input
                  type="date"
                  [(ngModel)]="searchDates.checkOut"
                  (change)="recalculateQuote()"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <!-- Tipo de Habitación -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Categoría de Habitación</label>
                <app-custom-select
                  [options]="roomTypeOptions"
                  [(ngModel)]="searchDates.selectedTypeId"
                  (ngModelChange)="recalculateQuote()"
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
                  <span>Cotizar por WhatsApp</span>
                </button>
              </div>
            </div>

            <!-- Quote Live Banner -->
            <div *ngIf="quotePreviewNights > 0" class="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div class="flex items-center gap-2">
                <app-icon name="clock" [size]="16" class="text-slate-400"></app-icon>
                <span>Estadía estimada: <strong>{{ quotePreviewNights }} noche(s)</strong></span>
                <span *ngIf="quotePreviewTotal > 0">• Total aproximado: <strong class="text-slate-900 text-sm">\${{ quotePreviewTotal }}</strong></span>
              </div>
              <span class="text-[11px] text-slate-400">Atención inmediata en menos de 5 minutos por WhatsApp</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ROOM CATALOG SECTION -->
      <section id="habitaciones" class="py-20 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-2xl mx-auto mb-14">
            <h2 class="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Alojamiento de Primer Nivel</h2>
            <h3 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Nuestras Habitaciones & Suites</h3>
            <p class="mt-3 text-sm text-slate-600">
              Espacios climatizados con diseño contemporáneo, ropa de cama hipoalergénica y baño privado con agua caliente continua.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              *ngFor="let type of roomTypes()"
              class="bg-white rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <!-- Photo Container -->
              <div class="relative h-60 bg-slate-200 overflow-hidden">
                <img
                  [src]="type.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'"
                  [alt]="type.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <!-- Price Badge -->
                <div class="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl font-black text-xs shadow-lg border border-slate-800">
                  <span class="text-amber-400 font-mono text-sm">\${{ type.base_price }}</span> / noche
                </div>

                <!-- Capacity Tag -->
                <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs text-slate-900 px-3 py-1 rounded-xl font-bold text-[11px] shadow-md flex items-center gap-1.5">
                  <app-icon name="users" [size]="13" class="text-amber-600"></app-icon>
                  Hasta {{ type.max_capacity }} huésped(es)
                </div>
              </div>

              <!-- Body -->
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                    {{ type.bed_summary || '1 Cama King/Queen' }}
                  </div>

                  <h4 class="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                    {{ type.name }}
                  </h4>

                  <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {{ type.description || 'Habitación equipada con acabados de calidad superior, iluminación cálida, escritorio de trabajo y baño privado.' }}
                  </p>

                  <!-- Amenities Pills -->
                  <div class="flex flex-wrap gap-1.5 mb-6">
                    <span class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <app-icon name="wifi" [size]="12" class="text-slate-400"></app-icon> WiFi 5G
                    </span>
                    <span class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <app-icon name="sparkles" [size]="12" class="text-slate-400"></app-icon> Limpieza Diaria
                    </span>
                    <span class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <app-icon name="shield" [size]="12" class="text-slate-400"></app-icon> Baño Privado
                    </span>
                  </div>
                </div>

                <!-- Footer & CTA -->
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Reserva Directa</span>
                    <span class="text-xs font-bold text-slate-800">Confirmación Inmediata</span>
                  </div>

                  <button
                    type="button"
                    (click)="reserveRoom(type)"
                    class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
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
            <h2 class="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Comodidades Destacadas</h2>
            <h3 class="text-3xl font-black text-slate-900 tracking-tight">Servicios Incluidos en tu Estadía</h3>
            <p class="mt-3 text-sm text-slate-600">
              Diseñamos cada ambiente pensando en los viajeros de turismo y negocios más exigentes.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="wifi" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">WiFi de Fibra Óptica</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Conexión de alta velocidad en todas las habitaciones y áreas comunes para streaming o trabajo.</p>
            </div>

            <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="clock" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Recepción & Asistencia 24/7</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Mostrador siempre disponible para check-in nocturnos, orientación turística y custodia.</p>
            </div>

            <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="sparkles" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Gobernanza Rigurosa</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Protocolos de limpieza con recambio diario de toallas, sábanas de algodón y desinfección.</p>
            </div>

            <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <app-icon name="shield" [size]="24"></app-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Seguridad & Custodia</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Monitoreo permanente y servicio de resguardo de equipaje sin costo adicional tras el check-out.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- PWA INSTALL BANNER SECTION -->
      <section id="app" class="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="max-w-xl">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <app-icon name="check-circle" [size]="14"></app-icon>
                Web App Progresiva (PWA)
              </div>
              <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Instala nuestra Aplicación en tu Móvil
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Sin necesidad de descargar desde tiendas. Abre este sitio en tu navegador móvil (Chrome o Safari) y pulsa <strong>"Agregar a la pantalla de inicio"</strong> para acceder al sistema al instante.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div class="px-5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-center">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Android & iOS</span>
                <span class="text-white font-extrabold text-sm">Instalación en 1 toque</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer id="contacto" class="bg-slate-950 text-slate-400 py-16 border-t border-slate-800/80 text-xs mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <div class="flex items-center gap-2.5 text-white font-black text-lg mb-3">
              <app-icon name="building" [size]="22" class="text-amber-500"></app-icon>
              {{ hotelInfo()?.hotel_name || 'hotelSJB' }}
            </div>
            <p class="text-slate-400 leading-relaxed text-xs">
              Hospedaje turístico y corporativo de primer nivel. Gestión hotelera profesional mediante la suite de software PMS integral.
            </p>
          </div>

          <div>
            <h5 class="text-white font-bold text-xs uppercase tracking-wider mb-4">Información de Contacto</h5>
            <ul class="space-y-2.5 text-xs">
              <li class="flex items-center gap-2">
                <app-icon name="map-pin" [size]="15" class="text-amber-500"></app-icon>
                {{ hotelInfo()?.address || 'Av. Principal 456, Centro' }}
              </li>
              <li class="flex items-center gap-2">
                <app-icon name="phone" [size]="15" class="text-amber-500"></app-icon>
                {{ hotelInfo()?.phone || '+51 84 234567' }}
              </li>
              <li class="flex items-center gap-2">
                <app-icon name="phone" [size]="15" class="text-emerald-500"></app-icon>
                WhatsApp Oficial: {{ hotelInfo()?.whatsapp || '+51 984123456' }}
              </li>
            </ul>
          </div>

          <div>
            <h5 class="text-white font-bold text-xs uppercase tracking-wider mb-4">Horarios Operativos</h5>
            <p class="mb-1 text-slate-300">Entrada (Check-In): <strong>{{ hotelInfo()?.check_in_time || '14:00' }} hrs</strong></p>
            <p class="mb-4 text-slate-300">Salida (Check-Out): <strong>{{ hotelInfo()?.check_out_time || '11:00' }} hrs</strong></p>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
              <app-icon name="check-circle" [size]="14" class="text-emerald-400"></app-icon>
              Recepción 24 Horas
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>© 2026 {{ hotelInfo()?.hotel_name || 'hotelSJB' }}. Todos los derechos reservados.</div>
          <div class="mt-2 sm:mt-0 font-semibold text-slate-400">Plataforma Hotelera Profesional PMS</div>
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
    selectedTypeId: null as number | null
  };

  quotePreviewNights: number = 1;
  quotePreviewTotal: number = 0;

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
            label: `${t.name} (\${${t.base_price}}/noche)`,
            sublabel: `Capacidad: ${t.max_capacity} pers.`
          }))
        ];
        this.recalculateQuote();
      }
    });
  }

  recalculateQuote() {
    if (!this.searchDates.checkIn || !this.searchDates.checkOut) {
      this.quotePreviewNights = 1;
      this.quotePreviewTotal = 0;
      return;
    }

    const t1 = new Date(this.searchDates.checkIn).getTime();
    const t2 = new Date(this.searchDates.checkOut).getTime();
    const nights = Math.max(1, Math.round((t2 - t1) / (1000 * 3600 * 24)));
    this.quotePreviewNights = nights;

    if (this.searchDates.selectedTypeId) {
      const selected = this.roomTypes().find((t) => t.id === this.searchDates.selectedTypeId);
      if (selected) {
        this.quotePreviewTotal = Number(selected.base_price || 0) * nights;
        return;
      }
    }
    this.quotePreviewTotal = 0;
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
    const priceInfo = this.quotePreviewTotal > 0 ? `\n- Total Estimado: \$${this.quotePreviewTotal} (${this.quotePreviewNights} noches)` : '';

    const msg = encodeURIComponent(
      `Hola ${this.hotelInfo()?.hotel_name || 'hotelSJB'}, deseo consultar disponibilidad para:\n` +
      `- Habitación: ${typeLabel}\n` +
      `- Entrada: ${this.searchDates.checkIn}\n` +
      `- Salida: ${this.searchDates.checkOut}` +
      priceInfo
    );
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  }

  reserveRoom(type: any) {
    const wa = this.hotelInfo()?.whatsapp || '+51984123456';
    const cleanWa = wa.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hola, deseo reservar la habitación: ${type.name} (\${${type.base_price}}/noche). ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  }
}
