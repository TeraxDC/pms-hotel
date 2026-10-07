import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  private api = inject(ApiService);
  private currentFavicon: string | null = null;

  init() {
    this.api.get<{ isConfigured: boolean; hotel?: any }>('onboarding/status').subscribe({
      next: (res) => {
        if (res.hotel?.favicon_url) {
          this.setFavicon(res.hotel.favicon_url);
        }
      },
      error: () => {}
    });
  }

  setFavicon(url?: string | null) {
    if (!url) return;
    if (url === this.currentFavicon) return;
    this.currentFavicon = url;

    try {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = url;

      // Handle type based on format
      if (url.startsWith('data:image/svg') || url.endsWith('.svg')) {
        link.type = 'image/svg+xml';
      } else if (url.startsWith('data:image/png') || url.endsWith('.png')) {
        link.type = 'image/png';
      } else {
        link.type = 'image/x-icon';
      }
    } catch {
      // Ignore in non-browser environments
    }
  }
}
