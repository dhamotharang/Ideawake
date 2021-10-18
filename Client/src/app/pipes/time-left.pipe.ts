import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'timeLeft',
  pure: true
})
export class TimeLeftPipe implements PipeTransform {
  private result = 0;
  transform(value: any, arg = 'seconds') {
    if (value) {
      const diffDuration = moment.duration(moment(value).diff(moment()));
      if (arg == 'seconds') {
        this.result = diffDuration.get('seconds');
      } else if (arg == 'minutes') {
        this.result = diffDuration.get('minutes');
      } else if (arg == 'hours') {
        this.result = diffDuration.get('hours');
      } else if (arg == 'days') {
        this.result = moment(value).diff(moment(), 'days');
      }
    }
    return this.result;
  }
}
