import { memo, useId } from 'react';
import type { Design } from './game';

// Each symbol is built from five independently lit parts: one part per point.
export const ThemeTally = memo(function ThemeTally({ count, design }: { count: number; design: Design }) {
  const uid = useId().replaceAll(':', '');
  return <div className={`matches themed-tally tally-${design}`} aria-hidden="true">
    {[0, 1, 2].map(group => {
      const points = Math.max(0, Math.min(5, count - group * 5));
      const gid = `${uid}-${group}`;
      return <svg key={group} viewBox="0 0 64 64" data-points={points} className={points === 5 ? 'symbol-complete' : ''}>
        <defs>
          {design === 'primavera' && <>
            <radialGradient id={`${gid}-jac`} cx=".35" cy=".25" r=".75">
              <stop offset="0" stopColor="#e8d4ff" />
              <stop offset=".5" stopColor="#9c6de3" />
              <stop offset="1" stopColor="#583091" />
            </radialGradient>
            <linearGradient id={`${gid}-twig`} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#4f3728" />
              <stop offset="1" stopColor="#85634b" />
            </linearGradient>
          </>}
          {design === 'verano' && <>
            <radialGradient id={`${gid}-sun`} cx=".35" cy=".3" r=".7">
              <stop offset="0" stopColor="#fffbe0" />
              <stop offset=".45" stopColor="#ffd34d" />
              <stop offset=".85" stopColor="#f09b22" />
              <stop offset="1" stopColor="#ba6211" />
            </radialGradient>
            <linearGradient id={`${gid}-ray`} x1=".5" y1="0" x2=".5" y2="1">
              <stop offset="0" stopColor="#ffe878" />
              <stop offset="1" stopColor="#e37d1e" />
            </linearGradient>
          </>}
          {design === 'otono' && <>
            <linearGradient id={`${gid}-leaf0`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ef6e42" />
              <stop offset=".55" stopColor="#b83b1c" />
              <stop offset="1" stopColor="#701f0d" />
            </linearGradient>
            <linearGradient id={`${gid}-leaf1`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffae4a" />
              <stop offset=".55" stopColor="#d66c1c" />
              <stop offset="1" stopColor="#8f3b0d" />
            </linearGradient>
            <linearGradient id={`${gid}-leaf2`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe070" />
              <stop offset=".55" stopColor="#d69c24" />
              <stop offset="1" stopColor="#8d5c11" />
            </linearGradient>
          </>}
          {design === 'invierno' && <>
            <linearGradient id={`${gid}-ice`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset=".5" stopColor="#9cd8f7" />
              <stop offset="1" stopColor="#2873a6" />
            </linearGradient>
            <radialGradient id={`${gid}-gem`} cx=".35" cy=".3" r=".75">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset=".5" stopColor="#aae2fc" />
              <stop offset="1" stopColor="#276e9e" />
            </radialGradient>
          </>}
        </defs>
        <path className="symbol-placeholder" d={
          design === 'cyberpunk'
            ? 'M32 6A26 26 0 1 1 31.99 6M32 14A18 18 0 1 1 31.99 14'
            : design === 'verano' || design === 'invierno'
            ? 'M32 8A24 24 0 1 1 31.99 8'
            : design === 'primavera' || design === 'otono'
            ? 'M12 50Q32 12 52 50'
            : 'M7 8H56V56H7ZM9 54L54 10'
        } />
        {design === 'primavera' && <>
          <path className="jacaranda-stem" stroke={`url(#${gid}-twig)`} d="M9 51Q28 24 55 15M29 31L36 45" />
          {[
            { x: 16, y: 42, r: -36 },
            { x: 25, y: 30, r: -20 },
            { x: 37, y: 22, r: -8 },
            { x: 49, y: 18, r: 12 },
            { x: 34, y: 43, r: 24 },
          ].map((bell, part) => (
            <g
              key={part}
              transform={`translate(${bell.x} ${bell.y}) rotate(${bell.r})`}
              className={part < points ? 'symbol-part filled' : 'symbol-part empty'}
            >
              <ellipse className="tally-shadow" cx=".8" cy="2" rx="6.2" ry="7.2" />
              <path className="jacaranda-bell" fill={`url(#${gid}-jac)`} d="M0 -9C-6 -7 -8.5 -1 -6.5 6Q-2 9.5 0 8Q2 9.5 6.5 6C8.5 -1 6 -7 0 -9Z" />
              <path className="jacaranda-throat" d="M-3 -3Q0 2 3 -3" />
              <circle className="jacaranda-core" cx="0" cy="1.5" r="1.7" />
            </g>
          ))}
        </>}
        {design === 'verano' && <>
          {[0, 1, 2, 3].map(part => (
            <g key={part} transform={`rotate(${part * 90} 32 32)`} className={part < points ? 'symbol-part filled' : 'symbol-part empty'}>
              <path className="tally-shadow" d="M32.8 5.5L38 17.5H27.5Z" />
              <path className="sun-ray-main" fill={`url(#${gid}-ray)`} d="M32 4.5L37.5 16.8L32 14.8L26.5 16.8Z" />
              <path className="sun-ray-shine" d="M32 5.5L32 14.2L27.6 16Z" />
              <path className="sun-ray-flare" fill={`url(#${gid}-ray)`} d="M50.5 11.5L46.5 21.5L40.5 15.8Z" />
            </g>
          ))}
          <g className={points === 5 ? 'symbol-part filled' : 'symbol-part empty'}>
            <circle className="tally-shadow" cx="32.8" cy="33.2" r="13.2" />
            <circle className="sun-disc" fill={`url(#${gid}-sun)`} cx="32" cy="32" r="13" />
            <circle className="sun-ring" cx="32" cy="32" r="9.4" />
            <path className="sun-gloss" d="M24 26A9 9 0 0 1 38 23.5" />
          </g>
        </>}
        {design === 'otono' && <>
          {[
            { x: 16, y: 40, r: -52 },
            { x: 24, y: 24, r: -24 },
            { x: 38, y: 19, r: 8 },
            { x: 48, y: 31, r: 44 },
            { x: 34, y: 43, r: 16 },
          ].map((leaf, part) => (
            <g
              key={part}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}
              className={part < points ? 'symbol-part filled' : 'symbol-part empty'}
            >
              <path className="tally-shadow" d="M1 -11C6 -7 9 0 6 7L1 13L-4 7C-7 0 -4 -7 1 -11Z" />
              <path className="lenga-leaf" fill={`url(#${gid}-leaf${part % 3})`} d="M0 -12.5C5 -9 7.8 -4 6.2 -1C7.6 2 6.5 5 4.8 7L0 11.5L-4.8 7C-6.5 5 -7.6 2 -6.2 -1C-7.8 -4 -5 -9 0 -12.5Z" />
              <path className="lenga-vein" d="M0 -9V13M0 -3L4 -6M0 1.5L-4.2 -1.5M0 4.5L3.8 2" />
            </g>
          ))}
        </>}
        {design === 'invierno' && <>
          {[0, 1, 2, 3].map(part => (
            <g key={part} transform={`rotate(${part * 90} 32 32)`} className={part < points ? 'symbol-part filled' : 'symbol-part empty'}>
              <path className="tally-shadow" d="M32.8 6.5V23.5M47.8 17.5L39.8 25.5" />
              <path className="ice-arm" stroke={`url(#${gid}-ice)`} d="M32 6V23.5M32 12L26.5 8M32 12L37.5 8M32 18.5L27.5 15M32 18.5L36.5 15" />
              <path className="ice-diag" stroke={`url(#${gid}-ice)`} d="M48 16L39 25M44 14L44 20M50 20L44 20" />
            </g>
          ))}
          <g className={points === 5 ? 'symbol-part filled' : 'symbol-part empty'}>
            <polygon className="tally-shadow" points="32.8,23.8 40.8,28.3 40.8,37.3 32.8,41.8 24.8,37.3 24.8,28.3" />
            <polygon className="ice-core" fill={`url(#${gid}-gem)`} points="32,23 40,27.5 40,36.5 32,41 24,36.5 24,27.5" />
            <polyline className="ice-facet" points="24,27.5 32,32 40,27.5 32,32 32,41" />
          </g>
        </>}
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
});
