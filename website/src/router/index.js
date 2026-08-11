import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ReleasePortalView from '../views/ReleasePortalView.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'SynlysAI',
    },
  },
  {
    path: '/releases',
    name: 'releases',
    component: ReleasePortalView,
    meta: {
      title: 'Release Portal | SynlysAI',
    },
  },
  {
    path: '/changelog',
    name: 'changelog',
    redirect: (to) => ({ name: 'releases', query: to.query }),
  },
]

/** 创建官网路由实例。
 *
 * @param {import('vue-router').RouterHistory} history 路由历史实现。
 * @returns {import('vue-router').Router} 官网路由实例。
 */
export const createAppRouter = (history = createWebHistory()) => createRouter({
  history,
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 0,
      }
    }

    return { top: 0 }
  },
})

const router = createAppRouter()

export default router
