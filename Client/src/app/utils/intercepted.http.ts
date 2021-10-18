import { Observable, Subject } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ResponseHelper } from '../helpers';

@Injectable()
export class InterceptedHttp {
  response: any;
  public options = { observe: 'response' };
  public canSubmit = new Subject<string>();
  canSubmit$ = this.canSubmit.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get(url: string, params: Object, loader = true) {
    const queryParams = {};

    if (loader) {
      ResponseHelper.pushInLoader({
        requestType: 'get',
        url: url
      });
    }

    if (!this.isEmpty(params) && params !== undefined) {
      for (const key of Object.keys(params)) {
        if (
          params[key] !== undefined &&
          params[key] != null &&
          params[key] != 'null' &&
          params[key] != 'undefined'
        ) {
          queryParams[key] = params[key];
        }
      }
      this.options['params'] = queryParams;
    }

    const tempOptions = this.options ? Object.assign({}, this.options) : {};
    if (this.options && this.options['params']) {
      delete this.options['params']; // If any api is in progress if we delete the
      // options params on response of some api then same options params will be sent to next api hit too,
      // so reset the global option params before the api hit and send temporary params
    }

    return this.http.get(url, tempOptions).pipe(
      //   retry(1), // retry a failed request up to 1 time
      map((response: HttpResponse<any>) => {
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'get',
              url: url
            },
            response,
            this.router,
            true
          );
        }

        return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'get',
              url: url
            },
            error,
            this.router,
            true
          );
        } else {
          ResponseHelper.popFromLoader(
            {
              requestType: 'get',
              url: url
            },
            error,
            this.router,
            false
          );
        }
        return Observable.throw(error);
      })
    );
  }

  post(url: string, params: any, loader = true) {
    this.canSubmit.next('false'); // DISABLE FURTHER SUBMITS
    ResponseHelper.incrementInPPDCount(); // INCREASE PPD COUNT

    if (loader) {
      ResponseHelper.pushInLoader({
        requestType: 'post',
        url: url
      });
    }

    const tempOptions = this.options ? Object.assign({}, this.options) : {};

    return this.http.post(url, params, tempOptions).pipe(
      //         retry(1), // retry a failed request up to 1 time
      map((response: HttpResponse<any>) => {
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'post',
              url: url
            },
            response,
            this.router,
            true
          );
        }

        ResponseHelper.decrementInPPDCount(); // DECREASE PPD COUNT

        // ENABLE SUBMIT IF ALL IN PROGRESS POST, PUT & DELETE ARE POPED OUT
        if (ResponseHelper.getPPDCount() == 0) {
          this.canSubmit.next('true');
        }

        return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'post',
              url: url
            },
            error,
            this.router,
            true
          );
        }

        ResponseHelper.decrementInPPDCount(); // DECREASE PPD COUNT

        // ENABLE SUBMIT IF ALL IN PROGRESS POST, PUT & DELETE ARE POPED OUT
        if (ResponseHelper.getPPDCount() == 0) {
          this.canSubmit.next('true');
        }

        return Observable.throw(error);
      })
    );
  }

  put(url: string, params: any, loader = true) {
    this.canSubmit.next('false'); // DISABLE FURTHER SUBMITS
    ResponseHelper.incrementInPPDCount(); // INCREASE PPD COUNT

    if (loader) {
      ResponseHelper.pushInLoader({
        requestType: 'put',
        url: url
      });
    }
    const tempOptions = this.options ? Object.assign({}, this.options) : {};
    return this.http.put(url, params, tempOptions).pipe(
      //        retry(1), // retry a failed request up to 1 time
      map((response: HttpResponse<any>) => {
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'put',
              url: url
            },
            response,
            this.router,
            true
          );
        }

        ResponseHelper.decrementInPPDCount(); // DECREASE PPD COUNT

        // ENABLE SUBMIT IF ALL IN PROGRESS POST, PUT & DELETE ARE POPED OUT
        if (ResponseHelper.getPPDCount() == 0) {
          this.canSubmit.next('true');
        }

        return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'put',
              url: url
            },
            error,
            this.router,
            true
          );
        }

        ResponseHelper.decrementInPPDCount(); // DECREASE PPD COUNT

        // ENABLE SUBMIT IF ALL IN PROGRESS POST, PUT & DELETE ARE POPED OUT
        if (ResponseHelper.getPPDCount() == 0) {
          this.canSubmit.next('true');
        }

        return Observable.throw(error);
      })
    );
  }

  delete(url: string, params?: any, loader = true) {
    this.canSubmit.next('false'); // DISABLE FURTHER SUBMITS
    ResponseHelper.incrementInPPDCount(); // INCREASE PPD COUNT

    if (params) {
      this.options['body'] = params;
    }
    if (loader) {
      ResponseHelper.pushInLoader({
        requestType: 'delete',
        url: url
      });
    }
    const tempOptions = this.options ? Object.assign({}, this.options) : {};
    return this.http.delete(url, tempOptions).pipe(
      //          retry(1), // retry a failed request up to 1 time
      map((response: HttpResponse<any>) => {
        this.options['body'] = null;
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'delete',
              url: url
            },
            response,
            this.router,
            true
          );
        }

        ResponseHelper.decrementInPPDCount(); // DECREASE PPD COUNT

        // ENABLE SUBMIT IF ALL IN PROGRESS POST, PUT & DELETE ARE POPED OUT
        if (ResponseHelper.getPPDCount() == 0) {
          this.canSubmit.next('true');
        }

        return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
        this.options['body'] = null;
        if (loader) {
          ResponseHelper.popFromLoader(
            {
              requestType: 'delete',
              url: url
            },
            error,
            this.router,
            true
          );
        }

        ResponseHelper.decrementInPPDCount(); // DECREASE PPD COUNT

        // ENABLE SUBMIT IF ALL IN PROGRESS POST, PUT & DELETE ARE POPED OUT
        if (ResponseHelper.getPPDCount() == 0) {
          this.canSubmit.next('true');
        }

        return Observable.throw(error);
      })
    );
  }

  isEmpty(myObject) {
    for (const key in myObject) {
      if (myObject.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
}
