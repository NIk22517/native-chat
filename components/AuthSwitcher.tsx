import { useThemeColor } from "@/hooks/use-theme-color";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  text: string;
  linkText: string;
  href: "/signin" | "/signup";
};

export default function AuthSwitcher({ text, linkText, href }: Props) {
  const textColor = useThemeColor({}, "text");
  const linkColor = useThemeColor({}, "primary");

  return (
    <View style={styles.container}>
      <Text style={{ color: textColor }}>{text} </Text>

      <Link href={href} asChild>
        <TouchableOpacity>
          <Text
            style={[
              styles.link,
              {
                color: linkColor,
              },
            ]}
          >
            {linkText}
          </Text>
        </TouchableOpacity>
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
    fontWeight: "600",
  },
});
