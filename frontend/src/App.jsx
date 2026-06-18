import { Navigate, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "./pages/dashboard";
import Discoverpage from "./pages/discover";
import MyConnectionsPage from "./pages/my_connections";
import Profile from "./pages/profile";
import ViewProfilePage from "./pages/view_profile/[username]";
import PostDetail from "./pages/postDetail";
import UserDetail from "./pages/userDetail";
import Homes from "./pages/Homes";
import LoginComponent from "./pages/login";

function ProtectedRoute({ children }) {
  const loggedIn = useSelector((state) => state.auth.loggedIn);

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Homes />}
      />

      <Route
        path="/login"
        element={<LoginComponent />}
      />

      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/discover"
        element={(
          <ProtectedRoute>
            <Discoverpage />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/view_profile/:username"
        element={(
          <ProtectedRoute>
            <ViewProfilePage />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/post/:postId"
        element={(
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/user/:userId"
        element={(
          <ProtectedRoute>
            <UserDetail />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/my_connections"
        element={(
          <ProtectedRoute>
            <MyConnectionsPage />
          </ProtectedRoute>
        )}
      />

    </Routes>
  );
}

export default App;
