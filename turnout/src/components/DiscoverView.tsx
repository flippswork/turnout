import { motion } from "motion/react";
import { 
  Heart, 
  Share2, 
  MessageSquare, 
  PlusCircle, 
  Reply, 
  EyeOff,
  PawPrint,
  PartyPopper,
  Utensils,
  Flower2,
  Calendar,
  ArrowRight,
  ThumbsUp,
  Sparkles,
  MapPin,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { db, handleFirestoreError } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import Markdown from "react-markdown";
import { AnimatePresence } from "motion/react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const Hero = () => (
  <section className="relative w-full min-h-[80vh] py-20 px-8 md:px-20 bg-background bulletin-paper overflow-hidden pt-32">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-5 z-10"
      >
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-primary mb-4 block">Local Community</span>
        <h1 className="text-5xl md:text-7xl mb-6 leading-tight text-on-surface">What's happening in your neighborhood</h1>
        <p className="font-sans text-lg md:text-xl text-secondary mb-8 max-w-lg leading-relaxed">
          Connecting neighbors, sharing local news, and celebrating the heartbeat of our local streets.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-sans font-semibold tracking-wide transition-all active:scale-95">
            Post an Update
          </button>
          <button className="border-2 border-primary text-primary px-8 py-4 rounded-xl font-sans font-semibold tracking-wide transition-all hover:bg-primary/5 active:scale-95">
            Browse Map
          </button>
        </div>
      </motion.div>

      <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4 relative">
        <div className="space-y-4 pt-12">
          <motion.div whileHover={{ rotate: 0 }} initial={{ rotate: -2 }} className="rounded-2xl overflow-hidden shadow-xl transition-transform duration-500">
            <img alt="Local bakery" className="w-full aspect-[3/4] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHRXyqm5de-DwKYoxsPFj_2iOupqM8bLpyKN3OVRZCNOA2RJ_aErvjYjmKdQk9D_LJSPxfITmidsxtuufU2BFf_ag1_EhSUFjxZohdQmM_6hexgHbIEFSzIgsQ9DKUeiqHAZ6mRtfIVzFYFdXoD5AZMEoiJ36GGfrdJfKe3JHWvd2CxDjZ6jU_6G1Gryhp7rJxLAs_DApxp9L_MHYOtsC2G1r5x-ctclkjAUmI--fkhcwNZPOXngdEOhhG_xqp4L5lWXB0gGekxnrV" referrerPolicy="no-referrer" />
          </motion.div>
          <motion.div whileHover={{ rotate: 0 }} initial={{ rotate: 3 }} className="rounded-2xl overflow-hidden shadow-xl transition-transform duration-500">
            <img alt="Community gathering" className="w-full aspect-square object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4hen0kTk5nTgWi73YYJrD9fqQhhzrpFw4uoq8bQj6Sx9HLycvkHucXVQa4DzTaI4qs4tT3cab5dkOksUcLY8tOYJgnUX_YQAPjfEcxosIe1X9j1awoM2hHjZrycvIAzyukur6DEJN9ym9eaxrXVvGz9w9R8jGmoRTQ2rUmJoIrfuJPSjN7QpbbmLF7G2aN_nP0oFmA6OHzd0RPpDz9C5xXL19qPEeb5sfwdyyENv1WVxgqgOK3ViME7LMiorbGphx07ektfUQLu4e" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
        <div className="space-y-4">
          <motion.div whileHover={{ rotate: 0 }} initial={{ rotate: 1 }} className="rounded-2xl overflow-hidden shadow-xl transition-transform duration-500">
            <img alt="Street market" className="w-full aspect-square object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAej2sQXP8kVDLIrz4a17Lbh2Iix5tY4oM5pFcqW3Tv4BC-Kx12TWH_lhxcJWyqn8U1ljv2FY5mpVZlT9koIY9U_KM9uli4w4qTIxhebmhjduYiX-FRg86nNZg6fkpUrmzL-OgARmNNwgBjeSPwQEB5jb6vE7-jssrYFoiZUruRj6bGygDSI5Qxx1ij0Qvc8375bAvy72LJSildf3ilkdu9nhpzj8AtG3qkE9lqlpN4Evk8kjZA2YQsxXnU-XsMjCDFYYNZMgE9zNwJ" referrerPolicy="no-referrer" />
          </motion.div>
          <motion.div whileHover={{ rotate: 0 }} initial={{ rotate: -3 }} className="rounded-2xl overflow-hidden shadow-xl transition-transform duration-500">
            <img alt="Neighbors talking" className="w-full aspect-[4/5] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9yypR3pfzyLJmSf7pRNufqXMwILMB8uQq0jHer6L_9hU5tuUmkwTIN7SXNfGNtscnxXDT3bWk2pDab9f7aAm-FPw0aQ7V8wQqXdxo4AxUFeCK_oT0YkSiq-tOgFvxvuQjSBmcAClEAhecI3mSU0hyiPHG-Ze6SwoOVUWywmqsCw6qcBJ2guGxnNKg8HgcFRFJbpVhYbG-fks7fDGbAphmmBKMBWBPgsOTqhHZ1KyXsdu2neflIenSYiiVDCtNwcv2YjFEV8KmdqAT" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
        <div className="hidden md:block space-y-4 pt-20">
          <motion.div whileHover={{ rotate: 0 }} initial={{ rotate: 5 }} className="rounded-2xl overflow-hidden shadow-xl transition-transform duration-500">
            <img alt="Neighborhood park" className="w-full aspect-[3/4] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0AoqBO42fcYvxVi05Ne6NwsKMNjVSfcK5AOiP4PQZ_CZqyxeRyilV4iazTOfughHGTZXEdZLVdMwXiMv7bkIIp8U5OtsAsJWtdtAPcKlCUxp9-m22z1MzRrkLCkWIm3ddST1ZFwICxUgCR57ycMussLKoLW18xptHaHTY82mU2WokQhwkKqBDtmvNhsab_EuLjmwLfgKkVTgd7fqJ5JhhiHHUjBBKiQ6ZIOzLz6ev4sFpmIPVoXzagHo01aoEHf3yDs2l6rnARYtU" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

const FriendActivity = ({ posts }: { posts: any[] }) => (
  <section className="py-24 px-8 md:px-20 bg-background">
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
      <div>
        <h2 className="text-4xl text-on-surface">From Your Circle</h2>
        <p className="font-sans text-secondary mt-2">Personal updates from your friends and connections.</p>
      </div>
      <button className="text-primary font-semibold border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">
        See More Activity
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <div key={post.id} className="bg-surface-container p-8 rounded-2xl border border-transparent hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10">
              <img alt={post.authorName} className="w-full h-full object-cover" src={post.authorPhoto || "https://picsum.photos/seed/user/100/100"} referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="font-bold text-on-surface">{post.authorName}</h4>
              <p className="text-xs text-secondary font-sans">{post.category || "Shared an update"}</p>
            </div>
          </div>
          <div className="mb-4">
            {post.imageUrl && (
              <img alt="Post" className="w-full h-40 object-cover rounded-xl mb-4" src={post.imageUrl} referrerPolicy="no-referrer" />
            )}
            <p className="text-secondary font-sans">"{post.content}"</p>
          </div>
          <div className="flex items-center justify-between text-secondary pt-4 border-t border-on-surface/5">
            <span className="text-xs">{new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
            <div className="flex gap-4">
              <Heart size={18} className="cursor-pointer hover:text-primary transition-colors" />
              <MessageSquare size={18} className="cursor-pointer hover:text-primary transition-colors" />
              <Share2 size={18} className="cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="col-span-full py-12 text-center text-secondary font-sans">
          No posts yet. Be the first to share something!
        </div>
      )}
    </div>
  </section>
);

const NeighborlyNews = () => {
  const [news, setNews] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "What are some interesting local events, news, or hidden gems in Milton Keynes right now? Provide a concise summary for a community notice board.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: 52.0406,
                  longitude: -0.7594
                }
              }
            }
          },
        });
        setNews(response.text || "No news found.");
        setSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews("Unable to load neighborhood news at this time.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <section className="py-24 px-8 md:px-20 bg-surface-container-low">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl text-on-surface">Neighborly News</h2>
            <Sparkles className="text-primary animate-pulse" size={24} />
          </div>
          <p className="font-sans text-secondary">AI-curated updates and hidden gems from your immediate vicinity.</p>
        </div>
      </div>
      
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-on-surface/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles size={120} />
        </div>
        
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-surface-container rounded w-3/4"></div>
            <div className="h-4 bg-surface-container rounded w-full"></div>
            <div className="h-4 bg-surface-container rounded w-5/6"></div>
          </div>
        ) : (
          <div className="prose prose-stone max-w-none">
            <div className="markdown-body font-sans text-lg text-secondary leading-relaxed">
              <Markdown>{news}</Markdown>
            </div>
            
            {sources.length > 0 && (
              <div className="mt-8 pt-8 border-t border-on-surface/5">
                <p className="text-xs uppercase tracking-widest text-secondary mb-4">Sources & Places</p>
                <div className="flex flex-wrap gap-3">
                  {sources.map((chunk, i) => chunk.maps && (
                    <a 
                      key={i} 
                      href={chunk.maps.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      <MapPin size={14} />
                      {chunk.maps.title || "View on Maps"}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const CommunitySpotlights = () => (
  <section className="py-24 px-8 md:px-20 bg-background">
    <div className="mb-16">
      <h2 className="text-4xl text-on-surface">Community Spotlights</h2>
      <div className="w-24 h-1 bg-primary mt-4"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <div className="md:col-span-7 group cursor-pointer">
        <div className="relative overflow-hidden rounded-xl aspect-[4/5] md:aspect-video mb-6">
          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhFYZ5gKv-VsNSreBnbWDH0soSS5_Cb_QlcD--X3ewemHlFJ7Qxg-FSWxuxZLJ8G8cz1I5YSRQwIjijxse_LUfJfAOhQX96u5Sci-2BmbUHPKoN_oY2fzUDeYefIKdAtbyJzEtU41t1N0YGCrbY3leYcEpgp63ZjctDS9MyC_qbcSEH5BnhjII5EsOY37nQ-gDurlgSNAF5Sfk-XglwvPcxfti25Q9ig4Mz0TuQ2V4Q-iFAr0ctit_bfr1QtJPvlQKgF6qc8usagPI" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <span className="text-white/80 font-sans text-xs uppercase tracking-widest mb-2 block">Dinner Series</span>
            <h3 className="text-3xl text-white">Secret Garden Dinners</h3>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 flex flex-col justify-center h-full space-y-12 md:pl-12">
        <div className="bg-surface-container p-10 rounded-xl">
          <h4 className="text-2xl mb-4 text-primary">The Artisan's Table</h4>
          <p className="font-sans text-secondary leading-relaxed mb-6">
            An intimate gathering of ten guests in a hidden vineyard loft. Six courses paired with heritage vintages.
          </p>
          <a className="text-primary font-semibold flex items-center gap-2 group" href="#">
            Book Private Access 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl shadow-on-surface/5">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApiZ-GrBHhmeI2DXZYBsgWV1aw6-f6BDhpIpruefUE6vj1htWt2sgrIBu9YUDGLfIuvDhN7ziYC_D9nIDKg4Erqcx4djvJZHTe9AuwDekxGJ9YsSJEqB63iiJLQPv3c-Zl8RDzXLlBTNAi3aYEbHNdEkM9NykoxE66_gM0SBGe0SM7wZSK8Jd9IpyyjEwWOeS3Dd8b7V7eu7J10q1FmUaz6tCMt2fG-rOtMYa__1LMq54fp-7BoECWGIoKH546FwIWchjQeJOLFD7D" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  </section>
);

const Newsletter = () => (
  <section className="py-24 px-8 md:px-20">
    <div className="bg-surface-container-highest rounded-xl p-12 md:p-20 text-center max-w-5xl mx-auto">
      <h3 className="text-4xl mb-6">Local News in Your Inbox</h3>
      <p className="font-sans text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
        Stay updated with everything happening on your street. Weekly roundups of local events, news, and neighborly requests.
      </p>
      <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
        <input className="flex-grow bg-white border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 font-sans outline-none" placeholder="Email Address" type="email" />
        <button className="bg-primary text-white px-8 py-4 rounded-xl font-sans font-bold transition-all active:scale-95 shadow-lg shadow-primary/10">
          Subscribe
        </button>
      </form>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-surface-container w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="text-lg font-serif text-on-surface">Turnout</div>
    <div className="font-sans text-xs uppercase tracking-widest text-secondary flex gap-8">
      <a className="hover:text-primary transition-colors" href="#">Terms</a>
      <a className="hover:text-primary transition-colors" href="#">Privacy</a>
      <a className="hover:text-primary transition-colors" href="#">Contact</a>
      <a className="hover:text-primary transition-colors" href="#">Press</a>
    </div>
    <p className="font-sans text-xs uppercase tracking-widest text-secondary">
      © 2024 Turnout. Curated for the modern estate.
    </p>
  </footer>
);

const WeeklyDigest = () => {
  const [digest, setDigest] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Generate a 'Weekly Neighborhood Digest' for Milton Keynes. Include a summary of community spirit, 3 upcoming highlights, and a 'Neighbor of the Week' spotlight. Keep it warm and editorial.",
        });
        setDigest(response.text || "");
      } catch (error) {
        console.error("Digest error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDigest();
  }, []);

  return (
    <section className="py-24 px-8 md:px-20 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-1 bg-primary"></div>
          <h2 className="text-3xl font-serif">Weekly Neighborhood Digest</h2>
        </div>
        
        <div className="bg-surface-container-low p-12 rounded-[2rem] border border-on-surface/5 relative shadow-2xl shadow-on-surface/5">
          <div className="absolute top-8 right-8 text-primary/10">
            <Calendar size={80} />
          </div>
          
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-surface-container rounded w-1/2"></div>
              <div className="h-4 bg-surface-container rounded w-full"></div>
              <div className="h-4 bg-surface-container rounded w-5/6"></div>
              <div className="h-4 bg-surface-container rounded w-full"></div>
            </div>
          ) : (
            <div className="markdown-body font-sans text-secondary leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-primary">
              <Markdown>{digest}</Markdown>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default function DiscoverView() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, "list", "posts");
    });
    return unsubscribe;
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search the neighborhood for: "${searchQuery}". Based on the context of Milton Keynes, provide a helpful and concise answer about local events, places, or community news.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      setSearchResults(response.text || "No results found.");
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults("Sorry, I couldn't find anything for that search.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="overflow-y-auto h-full pb-20">
      <section className="relative w-full min-h-[80vh] py-20 px-8 md:px-20 bg-background bulletin-paper overflow-hidden pt-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 z-10"
          >
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-primary mb-4 block">Local Community</span>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight text-on-surface">What's happening in your neighborhood</h1>
            
            <form onSubmit={handleSearch} className="relative mb-8 group">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything about MK..."
                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-surface-container-highest focus:border-primary outline-none font-sans text-lg shadow-xl shadow-on-surface/5 transition-all"
              />
              <button 
                type="submit"
                disabled={searching}
                className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {searching ? <Loader2 className="animate-spin" size={20} /> : "Search"}
              </button>
            </form>

            <AnimatePresence>
              {searchResults && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-8 overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-primary font-bold mb-2">
                    <Sparkles size={16} />
                    <span>AI Insights</span>
                  </div>
                  <div className="markdown-body text-sm text-secondary leading-relaxed">
                    <Markdown>{searchResults}</Markdown>
                  </div>
                  <button 
                    onClick={() => setSearchResults(null)}
                    className="mt-4 text-xs font-bold text-primary hover:underline"
                  >
                    Clear Results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="font-sans text-lg md:text-xl text-secondary mb-8 max-w-lg leading-relaxed">
              Connecting neighbors, sharing local news, and celebrating the heartbeat of our local streets.
            </p>
          </motion.div>
        </div>
      </section>
      <FriendActivity posts={posts} />
      <NeighborlyNews />
      <WeeklyDigest />
      <CommunitySpotlights />
      <Newsletter />
      <Footer />
    </div>
  );
}
