export interface HistoryLine {
  type: "text" | "password";
  text: string;
  isUserInput: boolean;
  timestamp: string;
}

export interface CommandType {
  type: "text" | "password";
  text: string | null;
}

export interface UiState {
  inputValue: string;
  command: CommandType;
  history: HistoryLine[];
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserSignupData extends UserLoginData {
  username: string;
}
