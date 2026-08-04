import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ChangelogView from '../views/ChangelogView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'SynlysAI',
    },
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: ChangelogView,
    meta: {
      title: 'Changelog | SynlysAI',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
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

export default router
