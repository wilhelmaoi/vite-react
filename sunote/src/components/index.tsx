// components/index.tsx
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';

import { Home } from './screens/Home';
import { Community } from '@/components/screens/Community';
import { Updates } from '@/components/screens/Updates';
import { Mine } from '@/components/screens/Mine';
// import { Profile } from '@/components/screens/Profile';
import { Settings } from '@/components/screens/Settings';
import { NotFound } from '@/components/screens/NotFound';
import newspaper from '../assets/newspaper.png';
import { SignIn } from './sign/SignIn';
import { RootStackParamList } from '@/screen';

type Props = NativeStackScreenProps<RootStackParamList>;
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Image source={newspaper} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{
          title: '社区',
          tabBarIcon: ({ color, size }) => (
            <Image source={newspaper} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={Updates}
        options={{
          title: '通知',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mine"
        component={Mine}
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Image source={newspaper} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const AppStack: React.FC<Props> =  ({ navigation }) =>{
  React.useEffect(() => {
    console.log('当前进入index界面');
  }, []);


  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={({ navigation }) => ({
          presentation: 'modal',
          headerRight: () => (
            <MaterialIcons name="close" size={24} onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen name="NotFound" component={NotFound} />
      <Stack.Screen name="SignIn" component={SignIn} />
  </Stack.Navigator>
  );
}