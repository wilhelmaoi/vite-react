// context/store.tsx
import { create } from 'zustand';
import { User } from '../database/sqlite';

// 账号状态管理
interface AuthState {
  token: string | null;
  username: string;
  password: string;
  user: User | null;  // 新增 user 字段
  avatarUri: string   // 新增 avatarUri
  nickname: string;
  setToken: (token: string) => void;
  clearToken: () => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setUser: (user: User) => void;  // 新增 setUser 方法
  setAvatarUri: (uri: string) => void;  // 新增 setAvatarUri
  setNickname: (nickname: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: '',
  password: '',
  user: null,  // 初始值为 null
  avatarUri: '',  // 初始值为 null
  nickname: '',
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setUser: (user) => set({ user }),  // 新增 setUser
  setAvatarUri: (uri) => set({ avatarUri: uri }),  // 新增 setAvatarUri
  setNickname: (nickname) => set({ nickname }),
  logout: () => set({ 
    token: null, 
    username: '', 
    password: '', 
    user: null,
    // avatarUri: ''  // 登出时清除头像
  }),
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


// 帖子数据类型
interface PostItem {
  id: string;
  username: string;
  nickname: string;
  content: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  location?: string;
  mood?: string;
  tags?: string[];
  avatar?: string; // 添加头像字段
}


// 评论数据类型
interface CommentItem {
  id: string;
  postId: string;
  username: string;
  nickname: string;
  content: string;
  createdAt: string;
  avatar?: string;
  // 新增回复相关字段
  parentId?: string;           // 父评论ID
  replyToUsername?: string;    // 被回复的用户名
  replyToNickname?: string;    // 被回复的用户昵称
  replyCount?: number;         // 回复数量
  likeCount?: number;          // 点赞数量
}

export type { PostItem, CommentItem };