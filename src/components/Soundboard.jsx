// 1. CORRECCIÓN: Añadimos useEffect al import
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// Configura aquí tus audios.
const TRACKS = [
  // --- AMBIENTES (Loop: true) ---
  {
    label: "Abejones",
    file: "/sounds/Abejones.mp3",
    loop: true,
    color: "text-pink-400 border-pink-500/50 hover:bg-pink-900/20",
  },
  {
    label: "Ambiente Mazmorra",
    file: "/sounds/ambienteMazmorra.mp3",
    loop: true,
    color: "text-rose-400 border-rose-500/50 hover:bg-rose-900/20",
  },
  {
    label: "Bajo el agua",
    file: "/sounds/bajoElAgua.mp3",
    loop: true,
    color: "text-lime-400 border-lime-500/50 hover:bg-lime-900/20",
  },
  {
    label: "Bosque",
    file: "/sounds/Bosque.mp3",
    loop: true,
    color: "text-green-400 border-green-500/50 hover:bg-green-900/20",
  },
  {
    label: "Fuego",
    file: "/sounds/Fuego.mp3",
    loop: true,
    color: "text-orange-400 border-orange-500/50 hover:bg-orange-900/20",
  },
  {
    label: "Ventisca",
    file: "/sounds/Ventisca.mp3",
    loop: true,
    color: "text-amber-400 border-amber-500/50 hover:bg-amber-900/20",
  },
  {
    label: "Lluvia",
    file: "/sounds/Lluvia.mp3",
    loop: true,
    color: "text-blue-400 border-blue-500/50 hover:bg-blue-900/20",
  },
  {
    label: "Mar",
    file: "/sounds/Mar.mp3",
    loop: true,
    color: "text-cyan-400 border-cyan-500/50 hover:bg-cyan-900/20",
  },
  {
    label: "Mazmorra",
    file: "/sounds/Mazmorra.mp3",
    loop: true,
    color: "text-purple-500 border-purple-500/50 hover:bg-purple-900/20",
  },
  {
    label: "Mercado",
    file: "/sounds/Mercado.mp3",
    loop: true,
    color: "text-yellow-400 border-yellow-500/50 hover:bg-yellow-900/20",
  },
  {
    label: "Taberna",
    file: "/sounds/Taberna.mp3",
    loop: true,
    color: "text-orange-400 border-orange-500/50 hover:bg-orange-900/20",
  },
  // --- MÚSICA (Loop: true) ---
  {
    label: "Música Aventuras",
    file: "/sounds/musicaAventuras.mp3",
    loop: true,
    color: "text-emerald-400 border-emerald-500/50 hover:bg-emerald-900/20",
  },
  {
    label: "Música Aventuras 2",
    file: "/sounds/musicaAventuras2.mp3",
    loop: true,
    color: "text-emerald-500 border-emerald-600/50 hover:bg-emerald-900/20",
  },
  {
    label: "Música Combate",
    file: "/sounds/musicaCombate.mp3",
    loop: true,
    color: "text-red-500 border-red-600/50 hover:bg-red-900/20",
  },
  // --- EFECTOS (Loop: false) ---
  {
    label: "Aullido",
    file: "/sounds/Aullido.mp3",
    loop: false,
    color: "text-amber-400 border-amber-500/50 hover:bg-amber-900/20",
  },
  {
    label: "Dragón",
    file: "/sounds/Dragon.mp3",
    loop: false,
    color: "text-green-400 border-green-500/50 hover:bg-green-900/20",
  },
  {
    label: "Zombie",
    file: "/sounds/Zombie.mp3",
    loop: false,
    color: "text-lime-600 border-lime-700/50 hover:bg-lime-900/20",
  },
  {
    label: "Caballo",
    file: "/sounds/Caballo.mp3",
    loop: false,
    color: "text-green-400 border-green-500/50 hover:bg-green-900/20",
  },
  {
    label: "Mujer Llorando",
    file: "/sounds/mujerLlorando.mp3",
    loop: false,
    color: "text-gray-400 border-gray-500/50 hover:bg-gray-800/20",
  },
  {
    label: "Risa Chica Malvada",
    file: "/sounds/risaChicaMalvada.mp3",
    loop: false,
    color: "text-fuchsia-500 border-fuchsia-600/50 hover:bg-fuchsia-900/20",
  },
  {
    label: "Risa Maligna",
    file: "/sounds/risaMaligna.mp3",
    loop: false,
    color: "text-red-700 border-red-800/50 hover:bg-red-950/20",
  },
  {
    label: "Risa Poderosa",
    file: "/sounds/risaPoderosa.mp3",
    loop: false,
    color: "text-violet-600 border-violet-700/50 hover:bg-violet-900/20",
  },
  {
    label: "Meow",
    file: "/sounds/Meow.mp3",
    loop: false,
    color: "text-orange-300 border-orange-400/50 hover:bg-orange-800/20",
  },
  {
    label: "Purr",
    file: "/sounds/Purr.mp3",
    loop: false,
    color: "text-rose-300 border-rose-400/50 hover:bg-rose-800/20",
  },
  {
    label: "Combate/Pelea",
    file: "/sounds/Pelea.mp3",
    loop: false,
    color: "text-red-400 border-red-500/50 hover:bg-red-900/20",
  },
  {
    label: "Grandes Alas",
    file: "/sounds/grandesAlas.mp3",
    loop: false,
    color: "text-slate-400 border-slate-500/50 hover:bg-slate-900/20",
  },
  {
    label: "Trueno",
    file: "/sounds/Trueno.mp3",
    loop: false,
    color: "text-blue-300 border-blue-400/50 hover:bg-blue-800/20",
  },
  {
    label: "Latigazo",
    file: "/sounds/Latigaso.mp3",
    loop: false,
    color: "text-stone-300 border-stone-400/50 hover:bg-stone-800/20",
  },
  {
    label: "Whoosh",
    file: "/sounds/Whoosh.mp3",
    loop: false,
    color: "text-sky-300 border-sky-400/50 hover:bg-sky-800/20",
  },
  {
    label: "Thud",
    file: "/sounds/Thud.mp3",
    loop: false,
    color: "text-orange-800 border-orange-900/50 hover:bg-orange-950/20",
  },
  {
    label: "Fuegos Art. 1",
    file: "/sounds/fuegosArtificiales.mp3",
    loop: false,
    color: "text-cyan-400 border-cyan-500/50 hover:bg-cyan-900/20",
  },
  {
    label: "Fuegos Art. 2",
    file: "/sounds/fuegosArtificiales2.mp3",
    loop: false,
    color: "text-cyan-400 border-cyan-500/50 hover:bg-cyan-900/20",
  },
  {
    label: "Violín",
    file: "/sounds/Violin.mp3",
    loop: false,
    color: "text-indigo-400 border-indigo-500/50 hover:bg-indigo-900/20",
  },
  {
    label: "Pop",
    file: "/sounds/Pop.mp3",
    loop: false,
    color: "text-pink-400 border-pink-500/50 hover:bg-pink-900/20",
  },
  {
    label: "Gomito",
    file: "/sounds/Gomito.mp3",
    loop: false,
    color: "text-green-500 border-green-600/50 hover:bg-green-900/20",
  },
  {
    label: "FAAAH",
    file: "/sounds/FAAAH.mp3",
    loop: false,
    color: "text-cyan-500 border-cyan-600/50 hover:bg-cyan-900/20",
  },
  {
    label: "Romance",
    file: "/sounds/Romance.mp3",
    loop: false,
    color: "text-orange-500 border-orange-600/50 hover:bg-orange-900/20",
  },
  {
    label: "Galaxymeme",
    file: "/sounds/Galaxymeme.mp3",
    loop: false,
    color: "text-green-500 border-green-600/50 hover:bg-green-900/20",
  },
  {
    label: "Get Out",
    file: "/sounds/Getout.mp3",
    loop: false,
    color: "text-red-500 border-red-600/50 hover:bg-red-900/20",
  },
  {
    label: "Apple pay",
    file: "/sounds/Applepay.mp3",
    loop: false,
    color: "text-purple-500 border-purple-600/50 hover:bg-purple-900/20",
  },
  {
    label: "Lizard",
    file: "/sounds/Lizard.mp3",
    loop: false,
    color: "text-yellow-500 border-yellow-600/50 hover:bg-yellow-900/20",
  },
  {
    label: "Everest",
    file: "/sounds/Everest.mp3",
    loop: false,
    color: "text-green-500 border-green-600/50 hover:bg-green-900/20",
  },
  {
    label: "Peruano",
    file: "/sounds/Peruano.mp3",
    loop: false,
    color: "text-purple-500 border-purple-600/50 hover:bg-purple-900/20",
  },
  {
    label: "Auron Alarma",
    file: "/sounds/AuronAlarma.mp3",
    loop: false,
    color: "text-red-500 border-red-600/50 hover:bg-red-900/20",
  },
  {
    label: "Broly",
    file: "/sounds/Broly.mp3",
    loop: false,
    color: "text-orange-500 border-orange-600/50 hover:bg-orange-900/20",
  },
  {
    label: "Necesito pito",
    file: "/sounds/Necesitopito.mp3",
    loop: false,
    color: "text-purple-500 border-purple-600/50 hover:bg-purple-900/20",
  },

];

const Soundboard = () => {
  const { user } = useAuth();
  const [activeAmbient, setActiveAmbient] = useState(null);
  const [activeEffect, setActiveEffect] = useState(null);
  const [customTracks, setCustomTracks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSound, setNewSound] = useState({ label: '', url: '', is_loop: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("dm_sound_favs");
    return saved ? JSON.parse(saved) : [];
  });

  // Usamos refs para los audios
  const ambientRef = useRef(new Audio());
  const effectRef = useRef(new Audio());
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    localStorage.setItem("dm_sound_favs", JSON.stringify(favorites));
  }, [favorites]);

  // Cargar sonidos personalizados de Supabase
  useEffect(() => {
    if (user) {
      fetchCustomSounds();
    }
  }, [user]);

  const fetchCustomSounds = async () => {
    const { data, error } = await supabase
      .from('custom_sounds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setCustomTracks(data.map(track => ({
        ...track,
        file: track.url,
        loop: track.is_loop,
        isCustom: true
      })));
    }
  };

  const handleAddSound = async (e) => {
    e.preventDefault();
    if (!newSound.label || !newSound.url || !user) return;
    
    setIsSubmitting(true);
    const { error } = await supabase
      .from('custom_sounds')
      .insert([{
        user_id: user.id,
        label: newSound.label,
        url: newSound.url,
        is_loop: newSound.is_loop,
        color: newSound.is_loop 
          ? "text-cyan-400 border-cyan-500/50 hover:bg-cyan-900/20" 
          : "text-gray-400 border-gray-500/50 hover:bg-gray-800/20"
      }]);
    
    if (!error) {
      setNewSound({ label: '', url: '', is_loop: false });
      setShowAddModal(false);
      fetchCustomSounds();
    }
    setIsSubmitting(false);
  };

  const handleDeleteCustom = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Borrar este sonido?")) return;
    const { error } = await supabase.from('custom_sounds').delete().eq('id', id);
    if (!error) fetchCustomSounds();
  };

  // Sincronizar volumen cuando cambie el slider
  useEffect(() => {
    ambientRef.current.volume = volume;
    effectRef.current.volume = volume;
  }, [volume]);

  const toggleFavorite = (e, label) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label],
    );
  };

  const togglePlay = (track) => {
    if (track.loop) {
      if (activeAmbient === track.label) {
        ambientRef.current.pause();
        setActiveAmbient(null);
      } else {
        ambientRef.current.src = track.file;
        ambientRef.current.load(); // Forzamos carga
        ambientRef.current.loop = true;
        ambientRef.current
          .play()
          .catch((err) => console.error("Error ambiente:", err));
        setActiveAmbient(track.label);
      }
    } else {
      effectRef.current.pause();
      effectRef.current.src = track.file;
      effectRef.current.load(); // Forzamos carga
      effectRef.current
        .play()
        .catch((err) => console.error("Error efecto:", err));
      setActiveEffect(track.label);
      effectRef.current.onended = () => setActiveEffect(null);
    }
  };

  const stopAll = () => {
    ambientRef.current.pause();
    effectRef.current.pause();
    setActiveAmbient(null);
    setActiveEffect(null);
  };

  const allTracks = [...TRACKS, ...customTracks];
  const favTracks = allTracks.filter((t) => favorites.includes(t.label));
  const otherTracks = allTracks.filter((t) => !favorites.includes(t.label));

  const SoundButton = ({ track }) => {
    const isActive = track.loop
      ? activeAmbient === track.label
      : activeEffect === track.label;
    const isFav = favorites.includes(track.label);

    return (
      <button
        onClick={() => togglePlay(track)}
        /* MEJORA: 
           1. Subimos a text-xs (12px)
           2. Usamos font-sans para máxima legibilidad
           3. Añadimos tracking-wider para que las letras no se peguen
           4. Añadimos drop-shadow para que el texto resalte
        */
        className={`py-3 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all border-2 relative bg-gray-900/60 shadow-inner group
          ${track.color} 
          ${isActive ? "ring-2 ring-white/50 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[0.98]" : "hover:scale-[1.02] hover:bg-gray-800/80"}
        `}
      >
        {/* Estrella de favorito mejor posicionada */}
        <span
          onClick={(e) => toggleFavorite(e, track.label)}
          className={`absolute top-1 right-1.5 text-[12px] transition-all ${isFav ? "text-yellow-500 scale-110" : "text-gray-600 opacity-20 group-hover:opacity-100"}`}
        >
          {isFav ? "★" : "☆"}
        </span>

        {track.isCustom && (
          <span 
            onClick={(e) => handleDeleteCustom(e, track.id)}
            className="absolute top-1 left-1.5 text-[10px] text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5"
            title="Borrar sonido"
          >
            🗑️
          </span>
        )}

        {/* ETIQUETA DEL SONIDO: Aquí es donde mejoramos la lectura */}
        <span className="text-[11px] font-black uppercase tracking-wider font-sans drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center leading-tight">
          {track.label}
        </span>

        {/* Indicador de estado más fino */}
        {isActive && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1 h-1 rounded-full bg-current animate-ping"></span>
            <span className="text-[8px] font-bold opacity-80 uppercase tracking-tighter">
              {track.loop ? "Loop" : "FX"}
            </span>
          </div>
        )}
      </button>
    );
  };
  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-pink-400 font-fantasy">
            🎵 Soundboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-900/40 hover:bg-green-600 text-green-500 hover:text-white text-[10px] font-bold px-2 py-1 rounded border border-green-600/50"
              title="Añadir Enlace Arcano"
            >
              ➕
            </button>
            <button
              onClick={stopAll}
              className="bg-red-900/40 hover:bg-red-600 text-red-500 hover:text-white text-[9px] font-bold px-2 py-1 rounded border border-red-600/50 animate-pulse"
            >
              🛑 STOP
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-pink-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 space-y-4">
        {favTracks.length > 0 && (
          <div>
            <h3 className="text-[9px] text-yellow-600 uppercase font-bold mb-2 tracking-widest flex items-center gap-1">
              <span>★</span> Favoritos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {favTracks.map((t) => (
                <SoundButton key={t.label} track={t} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[9px] text-gray-600 uppercase font-bold mb-2 tracking-widest">
            Biblioteca
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {otherTracks.map((t) => (
              <SoundButton key={t.label} track={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Modal para añadir sonidos */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              ✨ Nuevo Enlace Arcano
            </h3>
            <form onSubmit={handleAddSound} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Nombre del Sonido</label>
                <input 
                  required
                  type="text" 
                  value={newSound.label}
                  onChange={e => setNewSound({...newSound, label: e.target.value})}
                  className="w-full bg-black/40 border border-gray-800 rounded p-2 text-sm text-white focus:border-green-600 outline-none"
                  placeholder="Ej: Rugido de Dragón"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">URL (Direct Link MP3)</label>
                <input 
                  required
                  type="url" 
                  value={newSound.url}
                  onChange={e => setNewSound({...newSound, url: e.target.value})}
                  className="w-full bg-black/40 border border-gray-800 rounded p-2 text-sm text-white focus:border-green-600 outline-none"
                  placeholder="https://.../audio.mp3"
                />
              </div>
              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="loop-toggle"
                  checked={newSound.is_loop}
                  onChange={e => setNewSound({...newSound, is_loop: e.target.checked})}
                  className="w-4 h-4 accent-green-600"
                />
                <label htmlFor="loop-toggle" className="text-xs text-gray-400 cursor-pointer">
                  Reproducir en bucle (Ambiental)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-gray-500 hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-grow py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold uppercase rounded shadow-lg transition-transform active:scale-95"
                >
                  {isSubmitting ? 'Guardando...' : 'Añadir al Grimorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Soundboard;
