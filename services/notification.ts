import { PlatformOSType } from "react-native";
import { AuthInfo, BaseService } from "./baseService";

export class NotificationServices extends BaseService {
  registerPushToken = (
    values: AuthInfo & {
      data: { device_id: string; platform: PlatformOSType; token: string };
    },
  ) => {
    return this.instance.post(
      "notification/push-token",
      { data: values.data },
      {
        ...this.buildConfig({ auth: values }),
      },
    );
  };
}
