import { ApiModelProperty } from '@nestjs/swagger';
import { PageOptionsDto } from './PageOptionsDto';

interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @ApiModelProperty()
  readonly page: number;

  @ApiModelProperty()
  readonly take: number;

  @ApiModelProperty()
  readonly itemCount: number;

  @ApiModelProperty()
  readonly pageCount: number;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(itemCount / this.take);
  }
}
