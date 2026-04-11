import React from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useTheme } from './context/ThemeContext.jsx'
import { FavoritesProvider } from './hooks/useFavorites'
import Home from './components/Home'
import Catalog from './components/Catalog'
import AdminDashboard from './components/AdminDashboard'
import Login from './components/Login'
import Register from './components/Register'
import AboutUs from './components/AboutUs'
import ProductDetail from './components/ProductDetail'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Favorites from './pages/Favorites'

function AppRoutes() {
  const { theme } = useTheme()
  const { pathname } = useLocation()
  const showNav = pathname !== '/login' && pathname !== '/register'

  return (
    <>
      <ScrollToTop />
      <Toaster richColors position="top-right" theme={theme} />
      {showNav ? <NavBar /> : null}
      <main className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/nosotros" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <AppRoutes />
      </FavoritesProvider>
    </BrowserRouter>
  )
}

export default App
