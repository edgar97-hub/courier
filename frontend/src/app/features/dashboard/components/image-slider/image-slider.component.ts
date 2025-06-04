import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  effect,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
// MatIconModule y MatButtonModule ya no son necesarios si usas los controles de Slick
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { PromotionalSetItem } from '../../../settings/models/app-settings.interface';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule, RouterModule, SlickCarouselModule],
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
})
export class ImageSliderComponent implements OnChanges {
  @Input() slides: PromotionalSetItem[] | null = [];
  @Input() showNavigation: boolean = true;
  @Input() showDots: boolean = true;
  @Input() autoPlay: boolean = true;
  @Input() autoPlaySpeed: number = 5000;

  // No es estrictamente necesario un @ViewChild si no vas a llamar a sus métodos programáticamente desde aquí
  // pero puede ser útil para depurar o para acciones muy específicas.
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  private router = inject(Router);

  slideConfig = {}; // Se inicializará en el constructor o effect

  constructor() {
    // Inicializar y reaccionar a cambios en los inputs para la configuración de Slick
    effect(() => {
      console.log(
        'Effect triggered in ImageSlider: autoplay, dots, arrows changed'
      );
      this.slideConfig = {
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: this.autoPlay,
        autoplaySpeed: this.autoPlaySpeed,
        dots: this.showDots,
        arrows: this.showNavigation, // Esto controla las flechas de Slick
        infinite: true,
        speed: 700,
        fade: false,
        cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        adaptiveHeight: false,
      };
      // Si el carrusel ya está inicializado y quieres forzar la re-aplicación de config:
      // if (this.slickModal && this.slickModal['slick']) { // slick es una propiedad interna
      //   this.slickModal['slick']['slickSetOption'](null, null, true); // Re-evalúa opciones
      // }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides']) {
      console.log('ImageSliderComponent: Slides input changed', this.slides);
      // Si los slides cambian y el carrusel ya está inicializado,
      // ngx-slick-carousel debería manejarlo.
      // A veces, si el array de slides se reemplaza completamente,
      // Slick puede necesitar un "empujón".
      if (
        this.slickModal
        // &&
        // this.slickModal['slick'] &&
        // changes['slides'].previousValue !== changes['slides'].currentValue
      ) {
        // Forzar un re-renderizado si la referencia del array de slides cambia
        // Esto es un poco un hack y depende de la implementación interna de ngx-slick-carousel
        // y si detecta cambios en la referencia del array [slides] en ngx-slick-carousel.
        // La forma más "Angular" sería que ngx-slick-carousel detecte esto vía ngOnChanges en su propia directiva.
        // Si sigue sin funcionar, a veces es necesario:
        // this.slickModal.unslick();
        // setTimeout(() => this.slickModal.slickInit(), 0);
      }
    }
    // El 'effect' se encarga de actualizar slideConfig si cambian las props de config.
  }

  handleSlideClick(slide: PromotionalSetItem, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.slide-button')) {
      // El botón tiene su propio [routerLink] o [href], y (click)="$event.stopPropagation()"
      // así que no necesitamos hacer nada aquí si se hizo clic en el botón.
      return;
    }

    // Si el slide es clickeable (no tiene botón pero sí linkUrl)
    if (slide.linkUrl && this.isClickableSlide(slide)) {
      if (slide.linkUrl.startsWith('/')) {
        this.router.navigate([slide.linkUrl]);
      } else {
        window.open(slide.linkUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }

  isClickableSlide(slide: PromotionalSetItem): boolean {
    return !!slide.linkUrl && !slide.buttonText;
  }
}
