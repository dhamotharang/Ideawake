export enum OpportunityLinkRelationEnum {
  RELATED_TO = 'related_to',
  DUPLICATES = 'duplicates',
  IS_DUPLICATED_BY = 'is_duplicated_by',
  ALTERNATIVE_TO = 'alternative_to',
  BLOCKS = 'blocks',
  IS_BLOCKED_BY = 'is_blocked_by',
  HAS_SYNERGIES_WITH = 'has_synergies_with',
}

export enum OpportunityReverseLinkRelationEnum {
  RELATED_TO = 'related_to',
  DUPLICATES = 'is_duplicated_by',
  IS_DUPLICATED_BY = 'duplicates',
  ALTERNATIVE_TO = 'alternative_to',
  BLOCKS = 'is_blocked_by',
  IS_BLOCKED_BY = 'blocks',
  HAS_SYNERGIES_WITH = 'has_synergies_with',
}
