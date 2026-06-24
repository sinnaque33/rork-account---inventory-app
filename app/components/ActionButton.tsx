import React, { useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";

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
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.actionButton, isLoading && styles.disabledButton]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.ink} />
      ) : (
        icon
      )}
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, radius, type } = theme;
  return StyleSheet.create({
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      paddingVertical: 18,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    buttonText: {
      ...type.caption,
      fontWeight: "700",
      color: colors.ink,
      textAlign: "center",
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
};
