import { Injectable } from '@angular/core';

export interface ReceiptData {
  hotel: {
    name: string;
    trade_name?: string;
    tax_id?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    logo_url?: string;
    currency_symbol?: string;
  };
  reservation: {
    id: number;
    reservation_code: string;
    created_at?: string;
    check_in_date: string;
    check_out_date: string;
    total_accommodation: number;
    total_extras: number;
    total_discount: number;
    total_amount: number;
    paid_amount: number;
    notes?: string;
    guest: {
      first_name: string;
      last_name: string;
      document_type?: string;
      document_number?: string;
      phone?: string;
      email?: string;
      nationality?: string;
    };
    rooms: Array<{
      room_number: string;
      room_type_name: string;
      price_per_night?: number;
    }>;
    extra_charges: Array<{
      concept: string;
      category_name?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    payments: Array<{
      paid_at: string;
      method_name: string;
      reference_code?: string;
      amount: number;
    }>;
  };
}

export interface GeneratedReceipt {
  dataUrl: string;
  blob: Blob;
  filename: string;
  whatsappText: string;
  phone: string;
  pendingBalance: number;
  isFullyPaid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptCanvasService {

  private loadImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
      // Timeout de seguridad en caso de fallo de red
      setTimeout(() => resolve(null), 2500);
    });
  }

  async generateReceiptImage(data: ReceiptData): Promise<GeneratedReceipt> {
    const res = data.reservation;
    const hotel = data.hotel;
    const currency = hotel.currency_symbol || 'S/.';

    const pendingBalance = Math.max(0, Number((res.total_amount - res.paid_amount).toFixed(2)));
    const isFullyPaid = pendingBalance <= 0;

    // Calcular altura dinámica del comprobante
    const canvasWidth = 840;
    const scale = 2; // Factor Retina 2x para nitidez HD

    const extrasCount = (res.extra_charges || []).length;
    const paymentsCount = (res.payments || []).length;

    // Estimación de alturas
    let contentHeight = 220; // Header institucional
    contentHeight += 170; // Tarjeta de Huésped y Estadía
    contentHeight += 70;  // Encabezado de cuenta
    contentHeight += 45;  // Fila de Alojamiento
    contentHeight += extrasCount * 36; // Filas de consumos extras
    if (res.total_discount > 0) contentHeight += 36; // Descuento
    contentHeight += 75;  // Totales de cuenta
    contentHeight += 65;  // Encabezado de pagos
    contentHeight += Math.max(1, paymentsCount) * 36; // Filas de pagos
    contentHeight += 120; // Bloque de Saldo & Sello de Liquidación
    contentHeight += 110; // Footer de agradecimiento y contacto
    contentHeight += 40;  // Padding inferior

    const totalHeight = Math.max(900, contentHeight);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo inicializar el contexto 2D de Canvas');

    ctx.scale(scale, scale);

    // Fondo general limpio
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, totalHeight);

    // Borde exterior decorativo
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, canvasWidth - 2, totalHeight - 2);

    let y = 0;

    // ==========================================
    // 1. HEADER INSTITUCIONAL OSCURO CON DORADO
    // ==========================================
    const headerHeight = 175;
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, headerHeight);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, headerHeight);

    // Barra superior dorada
    const goldGrad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    goldGrad.addColorStop(0, '#f59e0b');
    goldGrad.addColorStop(0.5, '#fbbf24');
    goldGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, canvasWidth, 6);

    // Cargar logo si existe
    let logoImg: HTMLImageElement | null = null;
    if (hotel.logo_url) {
      try {
        logoImg = await this.loadImage(hotel.logo_url);
      } catch {
        logoImg = null;
      }
    }

    const paddingX = 36;
    let titleStartX = paddingX;

    if (logoImg) {
      const logoW = 80;
      const logoH = 80;
      ctx.save();
      // Contenedor redondeado para el logo
      ctx.beginPath();
      ctx.arc(paddingX + 40, 24 + 40, 40, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.drawImage(logoImg, paddingX, 24, logoW, logoH);
      ctx.restore();
      titleStartX = paddingX + 96;
    } else {
      // Isotipo / Escudo geométrico con monograma SJB
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(paddingX, 26, 68, 68, 16);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SJB', paddingX + 34, 69);
      titleStartX = paddingX + 84;
    }

    // Nombre del Hotel
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 23px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(hotel.name || 'HOTEL SAN JUAN BAUTISTA', titleStartX, 52);

    // Subtítulo comercial / legal
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const subLegal = [
      hotel.tax_id ? `RUC: ${hotel.tax_id}` : '',
      hotel.address || '',
      hotel.city ? `${hotel.city}, ${hotel.country || 'Perú'}` : 'Perú'
    ].filter(Boolean).join(' • ');
    ctx.fillText(subLegal, titleStartX, 73);

    // Teléfonos de contacto
    const contactLine = [
      hotel.whatsapp ? `WhatsApp: ${hotel.whatsapp}` : '',
      hotel.phone ? `Tel: ${hotel.phone}` : '',
      hotel.email ? `Email: ${hotel.email}` : ''
    ].filter(Boolean).join('  |  ');
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(contactLine, titleStartX, 93);

    // Bloque derecho: ESTADO DE CUENTA y N° RESERVA
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('ESTADO DE CUENTA / FOLIO', canvasWidth - paddingX, 48);

    // Badge con código de reserva
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px "SF Mono", Consolas, Menlo, monospace';
    ctx.fillText(res.reservation_code, canvasWidth - paddingX, 76);

    const nowStr = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Emisión: ${nowStr}`, canvasWidth - paddingX, 96);

    // Indicador de Estado en el Header
    const statusText = isFullyPaid ? '✓ PAGADO TOTAL' : `PENDIENTE: ${currency} ${pendingBalance.toFixed(2)}`;
    const statusBg = isFullyPaid ? '#065f46' : '#991b1b';
    const statusFg = isFullyPaid ? '#6ee7b7' : '#fca5a5';
    const badgeW = ctx.measureText(statusText).width + 24;

    ctx.fillStyle = statusBg;
    ctx.beginPath();
    ctx.roundRect(canvasWidth - paddingX - badgeW, 110, badgeW, 26, 8);
    ctx.fill();

    ctx.fillStyle = statusFg;
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, canvasWidth - paddingX - badgeW / 2, 127);

    y = headerHeight + 20;

    // ==========================================
    // 2. TARJETA DE HUÉSPED Y DETALLES DE ESTADÍA
    // ==========================================
    const cardH = 120;
    const cardW = canvasWidth - paddingX * 2;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(paddingX, y, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // Línea divisoria central
    ctx.beginPath();
    ctx.moveTo(paddingX + cardW / 2, y + 14);
    ctx.lineTo(paddingX + cardW / 2, y + cardH - 14);
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Columna 1: Huésped Titular
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('DATOS DEL HUÉSPED TITULAR', paddingX + 18, y + 25);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const guestName = `${res.guest.first_name || ''} ${res.guest.last_name || ''}`.trim() || 'Huésped Particular';
    ctx.fillText(guestName, paddingX + 18, y + 47);

    ctx.fillStyle = '#475569';
    ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const docInfo = res.guest.document_number
      ? `${res.guest.document_type || 'Doc'}: ${res.guest.document_number}`
      : 'Documento: No registrado';
    ctx.fillText(docInfo, paddingX + 18, y + 68);

    const contactGuest = [
      res.guest.phone ? `WhatsApp: ${res.guest.phone}` : '',
      res.guest.nationality ? `Nac: ${res.guest.nationality}` : ''
    ].filter(Boolean).join(' • ');
    ctx.fillText(contactGuest || (res.guest.email || 'Recepción General'), paddingX + 18, y + 88);

    // Columna 2: Detalles de Estadía y Habitación
    const col2X = paddingX + cardW / 2 + 18;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PERÍODO DE ESTADÍA & HABITACIÓN', col2X, y + 25);

    const roomsStr = (res.rooms || [])
      .map((r) => `Hab. ${r.room_number}${r.room_type_name ? ' (' + r.room_type_name + ')' : ''}`)
      .join(', ') || 'Habitación Asignada';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(roomsStr, col2X, y + 47);

    ctx.fillStyle = '#475569';
    ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Check-In:  ${res.check_in_date}`, col2X, y + 68);
    ctx.fillText(`Check-Out: ${res.check_out_date}`, col2X, y + 88);

    y += cardH + 24;

    // ==========================================
    // 3. TABLA DE CONSUMOS & ALOJAMIENTO
    // ==========================================
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DETALLE DE LA CUENTA (ALOJAMIENTO & SERVICIOS)', paddingX, y);

    y += 12;

    // Cabecera de la tabla
    const tableHeaderY = y;
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(paddingX, tableHeaderY, cardW, 28, 8);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('DESCRIPCIÓN / CONCEPTO', paddingX + 14, tableHeaderY + 18);

    ctx.textAlign = 'center';
    ctx.fillText('CANTIDAD', paddingX + cardW * 0.58, tableHeaderY + 18);
    ctx.fillText('PRECIO UNIT.', paddingX + cardW * 0.76, tableHeaderY + 18);

    ctx.textAlign = 'right';
    ctx.fillText('IMPORTE', paddingX + cardW - 14, tableHeaderY + 18);

    y += 36;

    // Fila 1: Alojamiento & Noches
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Estadía y Servicio de Alojamiento Hotelero', paddingX + 14, y);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('1 serv.', paddingX + cardW * 0.58, y);
    ctx.fillText(`${currency} ${Number(res.total_accommodation || 0).toFixed(2)}`, paddingX + cardW * 0.76, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${currency} ${Number(res.total_accommodation || 0).toFixed(2)}`, paddingX + cardW - 14, y);

    // Línea punteada
    y += 12;
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(paddingX + 10, y);
    ctx.lineTo(paddingX + cardW - 10, y);
    ctx.stroke();
    y += 18;

    // Filas de consumos extras
    if (res.extra_charges && res.extra_charges.length > 0) {
      for (const charge of res.extra_charges) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const conceptText = charge.concept + (charge.category_name ? ` (${charge.category_name})` : '');
        ctx.fillText(conceptText, paddingX + 14, y);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${charge.quantity}`, paddingX + cardW * 0.58, y);
        ctx.fillText(`${currency} ${Number(charge.unit_price || 0).toFixed(2)}`, paddingX + cardW * 0.76, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${currency} ${Number(charge.total_price || 0).toFixed(2)}`, paddingX + cardW - 14, y);

        y += 12;
        ctx.strokeStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(paddingX + 10, y);
        ctx.lineTo(paddingX + cardW - 10, y);
        ctx.stroke();
        y += 18;
      }
    }

    // Fila de Descuento (si existe)
    if (res.total_discount > 0) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Descuento / Oferta Especial Aplicada', paddingX + 14, y);

      ctx.textAlign = 'right';
      ctx.fillText(`-${currency} ${Number(res.total_discount).toFixed(2)}`, paddingX + cardW - 14, y);

      y += 12;
      ctx.strokeStyle = '#ecfdf5';
      ctx.beginPath();
      ctx.moveTo(paddingX + 10, y);
      ctx.lineTo(paddingX + cardW - 10, y);
      ctx.stroke();
      y += 18;
    }

    // Totales Ribbon
    y += 6;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(paddingX + cardW * 0.45, y, cardW * 0.55, 38, 8);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TOTAL GENERAL CUENTA:', paddingX + cardW * 0.48, y + 24);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${currency} ${Number(res.total_amount || 0).toFixed(2)}`, paddingX + cardW - 14, y + 24);

    y += 58;

    // ==========================================
    // 4. HISTORIAL DE PAGOS & ABONOS RECIBIDOS
    // ==========================================
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PAGOS & ABONOS REGISTRADOS', paddingX, y);

    y += 12;

    const payHeaderY = y;
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(paddingX, payHeaderY, cardW, 26, 8);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('FECHA / HORA', paddingX + 14, payHeaderY + 17);
    ctx.fillText('MÉTODO DE PAGO', paddingX + cardW * 0.35, payHeaderY + 17);
    ctx.fillText('N° REFERENCIA / VOUCHER', paddingX + cardW * 0.62, payHeaderY + 17);

    ctx.textAlign = 'right';
    ctx.fillText('MONTO ABONADO', paddingX + cardW - 14, payHeaderY + 17);

    y += 34;

    if (res.payments && res.payments.length > 0) {
      for (const pay of res.payments) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const payDateStr = pay.paid_at ? new Date(pay.paid_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
        ctx.fillText(payDateStr, paddingX + 14, y);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(pay.method_name || 'Pago', paddingX + cardW * 0.35, y);

        ctx.fillStyle = '#64748b';
        ctx.font = '500 11px "SF Mono", Consolas, monospace';
        ctx.fillText(pay.reference_code || 'En recepción', paddingX + cardW * 0.62, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`+${currency} ${Number(pay.amount || 0).toFixed(2)}`, paddingX + cardW - 14, y);

        y += 12;
        ctx.strokeStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(paddingX + 10, y);
        ctx.lineTo(paddingX + cardW - 10, y);
        ctx.stroke();
        y += 18;
      }
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Sin abonos previos registrados', paddingX + cardW / 2, y + 4);
      y += 24;
    }

    y += 14;

    // ==========================================
    // 5. RESUMEN DE SALDO Y SELLO DE LIQUIDACIÓN
    // ==========================================
    const statusBoxH = 88;
    ctx.beginPath();
    ctx.roundRect(paddingX, y, cardW, statusBoxH, 16);

    if (isFullyPaid) {
      ctx.fillStyle = '#ecfdf5';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 1.5;
    } else {
      ctx.fillStyle = '#fef2f2';
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
    }
    ctx.fill();
    ctx.stroke();

    // Lado Izquierdo: Saldo Pendiente
    ctx.textAlign = 'left';
    ctx.fillStyle = isFullyPaid ? '#065f46' : '#991b1b';
    ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('ESTADO DE LA CUENTA', paddingX + 20, y + 26);

    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    if (isFullyPaid) {
      ctx.fillText(`SALDO PENDIENTE: ${currency} 0.00`, paddingX + 20, y + 57);
    } else {
      ctx.fillText(`SALDO PENDIENTE: ${currency} ${pendingBalance.toFixed(2)}`, paddingX + 20, y + 57);
    }

    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = isFullyPaid ? '#047857' : '#b91c1c';
    ctx.fillText(`Total Pagado: ${currency} ${Number(res.paid_amount || 0).toFixed(2)} de ${currency} ${Number(res.total_amount || 0).toFixed(2)}`, paddingX + 20, y + 74);

    // Lado Derecho: Sello visual
    ctx.textAlign = 'right';
    const stampText = isFullyPaid ? '✓ CUENTA TOTALMENTE LIQUIDADA' : 'PENDIENTE DE PAGO';
    const stampW = ctx.measureText(stampText).width + 36;
    const stampX = paddingX + cardW - 20 - stampW;
    const stampY = y + 24;

    ctx.fillStyle = isFullyPaid ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(stampX, stampY, stampW, 38, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stampText, stampX + stampW / 2, stampY + 24);

    y += statusBoxH + 32;

    // ==========================================
    // 6. FOOTER DE CONTACTO Y AGRADECIMIENTO
    // ==========================================
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, y);
    ctx.lineTo(paddingX + cardW, y);
    ctx.stroke();

    y += 24;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('¡Muchas gracias por su preferencia en Hotel San Juan Bautista!', canvasWidth / 2, y);

    y += 18;
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const footerContact = [
      hotel.address || 'Cusco, Perú',
      hotel.whatsapp ? `WhatsApp Oficial: ${hotel.whatsapp}` : '',
      hotel.phone ? `Recepción: ${hotel.phone}` : ''
    ].filter(Boolean).join('  •  ');
    ctx.fillText(footerContact, canvasWidth / 2, y);

    y += 16;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Documento informativo de cuenta de huésped emitido por el sistema PMS.', canvasWidth / 2, y);

    // Generar imagen en Base64 Data URL y en Blob binario
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const filename = `comprobante-${res.reservation_code}.png`;

    // Generar texto estructurado para WhatsApp
    const guestPhone = (res.guest.phone || '').replace(/\D/g, '');
    const cleanPhone = guestPhone ? (guestPhone.startsWith('51') ? guestPhone : `51${guestPhone}`) : '';

    const roomsSummary = (res.rooms || []).map((r) => r.room_number).join(', ') || 'Asignada';
    const statusEmoji = isFullyPaid ? '✅ CUENTA LIQUIDADA (PAGADO)' : `⚠️ SALDO PENDIENTE: ${currency} ${pendingBalance.toFixed(2)}`;

    const whatsappText =
      `🏨 *${hotel.name || 'HOTEL SAN JUAN BAUTISTA'}*\n` +
      `📄 *Comprobante de Cuenta:* #${res.reservation_code}\n\n` +
      `👤 *Huésped:* ${guestName}\n` +
      `🚪 *Habitación:* Hab. ${roomsSummary}\n` +
      `📅 *Estadía:* ${res.check_in_date} al ${res.check_out_date}\n\n` +
      `💰 *Total de Cuenta:* ${currency} ${Number(res.total_amount || 0).toFixed(2)}\n` +
      `💵 *Total Abonado:* ${currency} ${Number(res.paid_amount || 0).toFixed(2)}\n` +
      `${statusEmoji}\n\n` +
      `¡Adjuntamos su comprobante detallado en imagen!\n` +
      `Muchas gracias por hospedarse con nosotros. Para cualquier consulta estamos a su entera disposición.`;

    return {
      dataUrl,
      blob,
      filename,
      whatsappText,
      phone: cleanPhone,
      pendingBalance,
      isFullyPaid
    };
  }
}
