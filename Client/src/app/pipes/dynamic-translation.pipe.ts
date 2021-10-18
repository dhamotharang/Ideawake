import { NgRedux } from '@angular-redux/store';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform
} from '@angular/core';
import { debug } from 'console';
import { Observable, of, Subject, Subscription } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { UtilService } from '../services';
import { AppState } from '../store';

@Pipe({
  name: 'dynamicTranslation',
  pure: false
})
export class DynamicTranslationPipe implements PipeTransform, OnDestroy {
  private sub: Subscription[] = [];
  private asyncObj: AsyncPipe;
  private valueSubject = new Subject();
  private translationSubbject = new Subject();
  private returnedSubject = new Subject();
  private value$ = this.translationSubbject.asObservable().pipe(
    distinctUntilChanged(),
    switchMap((value) =>
      this.valueSubject.asObservable().pipe(
        distinctUntilChanged(),
        tap((val) => {
          //without settimeout, current value is not emmiting
          setTimeout(() => {
            this.returnedSubject.next(val);
          });
        }),
        switchMap((value) => {
          // Uncomment this if dynamic translation needed.
          // this.sub.push(
          //   this.utilServ
          //     .getTranslation(value)
          //     .pipe(
          //       map((data: any) => {
          //         return data.response.data.translations[0].translatedText;
          //       }),
          //       catchError((e) => {
          //         return of(value);
          //       })
          //     )
          //     .subscribe((data: any) => {
          //       this.returnedSubject.next(data);
          //     })
          // );

          return this.returnedSubject.asObservable();
        })
      )
    )
  );

  constructor(
    public cdRef: ChangeDetectorRef,
    public utilServ: UtilService,
    private ngRedux: NgRedux<AppState>
  ) {
    this.asyncObj = new AsyncPipe(this.cdRef);
  }
  transform(value: any) {
    const translationEnable = this.ngRedux.getState().DynamicTranslationState
      .settings.isDynamicTranslation;
    let language = this.ngRedux.getState().DynamicTranslationState.settings
      .language;

    this.translationSubbject.next(translationEnable + language);
    if (translationEnable == true) {
      this.valueSubject.next(value);
      return this.asyncObj.transform(this.value$);
    } else {
      return value;
    }
  }
  ngOnDestroy(): void {
    if (this.sub && this.sub.length) {
      for (var obj of this.sub) {
        obj.unsubscribe();
      }
    }
  }
}
