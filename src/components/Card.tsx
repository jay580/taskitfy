import { View } from "react-native";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../theme";

export default function Card({ children }: any) {
  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        ...SHADOWS.card,
      }}
    >
      {children}
    </View>
  );
}