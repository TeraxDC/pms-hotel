import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelSettings } from './entities/hotel-settings.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelSettings)
    private readonly hotelRepo: Repository<HotelSettings>,
  ) {}

  async getSettings(): Promise<HotelSettings> {
    let settings = await this.hotelRepo.findOne({ where: { is_configured: true } });
    if (!settings) {
      settings = await this.hotelRepo.findOne({ where: {} });
    }
    if (!settings) {
      settings = this.hotelRepo.create({
        hotel_name: 'hotelSJB',
        trade_name: 'hotelSJB Suite & Hotel',
        tax_id: '20601234567',
        address: 'Av. Principal 456, Centro Histórico',
        city: 'Cusco',
        country: 'Perú',
        phone: '+51 84 234567',
        whatsapp: '+51984123456',
        email: 'reservas@hotelsjb.com',
        primary_currency: 'PEN',
        currency_symbol: 'S/.',
        tax_name: 'IGV',
        tax_percentage: 18.0,
        check_in_time: '14:00',
        check_out_time: '11:00',
        is_configured: true,
        cancellation_policy: 'Cancelación gratuita hasta 24 horas antes del Check-In.',
      });
      settings = await this.hotelRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(data: Partial<HotelSettings>): Promise<HotelSettings> {
    const settings = await this.getSettings();

    if (data.hotel_name !== undefined) settings.hotel_name = data.hotel_name;
    if (data.trade_name !== undefined) settings.trade_name = data.trade_name;
    if (data.tax_id !== undefined) settings.tax_id = data.tax_id;
    if (data.address !== undefined) settings.address = data.address;
    if (data.city !== undefined) settings.city = data.city;
    if (data.country !== undefined) settings.country = data.country;
    if (data.phone !== undefined) settings.phone = data.phone;
    if (data.whatsapp !== undefined) settings.whatsapp = data.whatsapp;
    if (data.email !== undefined) settings.email = data.email;
    if (data.logo_url !== undefined) settings.logo_url = data.logo_url;
    if (data.favicon_url !== undefined) settings.favicon_url = data.favicon_url;
    if (data.primary_currency !== undefined) settings.primary_currency = data.primary_currency;
    if (data.currency_symbol !== undefined) settings.currency_symbol = data.currency_symbol;
    if (data.secondary_currency !== undefined) settings.secondary_currency = data.secondary_currency;
    if (data.tax_name !== undefined) settings.tax_name = data.tax_name;
    if (data.tax_percentage !== undefined) settings.tax_percentage = Number(data.tax_percentage);
    if (data.check_in_time !== undefined) settings.check_in_time = data.check_in_time;
    if (data.check_out_time !== undefined) settings.check_out_time = data.check_out_time;
    if (data.cancellation_policy !== undefined) settings.cancellation_policy = data.cancellation_policy;
    settings.is_configured = true;

    return this.hotelRepo.save(settings);
  }
}
