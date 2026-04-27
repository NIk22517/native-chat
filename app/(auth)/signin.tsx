import { useSignIn } from "@/hooks/auth/use-sign-in";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthSwitcher from "../../components/AuthSwitcher";

export default function SignInScreen() {
  const { isPending, mutate } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  return (
    <View style={[styles.container]}>
      <Text
        style={[
          styles.title,
          {
            color: textColor,
          },
        ]}
      >
        Sign In
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={borderColor}
        style={[
          styles.input,
          {
            borderColor,
            color: textColor,
          },
        ]}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={borderColor}
        secureTextEntry
        style={[
          styles.input,
          {
            borderColor,
            color: textColor,
          },
        ]}
      />

      <TouchableOpacity
        disabled={isPending}
        style={[
          styles.button,
          {
            backgroundColor: primaryColor,
            opacity: isPending ? 0.7 : 1,
          },
        ]}
        onPress={() => {
          mutate({
            data: {
              email: email.trim(),
              password: password.trim(),
            },
          });
        }}
      >
        <Text style={styles.buttonText}>
          {isPending ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <AuthSwitcher
        text="Don't have an account?"
        linkText="Create new account"
        href="/signup"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
