import { AuthServices } from "./auth";
import { ChatServices } from "./chat";
import { NotificationServices } from "./notification";

export const services = {
  authServices: new AuthServices(),
  chatServices: new ChatServices(),
  notificationServices: new NotificationServices(),
};
