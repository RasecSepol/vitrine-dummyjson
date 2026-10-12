import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { MainLayout } from '../layouts/MainLayout'
import { AdminPage } from '../pages/AdminPage'
import { CartPage } from '../pages/CartPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { ProductsPage } from '../pages/ProductsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Área pública */}
        <Route index element={<ProductsPage />} />
        <Route path="produtos/:id" element={<ProductDetailsPage />} />
        <Route path="carrinho" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* Área administrativa protegida */}
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
