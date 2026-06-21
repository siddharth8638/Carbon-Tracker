import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./components/Login";
import LogForm from "./components/LogForm";
import Dashboard from "./components/Dashboard";
import "./App.css";

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Carbon Tracker</h1>
        <div className="user-info">
          <span>{user.displayName}</span>
          <button onClick={logout} className="logout-btn">
            Sign out
          </button>
        </div>
      </header>

      <main className="app-main">
        <LogForm uid={user.uid} />
        <Dashboard uid={user.uid} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
