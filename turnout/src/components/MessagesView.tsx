import { motion, AnimatePresence } from "motion/react";
import { Send, User, ArrowLeft, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { db, handleFirestoreError } from "../lib/firebase";
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where, limit } from "firebase/firestore";
import { useAuth } from "../App";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: any;
}

interface ChatPartner {
  uid: string;
  displayName: string;
  photoURL: string;
}

export default function MessagesView() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch unique chat partners
  useEffect(() => {
    if (!user) return;
    
    const q1 = query(collection(db, "messages"), where("senderId", "==", user.uid), orderBy("createdAt", "desc"));
    const q2 = query(collection(db, "messages"), where("receiverId", "==", user.uid), orderBy("createdAt", "desc"));

    const partners = new Map<string, ChatPartner>();

    const unsub1 = onSnapshot(q1, (snap) => {
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (!partners.has(data.receiverId)) {
          // In a real app, we'd fetch user details here. For now, we'll use placeholders
          partners.set(data.receiverId, { uid: data.receiverId, displayName: "Neighbor", photoURL: "" });
        }
      });
      setChats(Array.from(partners.values()));
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (!partners.has(data.senderId)) {
          partners.set(data.senderId, { uid: data.senderId, displayName: "Neighbor", photoURL: "" });
        }
      });
      setChats(Array.from(partners.values()));
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  // Fetch messages for selected partner
  useEffect(() => {
    if (!user || !selectedPartner) return;

    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [user.uid, selectedPartner.uid]),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .filter(m => (m.senderId === user.uid && m.receiverId === selectedPartner.uid) || 
                     (m.senderId === selectedPartner.uid && m.receiverId === user.uid));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return unsubscribe;
  }, [user, selectedPartner]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPartner || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: selectedPartner.uid,
        content: newMessage,
        createdAt: serverTimestamp(),
        read: false
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, "create", "messages");
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-8">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-primary/20 mb-4" />
          <h2 className="text-2xl font-serif mb-2">Private Messages</h2>
          <p className="text-secondary font-sans">Sign in to message your neighbors privately.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background pt-20 pb-20">
      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r border-surface-container flex flex-col ${selectedPartner ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-surface-container">
            <h2 className="text-2xl font-serif">Messages</h2>
          </div>
          <div className="flex-grow overflow-y-auto">
            {chats.map(chat => (
              <button 
                key={chat.uid}
                onClick={() => setSelectedPartner(chat)}
                className="w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-colors border-b border-surface-container/5"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-on-surface">{chat.displayName}</div>
                  <div className="text-xs text-secondary truncate w-40">Click to chat</div>
                </div>
              </button>
            ))}
            {chats.length === 0 && (
              <div className="p-8 text-center text-secondary font-sans text-sm">
                No conversations yet. Message a neighbor from their post!
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-grow flex flex-col bg-surface-container-low ${!selectedPartner ? 'hidden md:flex' : 'flex'}`}>
          {selectedPartner ? (
            <>
              <div className="p-4 bg-white border-b border-surface-container flex items-center gap-4">
                <button onClick={() => setSelectedPartner(null)} className="md:hidden p-2 hover:bg-surface-container rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div className="font-bold">{selectedPartner.displayName}</div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl font-sans text-sm ${
                      msg.senderId === user.uid 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-on-surface rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-surface-container flex gap-4">
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow px-6 py-3 rounded-xl bg-surface-container border-none outline-none font-sans"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-secondary font-sans">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
