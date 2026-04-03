import { Modal, View, Text, TouchableOpacity } from "react-native";
import { COLORS, SPACING, RADIUS } from "../theme";

export default function AppModal({
  visible,
  title,
  children,
  onClose,
}: any) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: SPACING.md,
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              marginBottom: SPACING.sm,
            }}
          >
            {title}
          </Text>

          {/* Content */}
          {children}

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: SPACING.md,
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.primary }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}