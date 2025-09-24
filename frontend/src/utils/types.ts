export interface HistoryLine {
  text: string;
  isUserInput: boolean;
  timestamp: string;
}

export interface UiState {
  inputValue: string;
  command: string | null;
  history: HistoryLine[];
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserSignupData extends UserLoginData {
  username: string;
}
