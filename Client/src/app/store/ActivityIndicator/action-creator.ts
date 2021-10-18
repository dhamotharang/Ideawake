import { HIDE_ACTIVITY_INDICATOR } from '../../actions';
import { SHOW_ACTIVITY_INDICATOR } from './actions';

export const showActivityLoader = (payload: any) => ({
  type: SHOW_ACTIVITY_INDICATOR,
  payload
});

export const utilityApiCall = () => ({
  type: HIDE_ACTIVITY_INDICATOR,
  data: false
});
