import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RoomView from '../views/RoomView.vue'
import AboutView from '../views/AboutView.vue'
import GroupView from '../views/GroupView.vue'
import ManageLightsView from '../views/ManageLightsView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import SensorsControlView from '../views/SensorsControlView.vue'
import EditSceneView from '../views/EditSceneView.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/aymeric', name: 'aymeric', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/room/:roomName', name: 'roomRoute', component: RoomView},
  { path: '/room/:roomName/:groupId', name: 'groupRoute', component: GroupView},
  { path: '/room/:roomName/:groupId/editScene', name: 'editSceneRoute', component: EditSceneView},
  { path: '/room/:roomName/:groupId/manageLights', name: 'manageLightsRoute', component: ManageLightsView},
  { path: '/room/:roomName/:groupId/schedule', name: 'scheduleRoute', component: ScheduleView},
  { path: '/room/:roomName/:groupId/sensorsControl', name: 'sensorsControlRoute', component: SensorsControlView},

  // Redirect if no route is matched let it the last
  { path: '/:catchAll(.*)', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
