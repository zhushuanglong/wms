import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes 恒定路由
 * 没有权限要求的页面，所有角色都可进入
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '数据面板', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes 异步路由
 * 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  // 产品管理
  {
    path: '/product',
    component: Layout,
    redirect: '/product/order/index',
    // alwaysShow: true, // will always show the root menu
    name: 'Product',
    meta: {
      title: '产品管理',
      icon: 'shopping',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'product',
        component: () => import('@/views/product/index'),
        name: 'IndexProduct',
        meta: {
          title: '产品列表',
          roles: ['admin', 'editor'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/create',
        component: () => import('@/views/product/create'),
        name: 'CreateProduct',
        meta: {
          title: '产品上新',
          roles: ['admin', 'editor'] // you can set roles in root nav
        }
      },
      {
        path: '/detail',
        component: () => import('@/views/product/detail'),
        name: 'DetailProduct',
        meta: {
          title: '产品详情',
          roles: ['admin', 'editor'] // you can set roles in root nav
        }
      }
    ]
  },
  // 采购管理
  {
    path: '/purchase',
    component: Layout,
    redirect: '/purchase/order',
    // alwaysShow: true, // will always show the root menu
    name: 'Purchase',
    meta: {
      title: '采购管理',
      icon: 'shopping',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'order',
        component: () => import('@/views/purchase/order/index'),
        name: 'OrderPurchase',
        meta: {
          title: '采购订单',
          roles: ['admin', 'editor'] // or you can only set roles in sub nav
        }
      },
      // 供应商管理
      {
        path: 'supplier',
        component: () => import('@/views/purchase/supplier/index'),
        name: 'Supplier',
        meta: {
          title: '供应商',
          roles: ['admin', 'editor'] // you can set roles in root nav
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
