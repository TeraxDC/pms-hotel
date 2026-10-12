import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneratedReceipt } from '../../../core/services/receipt-canvas.service';
import { IconComponent } from '../icon/icon.component';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div
      *ngIf="receipt"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full p-5 sm:p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
      >
        <!-- HEADER DEL MODAL -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
              <app-icon name="image" [size]="20"></app-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 leading-tight">
                  Comprobante de Cuenta / Folio
                </h3>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  [ngClass]="receipt.isFullyPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'"
                >
                  {{ receipt.isFullyPaid ? 'Liquidado' : 'Saldo Pendiente' }}
                </span>
              </div>
              <p class="text-xs text-slate-400">
                Formato imagen en alta resolución optimizado para compartir por WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="close.emit()"
            class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- CONTENIDO: VISTA PREVIA Y ACCIONES -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto pr-1 flex-1">
          
          <!-- COLUMNA IZQUIERDA: VISTA PREVIA DE LA IMAGEN (CANVAS RENDER) -->
          <div class="lg:col-span-7 flex flex-col items-center justify-start bg-slate-50 p-3 rounded-2xl border border-slate-200/80 overflow-hidden">
            <div class="w-full flex items-center justify-between mb-2 px-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vista Previa del Comprobante</span>
              <span class="text-[10px] text-slate-400 font-mono">PNG Alta Definición</span>
            </div>
            
            <div class="w-full max-h-[58vh] overflow-y-auto rounded-xl border border-slate-200 shadow-sm bg-white">
              <img
                [src]="receipt.dataUrl"
                [alt]="receipt.filename"
                class="w-full h-auto object-contain block"
              />
            </div>
          </div>

          <!-- COLUMNA DERECHA: OPCIONES DE ENVÍO Y DESCARGA -->
          <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            <div class="space-y-4">
              <!-- TARJETA: COMPARTIR POR WHATSAPP -->
              <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div class="flex items-center gap-2 font-bold text-emerald-900 text-xs uppercase tracking-wider">
                  <app-icon name="send" [size]="15" class="text-emerald-600"></app-icon>
                  <span>Enviar por WhatsApp al Cliente</span>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Número de Teléfono / WhatsApp:
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold font-mono">
                      +
                    </div>
                    <input
                      type="text"
                      [(ngModel)]="targetPhone"
                      placeholder="Ej. 51984123456"
                      class="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <span class="text-[10px] text-slate-400 mt-1 block">
                    Incluya código de país (ej. 51 para Perú seguido del número celular)
                  </span>
                </div>

                <button
                  type="button"
                  (click)="shareViaWhatsApp()"
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <app-icon name="send" [size]="15"></app-icon>
                  <span>Abrir WhatsApp y Enviar Resumen</span>
                </button>
              </div>

              <!-- DESCARGA DIRECTA DE LA IMAGEN -->
              <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span class="text-xs font-bold text-slate-800 block">Descargar Imagen</span>
                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Descargue el comprobante en formato PNG para guardarlo en su equipo, enviarlo como archivo adjunto o imprimirlo.
                </p>

                <button
                  type="button"
                  (click)="downloadImage()"
                  class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <app-icon name="download" [size]="15"></app-icon>
                  <span>Descargar Comprobante (.PNG)</span>
                </button>
              </div>

              <!-- COPIAR TEXTO RESUMEN -->
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div class="text-xs">
                  <span class="font-bold text-slate-800 block">Texto para Mensaje</span>
                  <span class="text-[10px] text-slate-400">Copiar texto formateado al portapapeles</span>
                </div>
                <button
                  type="button"
                  (click)="copySummaryText()"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <app-icon name="copy" [size]="13"></app-icon>
                  <span>Copiar Texto</span>
                </button>
              </div>
            </div>

            <!-- BOTONES INFERIORES -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                (click)="printImage()"
                class="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <app-icon name="printer" [size]="15"></app-icon>
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                (click)="close.emit()"
                class="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class ReceiptModalComponent {
  private toast = inject(ToastService);

  @Input() receipt: GeneratedReceipt | null = null;
  @Output() close = new EventEmitter<void>();

  targetPhone: string = '';

  ngOnChanges() {
    if (this.receipt) {
      this.targetPhone = this.receipt.phone || '';
    }
  }

  downloadImage() {
    if (!this.receipt) return;
    const a = document.createElement('a');
    a.href = this.receipt.dataUrl;
    a.download = this.receipt.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.toast.success('Comprobante descargado correctamente en imagen');
  }

  async shareViaWhatsApp() {
    if (!this.receipt) return;

    const phone = this.targetPhone.replace(/\D/g, '');
    const cleanPhone = phone ? (phone.startsWith('51') ? phone : (phone.length === 9 ? `51${phone}` : phone)) : '';
    const textEncoded = encodeURIComponent(this.receipt.whatsappText);

    // Intentar Web Share API con archivo si el dispositivo lo soporta
    if (navigator.canShare) {
      try {
        const file = new File([this.receipt.blob], this.receipt.filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Comprobante de Cuenta - Hotel San Juan Bautista`,
            text: this.receipt.whatsappText
          });
          this.toast.success('Comprobante compartido exitosamente');
          return;
        }
      } catch (err: any) {
        // Si el usuario canceló el share o dio error, continuar con enlace wa.me
        if (err.name !== 'AbortError') {
          console.warn('Web Share no disponible para archivos, abriendo enlace web WhatsApp');
        }
      }
    }

    // Fallback: descargar imagen automáticamente y abrir WhatsApp con el mensaje estructurado
    this.downloadImage();
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${textEncoded}`
      : `https://wa.me/?text=${textEncoded}`;
    window.open(waUrl, '_blank');
    this.toast.info('Se ha descargado la imagen y abierto WhatsApp para adjuntarla al cliente');
  }

  copySummaryText() {
    if (!this.receipt) return;
    navigator.clipboard.writeText(this.receipt.whatsappText).then(() => {
      this.toast.success('Texto del comprobante copiado al portapapeles');
    }).catch(() => {
      this.toast.error('No se pudo copiar al portapapeles');
    });
  }

  printImage() {
    if (!this.receipt) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${this.receipt.filename}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; }
            img { max-width: 100%; height: auto; display: block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            @media print {
              body { padding: 0; }
              img { max-width: 100%; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <img src="${this.receipt.dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
