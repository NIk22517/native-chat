import type { SignInPayload } from "@/hooks/auth/use-sign-in";
import type { SignUpPayload } from "@/hooks/auth/use-sign-up";
import { BaseService } from "./baseService";

export class AuthServices extends BaseService {
  logIn = (values: SignInPayload) => {
    return this.instance.post("/auth/log-in", values);
  };
  signUp = (values: SignUpPayload) => {
    return this.instance.post("/auth/sign-in", values);
  };
}
