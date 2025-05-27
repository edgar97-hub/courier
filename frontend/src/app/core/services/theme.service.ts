import {
  Injectable,
  Renderer2,
  RendererFactory2,
  signal,
  WritableSignal,
  effect,
  Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'app-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  public currentTheme: WritableSignal<Theme>;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // 1. Cargar tema guardado o detectar el del sistema
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    // const prefersDark =
    //   window.matchMedia &&
    //   window.matchMedia('(prefers-color-scheme: dark)').matches;
    // const initialTheme: Theme = storedTheme || (prefersDark ? 'dark' : 'light');

    const initialTheme: Theme = storedTheme || 'light';

    this.currentTheme = signal(initialTheme);

    // Aplicar el tema inicial y reaccionar a cambios en la señal
    effect(() => {
      const themeToApply = this.currentTheme();
      this.applyThemeToBody(themeToApply);
      localStorage.setItem(THEME_KEY, themeToApply);
      console.log(`Theme applied: ${themeToApply}`);
    });

    // Opcional: Escuchar cambios en la preferencia del sistema operativo
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // Solo cambia si no hay un tema explícitamente guardado por el usuario
        if (!localStorage.getItem(THEME_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  private applyThemeToBody(theme: Theme): void {
    // Usaremos una clase explícita para el tema oscuro
    // y asumiremos que el tema claro es la ausencia de esta clase.
    if (theme === 'dark') {
      this.renderer.addClass(this.document.body, 'dark-theme'); // O 'dark' si así lo tienes en CSS
      this.renderer.removeClass(this.document.body, 'light-theme'); // Opcional
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
      this.renderer.addClass(this.document.body, 'light-theme'); // Opcional, si necesitas estilos específicos para light
    }
    // Actualizar el atributo color-scheme en <html> para consistencia
    this.document.documentElement.setAttribute('color-scheme', theme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
    this.currentTheme.update((current) =>
      current === 'light' ? 'dark' : 'light'
    );
  }

  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
}
