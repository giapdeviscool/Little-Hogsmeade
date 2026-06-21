import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { LandingPage } from '../pages/landing/LandingPage'
import { CustomerLayout } from '../layouts/CustomerLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import {
  CustomerAboutPage,
  CustomerBlogPage,
  CustomerBookingPage,
  CustomerMembershipPage,
  CustomerMenuPage,
  CustomerPromotionsPage,
  CustomerStoresPage,
} from '../pages/customer/CustomerPages'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'

import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { POSPage } from '../pages/pos/POSPage'
import { OperationsPage } from '../pages/operations/OperationsPage'
import { InternalPage } from '../pages/internal/InternalPage'
import { OwnerPage } from '../pages/owner/OwnerPage'
import { CMSPage } from '../pages/cms/CMSPage'
import { SettingsPage } from '../pages/settings/SettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.customerHome} replace />} />
      <Route path={ROUTES.landing} element={<LandingPage embedded />} />
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.customerAbout} element={<CustomerAboutPage />} />
        <Route path={ROUTES.customerMenu} element={<CustomerMenuPage />} />
        <Route path={ROUTES.customerPromotions} element={<CustomerPromotionsPage />} />
        <Route path={ROUTES.customerBooking} element={<CustomerBookingPage />} />
        <Route path={ROUTES.customerBlog} element={<CustomerBlogPage />} />
        <Route path={ROUTES.customerStores} element={<CustomerStoresPage />} />
        <Route path={ROUTES.customerMembership} element={<CustomerMembershipPage />} />
      </Route>
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to={ROUTES.adminDashboard} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="internal" element={<InternalPage />} />
        <Route path="owner" element={<OwnerPage />} />
        <Route path="cms" element={<CMSPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/admin/dashboard" replace />} />
      
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to={ROUTES.customerHome} replace />} />
    </Routes>
  )
}
