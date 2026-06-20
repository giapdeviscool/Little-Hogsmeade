import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { HomePage } from '../pages/HomePage'
import { LandingPage } from '../pages/landing/LandingPage'
import { CustomerLayout } from '../layouts/CustomerLayout'
import {
  CustomerAboutPage,
  CustomerBlogPage,
  CustomerBookingPage,
  CustomerHomePage,
  CustomerMembershipPage,
  CustomerMenuPage,
  CustomerPromotionsPage,
  CustomerStoresPage,
} from '../pages/customer/CustomerPages'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.customerHome} replace />} />
      <Route path={ROUTES.admin} element={<Navigate to={ROUTES.home} replace />} />
      <Route path={ROUTES.cms} element={<Navigate to={ROUTES.home} replace />} />
      <Route path={ROUTES.landing} element={<LandingPage embedded />} />
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.customerHome} element={<CustomerHomePage />} />
        <Route path={ROUTES.customerAbout} element={<CustomerAboutPage />} />
        <Route path={ROUTES.customerMenu} element={<CustomerMenuPage />} />
        <Route path={ROUTES.customerPromotions} element={<CustomerPromotionsPage />} />
        <Route path={ROUTES.customerBooking} element={<CustomerBookingPage />} />
        <Route path={ROUTES.customerBlog} element={<CustomerBlogPage />} />
        <Route path={ROUTES.customerStores} element={<CustomerStoresPage />} />
        <Route path={ROUTES.customerMembership} element={<CustomerMembershipPage />} />
      </Route>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to={ROUTES.customerHome} replace />} />
    </Routes>
  )
}
