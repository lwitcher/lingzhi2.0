declare module '@/components/testcase/TestCaseList.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    filters: Record<string, any>
  }, {}, any>
  export default component
}

declare module '@/components/testcase/TestCaseDetails.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    testCase: Record<string, any>
  }, {}, any>
  export default component
}

declare module '@/components/testcase/TestCaseForm.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    testCase: Record<string, any> | null
    isEdit: boolean
  }, {}, any>
  export default component
}