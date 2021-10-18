import { get, isEmpty } from 'lodash';
import { NOTIFICATION_MENTION, NOTIFICATION_STRINGS } from '../utils/constants';

export class RenderNotificationHelper {
  constructor() {}
  static general(notification) {
    return `<span>
            ${NOTIFICATION_STRINGS[notification.actionType.abbreviation]}
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )}
    </span>`;
  }
  static shareOpportunity(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            ${NOTIFICATION_STRINGS[notification.actionType.abbreviation]}
            ${notification.entityName}
            with you
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static addOwner(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            added ${get(
              notification,
              'entityOperendObject.userName',
              'you'
            )} as an
            owner on your
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static removeOwner(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            removed ${get(
              notification,
              'entityOperendObject.userName',
              'you'
            )} as
            an owner from your
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static addContributor(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            added ${get(notification, 'entityOperendObject.userName', 'you')} as
            team member on your
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static removeContributor(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            removed ${get(
              notification,
              'entityOperendObject.userName',
              'you'
            )} as
            team member on your
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static addSubmitter(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            added ${get(notification, 'entityOperendObject.userName', 'you')} as
            co-submitter on your
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static removeSubmitter(notification) {
    let message = get(notification, 'entityOperendObject.message', '');
    if (!isEmpty(message)) {
      message = `- ${message}`;
    } else {
      message = '';
    }
    return `<span>
            removed ${get(
              notification,
              'entityOperendObject.userName',
              'you'
            )} as
            co-submitter on your
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} ${message}
    </span>`;
  }
  static awardPrize(notification) {
    let awardee = '';
    if (
      get(
        notification,
        'entityOperendObject.awardeeEntityType.abbreviation',
        false
      ) === 'user'
    ) {
      awardee = get(notification, 'entityOperendObject.awardee.userName', '');
    } else {
      awardee = `[#${get(
        notification,
        'entityOperendObject.awardee.id'
      )}] ${get(notification, 'entityOperendObject.awardee.title', '')}`;
    }
    return `<span>
            awarded ${get(
              notification,
              'entityOperendObject.prize.title',
              ''
            )} to ${awardee}
                  on
                  ${notification.entityName}
                  [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )}
    </span>`;
  }
  static userAndGroupMention(notification) {
    if (
      get(notification, 'entityOperendObject.type') ===
      NOTIFICATION_MENTION.type.opportunityDescription
    ) {
      if (
        get(notification, 'entityOperendObject.mentionedObjectType') ===
        NOTIFICATION_MENTION.mentionedObjectType.group
      ) {
        return `<span> mentioned your group ${get(
          notification,
          'entityOperendObject.mentionedObject.name',
          ''
        )} in their submission of a new ${notification.entityName}  ${get(
          notification,
          'entityTitle',
          ''
        )}</span>`;
      } else if (
        get(notification, 'entityOperendObject.mentionedObjectType') ===
        NOTIFICATION_MENTION.mentionedObjectType.user
      ) {
        return `<span> mentioned you in ${notification.entityName} [#${
          notification.entityObjectId
        }] ${get(notification, 'entityTitle', '')}</span>`;
      }
    } else if (
      get(notification, 'entityOperendObject.type') ===
      NOTIFICATION_MENTION.type.comment
    ) {
      if (
        get(notification, 'entityOperendObject.mentionedObjectType') ===
        NOTIFICATION_MENTION.mentionedObjectType.group
      ) {
        return `<span> mentioned your group ${get(
          notification,
          'entityOperendObject.mentionedObject.name',
          ''
        )} in their comment on ${notification.entityName} [#${
          notification.entityObjectId
        }] ${get(notification, 'entityTitle', '')}</span>`;
      } else if (
        get(notification, 'entityOperendObject.mentionedObjectType') ===
        NOTIFICATION_MENTION.mentionedObjectType.user
      ) {
        return `<span> mentioned you in their comment on [#${
          notification.entityObjectId
        }] ${get(notification, 'entityTitle', '')}</span>`;
      }
    }
    return 'mentioned you here.';
  }

  static addWorkflow(notification) {
    return `<span>
            ${NOTIFICATION_STRINGS.add_workflow}
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )} to the workflow ${get(
      notification,
      'entityOperendObject.currentWorkflow.title',
      ''
    )} > ${get(
      notification,
      'entityOperendObject.currentStage.title',
      ''
    )}  </span>`;
  }

  static changeWorkflow(notification) {
    return `<span>
            ${NOTIFICATION_STRINGS.change_workflow}
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )}
            from the workflow ${get(
              notification,
              'entityOperendObject.previousWorkflow.title',
              ''
            )}
            to the workflow ${get(
              notification,
              'entityOperendObject.currentWorkflow.title',
              ''
            )}
          </span>`;
  }

  static changeStage(notification) {
    return `<span>
            ${NOTIFICATION_STRINGS.change_stage}
            ${notification.entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )}
            from the stage ${get(
              notification,
              'entityOperendObject.previousStage.title',
              ''
            )}
            to the stage ${get(
              notification,
              'entityOperendObject.currentStage.title',
              ''
            )}
          </span>`;
  }

  static upVoted(notification) {
    let entityName = notification.entityName;
    if (get(notification, 'entityOperendObject.type') === 'comment') {
      entityName = `comment on ${notification.entityName}`;
    }
    return `<span>
            ${NOTIFICATION_STRINGS[notification.actionType.abbreviation]}
            ${entityName}
            [#${notification.entityObjectId}] ${get(
      notification,
      'entityTitle',
      ''
    )}
    </span>`;
  }
}
