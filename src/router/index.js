import { createRouter, createWebHistory } from 'vue-router'
import Base from '../components/Base.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Base,
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'category',
          name: 'category',
          component: () => import('../views/CategoryView.vue'),
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('../views/CartView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: '/login',
          name: 'login',
          component: () => import('../views/LoginView.vue')
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('../views/RegisterView.vue')
        },
        {
          path: '/orders',
          name: 'orders',
          component: () => import('../views/OrdersView.vue')
        },
        {
          path: '/address',
          name: 'address',
          component: () => import('../views/AddressView.vue')
        },
        {
          path: '/confirmOrder',
          name: 'confirmOrder',
          component: () => import('../views/ConfirmOrderView.vue')
        }
      ],
    },
  ],
})

export default router
