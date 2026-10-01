import type { Design } from './game';

// Each symbol is built from five independently lit parts: one part per point.
export function ThemeTally({ count, design }: { count: number; design: Design }) {
  return <div className={`matches themed-tally tally-${design}`} aria-hidden="true">
    {[0, 1, 2].map(group => {
      const points = Math.max(0, Math.min(5, count - group * 5));
      return <svg key={group} viewBox="0 0 64 64" data-points={points} className={points === 5 ? 'symbol-complete' : ''}>
        <path className="symbol-placeholder" d="M7 8H56V56H7ZM9 54L54 10" />
        {design === 'sakura' && <>
          {[0, 1, 2, 3, 4].map(part => <g key={part} className={part < points ? 'symbol-part filled' : 'symbol-part empty'} transform={`rotate(${part * 72} 32 32)`}>
            <path className="petal" d="M32 33C19 25 18 13 25 8L32 12L39 8C47 15 44 27 32 33Z" />
            <path className="petal-vein" d="M32 31V16M32 26L27 21M32 26L37 21" />
          </g>)}
          {points === 5 && <g className="flower-heart"><circle cx="32" cy="32" r="5" />{[0,1,2,3,4].map(i=><path key={i} d="M32 32V24" transform={`rotate(${i*72} 32 32)`}/>)}</g>}
        </>}
        {design === 'cyberpunk' && <>
          {['M9 54V9Q9 5 13 5H51','M51 5Q55 5 55 9V54','M55 54Q55 59 51 59H13','M13 59Q9 59 9 54'].map((path,part)=><path key={part} d={path} className={part < points ? 'neon-edge symbol-part filled' : 'neon-edge symbol-part empty'}/>)}
          <path className={points === 5 ? 'neon-spade symbol-part filled' : 'neon-spade symbol-part empty'} d="M32 17C28 24 20 27 20 34C20 40 27 43 31 37L28 47H36L33 37C38 43 44 40 44 34C44 27 36 24 32 17Z"/>
          {points === 5 && <><path className="card-corner" d="M14 13H18V17H14ZM46 47H50V51H46Z"/><path className="card-glint" d="M11 10V24M16 7H27"/></>}
        </>}
        {design === 'retro' && <g className="pixel-coin">
          {['M32 32V6H44V10H52V18H58V32Z','M32 32H58V44H52V52H44V58H32Z','M32 32V58H20V54H12V46H6V32Z','M32 32H6V20H12V12H20V6H32Z'].map((path,part)=><path key={part} d={path} className={part < points ? 'coin-quarter symbol-part filled' : 'coin-quarter symbol-part empty'}/>)}
          <path className={points === 5 ? 'coin-stamp symbol-part filled' : 'coin-stamp symbol-part empty'} d="M18 16H46V20H50V44H46V48H18V44H14V20H18ZM24 24H28V28H36V24H40V28H36V32H32V36H36V40H40V44H36V40H28V44H24V40H28V36H32V32H28V28H24Z"/>
        </g>}
      </svg>;
    })}
  </div>;
}
