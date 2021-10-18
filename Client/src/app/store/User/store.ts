export interface UserState {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  defaultLanguage: string;
  password: string;
  role: string;
  lastLogin: string;
  isSSO: boolean;
}

export const INITIAL_USER_STATE: UserState = {
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
  defaultLanguage: 'English',
  password: '',
  role: '',
  lastLogin: '',
  isSSO: false
};
