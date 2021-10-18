import { get, includes } from 'lodash';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { catchError, map, retry } from 'rxjs/operators';
import { tassign } from 'tassign';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { POINTS_NOTIFICATION, EXCLUDE_URL_401 } from '../utils';
import { I18nService } from '../modules/i18n/i18n.service';

@Injectable()
export class ApiService {
  private defaultConfig: Partial<IndividualConfig> = {
    positionClass: 'toast-top-center'
  };
  private uri = environment.backendApiUrl;
  public options: any = { withCredentials: true };

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private I18n: I18nService
  ) {}

  post(url, body?, opt = {}) {
    const tempOptions = { ...opt, withCredentials: true };
    return this.http.post(this.uri + url, body, tempOptions).pipe(
      map((response: HttpResponse<any>) => {
        this.pointsNotification(
          {
            requestType: 'post',
            url
          },
          response
        );
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.pointsNotification(
          {
            requestType: 'get',
            url
          },
          error
        );
        throw error;
      })
    );
  }

  get(url, params?) {
    const queryParams = {};
    if (!this.isEmpty(params) && params !== undefined) {
      for (const key of Object.keys(params)) {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== 'null' &&
          params[key] !== 'undefined'
        ) {
          if (Array.isArray(params[key])) {
            if (params[key].length) {
              queryParams[key + '[]'] = params[key];
            }
          } else {
            queryParams[key] = params[key];
          }
        }
      }
      this.options.params = queryParams;
    }

    const tempOptions = this.options ? tassign({}, this.options) : {};
    if (this.options && this.options.params) {
      delete this.options.params;
    }
    return this.http.get(this.uri + url, tempOptions).pipe(
      retry(0),
      map((response: HttpResponse<any>) => {
        this.pointsNotification(
          {
            requestType: 'get',
            url
          },
          response
        );
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.pointsNotification(
          {
            requestType: 'get',
            url
          },
          error
        );
        throw error;
      })
    );
  }

  patch(url, body) {
    return this.http
      .patch(this.uri + url, body, { withCredentials: true })
      .pipe(
        map((response: HttpResponse<any>) => {
          this.pointsNotification(
            {
              requestType: 'patch',
              url
            },
            response
          );
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          this.pointsNotification(
            {
              requestType: 'get',
              url
            },
            error
          );
          throw error;
        })
      );
  }

  delete(url, body?) {
    return this.http.request('delete', this.uri + url, {
      withCredentials: true,
      body
    });
  }

  put(url, body, params?) {
    let options: object = { withCredentials: true };
    if (params) {
      options = { ...options, params };
    }
    return this.http.put(this.uri + url, body, options).pipe(
      map((response: HttpResponse<any>) => {
        this.pointsNotification(
          {
            requestType: 'put',
            url
          },
          response
        );
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.pointsNotification(
          {
            requestType: 'get',
            url
          },
          error
        );
        throw error;
      })
    );
  }

  simpleGet(url) {
    return this.http.get(url);
  }

  s3Upload(url, body, opt) {
    return this.http.put(url, body, {
      headers: opt,
      reportProgress: true,
      observe: 'events'
    });
  }

  isEmpty(myObject) {
    for (const key in myObject) {
      if (myObject.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  pointsNotification(request, response) {
    if (response.statusCode < 400) {
      this.successNotification(request, response);
    } else if (
      response.status === 401 &&
      !includes(EXCLUDE_URL_401, request.url)
    ) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirectTo: document.location.href }
      });
      return false;
    } else if (response.status === 400) {
      this.errorNotification(response);
    }
  }

  successNotification(request, response) {
    const points = get(response, 'response.points.value', 0);
    if (request.requestType !== 'get' && points > 0) {
      const type = get(response, 'response.points.type', null);
      const pointsEarned = this.I18n.getTranslation('Alerts.PointsEarned');
      const message = `
        <div class="row">
          <div class="col-12">
            <div class="media ml-1">
              <div class="media-body">
                <p class="mb-0 bold montserrat">${points} ${pointsEarned}
                </p>
                <span class="small mb-0">
                  <i class="fa fa-plus-circle"></i> ${POINTS_NOTIFICATION[type]}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
      if (POINTS_NOTIFICATION[type] !== POINTS_NOTIFICATION.view) {
        this.toastr.success(message, '', {
          enableHtml: true,
          progressBar: false,
          positionClass: 'toast-bottom-right'
        });
      }
    }
  }

  errorNotification(response) {
    this.toastr.error(
      response.error.message,
      response.error.error,
      this.defaultConfig
    );
  }
}
