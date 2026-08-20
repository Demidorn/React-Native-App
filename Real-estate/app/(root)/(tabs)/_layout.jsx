import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/store/useStore";
import { Platform } from 'react-native';

function IOSTabs() {

  const isAdmin = useUserStore((state) => state.isAdmin);

  return (
    <NativeTabs
      tintColor="#2563EB"
      iconColor={{
        default: "#6B7280",
        selected: "#2563EB",
      }}
      labelVisibilityMode="labeled"
      labelStyle={{
        color: "#6B7280",
      }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      {/* create property */}
      {isAdmin && (
        <NativeTabs.Trigger name="create">
        <Icon sf="add.fill"  />
        <Label>Saved</Label>
      </NativeTabs.Trigger>
      )}

      <NativeTabs.Trigger name="saved">
        <Icon sf="heart.fill"  />
        <Label>Saved</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf="person.circle"  />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}



function AndroidTabs() {
  const isAdmin = useUserStore((state) => state.isAdmin);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* create property */}

      <Tabs.Screen
        name="create"
        options={{
          title: "create",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* second  option for only admins to create property */}
      {/* {isAdmin && (
      <Tabs.Screen
        name="create"
        options={{
          title: "create",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      )}  */}

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}


export default function TabsLayout() {
  return Platform.OS === 'ios' ? <IOSTabs /> : <AndroidTabs />;
}