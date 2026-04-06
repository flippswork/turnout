import { motion } from "motion/react";
import { Search, MapPin, PlusCircle, User, Users, MessageSquare } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'post', label: 'Post', icon: PlusCircle },
    { id: 'circles', label: 'Circles', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-background/80 backdrop-blur-xl border-t border-surface-container px-8 h-20 flex justify-around items-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 transition-all relative ${
            activeTab === tab.id ? 'text-primary' : 'text-secondary opacity-60 hover:opacity-100'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute -top-2 w-12 h-1 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <tab.icon size={24} />
          <span className="text-[10px] uppercase font-bold tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
