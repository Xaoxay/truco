import type { Design } from './game';

// Each symbol is built from five independently lit parts: one part per point.
export function ThemeTally({ count, design }: { count: number; design: Design }) {
  return <div className={`matches themed-tally tally-${design}`} aria-hidden="true">
    {[0, 1, 2].map(group => {
      const points = Math.max(0, Math.min(5, count - group * 5));
      return <svg key={group} viewBox="0 0 64 64" data-points={points} className={points === 5 ? 'symbol-complete' : ''}>
        <path className="symbol-placeholder" d={design === 'cyberpunk' ? 'M32 6A26 26 0 1 1 31.99 6M32 14A18 18 0 1 1 31.99 14' : 'M7 8H56V56H7ZM9 54L54 10'} />
        {design === 'sakura' && <>
          {[0, 1, 2, 3, 4].map(part => <g key={part} className={part < points ? 'symbol-part filled' : 'symbol-part empty'} transform={`rotate(${part * 72} 32 32)`}>
            <path className="petal" d="M32 33C19 25 18 13 25 8L32 12L39 8C47 15 44 27 32 33Z" />
            <path className="petal-vein" d="M32 31V16M32 26L27 21M32 26L37 21" />
          </g>)}
          {points === 5 && <g className="flower-heart"><circle cx="32" cy="32" r="5" />{[0,1,2,3,4].map(i=><path key={i} d="M32 32V24" transform={`rotate(${i*72} 32 32)`}/>)}</g>}
        </>}
        {design === 'cyberpunk' && <>
          {[0,1,2,3].map(part=><g key={part} transform={`rotate(${part*90} 32 32)`} className={part < points ? 'symbol-part filled' : 'symbol-part empty'}>
            <path className="chip-quarter" d="M33 6A26 26 0 0 1 58 31L50 31A18 18 0 0 0 33 14Z"/>
            <path className="chip-stripe" d="M43 9L40 16M53 19L46 23"/>
            <path className="neon-edge" d="M34 7A25 25 0 0 1 57 30"/>
          </g>)}
          <g className={points === 5 ? 'symbol-part filled' : 'symbol-part empty'}>
            <circle className="chip-center" cx="32" cy="32" r="15"/>
            <path className="neon-spade" d="M32 21C29 26 24 28 24 33C24 37 29 39 32 35L30 42H34L32 35C35 39 40 37 40 33C40 28 35 26 32 21Z"/>
          </g>
        </>}
        {design === 'retro' && <g className="pixel-coin">
          {['M32 32V6H44V10H52V18H58V32Z','M32 32H58V44H52V52H44V58H32Z','M32 32V58H20V54H12V46H6V32Z','M32 32H6V20H12V12H20V6H32Z'].map((path,part)=><path key={part} d={path} className={part < points ? 'coin-quarter symbol-part filled' : 'coin-quarter symbol-part empty'}/>)}
          <path className={points === 5 ? 'coin-stamp symbol-part filled' : 'coin-stamp symbol-part empty'} d="M18 16H46V20H50V44H46V48H18V44H14V20H18ZM24 24H28V28H36V24H40V28H36V32H32V36H36V40H40V44H36V40H28V44H24V40H28V36H32V32H28V28H24Z"/>
        </g>}
      </svg>;
    })}
  </div>;
}
