import { motion } from "motion/react";
import { PlusCircle, Image as ImageIcon, MapPin, Calendar, Clock, Tag, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { db, handleFirestoreError } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../App";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function PostView() {
  const { user, signIn } = useAuth();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [polishing, setPolishing] = useState(false);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-8 pt-32 pb-24">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusCircle size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl mb-4">Join the Conversation</h2>
          <p className="text-secondary mb-8 font-sans">
            Sign in to share updates, ask questions, and connect with your neighbors.
          </p>
          <button 
            onClick={signIn}
            className="w-full py-4 bg-primary text-white rounded-2xl font-sans font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  const polishContent = async () => {
    if (!content) return;
    setPolishing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: `Rewrite this neighborhood post to be more friendly, clear, and engaging, but keep it concise: "${content}"`,
      });
      setContent(response.text || content);
    } catch (error) {
      console.error("Error polishing content:", error);
    } finally {
      setPolishing(false);
    }
  };

  const handlePublish = async () => {
    if (!content || !user) return;
    setLoading(true);
    try {
      // AI Moderation Check
      const moderationResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: `Analyze this neighborhood post for community safety. Is it toxic, spam, or does it contain private contact info? Answer with "SAFE" or "UNSAFE: [reason]". Post: "${content}"`,
      });
      
      const moderationResult = moderationResponse.text?.trim() || "SAFE";
      if (moderationResult.startsWith("UNSAFE")) {
        alert(`Sorry, your post couldn't be published. ${moderationResult.split(":")[1] || "It may violate community guidelines."}`);
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: user.displayName || "Neighbor",
        authorPhoto: user.photoURL || "",
        content,
        category,
        createdAt: serverTimestamp(),
        likes: 0
      });
      setContent("");
      alert("Post published to the neighborhood!");
    } catch (error) {
      handleFirestoreError(error, "create", "posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-8 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl mb-8">Post an Update</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-on-surface/5">
            <div className="relative">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in your neighborhood?"
                className="w-full h-48 p-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 outline-none resize-none font-sans text-lg"
              />
              <button 
                onClick={polishContent}
                disabled={polishing || !content}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {polishing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{polishing ? "Polishing..." : "Polish with AI"}</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-highest transition-colors border-none outline-none font-sans text-sm"
              >
                <option value="General">General</option>
                <option value="News">News</option>
                <option value="Lost Pet">Lost Pet</option>
                <option value="Event">Event</option>
                <option value="Recommendation">Recommendation</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-highest transition-colors">
                <ImageIcon size={18} />
                <span>Add Photo</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-highest transition-colors">
                <MapPin size={18} />
                <span>Add Location</span>
              </button>
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={loading || !content}
            className="w-full py-4 bg-primary text-white rounded-2xl font-sans font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            <span>{loading ? "Publishing..." : "Publish to Neighborhood"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
