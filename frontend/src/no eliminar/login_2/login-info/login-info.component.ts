import { Component } from '@angular/core';

@Component({
  selector: 'app-login-info',
  imports: [],
  template: `
    <div
      class="bg-primary-container text-on-primary-container text-xs p-4 rounded-xl"
    >
      <p>Two login accounts are available:</p>
      <ul class="list-disc ml-4 mt-2 mb-2">
        <li>zoaib&#64;zoaibkhan.com</li>
        <li>johndoe&#64;zoaibkhan.com</li>
      </ul>
      <p>Password: testing123</p>
    </div>
  `,
  styles: ``,
})
export default class LoginInfoComponent {}
