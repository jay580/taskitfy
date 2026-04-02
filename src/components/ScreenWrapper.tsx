import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../theme";

export default function ScreenWrapper({ children }: any) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.md,
      }}
    >
      {children}
    </SafeAreaView>
  );
}
