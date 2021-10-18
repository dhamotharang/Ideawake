import { Directive, ElementRef, Input, OnInit } from '@angular/core';

// watch dom change and fire (dom-changed) event
@Directive({
  selector: '[watchDomTree]'
})
export class DomChangedDirective implements OnInit {
  @Input() childList = true;
  @Input() attributes = false;
  @Input() subtree = false;
  observer: MutationObserver;

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.registerDomChangedEvent(this.elRef.nativeElement);
  }

  registerDomChangedEvent(el) {
    this.observer = new MutationObserver((list) => {
      const evt = new CustomEvent('dom-changed', {
        detail: list,
        bubbles: true
      });
      el.dispatchEvent(evt);
    });
    this.observer.observe(el, {
      attributes: this.attributes,
      childList: this.childList,
      subtree: this.subtree
    });
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
