import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import colors from "@/constants/colors";

interface ActionButtonProps {
  text: string;
  icon: React.ReactNode;
  onPress: () => void;
  isLoading?: boolean;
}

export function ActionButton({
  text,
  icon,
  onPress,
  isLoading = false,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, isLoading && styles.disabledButton]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? <ActivityIndicator size="small" color="#000" /> : icon}
      <Text style={styles.buttonText}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 22,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    lineHeight: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});