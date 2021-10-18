export interface IUserState {
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

export const USER_INITIAL_STATE: IUserState = {
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
