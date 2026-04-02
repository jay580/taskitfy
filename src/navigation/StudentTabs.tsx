import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { verticalScale } from "../utils/responsive";

// Screens (make sure these exist)
import Home from "../screens/Student/Home";
import Tasks from "../screens/Student/Tasks";
import Leaderboard from "../screens/Student/Leaderboard";
import Profile from "../screens/Student/Profile";

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        // 🎨 Tab Bar Styling
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          height: verticalScale(60),
          borderTopWidth: 0,
          elevation: 10,
          paddingBottom: verticalScale(6)
        },

        // 🎯 Colors
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.inactive,

        // ✨ Clean look
        tabBarShowLabel: false,
      }}
    >
      {/* 🏠 HOME */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 📋 TASKS */}
      <Tab.Screen
        name="Tasks"
        component={Tasks}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 🏆 LEADERBOARD */}
      <Tab.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 👤 PROFILE */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}