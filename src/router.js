/* eslint-disable indent */
import Vue from 'vue'
import Router from 'vue-router'
// import './assets/css/global.css'
// import Home from './views/Home.vue'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/goods/Params.vue'
import GoodsList from './components/goods/List.vue'
import Add from './components/goods/Add.vue'


Vue.use(Router)

let router = new Router({
    routes: [
            { path: '/', redirect: '/login' },
            { path: '/login', component: Login },
            {
                path: '/home',
                component: Home,
                children: [{ path: '/users', component: Users },
                    { path: '/rights', component: Rights },
                    { path: '/roles', component: Roles },
                    { path: '/categories', component: Cate },
                    { path: '/params', component: Params },
                    { path: '/goods', component: GoodsList },
                    { path: '/goods/add', component: Add }

                ]
            }

        ]
        // eslint-disable-next-line eol-last
})
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})
export default router