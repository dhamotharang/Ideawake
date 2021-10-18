import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IdeaSummaryComponent } from '../idea-summary/idea-summary.component';

@Component({
  selector: 'app-idea-title',
  templateUrl: './idea-title.component.html',
  styleUrls: ['./idea-title.component.scss']
})
export class IdeaTitleComponent implements OnInit {
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;
  @Input() idea;
  constructor(private modalService: NgbModal, private router: Router) {}

  ngOnInit() {}

  open(content) {
    this.modalService
      .open(content, {
        size: 'xl',
        ariaLabelledBy: 'modal-basic-title',
        beforeDismiss: this.beforeDismiss
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }

  openSummaryModal() {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      windowClass: 'ideaSummaryModal'
    });

    modalRef.componentInstance.ideaId = this.idea.id;
    modalRef.componentInstance.changeRef.detectChanges();

    modalRef.componentInstance.closed.subscribe(() => {});
    modalRef.componentInstance.archive.subscribe((idea) => {});
  }

  viewIdea() {
    setTimeout(() => {
      this.router.navigateByUrl(`/idea/view/${this.idea.id}`);
    });
    // this.modalService.dismissAll();
  }
}
