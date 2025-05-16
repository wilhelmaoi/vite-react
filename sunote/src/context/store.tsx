// context/store.tsx
import { create } from 'zustand';
import { User } from '../database/sqlite';

// 账号状态管理
interface AuthState {
  token: string | null;
  username: string;
  password: string;
  user: User | null;  // 新增 user 字段
  setToken: (token: string) => void;
  clearToken: () => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setUser: (user: User) => void;  // 新增 setUser 方法
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: '',
  password: '',
  user: null,  // 初始值为 null
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setUser: (user) => set({ user }),  // 新增 setUser
  logout: () => set({ token: null, username: '', password: '', user: null }),
}));



// 主题模式
// * - 提供 mode: "dark"/"light"
// * - 提供 toggleTheme() 切换主题
export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  toggleTheme: () => void;
}


export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'light',
  toggleTheme: () =>
    set((state) => ({
      mode: state.mode === 'light' ? 'dark' : 'light',
    })),
}));


// 侧边栏状态
interface ModalStore {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

export const useMaskStore = create<ModalStore>((set) => ({
  visible: false,
  setVisible: (value: boolean) => set({ visible: value }),
}));

// export const useModalStore = create(set => ({
//   visible: false,
//   setVisible: (v) => set({ visible: v })
// }));




// 当前 tab 路由名
interface NavigationState {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentTab: '',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));