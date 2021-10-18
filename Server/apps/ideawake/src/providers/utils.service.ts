import axios from 'axios';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { lookup } from 'geoip-lite';
import * as _ from 'lodash';
import { mean, sum } from 'lodash';
import * as moment from 'moment';
import { FindOperator, getConnection } from 'typeorm';

import {
  DEMO_IPS,
  PERMISSIONS_MAP,
  TABLES,
} from '../common/constants/constants';
import { ConfigService } from '../shared/services/config.service';

const config = new ConfigService();

export class UtilsService {
  /**
   * convert entity to dto class instance
   * @param {{new(entity: E, options: any): T}} model
   * @param {E[] | E} entity
   * @param options
   * @returns {T[] | T}
   */
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E,
    options?: any,
  ): T;
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E[],
    options?: any,
  ): T[];
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E | E[],
    options?: any,
  ): T | T[] {
    if (_.isArray(entity)) {
      return entity.map(u => new model(u, options));
    }

    return new model(entity, options);
  }

  /**
   * generate hash from password or string
   * @param {string} password
   * @returns {string}
   */
  static generateHash(password: string): string {
    return bcrypt.hashSync(password, config.getNumber('BCRYPT_WORK') || 12);
  }

  /**
   * generate random string
   * @param length
   */
  static generateRandomString(length: number): string {
    return Math.random()
      .toString(36)
      .replace(/[^a-zA-Z0-9]+/g, '')
      .substr(0, length);
  }
  /**
   * validate text with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static validateHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash || '');
  }

  /**
   * Validate Old Hash
   * @param {string} password
   * @param {string} oldPassword
   * @param {string} salt
   * @returns {boolean}
   */
  static validateOldHash(
    password: string,
    oldPassword: string,
    salt: string,
  ): boolean {
    if (!password || !oldPassword || !salt) return false;
    const buffer = new Buffer(salt, 'base64');
    return (
      oldPassword ===
      crypto
        .pbkdf2Sync(password, buffer, 10000, 64, 'sha512')
        .toString('base64')
    );
  }

  // FIXME: remove after typescript 3.7 update
  static get<B, C = undefined>(
    func: () => B,
    defaultValue?: C,
  ): B | C | undefined {
    try {
      const value = func();

      if (_.isUndefined(value)) {
        return defaultValue;
      }
      return value;
    } catch {
      return defaultValue;
    }
  }

  static generateInviteUrl(originUrl, inviteId): string {
    return `${originUrl}/community/accept/invite/${inviteId}`;
  }
  static generateOpportunityUrl(originUrl, opportunityId, tab: string): string {
    return `${originUrl}/idea/view/${opportunityId}?tab=${tab}`;
  }
  static generateActionItemUrl(originUrl, opportunityId): string {
    return `${originUrl}/profile/action-items?idea=${opportunityId}`;
  }

  static generateRedirectEmailButton(url: string, text: string): string {
    return `<a href="${url}" style="min-width: 180px; height: 30px; font-size:19px; line-height:30px; background:#1ab394; text-decoration:none; border-radius:4px; color:#fff; font-weight:700; padding:12px 20px; display:inline-block; margin-bottom:0; font-weight:bold; text-align:center; vertical-align:middle;margin-top:15px; font-family: nunito; letter-spacing:.5px;">
          ${text}
        </a>`;
  }

  static generateInviteUrlButton(originUrl, inviteId, isSSO): string {
    let url;
    if (!isSSO) {
      url = `${originUrl}/community/accept/invite/${inviteId}`;
    } else {
      url = originUrl;
    }

    return this.generateRedirectEmailButton(url, 'Accept Invite');
  }

  static generateResetPasswordUrlButton(originUrl, resetCOde): string {
    return this.generateRedirectEmailButton(
      `${originUrl}/settings/update-password/${resetCOde}`,
      'Reset Password',
    );
  }

  static generatePasswordResetUrl(originUrl, resetCOde): string {
    return `${originUrl}/settings/update-password/${resetCOde}`;
  }

  static validateEmail(email: string): boolean {
    const re = /^([\w-\.]+@([\w-]+\.)+[\w-]+)+/;
    return re.test(email.toLowerCase());
  }

  static getCommunitySignupRate(invites): number {
    // const pending = _.filter(invites, function(o) {
    //   return o.invite_accepted === false;
    // });
    if (invites.length) {
      const accepted = _.filter(invites, function(o) {
        return o.invite_accepted === true;
      });
      const total = invites.length;
      return parseFloat(((accepted.length / total) * 100).toFixed(2));
    } else {
      return 0;
    }
  }
  static async createUserName(firstName, lastName, community) {
    const communityData = await getConnection()
      .createQueryBuilder()
      .select(`community`)
      .from(`${TABLES.COMMUNITY}`, `community`)
      .leftJoinAndSelect('community.tenant', 'tenant')
      .getMany();
    const tenantData = await communityData[0]['tenant'];
    const allTenantCommunities = await getConnection()
      .createQueryBuilder()
      .select(`community.id`)
      .from(`${TABLES.COMMUNITY}`, `community`)
      .where(`community.tenant = :tenant`, {
        tenant: tenantData.id,
      })
      .getMany();

    const communityUsers = await getConnection()
      .createQueryBuilder()
      .select('user', 'userCommunities')
      .from(`${TABLES.USER}`, `user`)
      .leftJoinAndSelect('user.userCommunities', 'userCommunities')
      .where('userCommunities.community IN (:...community)', {
        community: _.map(allTenantCommunities, 'id'),
      })
      .andWhere('user.userName = :userName', {
        userName: firstName + lastName,
      })
      .getMany();
    if (communityUsers.length) {
      const newLastName = lastName + Math.floor(Math.random() * (10 - 1) + 1);
      return await this.createUserName(firstName, newLastName, community);
    } else {
      return firstName + lastName;
    }
  }
  static updateKey(paramArray, keyToUpdate, updatedKey) {
    if (!paramArray.length) {
      return [];
    }
    const updatedArray = [];

    paramArray.map(item => {
      updatedArray.push(
        _.mapKeys(item, (_value, key) => {
          let newKey = key;
          if (key === keyToUpdate) {
            newKey = updatedKey;
          }
          return newKey;
        }),
      );
    });
    return updatedArray;
  }

  static updateUserCommunityData(userCommunities) {
    const userCommunitiesTemp = [];
    for (const i of userCommunities) {
      i.community['communityRole'] = {
        userId: i.userId,
        communityId: i.communityId,
      };
      userCommunitiesTemp.push(i.community);
    }
    return userCommunitiesTemp;
  }
  static getUserDraftOpportunityCount(opportunities) {
    const draftOpportunities = _.filter(opportunities, function(o) {
      return o.draft === true && o.isDeleted === false;
    }).length;
    return draftOpportunities;
  }

  static async getUserAvatar(firstName, lastName, size, background, color) {
    try {
      const imageResponse = await axios({
        url: `https://ui-avatars.com/api/?rounded=true&name=${firstName}+${lastName}&size=${size}&background=${background}&color=${color}`,
        method: 'GET',
        responseType: 'arraybuffer',
      });
      return imageResponse.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Updates the permission according to the given scenario condition.
   * @param permToCheck Permission to check the condition on.
   * @param condition Condition on the basis of which permission has to be updated.
   * @returns Updated permission value.
   */
  static checkScenarioPermission(permToCheck: number, condition): number {
    let permission = permToCheck;
    if (permToCheck === PERMISSIONS_MAP.SCENARIO) {
      permission = condition ? PERMISSIONS_MAP.ALLOW : PERMISSIONS_MAP.DENY;
    }
    return permission;
  }

  static getUserLocationByIp(ip) {
    const ipScenario = config.get('RANDOM_IP_FOR_TEST');
    const geo = lookup(ip);
    if (geo !== null) {
      return {
        country: geo && geo.country ? geo.country : null,
        city: geo && geo.city ? geo.city : null,
        timeZone: geo && geo.timezone ? geo.timezone : null,
        region: geo && geo.region ? geo.region : null,
        latLng: geo && geo.ll ? geo.ll : null,
      };
    } else {
      if (ipScenario === 'on') {
        const tempIp = DEMO_IPS[Math.floor(Math.random() * DEMO_IPS.length)];
        const geoTesting = lookup(tempIp);
        return {
          country: geoTesting && geoTesting.country ? geoTesting.country : null,
          city: geoTesting && geoTesting.city ? geoTesting.city : null,
          timeZone:
            geoTesting && geoTesting.timezone ? geoTesting.timezone : null,
          region: geoTesting && geoTesting.region ? geoTesting.region : null,
          latLng: geoTesting && geoTesting.ll ? geoTesting.ll : null,
        };
      }
      return null;
    }
  }

  /**
   * Get a date range for the past N months.
   * @param numberOnMonths Number of last N months to get dates on.
   */
  static getPastDatesByMonths(numberOnMonths: number): string[] {
    // Get moment at start date of previous month
    const prevMonth = moment().subtract(numberOnMonths, 'month');
    const prevMonthDays = prevMonth.daysInMonth() * numberOnMonths;

    // Array to collect dates of previous month
    const prevMonthDates = [];
    for (let i = 0; i < prevMonthDays; i++) {
      const prevMonthDay = prevMonth
        .clone()
        .add(i, 'days')
        .format('YYYY-MM-DD');
      prevMonthDates.push(prevMonthDay);
    }
    return prevMonthDates;
  }

  /**
   * Get a weekly date range for the past N months.
   * @param numberOnMonths Number of last N months to get dates on.
   */
  static getWeekDates(numberOnMonths: number): string[] {
    // Get moment at start of week of previous month
    const prevMonth = moment()
      .subtract(numberOnMonths, 'month')
      .startOf('isoWeek');
    const prevMonthDays = moment().diff(prevMonth, 'week');

    // Array to collect weeks of previous month
    const prevMonthDates = [];
    for (let i = 0; i <= prevMonthDays; i++) {
      const prevMonthDay = prevMonth
        .clone()
        .add(i, 'week')
        .format('YYYY-MM-DD');
      prevMonthDates.push(prevMonthDay);
    }
    return prevMonthDates;
  }

  /**
   * Get a monthly date range for the past N months.
   * @param numberOnMonths Number of last N months to get dates on.
   */
  static getPastMonths(numberOnMonths: number): string[] {
    // Get moment at start date of previous month
    const prevMonth = moment()
      .startOf('month')
      .subtract(numberOnMonths, 'month');

    // Array to collect dates of previous month
    const prevMonthDates = [];
    for (let i = 0; i <= numberOnMonths; i++) {
      const prevMonthDay = prevMonth
        .clone()
        .add(i, 'month')
        .format('YYYY-MM-DD');
      prevMonthDates.push(prevMonthDay);
    }
    return prevMonthDates;
  }

  static getRandomColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }

  /**
   * Helper method to replace the JoinColumn keys to their id columns for the
   * given query object if quering through FKs.
   * e.g. { community: 2 } will be converted to { communityId: 2 }
   *
   * @param queryOptions Object containing the data for entity columns.
   * @param entityAbbr Abbreviation for entity whose columns need to be replaced.
   * @param clone Boolean defining weather to clone the incoming data or not (defaults to true).
   */
  static replaceJoinColumnsForQueries(
    queryOptions: {} | [],
    entityAbbr:
      | 'opportunity'
      | 'challenge'
      | 'prize'
      | 'userCircle'
      | 'roleActor'
      | 'invite',
    clone = true,
  ): {} {
    const joinedColumns = {
      opportunity: {
        opportunityType: true,
        community: true,
        user: true,
        challenge: true,
        stage: true,
        workflow: true,
      },
      challenge: {
        opportunityType: true,
        community: true,
        workflow: true,
        user: true,
      },
      prize: { community: true, challenge: true, category: true },
      userCircle: { user: true, circle: true },
      roleActor: { role: true, community: true, entityType: true },
      invite: { role: true, community: true, user: true },
    };
    const data = clone ? _.cloneDeep(queryOptions) : queryOptions;

    if (Array.isArray(queryOptions)) {
      _.forEach(data, val =>
        UtilsService.replaceJoinColumns(val, joinedColumns[entityAbbr]),
      );
    } else {
      UtilsService.replaceJoinColumns(data, joinedColumns[entityAbbr]);
    }

    return data;
  }

  /**
   * Inner helper method for replacing join column keys in
   * 'replaceJoinColumnsForQueries' method.
   *
   * @param data Data object to replace.
   * @param joinedColumns Object containing joined columns' names.
   */
  private static replaceJoinColumns(data: {}, joinedColumns: {}): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _.forEach(data, (val: any, key) => {
      if (
        _.get(joinedColumns, key) &&
        (typeof val === 'number' ||
          !isNaN(val) ||
          (val instanceof FindOperator &&
            Array.isArray(val.value) &&
            (typeof _.head(val.value) === 'number' ||
              !isNaN(_.head(val.value)))))
      ) {
        data[`${key}Id`] = val;
        delete data[key];
      }
    });
  }

  static variance(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = mean(values);
    return sum(values.map(num => Math.pow(num - avg, 2))) / (values.length - 1);
  }
}
