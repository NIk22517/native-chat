import { useSignUp } from "@/hooks/auth/use-sign-up";
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

export default function SignUpScreen() {
  const { isPending, mutate } = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: textColor,
          },
        ]}
      >
        Create Account
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full Name"
        style={[
          styles.input,
          {
            borderColor,
            color: textColor,
          },
        ]}
        placeholderTextColor={borderColor}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={[
          styles.input,
          {
            borderColor,
            color: textColor,
          },
        ]}
        placeholderTextColor={borderColor}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={[
          styles.input,
          {
            borderColor,
            color: textColor,
          },
        ]}
        placeholderTextColor={borderColor}
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
              email,
              name,
              password,
            },
          });
        }}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <AuthSwitcher
        text="Already have an account?"
        linkText="Login"
        href="/signin"
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
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
