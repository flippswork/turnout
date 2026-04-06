import { motion } from "motion/react";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Heart,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../App";

export default function ProfileView() {
  const { user, signOut, signIn } = useAuth();

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-8 pt-32 pb-24">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl mb-4">Your Neighborhood Profile</h2>
          <p className="text-secondary mb-8 font-sans">
            Sign in to see your activity, manage your settings, and keep track of your neighborhood connections.
          </p>
          <button 
            onClick={signIn}
            className="w-full py-4 bg-primary text-white rounded-2xl font-sans font-bold text-lg shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-8 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-8 mb-12">
          <div className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden border-4 border-white shadow-xl">
            <img 
              src={user.photoURL || "https://picsum.photos/seed/user/200/200"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-4xl mb-2">{user.displayName || "Neighbor"}</h2>
            <p className="text-secondary font-sans">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Saved', icon: Heart, count: 0 },
            { label: 'Events', icon: Calendar, count: 0 },
            { label: 'Posts', icon: 0 },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-on-surface/5 text-center">
              {typeof stat.icon !== 'number' && <stat.icon className="mx-auto mb-2 text-primary" size={24} />}
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs text-secondary uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl mb-4">Settings</h3>
          {[
            { label: 'Account Settings', icon: User },
            { label: 'Notifications', icon: Bell },
            { label: 'Privacy & Security', icon: Shield },
            { label: 'Help Center', icon: HelpCircle },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-on-surface/5 hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-on-surface">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-secondary" />
            </button>
          ))}
          
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-between p-6 bg-red-50 rounded-2xl shadow-sm border border-red-100 hover:bg-red-100 transition-colors group mt-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center text-red-600">
                <LogOut size={20} />
              </div>
              <span className="font-bold text-red-600">Log Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
