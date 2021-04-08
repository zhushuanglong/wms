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
  }
  // {
  //   path: '/profile',
  //   component: Layout,
  //   redirect: '/profile/index',
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/profile/index'),
  //       name: 'Profile',
  //       meta: { title: '个人中心', icon: 'user', noCache: true }
  //     }
  //   ]
  // }
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
    redirect: '/product/index',
    alwaysShow: true, // will always show the root menu
    name: 'Product',
    meta: {
      title: '产品管理',
      icon: 'theme',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/product/index'),
        name: 'IndexProduct',
        meta: {
          title: '产品列表',
          roles: ['admin', 'editor']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/product/create'),
        name: 'CreateProduct',
        meta: {
          title: '上新产品',
          roles: ['admin', 'editor']
        },
        hidden: true
      },
      {
        path: 'view',
        component: () => import('@/views/product/view'),
        name: 'ViewProduct',
        meta: {
          title: '查看产品',
          roles: ['admin', 'editor']
        },
        hidden: true
      }
    ]
  },
  // 采购管理
  {
    path: '/purchase',
    component: Layout,
    redirect: '/purchase/order',
    alwaysShow: true, // will always show the root menu
    name: 'Purchase',
    meta: {
      title: '采购管理',
      icon: 'shopping',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      // 采购订单
      {
        path: 'order',
        component: () => import('@/views/purchase/order/index'),
        name: 'OrderPurchase',
        meta: {
          title: '采购订单',
          roles: ['admin', 'editor']
        },
      },
      {
        path: 'detail',
        component: () => import('@/views/purchase/order/detail'),
        name: 'DetailPurchase',
        hidden: true,
        meta: {
          title: '采购详情',
          roles: ['admin', 'editor']
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
  // 订单管理
  {
    path: '/order',
    component: Layout,
    redirect: '/order/index',
    alwaysShow: true, // will always show the root menu
    name: 'Order',
    meta: {
      title: '订单管理',
      icon: 'form',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/order/index'),
        name: 'indexOrder',
        meta: {
          title: '订单列表',
          roles: ['admin', 'editor']
        }
      },
      {
        path: 'detail',
        component: () => import('@/views/order/detail'),
        name: 'detailOrder',
        hidden: true,
        meta: {
          title: '订单详情',
          roles: ['admin', 'editor']
        }
      }
    ]
  },
  // 库存管理 - 货架列表
  {
    path: '/inventory',
    component: Layout,
    redirect: '/inventory/order/index',
    alwaysShow: true, // will always show the root menu
    name: 'Inventory',
    meta: {
      title: '库存管理',
      icon: 'international',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      // 货架管理
      {
        path: 'shelf',
        component: () => import('@/views/inventory/shelf'),
        name: 'shelfInventory',
        meta: {
          title: '货架管理',
          roles: ['admin', 'editor']
        }
      },
      // 入库记录
      // {
      //   path: '/inbound',
      //   component: () => import('@/views/inventory/inbound'),
      //   name: 'inboundInventory',
      //   hidden: true,
      //   meta: {
      //     title: '入库记录',
      //     roles: ['admin', 'editor']
      //   }
      // },
      // 出库记录
      {
        path: '/outbound',
        component: () => import('@/views/inventory/outbound'),
        name: 'outboundInventory',
        hidden: true,
        meta: {
          title: '出库记录',
          roles: ['admin', 'editor']
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
