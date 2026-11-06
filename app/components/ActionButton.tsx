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
  tone?: "quiet" | "ok";
}

export function ActionButton({
  text,
  icon,
  onPress,
  isLoading = false,
  tone = "quiet",
}: ActionButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        tone === "ok" && styles.okButton,
        isLoading && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={tone === "ok" ? theme.colors.onConfirm : theme.colors.ink}
        />
      ) : (
        icon
      )}
      <Text style={[styles.buttonText, tone === "ok" && styles.okText]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, radius, spacing, type } = theme;
  return StyleSheet.create({
    actionButton: {
      flexBasis: "48%",
      flexGrow: 1,
      flexDirection: "row",
      minHeight: 48,
      backgroundColor: colors.card,
      borderRadius: radius.control,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.cardLine,
      ...theme.cardShadow,
    },
    okButton: {
      backgroundColor: colors.confirm,
      borderColor: colors.confirm,
    },
    buttonText: {
      ...type.labelStrong,
      color: colors.ink,
      textAlign: "center",
    },
    okText: {
      color: colors.onConfirm,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
};
