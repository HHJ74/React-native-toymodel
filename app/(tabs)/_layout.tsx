import { Tabs } from 'expo-router';
import React ,{useState, useEffect} from 'react';
import { Platform, Button } from 'react-native';
import { logout as kakaoLogout } from '@react-native-seoul/kakao-login';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { getProfile } from '@react-native-seoul/kakao-login'; 

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ useState는 최상단에서 호출
    
  const handleLogout = async () => {
    try {
      await kakaoLogout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  };

  const handleLogin = async () => {
      router.replace('/login');
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const profile = await getProfile(); // ✅ 올바른 API 사용
        console.log("Profile fetched:", profile);
        setIsLoggedIn(!!profile);
      } catch (error) {
        console.log("Login check failed:", error.message);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true, // 로그아웃 버튼을 위해 헤더 표시
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        headerRight: () => (
          <Button 
          title= {isLoggedIn ? "logout" : "login"} 
          onPress={isLoggedIn ? handleLogout : handleLogin} 
          />
        ),
      }}>
      <Tabs.Screen
        name="login"
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Board',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

async function getKakaoProfile(): Promise<any> {
  throw new Error('Function not implemented.');
}