import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#6B6B80',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopWidth: 1,
          borderTopColor: '#2D2D44',
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: '训练',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>💪</Text>,
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: '打卡',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>✅</Text>,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '社区',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
