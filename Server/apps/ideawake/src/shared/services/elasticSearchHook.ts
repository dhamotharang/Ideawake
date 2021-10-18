import { Injectable, Logger } from '@nestjs/common';
import { ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { Transport } from '@nestjs/common/enums/transport.enum';
import { ConfigService } from './config.service';
import { SearchResultInterface } from '../../interfaces';

@Injectable()
export class ElasticSearchService {
  private client: ClientProxy;
  private logger = new Logger();

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: this.configService.get('REDIS_URL'),
      },
    });
  }

  async syncUserData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-sync-user-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async syncChallengeData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-sync-challenge-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async syncOpportunityData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-sync-opportunity-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addOpportunityData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-add-opportunity-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addUserData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-add-user-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addChallengeData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-add-challenge-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async editOpportunityData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-edit-opportunity-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async editUserData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-edit-user-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async editChallengeData(params): Promise<void> {
    try {
      const result = await this.client
        .send('elastic-edit-challenge-data', params)
        .toPromise();

      this.logger.log('Added Successfully');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async search(params: {
    query: string;
    community: number;
    isDeleted: boolean;
    index: string[];
    fields: string[];
    includeOppId?: boolean;
  }): Promise<SearchResultInterface> {
    try {
      this.logger.log('Search Query');

      const result = await this.client
        .send('elastic-generic-search', params)
        .toPromise();
      this.logger.log('Searched Successfully');

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search Duplicate Opportunities Hook.
   * @param params Search Params
   */
  async searchDuplicateOpportunities(params: {
    queries: string[];
    community: number;
    challenge?: number;
    opportunityTypes: number[];
    isDeleted: boolean;
    fields: string[];
  }): Promise<SearchResultInterface> {
    try {
      this.logger.log('Search Duplicates Query');

      const result = await this.client
        .send('elastic-search-duplicate-opportunities', params)
        .toPromise();
      this.logger.log('Searched Successfully');

      return result;
    } catch (error) {
      this.logger.error('ERROR in Search Duplicates hook - ', error);
      throw error;
    }
  }

  /**
   * Search Challenges Hook.
   * @param params Search Params
   */
  async filterChallenges(params: {
    queries: string[];
    community: number;
    isDeleted: boolean;
    fields: string[];
  }): Promise<SearchResultInterface> {
    try {
      this.logger.log('Search Challenges Query');

      const result = await this.client
        .send('elastic-search-challenges', params)
        .toPromise();
      this.logger.log('Searched Successfully');

      return result;
    } catch (error) {
      this.logger.error('ERROR in Search Challenges hook - ', error);
      throw error;
    }
  }
}
