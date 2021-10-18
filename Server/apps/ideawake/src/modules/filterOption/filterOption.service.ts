import { Injectable } from '@nestjs/common';
import { FilterOptionRepository } from './filterOption.repository';
import { FilterOptionEntity } from './filterOption.entity';
import { PageTypeEnum } from '../../enum/page-type.enum';

@Injectable()
export class FilterOptionService {
  constructor(public readonly filterOptionRepository: FilterOptionRepository) {}

  /**
   * Fetches multiple filter options' data form DB based on the given options.
   * @param options Find options.
   */
  async getFilterOptions(options: {}): Promise<FilterOptionEntity[]> {
    return this.filterOptionRepository.find(options);
  }

  /**
   * Fetches a single filter option data form DB based on the given options.
   * @param options Find options.
   */
  async getFilterOption(options: {}): Promise<FilterOptionEntity> {
    return this.filterOptionRepository.findOne(options);
  }

  /**
   * Adds filter options data in the database.
   * @param data Data to be added.
   */
  async addFilterOption(data: {}): Promise<FilterOptionEntity> {
    const filterOptionCreated = this.filterOptionRepository.create(data);
    return this.filterOptionRepository.save(filterOptionCreated);
  }

  /**
   * Updates filter options based on the given options and data.
   * @param options Options to find the relevant row(s).
   * @param data Data to be updated.
   */
  async updateFilterOption(options: {}, data: {}): Promise<{}> {
    return this.filterOptionRepository.update(options, data);
  }

  /**
   * Adds or Updates the filter options data based on user, community and
   * pageType.
   * @param data Filter options data.
   */
  async addOrUpdateFilterOption(data: {
    pageType: PageTypeEnum;
    optionsData: {};
    community: number;
  }): Promise<{}> {
    const filterOption = await this.getFilterOption({
      where: {
        pageType: data.pageType,
        community: data.community,
      },
    });

    let result;

    if (!filterOption) {
      result = this.addFilterOption(data);
    } else {
      result = this.updateFilterOption({ id: filterOption.id }, data);
    }

    return result;
  }
}
