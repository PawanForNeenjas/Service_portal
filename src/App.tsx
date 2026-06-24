import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductDetail } from "./pages/ProductDetail";
import { ProductSearch } from "./pages/ProductSearch";
import { ServiceTicketCreation } from "./pages/ServiceTicketCreation";
import { SignupPage } from "./pages/SignupPage";
import { TicketDetail } from "./pages/TicketDetail";
import { TicketTracking } from "./pages/TicketTracking";
import { isWarrantyModuleEnabled } from "./utils/releaseFlags";

/* ===========================================================================
   SIMPLE ROUTE LOADER
   =========================================================================== */

const CustomerDashboardPage = lazy(() => import("./pages/customer/CustomerDashboard"));
const CustomerSupportSuccessPage = lazy(() => import("./pages/customer/SupportSuccess"));
const CustomerWarrantyListPage = lazy(() => import("./pages/customer/WarrantyList"));
const CustomerProfilePage = lazy(() => import("./pages/customer/CustomerProfile"));

const PartnerDashboardPage = lazy(() => import("./pages/partner/PartnerDashboard"));
const PartnerRegisterPage = lazy(() => import("./pages/partner/PartnerRegister"));
const PartnerProductsPage = lazy(() => import("./pages/partner/PartnerProducts"));
const PartnerTicketsPage = lazy(() => import("./pages/partner/PartnerTickets"));
const PartnerApprovalsPage = lazy(() => import("./pages/partner/PartnerApprovals"));
const PartnerReturnsPage = lazy(() => import("./pages/partner/PartnerReturns"));
const PartnerStatsPage = lazy(() => import("./pages/partner/PartnerStats"));

const OperationsDashboardPage = lazy(() => import("./pages/ops/OperationsDashboard"));
const OpsQueuePage = lazy(() => import("./pages/ops/OpsQueue"));
const OpsTeamQueuePage = lazy(() => import("./pages/ops/OpsTeamQueue"));
const OpsTicketDetailPage = lazy(() => import("./pages/ops/OpsTicketDetail"));
const OpsApprovalsPage = lazy(() => import("./pages/ops/OpsApprovals"));
const OpsEscalationsPage = lazy(() => import("./pages/ops/OpsEscalations"));
const OpsCustomerLookupPage = lazy(() => import("./pages/ops/OpsCustomerLookup"));
const OpsStatsPage = lazy(() => import("./pages/ops/OpsStats"));

const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminEscalationsPage = lazy(() => import("./pages/admin/AdminEscalations"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverview"));
const AdminDealersPage = lazy(() => import("./pages/admin/AdminDealers"));
const AdminCustomersPage = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAuditPage = lazy(() => import("./pages/admin/AdminAudit"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettings"));

function PageLoader({ Page }: { Page: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading</div>}>
      <Page />
    </Suspense>
  );
}

/* ===========================================================================
   APP COMPONENT
   =========================================================================== */

export default function App() {
  return (
    <Routes>
      {/* Public routes - no authentication required */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* ========================================
            CUSTOMER ZONE ROUTES
            Only CUSTOMER role can access these
            ======================================== */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <PageLoader Page={CustomerDashboardPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <ProductSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "DEALER", "CUSTOMER_SERVICE", "ADMIN"]}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <TicketTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:ticketId"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "DEALER", "CUSTOMER_SERVICE", "ADMIN"]}>
              <TicketDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <ServiceTicketCreation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/success"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <PageLoader Page={CustomerSupportSuccessPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warranties"
          element={
            isWarrantyModuleEnabled ? (
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <PageLoader Page={CustomerWarrantyListPage} />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <PageLoader Page={CustomerProfilePage} />
            </ProtectedRoute>
          }
        />

        {/* ========================================
            PARTNER ZONE ROUTES
            Only DEALER role can access these
            ======================================== */}
        <Route
          path="/partner"
          element={
            <ProtectedRoute allowedRoles={["DEALER"]}>
              <PageLoader Page={PartnerDashboardPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/register"
          element={
            isWarrantyModuleEnabled ? (
              <ProtectedRoute allowedRoles={["DEALER"]}>
                <PageLoader Page={PartnerRegisterPage} />
              </ProtectedRoute>
            ) : (
              <Navigate to="/partner" replace />
            )
          }
        />
        <Route
          path="/partner/products"
          element={
            <ProtectedRoute allowedRoles={["DEALER"]}>
              <PageLoader Page={PartnerProductsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/tickets"
          element={
            <ProtectedRoute allowedRoles={["DEALER"]}>
              <PageLoader Page={PartnerTicketsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/customers"
          element={<Navigate to="/partner" replace />}
        />
        <Route
          path="/partner/approvals"
          element={
            <ProtectedRoute allowedRoles={["DEALER"]}>
              <PageLoader Page={PartnerApprovalsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/returns"
          element={
            <ProtectedRoute allowedRoles={["DEALER"]}>
              <PageLoader Page={PartnerReturnsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/stats"
          element={
            <ProtectedRoute allowedRoles={["DEALER"]}>
              <PageLoader Page={PartnerStatsPage} />
            </ProtectedRoute>
          }
        />

        {/* ========================================
            OPERATIONS ZONE ROUTES
            Only CUSTOMER_SERVICE role can access these
            ======================================== */}
        <Route
          path="/ops"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OperationsDashboardPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/queue"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsQueuePage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/team"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsTeamQueuePage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/tickets/:id"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsTicketDetailPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/tickets"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsQueuePage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/approvals"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsApprovalsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/escalations"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsEscalationsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/customers"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsCustomerLookupPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops/stats"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER_SERVICE"]}>
              <PageLoader Page={OpsStatsPage} />
            </ProtectedRoute>
          }
        />

        {/* ========================================
            ADMIN ZONE ROUTES
            Only ADMIN role can access these
            ======================================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminDashboardPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/escalations"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminEscalationsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/overview"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminOverviewPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dealers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminDealersPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminCustomersPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminUsersPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminAuditPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PageLoader Page={AdminSettingsPage} />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ========================================
          CATCH-ALL REDIRECT
          ======================================== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
