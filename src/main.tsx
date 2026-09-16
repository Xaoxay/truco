import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import {
  ArrowRight,
  Pencil,
  Menu,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  History,
  ListRestart,
  Minus,
  Moon,
  Plus,
  Settings2,
  ShieldCheck,
  Sun,
  Trophy,
  Undo2,
  Vibrate,
  X,
} from "lucide-react";
import {
  addPoints,
  initialState,
  restore,
  scores,
  startNext,
  undo,
  winner,
  type Goal,
  type State,
  type Team,
} from "./game";
import "./style.css";
import "./gaucho.css";

const STORAGE_KEY = "truco-state-v1";
let saveQueue = Promise.resolve();
function Matches({ count }: { count: number }) {
  const lines = [
    [12, 10, 44, 10],
    [48, 12, 48, 44],
    [44, 48, 12, 48],
    [8, 44, 8, 12],
    [7, 50, 49, 7],
  ];
  return (
    <div className="matches" aria-hidden="true">
      {[0, 1, 2].map((group) => (
        <svg key={group} viewBox="0 0 58 58">
          {lines.map(([x1, y1, x2, y2], i) => (
            <g key={i} className={count > group * 5 + i ? "lit" : "unlit"}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} />
              <circle cx={x2} cy={y2} r="2.4" />
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
function App({ saved, warning }: { saved: State; warning: boolean }) {
  const [state, setState] = useState(saved);
  const [tab, setTab] = useState<"board" | "history" | "settings">("board");
  const [modal, setModal] = useState<
    "new" | "help" | "cards" | "names" | "menu" | null
  >(null);
  const [customTeam, setCustomTeam] = useState<Team>(0);
  const [notice, setNotice] = useState(
    warning ? "No pudimos recuperar la partida guardada." : "",
  );
  const [saveError, setSaveError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const latest = useRef(state);
  const total = scores(state.match);
  const won = winner(state.match);
  useEffect(() => {
    latest.current = state;
    document.documentElement.dataset.theme = state.dark ? "dark" : "light";
    saveQueue = saveQueue
      .then(() =>
        Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) }),
      )
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, [state]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (modal) {
      dialog.current?.showModal();
      if (modal === "names")
        dialog.current
          ?.querySelector<HTMLInputElement>(`[name="name${customTeam}"]`)
          ?.focus();
    } else dialog.current?.close();
  }, [modal, customTeam]);
  function feedback() {
    if (latest.current.haptics && Capacitor.isNativePlatform())
      void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }
  function score(team: Team, amount: number) {
    feedback();
    setState((s) => ({ ...s, match: addPoints(s.match, team, amount) }));
  }
  function goBack() {
    setState((s) => ({ ...s, match: undo(s.match) }));
    setNotice("Último movimiento deshecho");
  }
  const wins = [0, 1].map(
    (i) =>
      state.finished.filter(
        (m) =>
          m.names[0] === state.match.names[0] &&
          m.names[1] === state.match.names[1] &&
          winner(m) === i,
      ).length + (won === i ? 1 : 0),
  );
  const last = state.match.moves.at(-1);
  return (
    <div className={"shell " + (tab === "board" ? "board-mode" : "")}>
      <header className="header">
        <div className="brand">
          <img src="./icon.svg" alt="" />
          <div>
            <span className="brand-title">Truco</span>
            <span className="eyebrow">BIEN DE CAMPO</span>
          </div>
        </div>
        <span className="header-goal">
          A {state.match.goal}
          <small>TANTOS</small>
        </span>
        <button
          className="icon-button"
          aria-label="Abrir menú"
          onClick={() => setModal("menu")}
        >
          <Menu size={24} />
        </button>
      </header>
      <main>
        {tab === "board" && (
          <>
            <section className="scoreboard" aria-label="Marcador de la partida">
              <div className="score-columns">
                {([0, 1] as Team[]).map((team) => {
                  const phase = state.match.goal === 30 && total[team] >= 15;

                  return (
                    <section
                      className={"team team-" + team}
                      key={team}
                      aria-label={state.match.names[team]}
                    >
                      <h2 className="team-name">
                        <button
                          aria-label={`Editar nombre de ${state.match.names[team]}`}
                          onClick={() => {
                            setCustomTeam(team);
                            setModal("names");
                          }}
                        >
                          <span>{state.match.names[team]}</span>
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                      </h2>
                      <div
                        className="score"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        <span className="sr-only">
                          {state.match.names[team]}:{" "}
                        </span>
                        {total[team]}
                        <span className="sr-only"> tantos</span>
                      </div>
                      <div className={"tally-phases " + (state.match.goal === 15 ? "short-game" : "")}>
                        <section className="tally-phase" aria-label={`${state.match.names[team]}: ${Math.min(total[team],15)} malas de 15`}>
                          <h3>{state.match.goal === 30 ? "Malas" : "Tantos"}<span>{Math.min(total[team],15)}/15</span></h3>
                          <Matches count={Math.min(total[team],15)}/>
                        </section>
                        {state.match.goal === 30 && <section className={"tally-phase buenas " + (phase ? "active" : "")} aria-label={`${state.match.names[team]}: ${Math.max(total[team]-15,0)} buenas de 15`}>
                          <h3>Buenas<span>{Math.max(total[team]-15,0)}/15</span></h3>
                          <Matches count={Math.max(total[team]-15,0)}/>
                        </section>}
                      </div>
                      <div className="distance">
                        {won === team
                          ? "¡La mesa es suya!"
                          : `A ${state.match.goal - total[team]} de ganar`}
                      </div>
                      <div className="main-controls">
                        <button
                          className="subtract"
                          aria-label={`Restar un tanto a ${state.match.names[team]}`}
                          disabled={total[team] === 0 || won !== null}
                          onClick={() => score(team, -1)}
                        >
                          <Minus size={20} />
                        </button>
                        <button
                          className="add"
                          aria-label={`Sumar un tanto a ${state.match.names[team]}`}
                          disabled={won !== null}
                          onClick={() => score(team, 1)}
                        >
                          <Plus size={24} />

                        </button>
                      </div>
                    </section>
                  );
                })}
              </div>
              <div className="table-footer">
                <span className="small-diamond">◆</span>
                <span>
                  {state.match.goal === 30
                    ? "15 malas · 15 buenas · un solo ganador"
                    : "15 tantos · una mano más · un solo ganador"}
                </span>
                <span className="small-diamond">◆</span>
              </div>
            </section>
            {won !== null && (
              <section className="victory" role="status">
                <Trophy />
                <div>
                  <strong>¡Ganó {state.match.names[won]}!</strong>
                  <p>
                    {total[0]} a {total[1]}. ¿Sale revancha?
                  </p>
                </div>
                <button
                  className="icon-button"
                  aria-label="Jugar revancha"
                  onClick={() => {
                    setState((s) => startNext(s, s.match.names, s.match.goal));
                    setNotice("¡Arrancó la revancha!");
                  }}
                >
                  <ArrowRight />
                </button>
              </section>
            )}
            <div className="actions">
              <button
                className="secondary-button"
                disabled={!last}
                onClick={goBack}
              >
                <Undo2 size={18} />
                Deshacer
              </button>
              <button
                className="primary-button"
                onClick={() => setModal("new")}
              >
                <Plus size={18} />
                Nueva partida
              </button>
            </div>
            <div className="saved">
              <ShieldCheck size={14} />
              {saveError
                ? "No se pudo guardar. Mantené la app abierta."
                : "Guardado · Que siga la ronda"}
            </div>
          </>
        )}
        {tab === "history" && (
          <section className="page">
            <span className="eyebrow">CADA TANTO CUENTA</span>
            <h1>
              La historia
              <br />
              de la mesa.
            </h1>
            <h2>Esta partida</h2>
            {!last ? (
              <div className="empty">
                <History />
                <h3>Todavía no hay tantos</h3>
                <p>Los puntos que anotes aparecen acá.</p>
                <button
                  className="primary-button"
                  onClick={() => setTab("board")}
                >
                  Ir al anotador <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <button className="secondary-button" onClick={goBack}>
                  <Undo2 size={18} />
                  Deshacer último
                </button>
                <ol className="move-list">
                  {state.match.moves
                    .map((m, i) => (
                      <li key={i}>
                        <span className="move-points">
                          {m.points > 0 ? "+" : ""}
                          {m.points}
                        </span>
                        <div>
                          <strong>{state.match.names[m.team]}</strong>
                          <small>Movimiento {i + 1}</small>
                        </div>
                        <time>
                          {new Date(m.at).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </li>
                    ))
                    .reverse()}
                </ol>
              </>
            )}
            <h2>Partidas anteriores</h2>
            {state.finished.length === 0 ? (
              <p className="muted">
                Cuando termines una partida y empieces otra, la vas a encontrar
                acá.
              </p>
            ) : (
              <div className="past-matches">
                {[...state.finished].reverse().map((m) => (
                  <article key={m.id}>
                    <Trophy size={20} />
                    <div>
                      <strong>{m.names[winner(m)!]}</strong>
                      <p>
                        {m.names.join(" vs. ")} · A {m.goal}
                      </p>
                      <small>
                        {new Date(m.startedAt).toLocaleDateString("es-AR")}
                      </small>
                    </div>
                    <b>{scores(m).join(" : ")}</b>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {tab === "settings" && (
          <section className="page">
            <span className="eyebrow">A TU MANERA</span>
            <h1>
              Tu mesa,
              <br />
              tus costumbres.
            </h1>
            <div className="settings-card">
              <button
                className="setting-row"
                aria-pressed={state.dark}
                onClick={() => setState((s) => ({ ...s, dark: !s.dark }))}
              >
                {state.dark ? <Moon /> : <Sun />}
                <span>
                  <strong>Modo oscuro</strong>
                  <small>Para el truco después del asado</small>
                </span>
                <span className={"switch " + (state.dark ? "on" : "")}>
                  <i />
                </span>
              </button>
              <button
                className="setting-row"
                aria-pressed={state.haptics}
                onClick={() => setState((s) => ({ ...s, haptics: !s.haptics }))}
              >
                <Vibrate />
                <span>
                  <strong>Vibración al anotar</strong>
                  <small>Disponible en la app nativa</small>
                </span>
                <span className={"switch " + (state.haptics ? "on" : "")}>
                  <i />
                </span>
              </button>
              <button className="setting-row" onClick={() => setModal("new")}>
                <ListRestart />
                <span>
                  <strong>Puntaje de la partida</strong>
                  <small>Elegí 15 o 30 al empezar</small>
                </span>
                <ChevronRight />
              </button>
            </div>
            <div className="note">
              <ShieldCheck />
              <h2>
                Lo que pasa en la mesa,
                <br />
                queda en tu celu.
              </h2>
              <p>
                Sin cuenta, sin anuncios y sin enviar tus partidas a ningún
                servidor. Guardamos la partida actual y las últimas 100
                terminadas en este dispositivo.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setModal("help")}
            >
              <CircleHelp size={18} />
              Cómo usar e instalar
            </button>
            <p className="version">
              TRUCO · VERSIÓN 1.2.0
              <br />
              Hecho para una mano más.
            </p>
          </section>
        )}
      </main>
      {tab !== "board" && (
        <nav className="bottom-nav" aria-label="Navegación principal">
          {(
            [
              { key: "board", label: "Anotador", Icon: ListRestart },
              { key: "history", label: "Historial", Icon: History },
              { key: "settings", label: "Ajustes", Icon: Settings2 },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => setTab(key)}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
      <div className={"toast " + (notice ? "visible" : "")} role="status">
        {notice && (
          <>
            <Check size={16} />
            {notice}
          </>
        )}
      </div>
      <dialog
        ref={dialog}
        aria-label={
          modal === "names"
            ? "Nombres de los equipos"
            : modal === "menu"
              ? "Menú de la mesa"
              : modal === "new"
                ? "Nueva partida"
                : modal === "cards"
                  ? "Valor de las cartas"
                  : "Cómo usar el anotador"
        }
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <div className="dialog-head">
          <span className="eyebrow">TRUCO · EL ANOTADOR</span>
          <button
            className="icon-button"
            aria-label="Cerrar"
            onClick={() => setModal(null)}
          >
            <X />
          </button>
        </div>
        {modal === "names" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const names = [
                String(data.get("name0")).trim() || "Nosotros",
                String(data.get("name1")).trim() || "Ellos",
              ] as [string, string];
              setState((s) => ({ ...s, match: { ...s.match, names } }));
              setModal(null);
              setNotice("Nombres guardados. Los tantos siguen igual.");
            }}
          >
            <h2>¿Cómo se llaman?</h2>
            <p className="muted">
              Poné el nombre o apodo que quieras. Los puntos se mantienen.
            </p>
            <label>
              Nosotros
              <input
                name="name0"
                defaultValue={state.match.names[0]}
                maxLength={24}
                autoFocus={customTeam === 0}
                autoComplete="off"
              />
            </label>
            <label>
              Ellos
              <input
                name="name1"
                defaultValue={state.match.names[1]}
                maxLength={24}
                autoFocus={customTeam === 1}
                autoComplete="off"
              />
            </label>
            <button className="primary-button full" type="submit">
              <Check size={18} />
              Guardar nombres
            </button>
          </form>
        )}
        {modal === "menu" && (
          <section className="mesa-menu">
            <h2>La mesa está servida.</h2>
            <p className="menu-series">
              <Trophy size={18} /> La serie{" "}
              <strong>
                {wins[0]} : {wins[1]}
              </strong>
            </p>
            <button
              className="setting-row"
              onClick={() => {
                setTab("board");
                setModal(null);
              }}
            >
              <ListRestart />
              <span>Volver al anotador</span>
              <ChevronRight />
            </button>
            <button className="setting-row" onClick={() => setModal("names")}>
              <Pencil />
              <span>Cambiar nombres</span>
              <ChevronRight />
            </button>
            <button className="setting-row" onClick={() => setModal("new")}>
              <Plus />
              <span>Nueva partida</span>
              <ChevronRight />
            </button>
            <button
              className="setting-row"
              onClick={() => {
                setTab("history");
                setModal(null);
              }}
            >
              <History />
              <span>Historial de la mesa</span>
              <ChevronRight />
            </button>
            <button
              className="setting-row"
              onClick={() => {
                setTab("settings");
                setModal(null);
              }}
            >
              <Settings2 />
              <span>Ajustes</span>
              <ChevronRight />
            </button>
            <button className="setting-row" onClick={() => setModal("cards")}><BookOpen/><span>Valor de las cartas en el truco</span><ChevronRight/></button>
            <button className="setting-row" onClick={() => setModal("help")}>
              <CircleHelp />
              <span>Cómo se usa</span>
              <ChevronRight />
            </button>
          </section>
        )}
        {modal === "new" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              setState((s) =>
                startNext(
                  s,
                  [String(d.get("team0")), String(d.get("team1"))],
                  Number(d.get("goal")) as Goal,
                ),
              );
              setTab("board");
              setModal(null);
              setNotice("¡Todo listo, a repartir!");
            }}
          >
            <h2>
              ¿Quién se sienta
              <br />a la mesa?
            </h2>
            <p className="muted">Poneles nombre a los equipos y arranquen.</p>
            <label>
              Equipo 1
              <input
                name="team0"
                defaultValue={state.match.names[0]}
                maxLength={24}
                required
                autoComplete="off"
              />
            </label>
            <label>
              Equipo 2
              <input
                name="team1"
                defaultValue={state.match.names[1]}
                maxLength={24}
                required
                autoComplete="off"
              />
            </label>
            <fieldset>
              <legend>¿A cuántos tantos?</legend>
              <div className="goal-options">
                {[15, 30].map((n) => (
                  <label key={n}>
                    <input
                      type="radio"
                      name="goal"
                      value={n}
                      defaultChecked={state.match.goal === n}
                    />
                    <span>
                      <b>{n}</b>
                      {n === 30 ? "Malas y buenas" : "Partida corta"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {last && won === null && (
              <p className="warning">
                Al empezar, se descarta la partida en curso ({total.join(" a ")}
                ). Si querés seguirla, tocá Cerrar.
              </p>
            )}
            <button className="primary-button full" type="submit">
              Empezar partida <ArrowRight size={18} />
            </button>
          </form>
        )}
        {modal === "cards" && <section className="cards-guide"><h2>Valor de las cartas<br/>en el truco</h2><p className="muted">De mayor a menor. Cada carta le gana a las que están debajo.</p>
          <ol className="card-ranking">{[
            ["1", "Espada", "Ancho de espada"], ["1", "Basto", "Ancho de basto"], ["7", "Espada", "Siete bravo"], ["7", "Oro", "Siete bravo"],
            ["3", "Todos los palos", ""], ["2", "Todos los palos", ""], ["1", "Copa y oro", "Anchos falsos"],
            ["12", "Todos los palos", "Reyes"], ["11", "Todos los palos", "Caballos"], ["10", "Todos los palos", "Sotas"],
            ["7", "Copa y basto", "Sietes falsos"], ["6", "Todos los palos", ""], ["5", "Todos los palos", ""], ["4", "Todos los palos", ""]
          ].map(([number,suit,nickname],i)=><li key={i}><span className="rank">{i+1}.</span><b className="card-number">{number}</b><div><strong>{suit}</strong>{nickname && <small>{nickname}</small>}</div></li>)}</ol>
          <p className="muted">Las cartas de la misma fila empatan: hacen parda. Se usa el mazo español de 40 cartas, sin 8, 9 ni comodines.</p>
          <h3>Para el envido</h3><p>Del 1 al 7 valen su número. El 10, 11 y 12 valen 0. Con dos cartas del mismo palo, sumá sus valores y 20; sin dos del mismo palo, cuenta la de mayor valor. El máximo es 33.</p>
          <button className="primary-button full" onClick={()=>setModal("menu")}>Volver al menú</button>
        </section>}
        {modal === "help" && (
          <div className="help">
            <h2>
              Menos cuentas.
              <br />
              Más truco.
            </h2>
            <h3>Así se anota</h3>
            <p>
              Elegí 15 o 30 tantos. A 30, los primeros 15 son las malas y los
              siguientes 15 son las buenas. Los fósforos forman cuadrados de
              cinco.
            </p>
            <p>
              Sumá de a un tanto con +. El
              botón − resta un tanto y «Deshacer» revierte el último movimiento,
              incluso el que cerró la partida.
            </p>
            <h3>¿Sale revancha?</h3>
            <p>
              Al llegar al objetivo aparece el ganador. Tocá la flecha para
              jugar de nuevo con los mismos equipos. Las victorias se acumulan
              en la serie.
            </p>
            <h3>Siempre a mano</h3>
            <p>
              La app nativa funciona sin internet desde el primer uso. En la
              versión web, abrila una vez con conexión antes de usarla sin
              internet.
            </p>
            <h3>Instalar desde el navegador</h3>
            <p>
              <b>Android:</b> en Chrome, abrí el menú y elegí «Agregar a la
              pantalla principal» o «Instalar app».
            </p>
            <p>
              <b>iPhone:</b> en Safari, tocá Compartir → «Agregar a inicio».
              Necesitás abrir una dirección HTTPS.
            </p>
            <button
              className="primary-button full"
              onClick={() => setModal(null)}
            >
              Listo, a jugar <ArrowRight size={18} />
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
let root: ReturnType<typeof createRoot> | undefined;
let disposed = false;
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposed = true;
    root?.unmount();
  });
}
async function boot() {
  let state = initialState();
  let warning = false;
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (value) {
      const recovered = restore(value);
      if (recovered) state = recovered;
      else warning = true;
    }
  } catch {
    warning = true;
  }
  if (disposed) return;
  root = createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App saved={state} warning={warning} />
    </React.StrictMode>,
  );
  if (
    "serviceWorker" in navigator &&
    import.meta.env.PROD &&
    !Capacitor.isNativePlatform()
  )
    navigator.serviceWorker.register("./sw.js").catch(() => {});
}
void boot();
