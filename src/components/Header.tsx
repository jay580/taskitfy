import { View, Text, TouchableOpacity } from "react-native";
import { COLORS, SPACING } from "../theme";

export default function Header({
  title,
  rightAction,
  onRightPress,
}: any) {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        paddingTop: SPACING.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          color: COLORS.white,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>

      {rightAction && (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={{ color: COLORS.white }}>{rightAction}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}