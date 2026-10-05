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
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/login/register'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    meta: { requireAuth: true },
    redirect: '/index', // 添加重定向规则
    children: [{
      path: 'index',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '主页', icon: 'el-icon-data-line', visible: true }
    }]
  },

  {
    path: '/user-management',
    component: Layout,
    children: [{
      path: '/user-management',
      name: 'user-management',
      component: () => import('@/views/user/index'),
      meta: { title: '用户管理', icon: 'el-icon-user', visible: true, roles: ['teacher', 'admin'] }
    }]
  },
  {
    path: '/myself',
    component: Layout,
    children: [{
      path: '/myself',
      name: 'myself',
      hidden: true,
      component: () => import('@/views/user/myself'),
      meta: { title: '个人中心', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }
    }]
  },
  {
    path: '/change-password',
    component: Layout,
    children: [{
      path: '/change-password',
      name: 'change-password',
      hidden: true,
      component: () => import('@/views/user/updatePassword.vue'),
      meta: { title: '修改密码', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }
    }]
  },
  {
    path: '/class-management',
    component: Layout,
    children: [{
      path: '/class-management',
      name: 'class-management',
      component: () => import('@/views/class/index'),
      meta: { title: '班级管理', visible: true, roles: ['teacher', 'admin'], icon: 'el-icon-takeaway-box' }
    }]
  },
  {
    path: '/discussion-management',
    component: Layout,
    children: [{
      path: 'discussion-management',
      name: 'discussion-management',
      component: () => import('@/views/discuss/index.vue'),
      meta: { title: '讨论管理', visible: true, roles: ['teacher', 'student'], icon: 'el-icon-chat-dot-square' },
  }],
  },
  {
    path: '/discussion-detail',
    component: Layout,
    children: [{
      path: 'discussion-detail',
      hidden: true,
      name: 'discussion-detail',
      component: () => import('@/views/discuss/detail.vue'),
      meta: { title: '讨论详情', visible: true, roles:['teacher', 'student'], icon: 'el-icon-takeaway-box' },
  }],
},
{
  path: '/exam-details',
  component: Layout,
  children: [{
    path: 'exam-details',
    hidden: true,
    name: 'exam-details',
    component: () => import('@/views/exam/details.vue'),
    meta: { title: '考试详情', visible: true, roles:['teacher', 'admin'], icon: 'el-icon-takeaway-box' },
}],
},
{
  path: "/discussion-block",
  component: Layout,
  children: [
    {
      path: "/discussion-block",
      name: "discussion-block",
      hidden: true,
      component: () =>
        import("@/views/discuss/block.vue"),
      meta: {
        title: "投屏模式",
        visible: false,
        roles: ["teacher", "admin"],
      },
    },
  ],
},
{
  path: '/prepare-exam',
  component: Layout,
  children: [{
    path: '/prepare-exam',
    name: 'prepare-exam',
    hidden: true,

    component: () => import('@/views/exam/examInformation.vue'),
    meta: { title: '准备考试', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }
  }]
},
  {
    path: '/text-center',
    component: Layout,
    children: [{
      path: '/text-center',
      name: 'text-center',
      component: () => import('@/views/exam/student/index'),
      meta: { title: '试卷中心', visible: true, roles: ['student'], icon: 'el-icon-document-copy' }
    }]
  },
  {
    path: '/start-exam',
    name: 'start-exam',
    hidden: true,
    component: () => import('@/views/exam/index.vue'),
    meta: { title: '开始考试', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }
  },
  {
    path: '/exercise-center',
    component: Layout,
    children: [{
      path: '/exercise-center',
      name: 'exercise-center',
      component: () => import('@/views/exercise/index'),
      // 'admin',
      meta: { title: '刷题中心', visible: true, roles: ['student'], icon: 'el-icon-tickets' }
    }]
  },
  {
    path: '/start-exercise',
    name: 'start-exercise',
    hidden: true,
    component: () => import('@/views/exercise/exercise.vue'),
    meta: { title: '开始刷题', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }

  },

  {
    path: '/record',
    component: Layout,
    name: 'record',
    // 'admin',
    meta: { title: '考试记录', icon: 'el-icon-folder-opened', visible: true, roles: ['student'], requireAuth: true },
    children: [
      {
        path: '/exam-record',
        name: 'exam-record',
        component: () => import('@/views/record/exam/index.vue'),
        // 'admin',
        meta: { title: '考试记录', visible: true, roles: ['student'], icon: 'table' }
      },
      {
        path: '/exercise-record',
        name: 'exercise-record',
        // 'admin',
        component: () => import('@/views/record/exercise/index.vue'),
        meta: { title: '刷题记录', visible: true, roles: ['student'], icon: 'tree' }
      }
    ]
  },
  {
    path: '/exam-record-detail',
    component: Layout,
    children: [{
      path: '/exam-record-detail',
      name: 'exam-record-detail',
      hidden: true,
      component: () => import('@/views/record/exam/newk'),
      meta: { title: '考试记录查看', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }
    }]
  },
  {
    path: '/exercise-record-detail',
    component: Layout,
    children: [{
      path: '/exercise-record-detail',
      name: 'exercise-record-detail',
      hidden: true,
      component: () => import('@/views/record/exercise/newk'),
      meta: { title: '刷题记录查看', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }
    }]
  },
  {
    path: '/wrong-book',
    component: Layout,
    children: [{
      path: '/wrong-book',
      name: 'wrong-book',
      component: () => import('@/views/userbook/index'),
      meta: { title: '错题本', visible: true, roles: ['student'], icon: 'el-icon-notebook-1' }
    }]
  },
  {
    path: '/rebrush',
    name: 'rebrush',
    hidden: true,
    component: () => import('@/views/userbook/rebrush.vue'),
    meta: { title: '重刷', visible: true, roles: ['teacher', 'admin', 'student'], icon: 'dashboard' }

  },
  {
    path: '/exam-management',
    component: Layout,
    children: [{
      path: '/exam-management',
      name: 'exam-management',
      component: () => import('@/views/exam/teacher/index'),
      // , 'admin'
      meta: { title: '考试管理', visible: true, roles: ['teacher', 'admin'], icon: 'el-icon-document' }
    }]
  },
  {
    path: '/exam-add',
    component: Layout,
    children: [{
      path: '/exam-add',
      name: 'exam-add',
      hidden: true,
      component: () => import('@/views/exam/examAdd'),
      meta: { title: '考试添加', visible: true, roles: ['teacher', 'admin'], icon: 'dashboard' }
    }]
  },
  {
    path: '/repo-management',
    component: Layout,
    children: [{
      path: '/repo-management',
      name: 'repo-management',
      component: () => import('@/views/repo/index'),
      meta: { title: '题库管理', visible: true, roles: ['teacher', 'admin'], icon: 'el-icon-folder-opened' }
    }]
  },
  {
    path: '/questions-management',
    component: Layout,
    children: [{
      path: '/questions-management',
      name: 'questions-management',
      component: () => import('@/views/question/index'),
      meta: { title: '试题管理', visible: true, roles: ['teacher', 'admin'], icon: 'el-icon-document-copy' }
    }]
  },
  {
    path: '/questions-add',
    component: Layout,
    children: [{
      path: '/questions-add',
      name: 'questions-add',
      hidden: true,
      component: () => import('@/views/question/add.vue'),
      meta: { title: '试题添加', visible: true, roles: ['teacher', 'admin'], icon: 'dashboard' }
    }]
  },
  {
    path: '/certificate',
    component: Layout,
    children: [{
      path: '/certificate-management',
      name: 'certificate-management',
      component: () => import('@/views/certificate/CertMgr'),
      meta: { title: '证书管理', visible: true, roles: ['admin'], icon: 'el-icon-postcard' }
    }]
  },
  {
    path: '/mycertificate',
    component: Layout,
    children: [{
      path: '/mycertificate',
      name: 'mycertificate',
      component: () => import('@/views/certificate/myCertificates'),
      // 'admin',
      meta: { title: '我的证书', icon: 'el-icon-postcard', visible: true, roles: ['student'] }
    }]
  },

  {
    path: '/score-analysis',
    component: Layout,
    children: [{
      path: 'score-analysis',
      name: 'score-analysis',
      component: () => import('@/views/score/index'),
      // , 'admin'
      meta: { title: '成绩分析', visible: true, roles: ['teacher'], icon: 'el-icon-pie-chart' }
    }]
  },
  {
    path: '/detail',
    component: Layout,
    children: [{
      path: '/user-score',
      name: 'user-score',
      hidden: true,
      component: () => import('@/views/score/detail'),
      meta: { title: '用户成绩', visible: true, roles: ['teacher', 'admin'], icon: 'dashboard' }
    }]
  },
  {
    path: '/answer-manage',
    component: Layout,
    children: [{
      path: 'marking-management',
      name: 'marking-management',
      component: () => import('@/views/answer/index'),
      // , 'admin'
      meta: { title: '阅卷管理', visible: true, roles: ['teacher'], icon: 'el-icon-files' }
    }]
  },
  {
    path: '/answer',
    component: Layout,
    children: [{
      path: '/answer-show',
      name: 'answer-show',
      hidden: true,
      component: () => import('@/views/answer/answerck'),
      meta: { title: '答卷查看', visible: true, roles: ['teacher', 'admin'], icon: 'dashboard' }
    }]
  },
  {
    path: '/makeTest',
    component: Layout,
    children: [{
      path: '/makeTest',
      name: 'makeTest',
      hidden: true,
      component: () => import('@/views/answer/makeTest'),
      meta: { title: '批改试卷', visible: true, roles: ['teacher', 'admin'], icon: 'dashboard' }
    }]
  },

  {
    path: '/notice-management',
    component: Layout,
    children: [{
      path: '/notice-management',
      name: 'notice-management',
      component: () => import('@/views/notice/notice'),
      meta: { title: '公告管理', visible: true, roles: ['teacher', 'admin'], icon: 'el-icon-bell' }
    }]
  },
  {
    path: "/login-log",
    component: Layout,
    children: [
      {
        path: "/login-log",
        name: "login-log",
        component: () => import("@/views/log/index"),
        meta: {
          title: "登录日志",
          visible: false,
          roles: ["teacher", "admin", "student"],
          icon: "el-icon-receiving",
        },
      },
    ],
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
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
