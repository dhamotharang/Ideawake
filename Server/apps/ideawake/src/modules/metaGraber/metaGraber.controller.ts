import { Controller, Get, Query } from '@nestjs/common';
import { grabIt } from 'grabity';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { map } from 'lodash';

@Controller('meta')
export class MetaGraberController {
  /**
   * Get Page Meta (Meta, OpenGraph, Twitter Cards) of Provided URL(s)
   * @param {} queryParams Urls List
   * @return List of Meta Info of Provided URLs
   */
  @Get('getmeta')
  async getMeta(@Query() queryParams): Promise<ResponseFormat> {
    const promiseArr = [];
    const metaObj = {};
    if (queryParams.url) {
      const urlArr = queryParams.url.split(',');

      //Fill up prmoise Arr w.r.t urls
      map(urlArr, url => {
        promiseArr.push(grabIt(url));
      });

      //Resolve all promise
      const metaList = await Promise.all(promiseArr);

      //Map promised meta list to respective urls
      map(metaList, (val, key) => {
        metaObj[urlArr[key]] = val;
      });
    }
    return ResponseFormatService.responseOk(metaObj, 'List Of Meta Info');
  }
}
