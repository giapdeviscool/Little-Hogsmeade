import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { PosPage } from '../pages/pos/index'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.home} replace />} />
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.pos} element={<PosPage />} />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
