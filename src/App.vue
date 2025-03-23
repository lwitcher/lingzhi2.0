<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const route = useRoute();
const router = useRouter();
const isSidebarOpen = ref(true);
const windowWidth = ref(0);

// 移动端菜单状态
const mobileMenuOpen = ref(false);
// 用户菜单状态
const userMenuOpen = ref(false);

onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
  
  // 点击页面其他位置关闭用户菜单
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.user-menu-container')) {
      userMenuOpen.value = false;
    }
  });
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const toggleUserMenu = (event) => {
  event.stopPropagation();
  userMenuOpen.value = !userMenuOpen.value;
};

const handleLogout = () => {
  // 实际应用中可添加登出逻辑
  alert('用户登出');
  userMenuOpen.value = false;
};

const menuItems = [
  {
    name: '仪表盘',
    route: '/',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />'
  },
  {
    name: '服务器',
    route: '/servers',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />'
  },
  {
    name: '测试用例',
    route: '/testcases',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
  },
  {
    name: '维护',
    route: '/maintenance',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />'
  },
  {
    name: '任务',
    route: '/jobs',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />'
  },
  {
    name: '监控',
    route: '/monitoring',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />'
  }
];

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- 左侧侧边栏 -->
    <aside :class="[isSidebarOpen ? 'w-64' : 'w-20', 'transition-all duration-300 bg-white shadow-md hidden md:block md:fixed md:h-screen z-10']">
      <div class="h-16 flex items-center px-4 border-b border-gray-200">
        <span v-if="isSidebarOpen" class="text-xl font-semibold text-gray-800">灵智管理系统</span>
        <span v-else class="text-xl font-semibold text-gray-800">灵智</span>
        <button @click="toggleSidebar" class="ml-auto p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <!-- 侧边栏菜单 -->
      <nav class="mt-5 px-2 overflow-y-auto h-[calc(100vh-4rem)]">
        <div class="space-y-1">
          <router-link 
            v-for="item in menuItems" 
            :key="item.route" 
            :to="item.route"
            :class="[
              isActive(item.route) 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
              'group flex items-center py-2 px-3 text-sm font-medium rounded-md'
            ]"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5 mr-3 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              v-html="item.icon"
            ></svg>
            <span v-if="isSidebarOpen">{{ item.name }}</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <div :class="[isSidebarOpen ? 'md:ml-64' : 'md:ml-20', 'flex-1 flex flex-col overflow-hidden transition-all duration-300']">
      <!-- 顶部导航栏 -->
      <header class="bg-white shadow-sm z-10">
        <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center md:hidden">
              <button 
                @click="toggleMobileMenu" 
                class="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <Bars3Icon v-if="!mobileMenuOpen" class="block h-6 w-6" aria-hidden="true" />
                <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
              </button>
              <span class="ml-3 text-xl font-semibold text-gray-800">灵智服务器管理系统</span>
            </div>
            
            <!-- 右侧用户头像和下拉菜单 -->
            <div class="flex items-center justify-end flex-1">
              <div class="ml-3 relative user-menu-container">
                <div>
                  <button 
                    @click="toggleUserMenu" 
                    class="bg-gray-100 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span class="sr-only">用户菜单</span>
                    <img class="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="用户头像" />
                  </button>
                </div>
                
                <!-- 用户下拉菜单 -->
                <div 
                  v-if="userMenuOpen" 
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1"
                >
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900">管理员</p>
                    <p class="text-sm text-gray-500 truncate">admin@example.com</p>
                  </div>
                  <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="userMenuOpen = false">
                    个人信息
                  </router-link>
                  <router-link to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="userMenuOpen = false">
                    设置
                  </router-link>
                  <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    退出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- 移动端导航菜单 -->
      <div class="md:hidden" :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }">
        <div class="bg-white shadow-md">
          <div class="pt-2 pb-3 space-y-1">
            <router-link 
              v-for="item in menuItems" 
              :key="item.route" 
              :to="item.route"
              :class="[
                isActive(item.route) 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
              ]"
              @click="closeMobileMenu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 mr-3 inline-block" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                v-html="item.icon"
              ></svg>
              <span>{{ item.name }}</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <main class="flex-1 overflow-auto bg-gray-50">
        <div class="py-6 px-4 sm:px-6 lg:px-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.router-link-active svg {
  color: #1D4ED8;
}

nav a {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .hide-on-mobile {
    display: none;
  }
}

/* 用户菜单淡入淡出动画 */
.origin-top-right {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
