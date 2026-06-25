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
  CustomerEventsPage,
  CustomerPromotionsPage,
} from '../pages/customer/CustomerPages'
import { StoresPage } from '../pages/stores/StoresPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { CashierLoginPage } from '../pages/auth/CashierLoginPage'

import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { POSPage } from '../pages/pos/POSPage'
import { OperationsPage } from '../pages/operations/OperationsPage'
import { TableLayoutPage } from '../pages/operations/TableLayoutPage'
import { DeliveryManagementTab } from '../pages/operations/DeliveryManagementTab'
import { InternalPage } from '../pages/internal/InternalPage'
import { OwnerPage } from '../pages/owner/OwnerPage'
import { CMSPage } from '../pages/cms/CMSPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { CustomerListPage } from '../pages/loyalty/CustomerListPage'
import { PosPage } from '@/pages/pos/index'
import { InvoicePage } from '@/pages/invoices/index'
import { ShiftOpeningPage } from '../pages/pos/ShiftOpeningPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.customerHome} replace />} />
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.landing} element={<LandingPage embedded />} />
        <Route path={ROUTES.customerAbout} element={<CustomerAboutPage />} />
        <Route path={ROUTES.customerMenu} element={<CustomerMenuPage />} />
        <Route path={ROUTES.customerEvents} element={<CustomerEventsPage />} />
        <Route path={ROUTES.customerPromotions} element={<CustomerPromotionsPage />} />
        <Route path={ROUTES.customerBooking} element={<CustomerBookingPage />} />
        <Route path={ROUTES.customerBlog} element={<CustomerBlogPage />} />
        <Route path={ROUTES.customerStores} element={<StoresPage />} />
        <Route path={ROUTES.customerMembership} element={<CustomerMembershipPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to={ROUTES.adminDashboard} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="operations" element={<OperationsPage />}>
          <Route index element={<Navigate to="tables" replace />} />
          <Route path="tables" element={<TableLayoutPage />} />
          <Route path="delivery" element={<DeliveryManagementTab />} />
        </Route>
        <Route path="table-layout" element={<TableLayoutPage />} />
        <Route path="internal" element={<InternalPage />} />
        <Route path="owner" element={<OwnerPage />} />
        <Route path="cms" element={<CMSPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="loyalty/*" element={<Navigate to={ROUTES.adminCustomers} replace />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.cashierLogin} element={<CashierLoginPage />} />
      
      <Route path={ROUTES.shiftOpening} element={<ShiftOpeningPage />} />
      <Route path={ROUTES.pos} element={<PosPage />} />
      <Route path={ROUTES.invoices} element={<InvoicePage />} />
      
      <Route path="*" element={<Navigate to={ROUTES.customerHome} replace />} />
    </Routes>
  )
}
