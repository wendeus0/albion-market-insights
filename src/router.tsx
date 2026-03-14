import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import About from './pages/About'
import NotFound from './pages/NotFound'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFound,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
})

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alerts',
  component: Alerts,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  alertsRoute,
  aboutRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
