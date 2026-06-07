import { createBrowserRouter } from "react-router";
import { WelcomePage } from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";
import { CustomerSignupPage } from "./pages/CustomerSignupPage";
import { RiderSignupPage } from "./pages/RiderSignupPage";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { RiderLayout } from "./layouts/RiderLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { CustomerDashboard } from "./pages/customer/Dashboard";
import { PabiliService } from "./pages/customer/PabiliService";
import { PasugoService } from "./pages/customer/PasugoService";
import { PakuhaService } from "./pages/customer/PakuhaService";
import { PahatodService } from "./pages/customer/PahatodService";
import { RideService } from "./pages/customer/RideService";
import { CustomerChat } from "./pages/customer/Chat";
import { ActiveOrders } from "./pages/customer/ActiveOrders";
import { OrderHistory } from "./pages/customer/OrderHistory";
import { OrderDetails } from "./pages/customer/OrderDetails";
import { TrackOrder } from "./pages/customer/TrackOrder";
import { CustomerNotifications } from "./pages/customer/Notifications";
import { CustomerWallet } from "./pages/customer/Wallet";
import { CustomerProfile } from "./pages/customer/Profile";
import { SavedAddresses } from "./pages/customer/SavedAddresses";
import { NotificationsSettings } from "./pages/customer/NotificationsSettings";
import { PrivacySettings } from "./pages/customer/PrivacySettings";
import { ChangePassword } from "./pages/customer/ChangePassword";
import { PaymentMethods } from "./pages/customer/PaymentMethods";
import { EditProfile } from "./pages/EditProfile";
import { CustomerHelp } from "./pages/customer/Help";
import { FavoriteRiders } from "./pages/customer/FavoriteRiders";
import { RateRider } from "./pages/customer/Reviews";
import { RiderReviews } from "./pages/customer/RiderReviews";
import { RiderDashboard } from "./pages/rider/Dashboard";
import { ActiveDelivery } from "./pages/rider/ActiveDelivery";
import { RiderEarnings } from "./pages/rider/Earnings";
import { WorkHistory } from "./pages/rider/WorkHistory";
import { RiderChat } from "./pages/rider/Chat";
import { RiderNotifications } from "./pages/rider/Notifications";
import { RiderProfile } from "./pages/rider/Profile";
import { RiderNotificationsSettings } from "./pages/rider/NotificationsSettings";
import { RiderPrivacySettings } from "./pages/rider/PrivacySettings";
import { RiderHelp } from "./pages/rider/Help";
import { ServiceAreas } from "./pages/rider/ServiceAreas";
import { RiderDocuments } from "./pages/rider/Documents";
import { RiderPerformance } from "./pages/rider/Performance";
import { RiderAvailability } from "./pages/rider/Availability";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RiderApprovalsPage } from "./pages/admin/RiderApprovalsPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { WithdrawalApprovalsPage } from "./pages/admin/WithdrawalApprovalsPage";
import SupportChatsPage from "./pages/admin/SupportChatsPage";
import { SystemSettingsPage } from "./pages/admin/SystemSettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup/customer",
    Component: CustomerSignupPage,
  },
  {
    path: "/signup/rider",
    Component: RiderSignupPage,
  },
  {
    path: "/customer",
    Component: CustomerLayout,
    children: [
      { index: true, Component: CustomerDashboard },
      { path: "pabili", Component: PabiliService },
      { path: "pasugo", Component: PasugoService },
      { path: "pakuha", Component: PakuhaService },
      { path: "pahatod", Component: PahatodService },
      { path: "ride", Component: RideService },
      { path: "chat", Component: CustomerChat },
      { path: "active-orders", Component: ActiveOrders },
      { path: "history", Component: OrderHistory },
      { path: "order-details/:orderId", Component: OrderDetails },
      { path: "track/:orderId", Component: TrackOrder },
      { path: "notifications", Component: CustomerNotifications },
      { path: "wallet", Component: CustomerWallet },
      { path: "payment-methods", Component: PaymentMethods },
      { path: "profile", Component: CustomerProfile },
      { path: "edit-profile", Component: EditProfile },
      { path: "addresses", Component: SavedAddresses },
      { path: "notifications-settings", Component: NotificationsSettings },
      { path: "privacy-settings", Component: PrivacySettings },
      { path: "change-password", Component: ChangePassword },
      { path: "help", Component: CustomerHelp },
      { path: "favorite-riders", Component: FavoriteRiders },
      { path: "rate/:orderId", Component: RateRider },
      { path: "rider-reviews/:riderId", Component: RiderReviews },
    ],
  },
  {
    path: "/rider",
    Component: RiderLayout,
    children: [
      { index: true, Component: RiderDashboard },
      { path: "delivery/:orderId", Component: ActiveDelivery },
      { path: "earnings", Component: RiderEarnings },
      { path: "history", Component: WorkHistory },
      { path: "chat/:customerId", Component: RiderChat },
      { path: "notifications", Component: RiderNotifications },
      { path: "profile", Component: RiderProfile },
      { path: "notifications-settings", Component: RiderNotificationsSettings },
      { path: "privacy-settings", Component: RiderPrivacySettings },
      { path: "help", Component: RiderHelp },
      { path: "edit-profile", Component: EditProfile },
      { path: "areas", Component: ServiceAreas },
      { path: "documents", Component: RiderDocuments },
      { path: "performance", Component: RiderPerformance },
      { path: "availability", Component: RiderAvailability },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "approvals", Component: RiderApprovalsPage },
      { path: "users", Component: UserManagementPage },
      { path: "withdrawals", Component: WithdrawalApprovalsPage },
      { path: "support", Component: SupportChatsPage },
      { path: "settings", Component: SystemSettingsPage },
    ],
  },
]);
