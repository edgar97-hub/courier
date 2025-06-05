import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  inject,
  ElementRef,
  OnDestroy,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
// MatButtonModule no es estrictamente necesario si los botones son divs estilizados
// import { MatButtonModule } from '@angular/material/button';

import { PromotionalSetItem } from '../../../settings/models/app-settings.interface';

import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    // MatButtonModule, // Lo quitamos por ahora, usaremos divs estilizados
  ],
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
})
export class ImageSliderComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() slides: PromotionalSetItem[] | null = [];
  @Input() showNavigation: boolean = true;
  @Input() showDots: boolean = true;
  @Input() autoPlay: boolean = true;
  @Input() autoPlayDelay: number = 4000; // Un poco menos para que se note el autoplay
  @Input() loop: boolean = true;
  @Input() effect: 'slide' | 'fade' = 'slide'; // Simplificado a slide o fade

  @ViewChild('swiperContainerRef') swiperContainerRef!: ElementRef<HTMLElement>;
  swiperInstance: Swiper | null = null;

  private router = inject(Router);
  currentIndex = signal(0); // Para los dots si los controlaras manualmente (Swiper puede hacerlo)

  // La configuración se actualiza con un effect
  swiperConfig: any = {}; // Se llenará en el constructor/effect

  constructor() {
    effect(() => {
      this.swiperConfig = {
        modules: [Navigation, Pagination, Autoplay, EffectFade],
        slidesPerView: 1,
        spaceBetween: 0,
        loop: this.loop && (this.slides ? this.slides.length > 1 : false),
        autoplay:
          this.autoPlay && this.slides && this.slides.length > 1
            ? { delay: this.autoPlayDelay, disableOnInteraction: false }
            : false,
        pagination:
          this.showDots && this.slides && this.slides.length > 1
            ? {
                el: '.custom-swiper-pagination',
                clickable: true,
                bulletClass: 'custom-swiper-dot',
                bulletActiveClass: 'custom-swiper-dot-active',
              }
            : false,
        navigation:
          this.showNavigation && this.slides && this.slides.length > 1
            ? {
                nextEl: '.custom-swiper-button-next',
                prevEl: '.custom-swiper-button-prev',
              }
            : false,
        effect: this.effect,
        fadeEffect: this.effect === 'fade' ? { crossFade: true } : undefined,
        speed: 600,
        observer: true,
        observeParents: true,
        on: {
          slideChange: (swiper: Swiper) => {
            this.currentIndex.set(swiper.realIndex);
          },
          init: (swiper: Swiper) => {
            this.currentIndex.set(swiper.realIndex);
          },
        },
      };
      // Si Swiper ya está inicializado, intenta actualizarlo o recréalo
      if (this.swiperInstance) {
        this.updateSwiperInstance();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides'] && this.slides && this.slides.length > 0) {
      // Si la cantidad de slides cambia, es mejor destruir y recrear Swiper
      // para que maneje correctamente la nueva cantidad de slides para loop, etc.
      console.log('Slides changed, re-initializing Swiper.');
      this.updateSwiperInstance();
    }
    // Otros cambios de config (autoplay, dots, arrows) son manejados por el effect
    // que actualiza this.swiperConfig y luego updateSwiperInstance podría ser llamado.
  }

  ngAfterViewInit(): void {
    if (this.slides && this.slides.length > 0) {
      this.initSwiper();
    }
  }

  initSwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
    }
    if (
      this.swiperContainerRef &&
      this.swiperContainerRef.nativeElement &&
      this.slides &&
      this.slides.length > 0
    ) {
      this.swiperInstance = new Swiper(
        this.swiperContainerRef.nativeElement,
        this.swiperConfig
      );
      console.log('Swiper initialized with config:', this.swiperConfig);
    } else {
      console.log('Swiper not initialized, no slides or container not ready.');
    }
  }

  updateSwiperInstance(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
    // Pequeño delay para asegurar que el DOM se haya limpiado si es necesario
    // y que this.swiperConfig esté actualizado por el effect.
    setTimeout(() => {
      if (
        this.slides &&
        this.slides.length > 0 &&
        this.swiperContainerRef?.nativeElement
      ) {
        this.initSwiper();
      }
    }, 0);
  }

  isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  handleSlideClick(slide: PromotionalSetItem, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.slide-button-swiper')) {
      event.stopPropagation(); // El botón se encarga
      return;
    }

    if (slide.linkUrl && this.isClickableSlide(slide)) {
      console.log('slide.linkUrl', slide.linkUrl);
      if (this.isExternalUrl(slide.linkUrl)) {
        window.open(slide.linkUrl, '_blank', 'noopener,noreferrer');
      } else {
        this.router.navigate([slide.linkUrl]); // Asume ruta interna
      }
    }
  }

  isClickableSlide(slide: PromotionalSetItem): boolean {
    console.log(
      '!!slide.linkUrl && !slide.buttonText',
      !!slide.linkUrl && !slide.buttonText
    );
    return !!slide.linkUrl && !slide.buttonText;
  }

  // Estos métodos ahora serán llamados por TUS botones HTML
  slidePrevCustom(): void {
    this.swiperInstance?.slidePrev();
  }
  slideNextCustom(): void {
    this.swiperInstance?.slideNext();
  }
  // goToSlideCustom ya no es necesario si Swiper maneja los dots con el `el`

  ngOnDestroy(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
    }
  }
  // En image-slider.component.ts
  private getSwiperConfig(): any {
    return {
      // ... otras opciones ...
      modules: [
        Navigation,
        Pagination,
        Autoplay /*, ...otros módulos que uses */,
      ],
      pagination:
        this.showDots && this.slides && this.slides.length > 1
          ? {
              el: '.custom-swiper-pagination', // Clase CSS del div que contendrá los dots
              clickable: true, // Permitir hacer clic en los dots
              bulletClass: 'custom-swiper-dot', // Clase para cada dot individual
              bulletActiveClass: 'custom-swiper-dot-active', // Clase para el dot activo
              // type: 'bullets', // 'bullets', 'fraction', 'progressbar' (bullets es el default)
              // renderBullet: function (index, className) { // Para HTML custom en los bullets
              //   return '<span class="' + className + '">' + (index + 1) + '</span>';
              // }
            }
          : false, // Deshabilitar paginación si no se cumplen las condiciones

      navigation:
        this.showNavigation && this.slides && this.slides.length > 1
          ? {
              nextEl: '.custom-swiper-button-next', // Clase CSS de tu botón "siguiente"
              prevEl: '.custom-swiper-button-prev', // Clase CSS de tu botón "anterior"
            }
          : false, // Deshabilitar navegación si no se cumplen
      // ... resto de la configuración ...
    };
  }
}
