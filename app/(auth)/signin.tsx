import { useSignIn } from "@/hooks/auth/use-sign-in";
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity
        disabled={isPending}
        style={styles.button}
        onPress={() => {
          mutate({
            data: {
              email,
              password,
            },
          });
        }}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <AuthSwitcher
        text="Don't have an account?"
        linkText="Create new account"
        href="/(auth)/signup"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
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
