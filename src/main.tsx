import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ArrowRight, Check, ChevronRight, CircleHelp, History, ListRestart, Minus, Moon, Plus, Settings2, ShieldCheck, Sun, Trophy, Undo2, Vibrate, X } from 'lucide-react';
import { addPoints, initialState, restore, scores, startNext, undo, winner, type Goal, type State, type Team } from './game';
import './style.css';

const STORAGE_KEY = 'truco-state-v1';
let saveQueue = Promise.resolve();
function Matches({ count }: { count: number }) {
  const lines = [[12,10,44,10],[48,12,48,44],[44,48,12,48],[8,44,8,12],[7,50,49,7]];
  return <div className="matches" aria-hidden="true">{[0,1,2].map(group => <svg key={group} viewBox="0 0 58 58">{lines.map(([x1,y1,x2,y2],i) => <g key={i} className={count > group*5+i ? 'lit' : 'unlit'}><line x1={x1} y1={y1} x2={x2} y2={y2} /><circle cx={x2} cy={y2} r="2.4" /></g>)}</svg>)}</div>;
}
function App({ saved, warning }: { saved: State; warning: boolean }) {
  const [state, setState] = useState(saved);
  const [tab, setTab] = useState<'board'|'history'|'settings'>('board');
  const [modal, setModal] = useState<'new'|'help'|'points'|null>(null);
  const [customTeam, setCustomTeam] = useState<Team>(0);
  const [notice, setNotice] = useState(warning ? 'No pudimos recuperar la partida guardada.' : '');
  const [saveError, setSaveError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const latest = useRef(state);
  const total = scores(state.match);
  const won = winner(state.match);
  useEffect(() => {
    latest.current = state;
    document.documentElement.dataset.theme = state.dark ? 'dark' : 'light';
    saveQueue = saveQueue.then(() => Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) })).then(() => setSaveError(false)).catch(() => setSaveError(true));
  }, [state]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (modal) dialog.current?.showModal(); else dialog.current?.close(); }, [modal]);
  function feedback() { if (latest.current.haptics && Capacitor.isNativePlatform()) void Haptics.impact({style: ImpactStyle.Light}).catch(() => {}); }
  function score(team: Team, amount: number) { feedback(); setState(s => ({...s, match: addPoints(s.match, team, amount)})); }
  function goBack() { setState(s => ({...s, match: undo(s.match)})); setNotice('Último movimiento deshecho'); }
  const wins = [0,1].map(i => state.finished.filter(m => m.names[0] === state.match.names[0] && m.names[1] === state.match.names[1] && winner(m) === i).length + (won === i ? 1 : 0));
  const last = state.match.moves.at(-1);
  return <div className="shell">
    <header className="header"><div className="brand"><img src="./icon.svg" alt=""/><div><span className="brand-title">truco<span>.</span></span><span className="eyebrow">EL ANOTADOR</span></div></div><button className="icon-button" aria-label="Cómo usar el anotador" onClick={() => setModal('help')}><CircleHelp size={22}/></button></header>
    <main>
    {tab === 'board' && <>
      <div className="intro"><div><span className="eyebrow">LAS CARTAS EN LA MESA</span><h1>Que no se pierda<br/>ningún tanto.</h1></div><div className="argentina" aria-label="Hecho para el truco argentino"><i/><i/><i/></div></div>
      <div className="table-heading"><span className="live-dot"/><span>{won !== null ? 'Partida terminada' : 'Partida en curso'}</span><span className="goal-tag">A {state.match.goal} tantos</span></div>
      <section className="scoreboard" aria-label="Marcador de la partida">
        <div className="score-columns">{([0,1] as Team[]).map(team => {
          const phase = state.match.goal === 30 && total[team] >= 15;
          const matchCount = phase ? total[team] - 15 : total[team];
          return <section className={'team team-' + team} key={team} aria-label={state.match.names[team]}>
            <div className="team-caption">EQUIPO {team + 1}</div><h2 title={state.match.names[team]}>{state.match.names[team]}</h2>
            <div className="score" aria-live="polite" aria-atomic="true"><span className="sr-only">{state.match.names[team]}: </span>{total[team]}<span className="sr-only"> tantos</span></div>
            <span className={'phase ' + (phase ? 'good' : '')}>{won === team ? 'GANADORES' : state.match.goal === 15 ? 'TANTOS' : phase ? 'BUENAS' : 'MALAS'}</span>
            <Matches count={matchCount}/>
            <div className="distance">{won === team ? '¡La mesa es suya!' : `A ${state.match.goal-total[team]} de ganar`}</div>
            <div className="main-controls"><button className="subtract" aria-label={`Restar un tanto a ${state.match.names[team]}`} disabled={total[team] === 0 || won !== null} onClick={() => score(team,-1)}><Minus size={20}/></button><button className="add" aria-label={`Sumar un tanto a ${state.match.names[team]}`} disabled={won !== null} onClick={() => score(team,1)}><Plus size={24}/><span>1</span></button></div>
            <div className="quick-controls">{[2,3,4].map(n => <button key={n} disabled={won !== null} aria-label={`Sumar ${n} tantos a ${state.match.names[team]}`} onClick={() => score(team,n)}>+{n}</button>)}<button disabled={won !== null} aria-label={`Otro puntaje para ${state.match.names[team]}`} onClick={() => {setCustomTeam(team); setModal('points');}}>Otro</button></div>
          </section>;
        })}</div>
        <div className="table-footer"><span className="small-diamond">◆</span><span>{state.match.goal === 30 ? '15 malas · 15 buenas · un solo ganador' : '15 tantos · una mano más · un solo ganador'}</span><span className="small-diamond">◆</span></div>
      </section>
      {won !== null && <section className="victory" role="status"><Trophy/><div><strong>¡Ganó {state.match.names[won]}!</strong><p>{total[0]} a {total[1]}. ¿Sale revancha?</p></div><button className="icon-button" aria-label="Jugar revancha" onClick={() => {setState(s=>startNext(s,s.match.names,s.match.goal)); setNotice('¡Arrancó la revancha!');}}><ArrowRight/></button></section>}
      <div className="actions"><button className="secondary-button" disabled={!last} onClick={goBack}><Undo2 size={18}/>Deshacer</button><button className="primary-button" onClick={() => setModal('new')}><Plus size={18}/>Nueva partida</button></div>
      <div className="last-move">{last ? <><span>{last.points > 0 ? '+' : ''}{last.points} para {state.match.names[last.team]}</span><span>Último movimiento</span></> : <><span>Todo listo para la primera mano</span><span>Sumá con los botones de cada equipo</span></>}</div>
      <section className="series"><div className="series-icon"><Trophy size={21}/></div><div><h3>La serie de la mesa</h3><p>Partidas ganadas con estos equipos</p></div><strong aria-label={`${wins[0]} a ${wins[1]} en la serie`}>{wins[0]} <span>:</span> {wins[1]}</strong></section>
      <div className="saved"><ShieldCheck size={14}/>{saveError ? 'No se pudo guardar. Mantené la app abierta.' : 'Se guarda sola. Vos seguí jugando.'}</div>
    </>}
    {tab === 'history' && <section className="page"><span className="eyebrow">CADA TANTO CUENTA</span><h1>La historia<br/>de la mesa.</h1><h2>Esta partida</h2>{!last ? <div className="empty"><History/><h3>Todavía no hay tantos</h3><p>Los puntos que anotes aparecen acá.</p><button className="primary-button" onClick={() => setTab('board')}>Ir al anotador <ArrowRight size={18}/></button></div> : <><button className="secondary-button" onClick={goBack}><Undo2 size={18}/>Deshacer último</button><ol className="move-list">{state.match.moves.map((m,i) => <li key={i}><span className="move-points">{m.points > 0 ? '+' : ''}{m.points}</span><div><strong>{state.match.names[m.team]}</strong><small>Movimiento {i+1}</small></div><time>{new Date(m.at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</time></li>).reverse()}</ol></>}
      <h2>Partidas anteriores</h2>{state.finished.length === 0 ? <p className="muted">Cuando termines una partida y empieces otra, la vas a encontrar acá.</p> : <div className="past-matches">{[...state.finished].reverse().map(m => <article key={m.id}><Trophy size={20}/><div><strong>{m.names[winner(m)!]}</strong><p>{m.names.join(' vs. ')} · A {m.goal}</p><small>{new Date(m.startedAt).toLocaleDateString('es-AR')}</small></div><b>{scores(m).join(' : ')}</b></article>)}</div>}</section>}
    {tab === 'settings' && <section className="page"><span className="eyebrow">A TU MANERA</span><h1>Tu mesa,<br/>tus costumbres.</h1><div className="settings-card"><button className="setting-row" aria-pressed={state.dark} onClick={() => setState(s=>({...s,dark:!s.dark}))}>{state.dark ? <Moon/> : <Sun/>}<span><strong>Modo oscuro</strong><small>Para el truco después del asado</small></span><span className={'switch '+(state.dark?'on':'')}><i/></span></button><button className="setting-row" aria-pressed={state.haptics} onClick={() => setState(s=>({...s,haptics:!s.haptics}))}><Vibrate/><span><strong>Vibración al anotar</strong><small>Disponible en la app nativa</small></span><span className={'switch '+(state.haptics?'on':'')}><i/></span></button><button className="setting-row" onClick={() => setModal('new')}><ListRestart/><span><strong>Equipos y tantos</strong><small>Elegilos al empezar una partida</small></span><ChevronRight/></button></div><div className="note"><ShieldCheck/><h2>Lo que pasa en la mesa,<br/>queda en tu celu.</h2><p>Sin cuenta, sin anuncios y sin enviar tus partidas a ningún servidor. Guardamos la partida actual y las últimas 100 terminadas en este dispositivo.</p></div><button className="secondary-button" onClick={() => setModal('help')}><CircleHelp size={18}/>Cómo usar e instalar</button><p className="version">TRUCO · VERSIÓN 1.0.0<br/>Hecho para una mano más.</p></section>}
    </main>
    <nav className="bottom-nav" aria-label="Navegación principal">{([{key:'board',label:'Anotador',Icon:ListRestart},{key:'history',label:'Historial',Icon:History},{key:'settings',label:'Ajustes',Icon:Settings2}] as const).map(({key,label,Icon}) => <button key={key} aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}><Icon size={21}/><span>{label}</span></button>)}</nav>
    <div className={'toast '+(notice?'visible':'')} role="status">{notice && <><Check size={16}/>{notice}</>}</div>
    <dialog ref={dialog} onCancel={() => setModal(null)} onClick={e => {if(e.target === e.currentTarget) setModal(null);}}>
      <div className="dialog-head"><span className="eyebrow">TRUCO · EL ANOTADOR</span><button className="icon-button" aria-label="Cerrar" onClick={() => setModal(null)}><X/></button></div>
      {modal === 'new' && <form onSubmit={e => {e.preventDefault(); const d = new FormData(e.currentTarget); setState(s=>startNext(s,[String(d.get('team0')),String(d.get('team1'))],Number(d.get('goal')) as Goal)); setTab('board'); setModal(null); setNotice('¡Todo listo, a repartir!');}}><h2>¿Quién se sienta<br/>a la mesa?</h2><p className="muted">Poneles nombre a los equipos y arranquen.</p><label>Equipo 1<input name="team0" defaultValue={state.match.names[0]} maxLength={24} required autoComplete="off"/></label><label>Equipo 2<input name="team1" defaultValue={state.match.names[1]} maxLength={24} required autoComplete="off"/></label><fieldset><legend>¿A cuántos tantos?</legend><div className="goal-options">{[15,30].map(n=><label key={n}><input type="radio" name="goal" value={n} defaultChecked={state.match.goal === n}/><span><b>{n}</b>{n === 30 ? 'Malas y buenas' : 'Partida corta'}</span></label>)}</div></fieldset>{last && won === null && <p className="warning">Al empezar, se descarta la partida en curso ({total.join(' a ')}). Si querés seguirla, tocá Cerrar.</p>}<button className="primary-button full" type="submit">Empezar partida <ArrowRight size={18}/></button></form>}
      {modal === 'points' && <form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);score(customTeam,Number(d.get('points')));setModal(null);}}><h2>Tantos para<br/>{state.match.names[customTeam]}</h2><p className="muted">Anotá el valor que acordaron en la mesa.</p><label>Cantidad de tantos<input type="number" name="points" inputMode="numeric" min="1" max={state.match.goal-total[customTeam]} required defaultValue="1"/></label><p className="muted">Le faltan {state.match.goal-total[customTeam]} para ganar. La falta envido se anota según la variante que jueguen.</p><button className="primary-button full" type="submit">Anotar tantos <Plus size={18}/></button></form>}
      {modal === 'help' && <div className="help"><h2>Menos cuentas.<br/>Más truco.</h2><h3>Así se anota</h3><p>Elegí 15 o 30 tantos. A 30, los primeros 15 son las malas y los siguientes 15 son las buenas. Los fósforos forman cuadrados de cinco.</p><p>Sumá con +1, +2, +3 o +4. Para otro valor, tocá «Otro puntaje». El botón − resta un tanto y «Deshacer» revierte el último movimiento, incluso el que cerró la partida.</p><h3>¿Sale revancha?</h3><p>Al llegar al objetivo aparece el ganador. Tocá la flecha para jugar de nuevo con los mismos equipos. Las victorias se acumulan en la serie.</p><h3>Siempre a mano</h3><p>La app nativa funciona sin internet desde el primer uso. En la versión web, abrila una vez con conexión antes de usarla sin internet.</p><h3>Instalar desde el navegador</h3><p><b>Android:</b> en Chrome, abrí el menú y elegí «Agregar a la pantalla principal» o «Instalar app».</p><p><b>iPhone:</b> en Safari, tocá Compartir → «Agregar a inicio». Necesitás abrir una dirección HTTPS.</p><button className="primary-button full" onClick={() => setModal(null)}>Listo, a jugar <ArrowRight size={18}/></button></div>}
    </dialog>
  </div>;
}
async function boot() {
  let state = initialState(); let warning = false;
  try { const { value } = await Preferences.get({key:STORAGE_KEY}); if(value) { const recovered = restore(value); if(recovered) state=recovered; else warning=true; } } catch { warning=true; }
  createRoot(document.getElementById('root')!).render(<React.StrictMode><App saved={state} warning={warning}/></React.StrictMode>);
  if ('serviceWorker' in navigator && import.meta.env.PROD && !Capacitor.isNativePlatform()) navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
void boot();
