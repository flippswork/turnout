import { motion } from "motion/react";
import { Users, Plus, ArrowRight, MessageSquare, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { db, handleFirestoreError } from "../lib/firebase";
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, orderBy } from "firebase/firestore";
import { useAuth } from "../App";

interface Circle {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: string[];
  createdBy: string;
}

export default function CirclesView() {
  const { user, signIn } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("🤝");

  useEffect(() => {
    const q = query(collection(db, "circles"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const circlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Circle));
      setCircles(circlesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list", "circles");
    });
    return unsubscribe;
  }, []);

  const handleCreateCircle = async () => {
    if (!user || !newName) return;
    try {
      await addDoc(collection(db, "circles"), {
        name: newName,
        description: newDesc,
        icon: newIcon,
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (error) {
      handleFirestoreError(error, "create", "circles");
    }
  };

  const toggleJoin = async (circle: Circle) => {
    if (!user) {
      signIn();
      return;
    }
    const isMember = circle.members.includes(user.uid);
    const circleRef = doc(db, "circles", circle.id);
    try {
      await updateDoc(circleRef, {
        members: isMember ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      handleFirestoreError(error, "update", `circles/${circle.id}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-8 pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-serif text-on-surface">Neighborhood Circles</h2>
            <p className="text-secondary font-sans mt-2">Join interest groups and connect with like-minded neighbors.</p>
          </div>
          <button 
            onClick={() => user ? setShowCreate(true) : signIn()}
            className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-on-surface/5 mb-12"
          >
            <h3 className="text-2xl mb-6">Create a New Circle</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input 
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-16 h-16 text-2xl text-center rounded-xl bg-surface-container border-none outline-none"
                  placeholder="🤝"
                />
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Circle Name"
                  className="flex-grow px-6 py-4 rounded-xl bg-surface-container border-none outline-none font-sans"
                />
              </div>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this circle about?"
                className="w-full h-32 px-6 py-4 rounded-xl bg-surface-container border-none outline-none font-sans resize-none"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCreate(false)}
                  className="flex-grow py-4 rounded-xl font-sans font-bold text-secondary hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateCircle}
                  className="flex-grow py-4 bg-primary text-white rounded-xl font-sans font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all"
                >
                  Create Circle
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {circles.map(circle => {
            const isMember = user && circle.members.includes(user.uid);
            return (
              <motion.div 
                key={circle.id}
                layout
                className="bg-white p-6 rounded-2xl border border-on-surface/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{circle.icon || "🤝"}</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest">
                    <Users size={14} />
                    <span>{circle.members.length} members</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-on-surface mb-2">{circle.name}</h4>
                <p className="text-secondary font-sans text-sm mb-6 line-clamp-2">{circle.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-on-surface/5">
                  <button 
                    onClick={() => toggleJoin(circle)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                      isMember 
                      ? "bg-surface-container text-secondary" 
                      : "bg-primary text-white shadow-lg shadow-primary/10"
                    }`}
                  >
                    {isMember ? "Joined" : "Join Circle"}
                  </button>
                  <button className="text-primary p-2 hover:bg-primary/5 rounded-full transition-all">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {circles.length === 0 && !loading && (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-surface-container-highest mb-4" />
            <p className="text-secondary font-sans">No circles yet. Why not start one for your interests?</p>
          </div>
        )}
      </div>
    </div>
  );
}
