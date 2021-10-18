import { CLEAR_USER_DATA, LOAD_USER_DATA } from './actions';

export const clearUserData = (payload: any) => ({
  type: CLEAR_USER_DATA,
  payload
});

export const loadUserData = (payload: any) => ({
  type: LOAD_USER_DATA,
  payload
});
