import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#64748b" />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This page doesn&apos;t exist.</Text>

        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>Go to Login</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1e293b",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600" as const,
  },
});
