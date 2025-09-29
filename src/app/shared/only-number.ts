import { ChangeDetectorRef, Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';


@Directive({
  selector: '[appOnlyNumber]'
})

export class OnlyNumberDirective {

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private control: NgControl,
    private cdr: ChangeDetectorRef
  ) { }
  //prevent invalid key press
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Enter'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {

    const input = this.el.nativeElement;
    if (!/^[0-9]$/.test(input.value)) {
      event.preventDefault();
    }

  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }
}
