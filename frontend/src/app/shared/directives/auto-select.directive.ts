import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutoSelect]',
})
export class AutoSelectDirective {
  private alreadySelected = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('focus')
  onFocus() {
    this.selectText();
  }

  @HostListener('click')
  @HostListener('touchend')
  onClickOrTouch() {
    if (!this.alreadySelected) {
      this.selectText();
      this.alreadySelected = true;
      setTimeout(() => (this.alreadySelected = false), 1000);
    }
  }

  private selectText() {
    setTimeout(() => {
      const input = this.el.nativeElement;
      if (input && typeof input.select === 'function') {
        input.select();
      }
    }, 0);
  }
}
