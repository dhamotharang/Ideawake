import { get } from 'lodash';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(private router: Router, private modalService: NgbModal) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((evt) => {
        if (evt instanceof HttpResponse) {
          if (get(evt, 'body.statusCode') === 404) {
            this.modalService.dismissAll();
            this.router.navigateByUrl('/error/404');
          }
        }
      }),
      catchError((err) => {
        /* if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.modalService.dismissAll();
            this.router.navigate(['/auth/login'], {
              queryParams : { redirectTo: document.location.href }
            });
          }
        } */
        return throwError(err);
      })
    );
  }
}
