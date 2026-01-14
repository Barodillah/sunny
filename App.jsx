import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Car, 
  Wrench, 
  Settings, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  Instagram, 
  Facebook, 
  ChevronRight,
  ChevronLeft,
  User
} from 'lucide-react';

// --- Constants & Mock Data ---
const MITSUBISHI_RED = "#E60012";

const PROMOS = [
  { id: 1, title: "Promo Merdeka Xpander", desc: "Bunga 0% hingga 2 tahun & Gratis Asuransi.", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800" },
  { id: 2, title: "Pajero Sport Special Edition", desc: "DP Ringan mulai 15% & Voucher Aksesoris 10jt.", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800" },
  { id: 3, title: "Service Hemat Berkala", desc: "Diskon Jasa 20% khusus booking via Sunny AI.", img: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800" },
];

const SERVICES = [
  { icon: <Car className="w-8 h-8" />, title: "Penjualan", desc: "Konsultasi unit baru Mitsubishi." },
  { icon: <Wrench className="w-8 h-8" />, title: "Service", desc: "Perawatan berkala dengan teknisi ahli." },
  { icon: <Settings className="w-8 h-8" />, title: "Sparepart", desc: "Suku cadang asli Mitsubishi Motors." },
  { icon: <Calendar className="w-8 h-8" />, title: "Test Drive", desc: "Rasakan sensasi berkendara sekarang." },
];

const QUICK_QUESTIONS = [
  "Cek Promo Xpander",
  "Booking Service Besok",
  "Daftar Harga Terbaru",
  "Lokasi Bengkel"
];

// --- Components ---

const Navbar = ({ onContactClick }) => (
  <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter" style={{ color: MITSUBISHI_RED }}>MITSUBISHI</span>
        <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em]">SUN BEKASI</span>
      </div>
    </div>
    <div className="hidden md:flex gap-10 text-sm font-bold text-gray-600">
      <a href="#" className="hover:text-red-600 transition-colors uppercase tracking-widest">Models</a>
      <a href="#" className="hover:text-red-600 transition-colors uppercase tracking-widest">Service</a>
      <a href="#" className="hover:text-red-600 transition-colors uppercase tracking-widest">Promo</a>
    </div>
    <button 
      onClick={onContactClick}
      className="bg-[#E60012] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-200"
    >
      Hubungi Kami
    </button>
  </nav>
);

const Hero = ({ onOpenChat }) => (
  <section className="relative min-h-[90vh] md:h-screen flex items-center overflow-hidden bg-white pt-24 pb-12 md:pt-16">
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent z-10" />
      <img 
        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=100&w=1920" 
        className="w-full h-full object-cover opacity-90 object-center"
        alt="Mitsubishi Xpander"
      />
    </div>
    
    <div className="container mx-auto px-6 md:px-12 z-20">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <span className="inline-block bg-yellow-400 text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-8 shadow-sm">
          Experience the Sun Service
        </span>
        <h1 className="text-5xl md:text-8xl font-black text-gray-950 leading-[1.1] mb-8">
          Drive Your Dream with <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">SUN Bekasi.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed font-medium">
          Dapatkan penawaran eksklusif Mitsubishi dan layanan purna jual terbaik langsung melalui asisten cerdas kami, Sunny.
        </p>
        <div className="flex flex-col sm:flex-row gap-5">
          <button 
            onClick={onOpenChat}
            className="flex items-center justify-center gap-3 bg-gray-950 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all group shadow-2xl shadow-gray-300"
          >
            Tanya Sunny Sekarang
            <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
          <button className="flex items-center justify-center gap-3 border-2 border-gray-200 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-800">
            Lihat Katalog
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

const ServiceCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" }}
    className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50 flex flex-col items-center text-center transition-all"
  >
    <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-8">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Halo! Saya Sunny, asisten AI Mitsubishi SUN Bekasi. Ada yang bisa saya bantu hari ini?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue("");

    // Simulated AI response
    setTimeout(() => {
      let response = "Tentu! Saya bisa membantu terkait hal tersebut. Apakah Anda ingin berbicara dengan konsultan marketing kami untuk detail lebih lanjut?";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("promo")) {
        response = "Saat ini ada Promo Merdeka! DP ringan untuk Xpander mulai 10jt dan Pajero Sport dengan bunga 0%. Mau saya kirimkan brosur lengkapnya?";
      } else if (lowerText.includes("service")) {
        response = "Booking service di SUN Bekasi sangat mudah. Kami ada slot kosong besok jam 09.00 atau 13.00. Anda ingin saya pesankan sekarang?";
      } else if (lowerText.includes("harga")) {
        response = "Daftar harga terbaru OTR Bekasi: Xpander mulai Rp 260jt-an, Pajero Sport mulai Rp 560jt-an. Ada unit spesifik yang Anda minati?";
      } else if (lowerText.includes("lokasi")) {
        response = "Kami berlokasi di Jl. Raya Bekasi KM 21, Medan Satria. Dekat dengan Harapan Indah. Mau saya kirimkan link Google Maps?";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:items-end md:justify-end p-4 md:p-8 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="w-full max-w-lg h-[600px] md:h-[700px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.25)] pointer-events-auto overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-gray-950 p-6 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-black font-black text-xl">
                    S
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest leading-none mb-1">SUNNY AI</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Automated Assistant</span>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-4">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm shadow-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {/* Quick Questions inside Modal */}
              {messages.length < 3 && (
                <div className="pt-4 grid grid-cols-2 gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button 
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="p-3 text-[11px] font-black uppercase tracking-wider text-gray-600 bg-white rounded-xl hover:bg-yellow-400 hover:text-black transition-all text-left border border-gray-200 shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-6 bg-white border-t border-gray-100 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} 
                className="relative group"
              >
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-red-500 transition-all font-bold text-sm outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 w-12 bg-gray-950 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Footer = () => (
  <footer className="bg-gray-950 text-white py-20">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
        <div>
          <div className="flex flex-col leading-none mb-8">
            <span className="text-3xl font-black tracking-tighter" style={{ color: "white" }}>MITSUBISHI</span>
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.4em]">SUN BEKASI</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
            Dealer resmi Mitsubishi Motors di Bekasi dengan standar layanan global dan fasilitas modern 3S (Sales, Service, Spareparts).
          </p>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer border border-white/10">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer border border-white/10">
              <Facebook className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-red-500">Lokasi & Kontak</h4>
          <ul className="space-y-6 text-gray-300 font-medium">
            <li className="flex gap-4 text-sm leading-relaxed">
              <MapPin className="w-6 h-6 text-red-500 shrink-0" />
              Jl. Raya Bekasi KM 21, Medan Satria, Kota Bekasi, Jawa Barat
            </li>
            <li className="flex gap-4 text-sm items-center">
              <Phone className="w-6 h-6 text-red-500 shrink-0" />
              (021) 8884 1234
            </li>
            <li className="flex gap-4 text-sm">
              <Clock className="w-6 h-6 text-red-500 shrink-0" />
              Senin - Jumat: 08.30 - 17.00<br />Sabtu: 08.30 - 15.00
            </li>
          </ul>
        </div>

        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
          <h4 className="text-xl font-black mb-4">Brosur Digital</h4>
          <p className="text-gray-400 text-xs mb-8 font-medium">Kirimkan katalog terbaru langsung ke WhatsApp Anda sekarang.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Nomor WhatsApp" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
            />
            <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-yellow-400/10">
              Dapatkan Brosur
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] gap-6">
        <p>© 2024 Mitsubishi SUN Bekasi. Excellence in Service.</p>
        <div className="flex gap-10">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans text-gray-900 bg-white selection:bg-red-100 selection:text-red-700">
      <Navbar onContactClick={() => setIsModalOpen(true)} />
      
      <main>
        <Hero onOpenChat={() => setIsModalOpen(true)} />
        
        <section className="py-32 container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Our Excellence</span>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Layanan Terpadu Kami</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">Kami memberikan standar layanan bintang 5 untuk menjamin kenyamanan dan performa maksimal kendaraan Mitsubishi Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((s, i) => (
              <ServiceCard key={i} {...s} />
            ))}
          </div>
        </section>

        <section className="bg-gray-50">
          <PromoCarousel />
        </section>
      </main>

      <Footer />

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-[90] w-18 h-18 md:w-20 md:h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(230,0,18,0.5)] border-4 border-white transition-transform"
      >
        <MessageCircle className="w-10 h-10" />
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-full border-2 border-white">1</span>
      </motion.button>

      <ChatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

const PromoCarousel = () => {
  const [active, setActive] = useState(0);
  return (
    <div className="py-32 container mx-auto px-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Limited Offers</span>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">Featured Promo</h2>
          <p className="text-gray-500 font-medium">Penawaran eksklusif bulan ini khusus di Mitsubishi SUN Bekasi.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActive(prev => (prev > 0 ? prev - 1 : PROMOS.length - 1))}
            className="p-5 rounded-2xl bg-white shadow-xl hover:bg-gray-900 hover:text-white transition-all border border-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActive(prev => (prev < PROMOS.length - 1 ? prev + 1 : 0))}
            className="p-5 rounded-2xl bg-white shadow-xl hover:bg-gray-900 hover:text-white transition-all border border-gray-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div 
          className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) gap-8"
          style={{ transform: `translateX(-${active * (window.innerWidth < 768 ? 90 : 40)}%)` }}
        >
          {PROMOS.map((promo) => (
            <div key={promo.id} className="min-w-[90%] md:min-w-[450px] h-[550px] relative rounded-[3rem] overflow-hidden group shadow-2xl shadow-gray-200">
              <img src={promo.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-12 flex flex-col justify-end">
                <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">Limited Slot</span>
                <h4 className="text-3xl font-black text-white mb-3">{promo.title}</h4>
                <p className="text-gray-300 mb-8 font-medium leading-relaxed">{promo.desc}</p>
                <button className="bg-white text-black py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-xs w-fit hover:bg-yellow-400 transition-all shadow-lg">
                  Ambil Promo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
