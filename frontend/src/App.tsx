import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout';

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------
function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarded } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding/verify" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarded } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isOnboarded) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Lazy imports — ALL pointing to real screens
// ---------------------------------------------------------------------------

// A — Pre-Auth
const Splash = lazy(() => import('@/pages/auth/SplashScreen').then(m => ({ default: m.SplashScreen })));
const Register = lazy(() => import('@/pages/auth/RegisterScreen').then(m => ({ default: m.RegisterScreen })));
const Login = lazy(() => import('@/pages/auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })));

// B — Onboarding
const OnboardingVerify = lazy(() => import('@/pages/onboarding/Step1_Verify'));
const OnboardingModules = lazy(() => import('@/pages/onboarding/Step3_Modules'));
const OnboardingAbout = lazy(() => import('@/pages/onboarding/Step4_About'));
const OnboardingPreferences = lazy(() => import('@/pages/onboarding/Step5_Preferences'));
const OnboardingEvents = lazy(() => import('@/pages/onboarding/Step6_Events'));

// C — Main Tabs
const Home = lazy(() => import('@/pages/app/HomeScreen'));
const Explore = lazy(() => import('@/pages/app/ExploreScreen'));
const EventsList = lazy(() => import('@/pages/app/EventsListScreen'));
const Messages = lazy(() => import('@/pages/app/MessagesScreen'));
const MyProfile = lazy(() => import('@/pages/app/ProfileScreen'));

// D — Event screens
const EventDetail = lazy(() => import('@/pages/events/EventDetailScreen'));
const EventPeople = lazy(() => import('@/pages/events/EventPeopleScreen'));
const EventGroups = lazy(() => import('@/pages/events/EventGroupsScreen'));
const CreateEvent = lazy(() => import('@/pages/events/CreateEventScreen'));
const CreateGroup = lazy(() => import('@/pages/events/CreateGroupScreen'));

// E — Profile & Connections
const UserProfile = lazy(() => import('@/pages/profile/UserProfileScreen'));
const EditProfile = lazy(() => import('@/pages/profile/EditProfileScreen'));
const ConnectionRequests = lazy(() => import('@/pages/profile/ConnectionsScreen'));

// F — Messaging
const Chat = lazy(() => import('@/pages/messaging/ChatScreen'));

// G — 3D Lobby
const EventLobby = lazy(() => import('@/pages/lobby/EventLobbyScreen'));

// H — Utility
const Notifications = lazy(() => import('@/pages/utility/NotificationsScreen'));
const Settings = lazy(() => import('@/pages/utility/SettingsScreen'));

// ---------------------------------------------------------------------------
// App — route tree
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ---- A. Pre-Auth ---- */}
        <Route path="/" element={<Splash />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ---- B. Onboarding ---- */}
        <Route path="/onboarding/verify" element={<OnboardingGuard><OnboardingVerify /></OnboardingGuard>} />
        <Route path="/onboarding/modules" element={<OnboardingGuard><OnboardingModules /></OnboardingGuard>} />
        <Route path="/onboarding/about" element={<OnboardingGuard><OnboardingAbout /></OnboardingGuard>} />
        <Route path="/onboarding/preferences" element={<OnboardingGuard><OnboardingPreferences /></OnboardingGuard>} />
        <Route path="/onboarding/events" element={<OnboardingGuard><OnboardingEvents /></OnboardingGuard>} />

        {/* ---- C-H. Protected app routes ---- */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<MyProfile />} />

          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/people" element={<EventPeople />} />
          <Route path="/events/:id/groups" element={<EventGroups />} />
          <Route path="/events/:id/groups/create" element={<CreateGroup />} />
          <Route path="/events/:id/lobby" element={<EventLobby />} />

          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/connections" element={<ConnectionRequests />} />

          <Route path="/messages/:conversationId" element={<Chat />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
