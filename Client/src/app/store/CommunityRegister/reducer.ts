import { CLEAR_USER_DATA, LOAD_USER_DATA } from './actions';
import { tassign } from 'tassign';
import { IUserState, USER_INITIAL_STATE } from './store';

export function userReducer(
  state: IUserState = USER_INITIAL_STATE,
  action: { type: any; user: any }
): IUserState {
  switch (action.type) {
    case CLEAR_USER_DATA: {
      return tassign(state, USER_INITIAL_STATE);
    }
    case LOAD_USER_DATA: {
      return tassign(state, { ...action.user });
    }
    default: {
      return state;
    }
  }
}
