import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  text: string;
  linkText: string;
  href: "/(auth)/signin" | "/(auth)/signup";
};

export default function AuthSwitcher({ text, linkText, href }: Props) {
  return (
    <View style={styles.container}>
      <Text>{text} </Text>

      <Link href={href} style={styles.link}>
        {linkText}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
