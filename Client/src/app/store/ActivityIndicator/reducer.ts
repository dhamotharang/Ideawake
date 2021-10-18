import { tassign } from 'tassign';

import { SHOW_ACTIVITY_INDICATOR } from './actions';
import {
  ACTIVITY_INDICATOR_INITIAL_STATE,
  ActivityIndicatorState
} from './store';

export function ActivityIndicatorReducer(
  state: ActivityIndicatorState = ACTIVITY_INDICATOR_INITIAL_STATE,
  action
): ActivityIndicatorState {
  switch (action.type) {
    case SHOW_ACTIVITY_INDICATOR: {
      return tassign(state, {
        ...{ activityIndicatorShown: action.indicator }
      });
    }
    default: {
      return state;
    }
  }
}
