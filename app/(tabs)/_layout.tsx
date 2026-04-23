import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLMStudio } from '@/context/LMStudioContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isConfigured } = useLMStudio();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.right.fill" color={color} />,
          headerTitle: isConfigured ? 'Chat with LM Studio' : 'Configure LM Studio',
        }}
      />
      <Tabs.Screen
        name="models"
        options={{
          title: 'Models',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cube.fill" color={color} />,
          headerTitle: 'Model Manager',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
