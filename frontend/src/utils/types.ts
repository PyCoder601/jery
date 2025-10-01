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
  username: string;
  password: string;
}

export interface UserSignupData extends UserLoginData {
  email: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  is_mail_verified: boolean;
  created_at: string;
}

export interface Metric {
  id: number;
  name: string;
  current_level: number;
  warning_level: number;
  created_at: string;
  total: number;
  history: { time: number; level: number }[];
}

export interface TopProcess {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
}

export interface Server {
  id: number;
  name: string;
  api_key: string;
  is_verified: boolean;
  created_at: string;
  owner_id: number;
  top_five_processes: string;
  metrics: Metric[];
}
