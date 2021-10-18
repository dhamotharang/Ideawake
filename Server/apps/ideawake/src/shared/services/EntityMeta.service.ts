import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../../modules/entityType/entity.entity';

@Injectable()
export class EntityMetaService {
  /**
   * Get Entity List By Providing Entity Type Id
   * @param {string} entity
   * @param {number} entityObjectId
   * @return List of entity
   */
  static async getEntityObjectByEntityType(
    entity,
    entityObjectId,
    relations?: string[],
  ): Promise<{}> {
    let query = await getConnection()
      .createQueryBuilder()
      .select(`${entity}`)
      .from(`${entity}`, `${entity}`);
    if (relations)
      relations.map(relation => {
        query = query.leftJoinAndSelect(`${entity}.${relation}`, `${relation}`);
      });
    query = query.where(`${entity}.id = :id`, { id: entityObjectId });
    const data = query.getOne();
    return data;
  }
  /**
   * Get Entity Type
   * @param {Object} params select, objectId
   * @return Entity name
   */
  static async getEntityTypeMeta(params: { objectId: {} }): Promise<{}> {
    const entityType = await getConnection()
      .createQueryBuilder()
      .select(`entityType`)
      .from(`${TABLES.ENTITY_TYPE}`, 'entityType')
      .where(`entityType.id = :id`, { id: params.objectId })
      .getOne();
    return entityType;
  }

  /**
   * Get Entity Type by providing entity type's Abbreviation.
   * @param {string} abbreviation Abbreviation of required entity type.
   * @returns {EntityTypeEntity} Entity Type
   */
  static async getEntityTypeMetaByAbbreviation(
    abbreviation: string,
  ): Promise<EntityTypeEntity> {
    const entityType = await getConnection()
      .createQueryBuilder()
      .select(`entityType`)
      .from(`${TABLES.ENTITY_TYPE}`, 'entityType')
      .where(`entityType.abbreviation = :abbreviation`, { abbreviation })
      .getOne();
    return entityType as EntityTypeEntity;
  }

  /**
   * Get Entity Typse by providing entity types' Abbreviations.
   * @param {string} abbreviation Abbreviation of required entity type.
   * @returns {EntityTypeEntity} Entity Type
   */
  static async getEntityTypesMetaByAbbreviations(
    abbreviations: string[],
  ): Promise<EntityTypeEntity[]> {
    const entityTypes = await getConnection()
      .createQueryBuilder()
      .select(`entityType`)
      .from(`${TABLES.ENTITY_TYPE}`, 'entityType')
      .where(`entityType.abbreviation IN(:...abbreviations)`, { abbreviations })
      .getMany();
    return entityTypes as EntityTypeEntity[];
  }
}
