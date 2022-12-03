/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.frag' {
  const content: any;
  export default content;
}

declare module '*.vert' {
  const content: any;
  export default content;
}