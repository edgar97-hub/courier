import { Component, AfterViewInit } from '@angular/core';

declare global {
  interface Window {
    MathJax: any;
  }
}

@Component({
  selector: 'app-peso-volumetrico',
  templateUrl: './peso-volumetrico.component.html',
  styleUrls: ['./peso-volumetrico.component.css'],
})
export class PesoVolumetricoComponent implements AfterViewInit {
  formulasHTML: string = `
    <div class="check-item">
    <span class="checkmark"></span>
    
    El sistema calculará automáticamente el peso volumétrico con la fórmula:</div>
    <div class="formula">$$\\text{Peso volumétrico} = \\frac{\\text{Largo} \\times \\text{Ancho} \\times \\text{Alto}}{\\text{Factor volumétrico}}$$</div>

    <div class="check-item"><span class="checkmark">
    </span>Luego compara:</div>
    <div class="formula">$$\\text{Peso cobrado} = \\max(\\text{Peso real}, \\text{Peso volumétrico})$$</div>

      <div class="check-item"><span class="checkmark">
    </span>Y busca entre las tablas de tarifas el precio correspondiente a ese peso cobrado </div>
  `;
  ngAfterViewInit(): void {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }
}
