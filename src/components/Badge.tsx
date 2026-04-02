import { View, Text } from "react-native";
import { COLORS, RADIUS, SPACING } from "../theme";

export default function Badge({ label }: any) {
  return (
    <View
      style={{
        backgroundColor: COLORS.accent,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
      }}
    >
      <Text style={{ fontWeight: "600" }}>{label}</Text>
    </View>
  );
}