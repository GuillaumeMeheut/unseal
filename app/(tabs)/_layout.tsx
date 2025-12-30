import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FAF8F5',
          borderTopWidth: 1,
          borderTopColor: '#E8E2D9',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3D3A36',
        tabBarInactiveTintColor: '#9A948A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'New',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="partner"
        options={{
          title: 'Partner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
