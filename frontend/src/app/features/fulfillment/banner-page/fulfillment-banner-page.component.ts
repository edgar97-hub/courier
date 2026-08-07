import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../settings/services/settings.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-fulfillment-banner-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (bannerUrl()) {
      <img [src]="bannerUrl()" alt="Banner Fulfillment" />
    } @else {
      <div class="no-banner">
        <p>El servicio de Fulfillment no está disponible para su cuenta.</p>
        <p>Contacte al administrador para habilitarlo.</p>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding: 1rem;
    }
    img {
      display: block;
      max-width: 100%;
      height: auto;
    }
    .no-banner {
      text-align: center;
      color: #666;
      padding: 4rem 0;
    }
    .no-banner p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }
  `,
})
export class FulfillmentBannerPageComponent implements OnInit {
  private settingsService = inject(SettingsService);
  bannerUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.settingsService
      .loadSettings()
      .pipe(take(1))
      .subscribe((settings) => {
        const currentSettings = Array.isArray(settings) ? settings[0] : settings;
        this.bannerUrl.set(currentSettings?.fulfillment_banner_image_url || null);
      });
  }
}
