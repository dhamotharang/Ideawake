import { Injectable } from '@nestjs/common';
import { ColumnOptionRepository } from './columnOption.repository';
import { ColumnOptionEntity } from './columnOption.entity';
import { PageTypeEnum } from '../../enum/page-type.enum';

@Injectable()
export class ColumnOptionService {
  constructor(public readonly columnOptionRepository: ColumnOptionRepository) {}

  /**
   * Fetches multiple column options' data form DB based on the given options.
   * @param options Find options.
   */
  async getColumnOptions(options: {}): Promise<ColumnOptionEntity[]> {
    return this.columnOptionRepository.find(options);
  }

  /**
   * Fetches a single column option data form DB based on the given options.
   * @param options Find options.
   */
  async getColumnOption(options: {}): Promise<ColumnOptionEntity> {
    return this.columnOptionRepository.findOne(options);
  }

  /**
   * Adds column options data in the database.
   * @param data Data to be added.
   */
  async addColumnOption(data: {}): Promise<ColumnOptionEntity> {
    const columnOptionCreated = this.columnOptionRepository.create(data);
    return this.columnOptionRepository.save(columnOptionCreated);
  }

  /**
   * Updates column options based on the given options and data.
   * @param options Options to find the relevant row(s).
   * @param data Data to be updated.
   */
  async updateColumnOption(options: {}, data: {}): Promise<{}> {
    return this.columnOptionRepository.update(options, data);
  }

  /**
   * Adds or Updates the column options data based on user, community and
   * pageType.
   * @param data Column options data.
   */
  async addOrUpdateColumnOption(data: {
    pageType: PageTypeEnum;
    optionsData: {};
    community: number;
  }): Promise<{}> {
    const columnOption = await this.getColumnOption({
      where: {
        pageType: data.pageType,
        community: data.community,
      },
    });

    let result;

    if (!columnOption) {
      result = this.addColumnOption(data);
    } else {
      result = this.updateColumnOption({ id: columnOption.id }, data);
    }

    return result;
  }
}
