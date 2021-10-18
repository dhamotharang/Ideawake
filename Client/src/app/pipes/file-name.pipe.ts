import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileNameUpdate',
  pure: true
})
export class FileNamePipe implements PipeTransform {
  transform(file: string, args?: any): any {
    let fileName = file.split('.')[file.split('.').length - 2].split('/')[
      file.split('.')[file.split('.').length - 2].split('/').length - 1
    ];
    if (fileName.length > 13) {
      fileName = fileName.slice(13, fileName.length);
    }
    const fileExt = file.split('.')[file.split('.').length - 1].toUpperCase();
    return args == 'extensionOnly' ? fileExt : fileName + '.' + fileExt;
  }
}
