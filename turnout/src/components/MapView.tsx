import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { collection, onSnapshot, query, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Sparkles, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Event {
  id: string;
  name: string;
  lat: number;
  lng: number;
  icon: string;
  category?: string;
  attendees?: string[];
}

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const CATEGORIES = ["All", "Social", "Help", "Lost & Found", "Garage Sale", "Other"];

export default function MapView() {
  const { user } = useAuth();
  const [radius, setRadius] = useState(2000); // meters
  const [center, setCenter] = useState<[number, number]>([52.0406, -0.7594]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list", "events");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.category === selectedCategory));
    }
  }, [events, selectedCategory]);

  const handleRSVP = async (eventId: string, isAttending: boolean) => {
    if (!user) return;
    const eventRef = doc(db, "events", eventId);
    try {
      await updateDoc(eventRef, {
        attendees: isAttending ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      handleFirestoreError(error, "update", `events/${eventId}`);
    }
  };

  const customIcon = (icon: string) => L.divIcon({
    html: `<div class="custom-marker text-xl">${icon || "📍"}</div>`,
    className: 'bg-transparent',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <div className="h-full w-full relative flex flex-col">
      {/* Controls Overlay */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md flex flex-col gap-3">
        {/* Category Filter */}
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-primary/10 overflow-x-auto flex gap-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-surface-container text-secondary hover:bg-surface-container-highest"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Radius Slider */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-primary/10">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-primary">Search Radius</span>
                {loading && <div className="w-2 h-2 bg-primary rounded-full animate-ping" />}
              </div>
              <span className="font-sans font-bold text-secondary">{(radius / 1000).toFixed(1)} km</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="10000" 
              step="500"
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          <Circle 
            center={center} 
            radius={radius} 
            pathOptions={{ color: '#99420d', fillColor: '#99420d', fillOpacity: 0.1 }} 
          />

          {/* Activity Heatmap (Simulated) */}
          {events.length > 0 && (
            <>
              <Circle 
                center={[52.0406, -0.7594]} 
                radius={800} 
                pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.15 }} 
              />
              <Circle 
                center={[52.0450, -0.7650]} 
                radius={600} 
                pathOptions={{ color: 'transparent', fillColor: '#f59e0b', fillOpacity: 0.1 }} 
              />
            </>
          )}

          {filteredEvents.map(event => {
            const isAttending = user && event.attendees?.includes(user.uid);
            const attendeeCount = event.attendees?.length || 0;

            return (
              <Marker 
                key={event.id} 
                position={[event.lat, event.lng]} 
                icon={customIcon(event.icon)}
              >
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <div className="font-serif font-bold text-primary text-lg mb-1">{event.name}</div>
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-1 text-[10px] text-secondary uppercase tracking-wider font-bold">
                        <MapPin size={10} />
                        <span>{event.category || "General"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        <Users size={12} />
                        <span>{attendeeCount} neighbor{attendeeCount !== 1 ? 's' : ''} attending</span>
                      </div>
                    </div>
                    
                    {user ? (
                      <button 
                        onClick={() => handleRSVP(event.id, !!isAttending)}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isAttending 
                          ? "bg-green-50 text-green-600 border border-green-200" 
                          : "bg-primary text-white shadow-md shadow-primary/10 hover:opacity-90"
                        }`}
                      >
                        {isAttending ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Going</span>
                          </>
                        ) : (
                          <span>I'm Interested</span>
                        )}
                      </button>
                    ) : (
                      <div className="text-[10px] text-center text-secondary italic">Sign in to RSVP</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {filteredEvents.length === 0 && !loading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <Sparkles className="shrink-0" />
            <p className="text-sm font-sans">No {selectedCategory !== "All" ? selectedCategory.toLowerCase() : ""} events found in this radius. Try expanding your search!</p>
          </div>
        </div>
      )}
    </div>
  );
}
