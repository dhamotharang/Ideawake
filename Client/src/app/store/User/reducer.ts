import { tassign } from 'tassign';

import { CLEAR_USER_DATA, LOAD_USER_DATA } from './actions';
import { INITIAL_USER_STATE, UserState } from './store';

export function userReducer(
  state: UserState = INITIAL_USER_STATE,
  action: { type: any; user: any }
): UserState {
  switch (action.type) {
    case CLEAR_USER_DATA: {
      return tassign(state, INITIAL_USER_STATE);
    }
    case LOAD_USER_DATA: {
      return tassign(state, { ...action.user });
    }
    default: {
      return state;
    }
  }
}
