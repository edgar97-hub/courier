import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-credits',
  imports: [MatButtonModule],
  template: `
    <span
      >Created by
      <a href="https://zoaibkhan.com" target="_blank">Zoaib Khan</a></span
    >
    <br />
    <br />
    <a mat-raised-button href="https://youtu.be/Bl4VDlYSqWQ" target="_blank"
      >Video tutorial</a
    >
    <br />
    <br />
    <a
      mat-flat-button
      href="https://zoaibkhan.lemonsqueezy.com/buy/4bc3b34d-4980-44be-80bc-bde1dc5b71e9"
      target="_blank"
      >Get the code</a
    >
  `,
  styles: `
  
  :host {
    width: 100%;
    text-align: center;
    font-size: 0.9rem;
    display: block;
  }

  a {
    color: var(--mat-sys-primary);
  }

  `,
})
export class CreditsComponent {}
