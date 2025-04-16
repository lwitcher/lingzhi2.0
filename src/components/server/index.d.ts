declare module '@/components/server/ServerList.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    selectedId: string | undefined
  }, {}, any>
  export default component
}

declare module '@/components/server/ServerDetails.vue' {
  import { DefineComponent } from 'vue'
  
  export interface Server {
    id: string | number;
    name: string;
    status: 'online' | 'offline' | 'warning';
    ip?: string;
    [key: string]: any;
  }
  
  const component: DefineComponent<{
    server: Server
  }, {}, any>
  export default component
}