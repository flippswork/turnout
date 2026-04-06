import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signInWithGoogle, logOut } from "./lib/firebase";
import DiscoverView from "./components/DiscoverView";
import MapView from "./components/MapView";
import PostView from "./components/PostView";
import ProfileView from "./components/ProfileView";
import CirclesView from "./components/CirclesView";
import MessagesView from "./components/MessagesView";
import Navigation from "./components/Navigation";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, LogIn } from "lucide-react";

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const signOut = async () => {
    await logOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Error Boundary ---
import React from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `Firestore Error: ${parsed.error}`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h1 className="text-3xl font-serif mb-4">Neighborhood Alert</h1>
          <p className="text-secondary mb-8 max-w-md">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            Refresh Community
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App ---
function AppContent() {
  const { user, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [isGuest, setIsGuest] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-4xl font-serif text-primary"
        >
          Turnout
        </motion.div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background bulletin-paper p-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h1 className="text-6xl font-serif mb-6 text-on-surface">Turnout</h1>
          <p className="text-xl text-secondary mb-12 leading-relaxed">
            Your neighborhood's digital heartbeat. Connect, discover, and share with those closest to you.
          </p>
          <div className="space-y-4">
            <button 
              onClick={signIn}
              className="w-full flex items-center justify-center gap-4 bg-white border-2 border-surface-container-highest px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-on-surface/5 hover:bg-surface-container-low transition-all active:scale-95"
            >
              <LogIn size={24} className="text-primary" />
              <span>Join with Google</span>
            </button>
            <button 
              onClick={() => setIsGuest(true)}
              className="w-full py-4 text-secondary font-sans font-semibold hover:text-primary transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return <DiscoverView />;
      case "map":
        return <MapView />;
      case "post":
        return <PostView />;
      case "circles":
        return <CirclesView />;
      case "messages":
        return <MessagesView />;
      case "profile":
        return <ProfileView />;
      default:
        return <DiscoverView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-background/80 backdrop-blur-xl border-b border-surface-container transition-colors">
        <div className="text-2xl font-bold font-serif text-on-surface">Turnout</div>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img src={user.photoURL || ""} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="bg-primary text-white px-6 py-2 rounded-xl font-serif text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/10"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
