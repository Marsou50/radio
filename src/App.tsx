import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, AudioLines, BarChart3, CalendarDays,
  Check, ChevronDown, Clock3,
  Headphones, Mail, MapPin, Menu, MessageSquareText, Mic2, Pause,
  Play, Radio, Search, Send, Share2, Sparkles, Volume2, VolumeX, X,
} from 'lucide-react';

type Page = 'accueil' | 'programmes' | 'podcasts' | 'annonceurs';
type Track = { title: string; subtitle: string; image: string; url: string; live?: boolean };

const STREAM_URL = import.meta.env.VITE_RADIO_STREAM_URL || 'https://icecast.radiofrance.fr/fip-midfi.mp3';
const LIVE_TRACK: Track = {
  title: 'Le son de la côte',
  subtitle: 'Soul · Hip-hop · Reggae · Électro',
  image: '/images/studio.jpg',
  url: STREAM_URL,
  live: true,
};

const podcasts = [
  { id: 1, title: 'Grooves du littoral', category: 'Soul & groove', episode: 'Session 24 — Soul brute et voix du large', duration: '28 min', date: '02 nov. 2026', image: '/images/cote.jpg', color: 'sage', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Hip-hop à marée haute', category: 'Hip-hop', episode: 'Session 18 — Beats sans frontières', duration: '42 min', date: '31 oct. 2026', image: '/images/falaises.jpg', color: 'blue', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Reggae côté mer', category: 'Reggae', episode: 'Session 09 — Dub, roots and good vibes', duration: '34 min', date: '29 oct. 2026', image: '/images/micro.jpg', color: 'coral', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, title: 'Le grand large', category: 'Électro', episode: 'Session 41 — La playlist des jours de grand vent', duration: '46 min', date: '26 oct. 2026', image: '/images/studio.jpg', color: 'yellow', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 5, title: 'Pépites du placard', category: 'Soul & groove', episode: 'Session 12 — Des vinyles qui sentent bon le large', duration: '31 min', date: '24 oct. 2026', image: '/images/cote.jpg', color: 'sage', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 6, title: 'Électro littoral', category: 'Électro', episode: 'Session 87 — Nouvelles vagues électroniques', duration: '38 min', date: '22 oct. 2026', image: '/images/falaises.jpg', color: 'blue', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
];

const schedule = [
  { time: '06:00', end: '09:00', title: 'Premiers cafés', host: 'Soul douce et grooves du matin', type: 'SÉLECTION MUSICALE', color: '#ef9a80' },
  { time: '09:00', end: '12:00', title: 'Le son de la côte', host: 'Hip-hop, soul et pépites sans frontières', type: 'EN DIRECT', color: '#dfff75', current: true },
  { time: '12:00', end: '14:00', title: 'Dub lunch', host: 'Reggae, dub et bonnes vibrations', type: 'REGGAE & DUB', color: '#9fc9d0' },
  { time: '14:00', end: '17:00', title: 'Groove continental', host: 'Funk, disco et soul sans modération', type: 'GROOVE', color: '#f1cf6a' },
  { time: '17:00', end: '19:00', title: 'Nouvelles vagues', host: 'Électro organique et découvertes', type: 'ÉLECTRO', color: '#c6b8df' },
  { time: '19:00', end: '02:00', title: 'Groovy time', host: 'La nuit en hip-hop, soul et électro', type: 'LIVE MIX', color: '#ef9a80' },
  { time: '02:00', end: '06:00', title: 'Slow tide', host: 'Ambient et douceurs pour finir la nuit', type: 'AMBIENT', color: '#9fc9d0' },
];

function WaveLogo({ light = false }: { light?: boolean }) {
  return <svg className="wave-logo" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M3 16c7-10 13 10 21 0s14 10 21 0M3 27c7-10 13 10 21 0s14 10 21 0M3 38c7-10 13 10 21 0s14 10 21 0" fill="none" stroke={light ? '#dfff75' : '#12343a'} strokeWidth="3.6" strokeLinecap="round" />
  </svg>;
}

function Waveform({ active = false, light = false }: { active?: boolean; light?: boolean }) {
  return <span className={`waveform ${active ? 'active' : ''} ${light ? 'light' : ''}`} aria-hidden="true">
    {[10, 18, 8, 23, 14, 28, 18, 10, 25, 17, 7, 19, 12, 22, 10, 16].map((h, i) => <i key={i} style={{ height: h, animationDelay: `${i * -0.09}s` }} />)}
  </span>;
}

function App() {
  const initialHash = window.location.hash.replace('#', '') as Page;
  const [page, setPage] = useState<Page>(['accueil', 'programmes', 'podcasts', 'annonceurs'].includes(initialHash) ? initialHash : 'accueil');
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(LIVE_TRACK);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [toast, setToast] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(currentTrack.url);
    audio.preload = 'none';
    audio.volume = volume;
    audioRef.current = audio;
    const onError = () => { setPlaying(false); setAudioError(true); };
    audio.addEventListener('error', onError);
    return () => { audio.pause(); audio.removeEventListener('error', onError); };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const navigate = (next: Page) => {
    setPage(next);
    window.location.hash = next;
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startTrack = async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack.url !== track.url) {
      audio.src = track.url;
      setCurrentTrack(track);
    }
    setAudioError(false);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setAudioError(true);
    }
  };

  const togglePlay = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else startTrack(currentTrack);
  };

  const playLive = () => {
    if (currentTrack.live && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else startTrack(LIVE_TRACK);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'L’Écume des falaises', url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setToast('Lien copié dans le presse-papiers'); }
    } catch { /* partage annulé */ }
  };

  return <div className="app-shell">
    <header className="site-header">
      <button className="brand" onClick={() => navigate('accueil')} aria-label="Retour à l’accueil">
        <WaveLogo />
        <span>L’ÉCUME<br /><strong>DES FALAISES</strong></span>
      </button>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Navigation principale">
        {(['accueil', 'programmes', 'podcasts'] as Page[]).map(item => <button key={item} className={page === item ? 'selected' : ''} onClick={() => navigate(item)}>{item === 'accueil' ? 'Accueil' : item === 'programmes' ? 'Programmes' : 'Podcasts'}</button>)}
        <button className={page === 'annonceurs' ? 'selected' : ''} onClick={() => navigate('annonceurs')}>Annonceurs</button>
      </nav>
      <button className="header-listen" onClick={playLive}><span className={`live-dot ${playing && currentTrack.live ? 'on' : ''}`} />{playing && currentTrack.live ? 'EN DIRECT' : 'ÉCOUTER LE DIRECT'}<Play size={14} fill="currentColor" /></button>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <main key={page} className="page-enter">
      {page === 'accueil' && <HomePage playLive={playLive} playing={playing && !!currentTrack.live} navigate={navigate} startTrack={startTrack} />}
      {page === 'programmes' && <ProgramsPage playLive={playLive} />}
      {page === 'podcasts' && <PodcastsPage startTrack={startTrack} currentTrack={currentTrack} playing={playing} togglePlay={togglePlay} />}
      {page === 'annonceurs' && <AdvertisersPage setToast={setToast} />}
    </main>

    <Footer navigate={navigate} />

    <div className="audio-player">
      <div className="player-track">
        <div className="player-cover"><img src={currentTrack.image} alt="" />{currentTrack.live && <span className="cover-live">LIVE</span>}</div>
        <div><span className="player-eyebrow">{currentTrack.live ? 'EN CE MOMENT SUR L’ÉCUME' : 'PODCAST EN ÉCOUTE'}</span><strong>{currentTrack.title}</strong><small>{currentTrack.subtitle}</small></div>
      </div>
      <div className="player-center">
        <button className="skip-button" aria-label="Revenir au direct" onClick={() => startTrack(LIVE_TRACK)}><Radio size={19} /></button>
        <button className="main-play" onClick={togglePlay} aria-label={playing ? 'Mettre en pause' : 'Écouter'}>{playing ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" />}</button>
        <Waveform active={playing} light />
      </div>
      <div className="player-right">
        {audioError && <span className="audio-error">Flux indisponible</span>}
        <button className="icon-button share-button" onClick={share} aria-label="Partager la radio"><Share2 size={18} /></button>
        <button className="icon-button" onClick={() => setMuted(!muted)} aria-label="Couper le son">{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
        <input className="volume" aria-label="Volume" type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }} />
        <span className="quality">HD</span>
      </div>
    </div>
    {toast && <div className="toast"><Check size={18} />{toast}</div>}
  </div>;
}

function HomePage({ playLive, playing, navigate, startTrack }: { playLive: () => void; playing: boolean; navigate: (p: Page) => void; startTrack: (t: Track) => void }) {
  return <>
    <section className="hero section-wrap">
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot on" /> LA WEBRADIO MUSICALE DE GRANVILLE</div>
        <h1>DU BON<br />SON.<br /><span>BRUT.</span></h1>
        <p>Soul, hip-hop, reggae, électro et petites perles qui vont bien. Des sélections faites par des humains, pour des humains.</p>
        <div className="hero-actions">
          <button className="button button-dark" onClick={playLive}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}{playing ? 'Mettre en pause' : 'Écouter le direct'}</button>
          <button className="text-link" onClick={() => navigate('programmes')}>Voir les programmes <ArrowRight size={18} /></button>
        </div>
        <div className="hero-meta"><span><Radio size={15} /> 100 % MUSIQUE</span><span><Headphones size={15} /> SÉLECTIONS HUMAINES</span><span><MapPin size={15} /> GRANVILLE · NORMANDIE</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-image-wrap">
          <img src="/images/falaises.jpg" alt="Les falaises d’Étretat face à la mer" />
          <div className="image-shade" />
          <span className="on-air"><i /> ON AIR</span>
          <div className="hero-show">
            <div className="show-time"><Clock3 size={15} /> 07:00 — 10:00</div>
            <h2>Le son<br />de la côte</h2>
            <p>Une sélection L’Écume · sans blabla</p>
            <Waveform active={playing} light />
          </div>
        </div>
        <div className="hero-sticker"><span>100%</span><small>BON SON<br />DU LARGE</small><WaveLogo /></div>
        <div className="listeners-pill"><span className="avatar-stack"><i>C</i><i>M</i><i>L</i></span><strong>1 248</strong> auditeurs en ligne</div>
      </div>
      <a href="#programme" className="scroll-hint"><ArrowDown size={16} /> DÉCOUVRIR</a>
    </section>

    <div className="ticker"><div className="ticker-track"><span>SOUL</span><WaveLogo light /><span>HIP-HOP</span><WaveLogo light /><span>REGGAE</span><WaveLogo light /><span>ÉLECTRO</span><WaveLogo light /><span>ET AUTRES PÉPITES QUI VONT BIEN</span></div></div>

    <section className="schedule-section section-wrap" id="programme">
      <div className="section-heading"><div><span className="kicker">AUJOURD’HUI SUR L’ÉCUME</span><h2>Des sélections,<br /><em>pas des algorithmes.</em></h2></div><button className="outline-button" onClick={() => navigate('programmes')}>Toute la grille <ArrowUpRight size={18} /></button></div>
      <div className="day-label"><CalendarDays size={18} /><strong>LA PROGRAMMATION DU LARGE</strong><span>Du bon son, du matin au soir</span></div>
      <div className="schedule-list">
        {schedule.slice(0, 5).map((show, index) => <div className={`schedule-row ${show.current ? 'current' : ''}`} key={show.time}>
          <div className="schedule-time">{show.time}<small>{show.end}</small></div>
          <span className="schedule-color" style={{ background: show.color }} />
          <div className="schedule-title"><small>{show.type}</small><h3>{show.title}</h3></div>
          <p>{show.host}</p>
          {show.current ? <button className="round-play live" onClick={playLive} aria-label="Écouter le direct">{playing ? <Pause size={19} /> : <Play size={19} fill="currentColor" />}</button> : <span className="schedule-index">0{index + 1}</span>}
        </div>)}
      </div>
    </section>

    <section className="track-history">
      <div className="section-wrap">
        <div className="section-heading"><div><span className="kicker">PASSÉ TOUT RÉCEMMENT</span><h2>Les derniers titres.<br /><em>De belles découvertes.</em></h2></div><a className="outline-button history-propose" href="mailto:son@ecumedesfalaises.fr?subject=Je propose un titre">Proposer un titre <ArrowUpRight size={18} /></a></div>
        <div className="history-list">
          {[
            { title: 'Lueur', artist: 'Noka', genre: 'ÉLECTRO ORGANIQUE', time: 'À L’INSTANT', color: '#dfff75' },
            { title: 'Marée haute', artist: 'Vanel', genre: 'SOUL', time: 'IL Y A 4 MIN', color: '#ef9a80' },
            { title: 'Contre-courant', artist: 'Les Marées', genre: 'HIP-HOP', time: 'IL Y A 8 MIN', color: '#9fc9d0' },
            { title: 'Après minuit', artist: 'Mono Club', genre: 'DUB', time: 'IL Y A 12 MIN', color: '#f1cf6a' },
          ].map((track, i) => <div className="history-row" key={track.title}>
            <span className="history-number">0{i + 1}</span>
            <div className="history-cover" style={{ background: track.color }}><AudioLines size={25} /></div>
            <div className="history-track"><h3>{track.title}</h3><p>{track.artist}</p></div>
            <span className="history-genre">{track.genre}</span>
            <span className="history-time">{track.time}</span>
            <button className="round-play" onClick={() => startTrack({ title: track.title, subtitle: `${track.artist} · extrait de démonstration`, image: '/images/micro.jpg', url: podcasts[i].url })} aria-label={`Écouter un extrait de ${track.title}`}><Play size={17} fill="currentColor" /></button>
          </div>)}
        </div>
      </div>
    </section>

    <section className="local-section">
      <div className="section-wrap local-grid">
        <div className="local-image"><img src="/images/cote.jpg" alt="Paysage de la côte normande" /><span className="vertical-caption">48.7600° N — 0.3700° E</span></div>
        <div className="local-copy"><span className="kicker">UNE RADIO, DES OREILLES CURIEUSES</span><h2>Du bon son brut.<br /><em>Rien que ça.</em></h2><p>Nous aimons les disques qui sortent des sentiers battus, les voix qui racontent quelque chose et les basses qui font du bien. Une radio libre, associative et résolument normande.</p><div className="local-stats"><div><strong>24 / 7</strong><span>de musique en continu</span></div><div><strong>100 %</strong><span>de sélections humaines</span></div></div><button className="text-link" onClick={() => navigate('podcasts')}>Découvrir nos sessions <ArrowRight size={18} /></button></div>
      </div>
    </section>

    <section className="podcast-preview section-wrap">
      <div className="section-heading"><div><span className="kicker">SESSIONS & SÉLECTIONS</span><h2>Du groove, <em>dans vos oreilles.</em></h2></div><button className="outline-button" onClick={() => navigate('podcasts')}>Tous les podcasts <ArrowUpRight size={18} /></button></div>
      <div className="podcast-grid">{podcasts.slice(0, 3).map(pod => <PodcastCard key={pod.id} podcast={pod} onPlay={() => startTrack({ title: pod.title, subtitle: pod.episode, image: pod.image, url: pod.url })} />)}</div>
    </section>

    <section className="ad-banner section-wrap">
      <div className="ad-icon"><Mic2 size={40} strokeWidth={1.4} /></div>
      <div><span className="kicker">TU FAIS DU SON ? ON T’ÉCOUTE.</span><h2>Ta musique<br />sur l’Écume.</h2></div>
      <div className="ad-banner-copy"><p>Artistes, groupes, labels ou simples passionnés : envoyez-nous vos pépites. Notre équipe écoute tout, vraiment.</p><a className="button button-dark" href="mailto:son@ecumedesfalaises.fr?subject=Ma musique sur L’Écume">Proposer ma musique <Send size={17} /></a><button className="advertiser-secondary" onClick={() => navigate('annonceurs')}>Vous êtes une marque ? Découvrir nos offres <ArrowUpRight size={14} /></button></div>
      <WaveLogo />
    </section>
  </>;
}

function PodcastCard({ podcast, onPlay }: { podcast: typeof podcasts[number]; onPlay: () => void }) {
  return <article className="podcast-card">
    <div className={`podcast-art ${podcast.color}`}><img src={podcast.image} alt="" /><span className="podcast-category">{podcast.category}</span><button onClick={onPlay} className="podcast-play" aria-label={`Écouter ${podcast.title}`}><Play size={22} fill="currentColor" /></button><AudioLines className="art-lines" size={76} strokeWidth={1} /></div>
    <div className="podcast-info"><span>{podcast.date} · {podcast.duration}</span><h3>{podcast.title}</h3><p>{podcast.episode}</p></div>
  </article>;
}

function ProgramsPage({ playLive }: { playLive: () => void }) {
  const [day, setDay] = useState('Mer. 04');
  const days = ['Lun. 02', 'Mar. 03', 'Mer. 04', 'Jeu. 05', 'Ven. 06', 'Sam. 07', 'Dim. 08'];
  return <>
    <section className="inner-hero section-wrap"><span className="kicker">TOUTE LA SEMAINE, À VOS CÔTÉS</span><h1>Le rendez-vous,<br /><em>c’est quand vous voulez.</em></h1><p>De l’info, de la musique et des rencontres. Retrouvez toutes les voix qui rythment vos journées.</p></section>
    <section className="programs-content section-wrap">
      <div className="day-tabs">{days.map(d => <button key={d} onClick={() => setDay(d)} className={day === d ? 'active' : ''}>{d}</button>)}</div>
      <div className="program-day-title"><div><span className="live-dot on" /><strong>{day === 'Mer. 04' ? 'AUJOURD’HUI' : day.toUpperCase()}</strong></div><span>Heure locale · Europe/Paris</span></div>
      <div className="full-schedule">{schedule.map(show => <div className={`full-schedule-row ${show.current && day === 'Mer. 04' ? 'current' : ''}`} key={show.time}><div className="big-time">{show.time}<span>{show.end}</span></div><div className="show-marker" style={{ background: show.color }}><Mic2 size={23} /></div><div><span className="kicker">{show.type}</span><h2>{show.title}</h2><p>{show.host}</p></div>{show.current && day === 'Mer. 04' ? <button className="button button-dark" onClick={playLive}><Play size={16} fill="currentColor" /> Écouter</button> : <button className="icon-button remind-button" title="Ajouter un rappel"><CalendarDays size={20} /></button>}</div>)}</div>
    </section>
    <section className="simple-cta section-wrap"><div><span className="kicker">UN ÉVÉNEMENT À PARTAGER ?</span><h2>Passez le mot sur l’Écume.</h2></div><a className="button button-light" href="mailto:bonjour@ecumedesfalaises.fr">Nous écrire <Mail size={18} /></a></section>
  </>;
}

function PodcastsPage({ startTrack, currentTrack, playing, togglePlay }: { startTrack: (t: Track) => void; currentTrack: Track; playing: boolean; togglePlay: () => void }) {
  const [category, setCategory] = useState('Tous');
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => podcasts.filter(p => (category === 'Tous' || p.category === category) && `${p.title} ${p.episode}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const playPod = (pod: typeof podcasts[number]) => {
    const isCurrent = currentTrack.url === pod.url;
    if (isCurrent) togglePlay();
    else startTrack({ title: pod.title, subtitle: pod.episode, image: pod.image, url: pod.url });
  };
  return <>
    <section className="inner-hero podcast-hero section-wrap"><div><span className="kicker">DES SÉLECTIONS, PAS DES ALGORITHMES</span><h1>Du bon son<br /><em>à emporter.</em></h1></div><p>Au bord de la mer ou dans votre canapé, emmenez nos sessions soul, hip-hop, reggae et électro avec vous.</p></section>
    <section className="podcast-catalog section-wrap">
      <div className="catalog-tools"><div className="filter-tabs">{['Tous', 'Soul & groove', 'Hip-hop', 'Reggae', 'Électro'].map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="search-box"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un podcast" /></label></div>
      <div className="catalog-count"><strong>{filtered.length} ÉPISODES</strong><span>à réécouter librement</span></div>
      {filtered.length ? <div className="podcast-grid catalog-grid">{filtered.map(pod => <PodcastCard key={pod.id} podcast={pod} onPlay={() => playPod(pod)} />)}</div> : <div className="empty-state"><Headphones size={42} /><h2>Aucun épisode trouvé</h2><p>Essayez un autre mot-clé ou une autre catégorie.</p><button className="text-link" onClick={() => { setSearch(''); setCategory('Tous'); }}>Voir tous les podcasts <ArrowRight size={17} /></button></div>}
    </section>
  </>;
}

function AdvertisersPage({ setToast }: { setToast: (t: string) => void }) {
  const [spots, setSpots] = useState(4);
  const [duration, setDuration] = useState(20);
  const [weeks, setWeeks] = useState(2);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const price = Math.round((spots * weeks * 7 * (duration === 15 ? 18 : duration === 20 ? 22 : 27)) * (weeks >= 4 ? 0.85 : 1));
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const requests = JSON.parse(localStorage.getItem('ecume-campaign-requests') || '[]');
    localStorage.setItem('ecume-campaign-requests', JSON.stringify([...requests, { ...data, estimate: price, createdAt: new Date().toISOString() }]));
    setSubmitted(true);
    setToast('Votre demande a bien été enregistrée');
  };
  return <>
    <section className="advertiser-hero">
      <div className="section-wrap advertiser-hero-grid"><div><span className="kicker light-kicker">L’ÉCUME POUR LES PROFESSIONNELS</span><h1>Votre marque<br />mérite d’être<br /><em>entendue.</em></h1><p>Créez un lien fort avec les habitants de la côte d’Albâtre. Une voix locale, une audience fidèle, votre histoire.</p><a href="#devis" className="button button-lime">Estimer ma campagne <ArrowDown size={18} /></a></div><div className="advertiser-audio-card"><div className="ad-card-top"><span>VOTRE MESSAGE, ICI.</span><AudioLines size={26} /></div><div className="ad-radio-icon"><WaveLogo /></div><Waveform active light /><div className="ad-card-bottom"><span>UN SPOT. DES MILLIERS D’OREILLES.</span><strong>00:20</strong></div></div></div>
    </section>
    <section className="advertiser-stats section-wrap"><div><strong>25 000</strong><span>auditeurs par semaine</span></div><div><strong>78 %</strong><span>d’auditeurs locaux</span></div><div><strong>4,6 M</strong><span>minutes écoutées / mois</span></div><div><strong>6</strong><span>communes en direct</span></div></section>
    <section className="why-section section-wrap"><div className="section-heading"><div><span className="kicker">LA RADIO, UN MÉDIA QUI RESTE</span><h2>Local. Humain.<br /><em>Efficace.</em></h2></div><p>Nous ne diffusons pas simplement votre message.<br />Nous lui donnons une voix que les gens connaissent.</p></div><div className="benefit-grid"><article><Radio /><span>01</span><h3>Une présence locale</h3><p>Parlez directement aux habitants de votre zone de chalandise, au bon moment.</p></article><article><MessageSquareText /><span>02</span><h3>Un message sur mesure</h3><p>Écriture, voix et habillage : notre studio donne vie à vos idées.</p></article><article><BarChart3 /><span>03</span><h3>Des résultats lisibles</h3><p>Planning de diffusion et bilan de campagne transmis en toute transparence.</p></article></div></section>
    <section className="quote-section" id="devis"><div className="section-wrap quote-grid"><div className="quote-intro"><span className="kicker">VOTRE CAMPAGNE EN QUELQUES CLICS</span><h2>Composez.<br /><em>Écoutez la suite.</em></h2><p>Obtenez une première estimation, puis confiez-nous votre projet. Un membre de l’équipe vous répond sous 48 h.</p><div className="quote-note"><Sparkles size={22} /><span><strong>Création du spot offerte</strong><br />pour toute première campagne de 4 semaines.</span></div></div><div className="calculator"><div className="calculator-title"><span>SIMULATEUR DE CAMPAGNE</span><span>01 / 02</span></div><label>Nombre de passages par jour <strong>{spots} spots</strong></label><input type="range" min="1" max="10" value={spots} onChange={e => setSpots(Number(e.target.value))} /><div className="range-labels"><span>1</span><span>10</span></div><div className="calculator-row"><label>Durée du spot<select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value="15">15 secondes</option><option value="20">20 secondes</option><option value="30">30 secondes</option></select></label><label>Durée de diffusion<select value={weeks} onChange={e => setWeeks(Number(e.target.value))}><option value="1">1 semaine</option><option value="2">2 semaines</option><option value="4">4 semaines</option><option value="8">8 semaines</option></select></label></div><div className="estimate"><span>Estimation à partir de<small>Hors taxes · création incluse</small></span><strong>{price.toLocaleString('fr-FR')} €</strong></div><a className="button button-dark full-button" href="#contact-annonceur">Recevoir mon devis personnalisé <ArrowRight size={18} /></a></div></div></section>
    <section className="contact-ad section-wrap" id="contact-annonceur"><div><span className="kicker">PARLONS DE VOTRE PROJET</span><h2>À vous le micro.</h2><p>Quelques mots suffisent pour commencer.</p><div className="contact-person"><span>CL</span><div><strong>Claire Lefebvre</strong><small>Régie publicitaire · 02 35 00 10 23</small></div></div></div>{submitted ? <div className="success-card"><span><Check size={34} /></span><h3>Merci, votre projet est entre de bonnes mains.</h3><p>Claire vous recontactera sous 48 h ouvrées pour construire votre campagne.</p><button className="outline-button" onClick={() => setSubmitted(false)}>Envoyer une autre demande</button></div> : <form className="campaign-form" onSubmit={submit}><div className="form-row"><label>Votre nom *<input required name="name" autoComplete="name" placeholder="Prénom et nom" /></label><label>Votre structure *<input required name="company" autoComplete="organization" placeholder="Nom de l’entreprise" /></label></div><div className="form-row"><label>E-mail professionnel *<input required name="email" autoComplete="email" type="email" placeholder="vous@entreprise.fr" /></label><label>Téléphone<input name="phone" autoComplete="tel" type="tel" placeholder="06 00 00 00 00" /></label></div><label>Parlez-nous de votre projet<textarea required name="project" placeholder="Votre activité, vos objectifs, vos dates…" rows={4} /></label><div className="form-submit"><label className="consent"><input type="checkbox" required /><span>J’accepte d’être recontacté au sujet de ma demande.</span></label><button className="button button-dark" type="submit">Envoyer ma demande <Send size={17} /></button></div></form>}</section>
    <section className="faq-section section-wrap"><div><span className="kicker">QUESTIONS FRÉQUENTES</span><h2>Vous vous<br />demandez peut-être…</h2></div><div className="faq-list">{[
      ['Comment mon spot publicitaire est-il créé ?', 'Après un échange sur vos objectifs, notre équipe rédige le texte, choisit la voix et réalise l’habillage sonore. Vous validez le spot avant chaque diffusion.'],
      ['Puis-je choisir les horaires de diffusion ?', 'Oui. Nous construisons ensemble un planning adapté à votre audience : matinée, midi, soirée ou répartition sur toute la journée.'],
      ['Quel est le budget minimum pour commencer ?', 'Une campagne locale peut démarrer à partir de 250 € HT. Le simulateur ci-dessus vous donne une première estimation personnalisée.'],
    ].map(([q, a], i) => <button key={q} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><div><span>{q}</span><ChevronDown size={20} /></div>{openFaq === i && <p>{a}</p>}</button>)}</div></section>
  </>;
}

function Footer({ navigate }: { navigate: (p: Page) => void }) {
  return <footer className="site-footer"><div className="section-wrap footer-grid"><div className="footer-brand"><div><WaveLogo light /><span>L’ÉCUME<br /><strong>DES FALAISES</strong></span></div><p>Du bon son brut depuis Granville.<br />Pour les normands et les sympathisants.</p><div className="socials"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a><a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">yt</a></div></div><div><span className="footer-label">LA RADIO</span><button onClick={() => navigate('programmes')}>Nos programmes</button><button onClick={() => navigate('podcasts')}>Nos podcasts</button><button onClick={() => navigate('accueil')}>Qui sommes-nous ?</button></div><div><span className="footer-label">NOUS TROUVER</span><p>12 quai des Pilotes<br />76400 Fécamp, France</p><p>102.3 FM<br />et partout en ligne</p></div><div className="newsletter"><span className="footer-label">LES NOUVELLES DU LARGE</span><p>Un e-mail par mois. Des histoires,<br />des découvertes, rien de superflu.</p><form onSubmit={e => { e.preventDefault(); const form = e.currentTarget; form.reset(); alert('Merci ! Vous êtes bien inscrit à notre newsletter.'); }}><input type="email" required placeholder="Votre adresse e-mail" aria-label="Votre adresse e-mail" /><button aria-label="S’inscrire"><ArrowRight size={20} /></button></form></div></div><div className="section-wrap footer-bottom"><span>© 2026 L’Écume des falaises</span><div><a href="mailto:bonjour@ecumedesfalaises.fr">Mentions légales</a><a href="mailto:bonjour@ecumedesfalaises.fr">Confidentialité</a></div><span>FAIT AVEC ♥ FACE À LA MER</span></div></footer>;
}

export default App;
