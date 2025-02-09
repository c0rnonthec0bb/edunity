import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StudentsView from '../views/StudentsView.vue'
import StudentView from '../views/StudentView.vue'
import QuizzesView from '../views/QuizzesView.vue'
import QuizView from '../views/QuizView.vue'
import QuizResponseView from '../views/QuizResponseView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, title: 'Home', backRoute: null }
    },
    {
      path: '/students',
      name: 'students',
      component: StudentsView,
      meta: { requiresAuth: true, title: 'Students', backRoute: { name: 'home' } }
    },
    {
      path: '/students/:studentId',
      name: 'student',
      component: StudentView,
      meta: { requiresAuth: true, backRoute: { name: 'students' } }
    },
    {
      path: '/quizzes',
      name: 'quizzes',
      component: QuizzesView,
      meta: { requiresAuth: true, title: 'Quizzes', backRoute: { name: 'home' } }
    },
    {
      path: '/quizzes/:quizId',
      name: 'quiz',
      component: QuizView,
      meta: { requiresAuth: true, backRoute: { name: 'quizzes' } },
      redirect: { name: 'quiz-overview' },
      children: [
        { 
          path: 'overview', 
          name: 'quiz-overview',
          component: QuizView,
        },
        { 
          path: 'questions', 
          name: 'quiz-questions',
          component: QuizView,
        },
        { 
          path: 'responses', 
          name: 'quiz-responses',
          component: QuizView,
        }
      ]
    },
    {
      path: '/quizzes/:quizId/responses/:responseId',
      name: 'quiz-response',
      component: QuizResponseView,
      meta: { 
        requiresAuth: true, 
        backRoute: { name: 'quiz-responses' },
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true, title: 'Settings', backRoute: { name: 'home' } }
    }
  ]
})

// Simple navigation guard just for logging
router.beforeEach((to, from, next) => {
  console.log('Navigation:', { 
    to: to.path, 
    from: from.path,
    matched: to.matched.length > 0
  })
  next()
})

export default router
