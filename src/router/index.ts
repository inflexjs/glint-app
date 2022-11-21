import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Overlay from '/src/components/Overlay.vue'
import Settings from '/src/components/Settings.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'overlay',
    component: Overlay
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
