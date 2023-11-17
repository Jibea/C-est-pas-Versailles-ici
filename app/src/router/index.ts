import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RoomView from '../views/RoomView.vue'
import AboutView from '../views/AboutView.vue'
import GroupView from '../views/GroupView.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/aymeric', name: 'aymeric', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/room/:roomName', name: 'roomRoute', component: RoomView},
  { path: '/room/:roomName/:groupId', name: 'groupRoute', component: GroupView}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
