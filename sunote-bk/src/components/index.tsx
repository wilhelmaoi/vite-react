import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import bell from '../assets/bell.png';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import newspaper from '../assets/newspaper.png';
import { Home } from './screens/Home';
import { Community } from './screens/Community';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import { Mine } from './screens/Mine';
import { SignIn } from './sign/SignIn';
import { TransitionSpecs } from '@react-navigation/bottom-tabs';

const HomeTabs = createBottomTabNavigator({
  screens: {
   
    Home: {
      screen: Home,
      options: {
        title: '首页',
        transitionSpec: TransitionSpecs.FadeSpec,
        tabBarIcon: ({ color, size }) => (
          <Image
            source={newspaper}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Community: {
      screen: Community,
      options: {
        title: '社区',
        transitionSpec: TransitionSpecs.FadeSpec,
        tabBarIcon: ({ color, size }) => (
          <Image
            source={newspaper}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Updates: {
      screen: Updates,
      options: {
        title: '通知',
        transitionSpec: TransitionSpecs.FadeSpec,
        tabBarIcon: ({ color, size }) => (
       <MaterialIcons name="notifications" size={size} color={color} />
        ),
      },
    },
  Mine: {
    screen: Mine,
    options: {
      title: '我的',
      transitionSpec: TransitionSpecs.FadeSpec,
      tabBarIcon: ({ color, size }) => (
        <Image
          source={newspaper}
          tintColor={color}
          style={{
            width: size,
            height: size,
          }}
        />
      ),
    },
  },
  }

});

const RootStack = createNativeStackNavigator({
  screens: {
    SignIn: {
      screen: SignIn,
      options: {
        headerShown: false,
      },
    },
    HomeTabs: {
      screen: HomeTabs,
      options: {
        title: 'Home',
        headerShown: false,
        
      },
    },
    Profile: {
      screen: Profile,
      linking: {
        path: ':user(@[a-zA-Z0-9-_]+)',
        parse: {
          user: (value) => value.replace(/^@/, ''),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
    },
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: '404',
      },
      linking: {
        path: '*',
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
