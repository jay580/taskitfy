import { View, Text, ScrollView } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Points from "../components/Points";
import Header from "../components/Header";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

export default function ThemePreview() {
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <Header title="Theme Preview" />

      <ScreenWrapper>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* COLORS */}
          <Text style={TYPOGRAPHY.heading}>Colors</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: SPACING.lg }}>
            {Object.entries(COLORS).map(([key, value]) => (
              <View key={key} style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: value as string,
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                />
                <Text style={{ fontSize: 10 }}>{key}</Text>
              </View>
            ))}
          </View>

          {/* TYPOGRAPHY */}
          <Text style={TYPOGRAPHY.heading}>Typography</Text>

          <Text style={TYPOGRAPHY.title}>Title Text</Text>
          <Text style={TYPOGRAPHY.heading}>Heading Text</Text>
          <Text style={TYPOGRAPHY.body}>Body Text</Text>
          <Text style={TYPOGRAPHY.small}>Small Text</Text>

          {/* BUTTONS */}
          <Text style={[TYPOGRAPHY.heading, { marginTop: SPACING.lg }]}>
            Buttons
          </Text>

          <Button title="Primary Button" onPress={() => {}} />
          <View style={{ height: 10 }} />
          <Button title="Danger Button" variant="secondary" onPress={() => {}} />

          {/* CARD */}
          <Text style={[TYPOGRAPHY.heading, { marginTop: SPACING.lg }]}>
            Card
          </Text>

          <Card>
            <Text>This is a card component</Text>
            <Points value={10} />
          </Card>

          {/* BADGES */}
          <Text style={[TYPOGRAPHY.heading, { marginTop: SPACING.lg }]}>
            Badges
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Badge label="🔥 On Fire" />
            <Badge label="⭐ First Task" />
          </View>

        </ScrollView>
      </ScreenWrapper>
    </View>
  );
}