import { Text } from "react-native";
import { COLORS } from "../theme";

export default function Points({ value }: any) {
  return (
    <Text style={{ color: COLORS.accent, fontWeight: "700" }}>
      ⭐ {value}
    </Text>
  );
}