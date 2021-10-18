import { snakeCase } from 'lodash';

export const DEFAULT_STATUSES = [
  {
    title: 'New Idea',
    description: '',
    colorCode: '#17a2b8',
    orderNumber: 1,
    uniqueId: snakeCase('New Idea'),
    isDeleted: false,
  },
  {
    title: 'In Evaluation',
    description: '',
    colorCode: '#727cf5',
    orderNumber: 2,
    uniqueId: snakeCase('In Evaluation'),
    isDeleted: false,
  },
  {
    title: 'Approved',
    description: '',
    colorCode: '#39afd1',
    orderNumber: 3,
    uniqueId: snakeCase('Approved'),
    isDeleted: false,
  },
  {
    title: 'In Planning',
    description: '',
    colorCode: '#1ab394',
    orderNumber: 4,
    uniqueId: snakeCase('In Planning'),
    isDeleted: false,
  },
  {
    title: 'In Development',
    description: '',
    colorCode: '#343a40 ',
    orderNumber: 5,
    uniqueId: snakeCase('In Development'),
    isDeleted: false,
  },
  {
    title: 'Implemented',
    description: '',
    colorCode: '#2ecc71',
    orderNumber: 6,
    uniqueId: snakeCase('Implemented'),
    isDeleted: false,
  },
  {
    title: 'Parking Lot',
    description: '',
    colorCode: '#6c757d',
    orderNumber: 7,
    uniqueId: snakeCase('Parking Lot'),
    isDeleted: false,
  },
];

export const DEFAULT_OPPORTUNITY_TYPES = [
  {
    name: 'Idea',
    description:
      'Share ways to help make our organization work better, faster, and smarter.',
    abbreviation: snakeCase('Idea'),
    icon: 'lightbulb',
    color: '#1AB394',
    isEnabled: true,
    isDeleted: false,
    enableDupDetection: true,
    duplicatableTypes: [],
    enableLinking: true,
    linkableTypes: [],
  },
];
