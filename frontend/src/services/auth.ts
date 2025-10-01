import { AxiosResponse } from "axios";

import { store } from "@/redux/store";
import api from "@/services/api";
import { UserLoginData, UserSignupData } from "@/utils/types";
import { setUser } from "@/redux/accountSlice";

export async function authenticate(
  data: UserLoginData | UserSignupData,
  auth_type: "login" | "signup",
) {
  console.log("Authenticating...", data);
  try {
    const res: AxiosResponse = await api.post(`/${auth_type}`, data, {
      withCredentials: true,
    });
    const { access_token, ...userData } = res.data;
    store.dispatch(setUser(userData));
    sessionStorage.setItem("token", access_token);
    return true;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error

    if (error.status) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return error.status;
    }
    return null;
  }
}

export async function checkEmail(email: string) {
  try {
    const res: AxiosResponse<{ exists: boolean }> = await api.post(
      "/signup/check-email",
      { email },
    );
    return res.data.exists;
  } catch {
    return null;
  }
}

export async function checkUsername(username: string) {
  try {
    const res: AxiosResponse<{ exists: boolean }> = await api.post(
      "/signup/check-username",
      { username },
    );
    return res.data.exists;
  } catch {
    return null;
  }
}
