import { useEffect, useRef, useState } from "react";
import ApiKeyDialog from "./ApiKeyDialog.jsx";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Cpu,
  Earth,
  FlaskConical,
  HeartPulse,
  Menu,
  Newspaper,
  Palette,
  Radio,
  Search,
  Settings,
  Sparkles,
  Trophy,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";

const channels = [
  {
    id: "general",
    label: "Para ti",
    icon: Newspaper,
    subtitle: "Una mirada a lo que mueve el mundo.",
  },
  {
    id: "world",
    label: "Mundo",
    icon: Earth,
    subtitle: "Otras latitudes. Nuevas perspectivas.",
  },
  {
    id: "technology",
    label: "Tecnología",
    icon: Cpu,
    subtitle: "Las ideas que construyen el mañana.",
  },
  {
    id: "business",
    label: "Negocios",
    icon: TrendingUp,
    subtitle: "Entiende un mundo en movimiento.",
  },
  {
    id: "science",
    label: "Ciencia",
    icon: FlaskConical,
    subtitle: "La curiosidad es solo el comienzo.",
  },
  {
    id: "sports",
    label: "Deportes",
    icon: Trophy,
    subtitle: "Cada historia tiene su propio ritmo.",
  },
  {
    id: "entertainment",
    label: "Cultura",
    icon: Sparkles,
    subtitle: "Historias que nos hacen sentir.",
  },
  {
    id: "health",
    label: "Bienestar",
    icon: HeartPulse,
    subtitle: "Una pausa para lo que más importa.",
  },
];
const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* La navegación funciona sin almacenamiento. */
  }
};
const articleDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      })
    : "Lectura de ejemplo";
const validLink = (value) => {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <svg
        className="wave wave-one"
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient">
            <stop stopColor="#8adfba" stopOpacity="0" />
            <stop offset=".55" stopColor="#b9ffe3" stopOpacity=".55" />
            <stop offset="1" stopColor="#83e0c2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M-100 ${440 + i * 8} C300 ${140 + i * 8} 510 ${650 + i * 10} 930 ${320 + i * 5} S1320 ${170 + i * 9} 1540 ${390 + i * 8}`}
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth={i === 0 ? 1.5 : 0.6}
          />
        ))}
      </svg>
      <div className="grain" />
    </div>
  );
}

function Modal({ type, onClose, theme, setTheme, onConfigure }) {
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  return (
    <dialog
      className="modal"
      aria-labelledby="modal-title"
      ref={dialog}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="modal-top">
        <span className="eyebrow">A TU RITMO</span>
        <button
          className="icon-button"
          aria-label="Cerrar ventana"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {type === "theme" ? (
        <>
          <h2 id="modal-title">Encuentra tu sintonía.</h2>
          <p>Elige el ambiente que te acompañará mientras exploras.</p>
          <div className="theme-list">
            {[
              ["ocean", "Océano", "La calma de lo profundo"],
              ["sunset", "Atardecer", "Una luz más cálida"],
              ["forest", "Bosque", "Un respiro entre noticias"],
            ].map(([id, name, description]) => (
              <button
                key={id}
                className={`theme-option ${theme === id ? "chosen" : ""}`}
                aria-pressed={theme === id}
                onClick={() => setTheme(id)}
              >
                <span className={`theme-dot ${id}`} />
                <span>
                  <strong>{name}</strong>
                  <small>{description}</small>
                </span>
                {theme === id && <Check size={18} />}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 id="modal-title">
            {type === "demo"
              ? "Primero, explora la experiencia."
              : "Menos ruido. Más perspectiva."}
          </h2>
          <p>
            ONDA es un explorador de noticias inspirado en la navegación del
            XMB: categorías en horizontal, titulares en vertical.
          </p>
          <p>
            Usa las flechas fuera de los campos y botones para navegar. También
            puedes seleccionar todo con el ratón o con Tab. Guarda tus lecturas
            con el marcador.
          </p>
          <div className="setup-note">
            <Radio size={20} />
            <div>
              <strong>Conecta las noticias reales</strong>
              <p>
                Abre el engranaje de configuración e introduce tu API Key
                personal de GNews. Se usará solo mientras esta página esté
                abierta. Sin una clave, puedes explorar los artículos de
                ejemplo.
              </p>
            </div>
          </div>
          <button
            className="primary-button help-configure"
            onClick={onConfigure}
          >
            Usar mi API Key <Settings size={16} />
          </button>
          <a
            className="text-link"
            href="https://gnews.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir a GNews <ArrowUpRight size={16} />
          </a>
        </>
      )}
    </dialog>
  );
}

export default function App() {
  const [category, setCategory] = useState("general");
  const [view, setView] = useState("explore");
  const [country, setCountry] = useState("all");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null);
  const [refresh, setRefresh] = useState(0);
  // La clave personal vive solo en este estado: no se persiste ni se añade a URLs.
  const [personalApiKey, setPersonalApiKey] = useState("");
  const [saved, setSaved] = useState(() => {
    const stored = readStorage("onda.saved", []);
    return Array.isArray(stored)
      ? stored
          .filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.title === "string",
          )
          .slice(0, 100)
      : [];
  });
  const [theme, setTheme] = useState(() => {
    const stored = readStorage("onda.theme", "ocean");
    return ["ocean", "sunset", "forest"].includes(stored) ? stored : "ocean";
  });
  const [modal, setModal] = useState(null);
  const [now, setNow] = useState(new Date());
  const search = useRef(null);
  const activeTab = useRef(null);
  const activeStory = useRef(null);
  const channel = channels.find((item) => item.id === category);
  const filteredSaved = saved.filter((item) =>
    `${item.title} ${item.description}`
      .toLocaleLowerCase("es")
      .includes(query.toLocaleLowerCase("es")),
  );
  const visible = view === "saved" ? filteredSaved : articles;
  const current = visible[selected];
  const isDemo = current ? current.demo : mode === "demo";
  const isSaved = current && saved.some((item) => item.id === current.id);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStorage("onda.theme", theme);
  }, [theme]);
  useEffect(() => {
    writeStorage("onda.saved", saved);
  }, [saved]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    activeTab.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
    if (document.activeElement?.getAttribute("role") === "tab")
      activeTab.current?.focus({ preventScroll: true });
  }, [category]);
  useEffect(() => {
    activeStory.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selected]);

  useEffect(() => {
    if (view !== "explore") return;
    const controller = new AbortController();
    setStatus("loading");
    setError("");
    setMode(null);
    setArticles([]);
    setSelected(0);
    async function loadNews() {
      try {
        const params = new URLSearchParams({
          category,
          country,
          q: query,
          lang: "es",
        });
        const response = await fetch(`/api/news?${params}`, {
          signal: controller.signal,
          headers: personalApiKey ? { "X-News-Api-Key": personalApiKey } : {},
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "No pudimos cargar las noticias.");
        if (!Array.isArray(data.articles))
          throw new Error("La respuesta de noticias no es válida.");
        setArticles(
          data.articles.map((article) => ({
            ...article,
            demo: data.mode === "demo",
            category,
          })),
        );
        setMode(data.mode);
        setStatus("ready");
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof TypeError || failure instanceof SyntaxError
              ? "No pudimos comunicarnos con el servidor. Comprueba que Express esté en ejecución y vuelve a intentarlo."
              : failure.message,
          );
          setStatus("error");
        }
      }
    }
    loadNews();
    return () => controller.abort();
  }, [category, country, query, refresh, view, personalApiKey]);

  function usePersonalKey(key) {
    setPersonalApiKey(key);
    setView("explore");
    setSelected(0);
    setRefresh((value) => value + 1);
    setModal(null);
  }

  function selectCategory(id) {
    setCategory(id);
    setSelected(0);
    setView("explore");
  }
  function readArticle() {
    if (!current) return;
    if (current.demo) setModal("demo");
    else if (validLink(current.url))
      window.open(current.url, "_blank", "noopener,noreferrer");
  }
  useEffect(() => {
    function onKey(event) {
      if (
        modal ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.target.closest(
          'input, select, textarea, [contenteditable="true"]',
        )
      )
        return;
      if (event.key === "Enter" && event.target.closest("button, a")) return;
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Enter",
          "/",
        ].includes(event.key)
      )
        event.preventDefault();
      const index = channels.findIndex((item) => item.id === category);
      if (event.key === "ArrowRight")
        selectCategory(channels[(index + 1) % channels.length].id);
      if (event.key === "ArrowLeft")
        selectCategory(
          channels[(index - 1 + channels.length) % channels.length].id,
        );
      if (event.key === "ArrowDown")
        setSelected((value) =>
          Math.max(0, Math.min(value + 1, visible.length - 1)),
        );
      if (event.key === "ArrowUp")
        setSelected((value) => Math.max(0, value - 1));
      if (event.key === "Enter") readArticle();
      if (event.key === "/") search.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function toggleSaved() {
    if (!current) return;
    setSaved((items) =>
      isSaved
        ? items.filter((item) => item.id !== current.id)
        : [current, ...items].slice(0, 100),
    );
    if (view === "saved") setSelected(0);
  }
  function changeView(next) {
    setView(next);
    setSelected(0);
    setInput("");
    setQuery("");
  }
  const loading = view === "explore" && status === "loading";
  const failed = view === "explore" && status === "error";

  return (
    <div className="app-shell">
      <Ambient />
      <a className="skip-link" href="#news-content">
        Saltar a noticias
      </a>
      <header className="header">
        <button
          className="brand"
          onClick={() => changeView("explore")}
          aria-label="ONDA, inicio"
        >
          <Waves strokeWidth={1.4} />
          <span>
            onda<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="header-divider" />
        <span className="brand-caption">TU MUNDO, EN SINTONÍA</span>
        <nav className="view-nav" aria-label="Navegación principal">
          <button
            className={view === "explore" ? "active" : ""}
            onClick={() => changeView("explore")}
          >
            Explorar
          </button>
          <button
            className={view === "saved" ? "active" : ""}
            onClick={() => changeView("saved")}
          >
            <Bookmark size={14} />
            Guardadas{" "}
            <span className="count">
              {saved.length.toString().padStart(2, "0")}
            </span>
          </button>
        </nav>
        <div className="header-right">
          <span className="clock">
            {now.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
            })}
            <span />
            {now.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
          <button
            className="icon-button"
            aria-label="Cambiar ambiente"
            title="Cambiar ambiente"
            onClick={() => setModal("theme")}
          >
            <Palette size={19} />
          </button>
          <button
            className={`icon-button settings-button ${personalApiKey ? "configured" : ""}`}
            aria-label="Configurar API Key"
            title="Configurar API Key"
            onClick={() => setModal("settings")}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      <main id="news-content">
        <section className="intro" aria-label="Bienvenida">
          <div>
            <div className="eyebrow">
              <span className="signal-dot" /> EL MUNDO NO SE DETIENE
            </div>
            <h1>
              Conecta con lo que <em>importa.</em>
            </h1>
            <p>Una nueva perspectiva, a tu propio ritmo.</p>
          </div>
          <button
            className="edition"
            onClick={() =>
              setModal(mode === "demo" || personalApiKey ? "settings" : "help")
            }
          >
            <Radio size={16} />
            <span>
              {failed
                ? "SIN SEÑAL"
                : mode === "live"
                  ? "SEÑAL EN VIVO"
                  : mode === "demo"
                    ? "MODO DEMOSTRACIÓN"
                    : "SINTONIZANDO"}
              <small>
                {failed
                  ? "Revisa la conexión o tu API Key"
                  : mode === "live"
                    ? personalApiKey
                      ? "GNews · Clave personal temporal"
                      : "Noticias vía GNews"
                    : mode === "demo"
                      ? "Artículos de ejemplo · Sin API Key"
                      : "Conectando con Express"}
              </small>
            </span>
            <ArrowUpRight size={15} />
          </button>
        </section>

        <section className="channel-section" aria-label="Canales de noticias">
          <div className="section-label">
            <span>EXPLORA TUS CANALES</span>
            <span>01 — 08</span>
          </div>
          <div className="channels" role="tablist" aria-label="Categorías">
            {channels.map(({ id, label, icon: Icon }, index) => (
              <button
                key={id}
                ref={category === id ? activeTab : null}
                role="tab"
                id={`tab-${id}`}
                aria-selected={category === id && view === "explore"}
                aria-controls="channel-panel"
                className={`channel ${category === id && view === "explore" ? "selected" : ""}`}
                onClick={() => selectCategory(id)}
              >
                <span className="channel-number">0{index + 1}</span>
                <span className="channel-icon">
                  <Icon strokeWidth={1.25} />
                </span>
                <span className="channel-name">{label}</span>
                <span className="channel-indicator" />
              </button>
            ))}
          </div>
        </section>

        <section
          id="channel-panel"
          className="news-section"
          role={view === "explore" ? "tabpanel" : undefined}
          aria-labelledby={
            view === "explore" ? `tab-${category}` : "saved-title"
          }
        >
          <div className="news-toolbar">
            <div className="channel-heading">
              <h2 id={view === "saved" ? "saved-title" : undefined}>
                {view === "saved" ? "Tus lecturas" : channel.label}
              </h2>
              <span className="heading-line" />
              <span className="article-count">
                {loading
                  ? "···"
                  : `${visible.length.toString().padStart(2, "0")} artículos`}
              </span>
            </div>
            <div className="filters">
              <form
                className="search-form"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery(input.trim());
                  setSelected(0);
                }}
              >
                <button type="submit" aria-label="Buscar noticias">
                  <Search size={16} />
                </button>
                <input
                  ref={search}
                  value={input}
                  maxLength={200}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Busca otra perspectiva…"
                  aria-label="Buscar noticias"
                />
                {input && (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                      setInput("");
                      setQuery("");
                      setSelected(0);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
              {view === "explore" && (
                <label className="country-filter">
                  <Earth size={14} />
                  <select
                    value={country}
                    onChange={(event) => {
                      setCountry(event.target.value);
                      setSelected(0);
                    }}
                    aria-label="País de las noticias"
                  >
                    <option value="all">Global</option>
                    <option value="mx">México</option>
                    <option value="es">España</option>
                    <option value="ar">Argentina</option>
                    <option value="co">Colombia</option>
                    <option value="us">EE. UU.</option>
                  </select>
                  <ChevronDown size={12} />
                </label>
              )}
            </div>
          </div>

          {loading ? (
            <div className="state-panel" role="status">
              <div className="loading-orbit">
                <Waves size={28} />
              </div>
              <h3>Sintonizando tu mundo…</h3>
              <p>Estamos reuniendo nuevas perspectivas.</p>
            </div>
          ) : failed ? (
            <div className="state-panel" role="alert">
              <Radio size={30} />
              <h3>La señal necesita una pausa.</h3>
              <p>{error}</p>
              <button
                className="primary-button"
                onClick={() => setRefresh((value) => value + 1)}
              >
                Volver a intentar <ArrowRight size={16} />
              </button>
              <button
                className="text-link"
                onClick={() => setModal("settings")}
              >
                <Settings size={15} /> Revisar API Key
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="state-panel" role="status">
              {view === "saved" ? <Bookmark size={30} /> : <Search size={30} />}
              <h3>
                {query
                  ? "Otra búsqueda, otra perspectiva."
                  : "Un espacio para volver a leer."}
              </h3>
              <p>
                {query
                  ? `No encontramos artículos para “${query}”. Prueba con otras palabras.`
                  : "Guarda un artículo con el marcador y lo encontrarás aquí."}
              </p>
              {query && (
                <button
                  className="primary-button"
                  onClick={() => {
                    setQuery("");
                    setInput("");
                  }}
                >
                  Borrar búsqueda <X size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="news-layout">
              <aside className="story-list" aria-label="Titulares">
                <div className="list-caption">
                  <Menu size={13} />
                  <span>
                    {view === "saved" ? "TU SELECCIÓN" : "EN EL RADAR"}
                  </span>
                </div>
                <div className="story-scroll">
                  {visible.map((article, index) => (
                    <button
                      ref={index === selected ? activeStory : null}
                      key={article.id}
                      className={`story ${index === selected ? "current" : ""}`}
                      aria-pressed={index === selected}
                      onClick={() => setSelected(index)}
                    >
                      <span className="story-index">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="story-copy">
                        <span className="story-source">
                          {article.source.name}
                        </span>
                        <strong>{article.title}</strong>
                        <span className="story-date">
                          {articleDate(article.publishedAt)}
                        </span>
                      </span>
                      {index === selected && (
                        <ArrowRight size={16} className="story-arrow" />
                      )}
                    </button>
                  ))}
                </div>
              </aside>
              {current && (
                <article
                  className={`featured ${current.image ? "has-image" : ""}`}
                  key={current.id}
                >
                  {current.image && (
                    <img
                      className="article-image"
                      src={current.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  )}
                  <div className="feature-orbits" aria-hidden="true">
                    <div />
                    <div />
                    <div />
                    <Earth strokeWidth={0.5} />
                  </div>
                  <div className="feature-content">
                    <div className="feature-meta">
                      <span className="feature-tag">
                        {isDemo ? "EXPLORA ONDA" : "EN PERSPECTIVA"}
                      </span>
                      <span className="feature-source">
                        {current.source.name}
                      </span>
                    </div>
                    <h3>{current.title}</h3>
                    <p className="feature-description">
                      {current.description ||
                        "Descubre los detalles de esta noticia en la publicación original."}
                    </p>
                    <div className="feature-bottom">
                      <div className="feature-actions">
                        <button
                          className="primary-button"
                          onClick={readArticle}
                          disabled={!current.demo && !validLink(current.url)}
                        >
                          {isDemo ? "Explorar este ejemplo" : "Leer noticia"}
                          <ArrowUpRight size={17} />
                        </button>
                        <button
                          className={`save-button ${isSaved ? "is-saved" : ""}`}
                          aria-label={
                            isSaved ? "Quitar de guardadas" : "Guardar noticia"
                          }
                          aria-pressed={Boolean(isSaved)}
                          onClick={toggleSaved}
                        >
                          <Bookmark
                            size={18}
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                      <span className="feature-date">
                        {articleDate(current.publishedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="feature-counter">
                    <span>{(selected + 1).toString().padStart(2, "0")}</span>
                    <span className="counter-track">
                      <i
                        style={{
                          width: `${((selected + 1) / visible.length) * 100}%`,
                        }}
                      />
                    </span>
                    <span>{visible.length.toString().padStart(2, "0")}</span>
                  </div>
                </article>
              )}
            </div>
          )}
        </section>
        <div className="below-news">
          <span>
            <span className="small-dot" />
            {view === "saved"
              ? "Tus noticias, siempre a mano. Guardadas en este navegador."
              : mode === "demo"
                ? "Estás explorando contenido ficticio. Conecta tu API Key para recibir noticias reales."
                : "Una pausa en el ruido. Un espacio para entender."}
          </span>
          <span>
            {view === "saved" ? "TU BIBLIOTECA PERSONAL" : channel.subtitle}
          </span>
        </div>
      </main>

      <footer className="footer">
        <div className="keyboard-hints">
          <span>
            <kbd>
              <ArrowLeft />
              <ArrowRight />
            </kbd>{" "}
            Categorías
          </span>
          <span>
            <kbd>
              <ArrowUp />
              <ArrowDown />
            </kbd>{" "}
            Titulares
          </span>
          <span>
            <kbd>↵</kbd> Leer
          </span>
          <span>
            <kbd>/</kbd> Buscar
          </span>
        </div>
        <span className="footer-signature">
          HECHO PARA EXPLORAR, SIN PRISA.
        </span>
        <button className="help-button" onClick={() => setModal("help")}>
          <CircleHelp size={15} /> Cómo navegar
        </button>
      </footer>
      {modal === "settings" ? (
        <ApiKeyDialog
          configured={Boolean(personalApiKey)}
          onSave={usePersonalKey}
          onForget={() => usePersonalKey("")}
          onClose={() => setModal(null)}
        />
      ) : (
        modal && (
          <Modal
            type={modal}
            onClose={() => setModal(null)}
            theme={theme}
            setTheme={setTheme}
            onConfigure={() => setModal("settings")}
          />
        )
      )}
    </div>
  );
}
