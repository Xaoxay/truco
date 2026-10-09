import { useId } from 'react';

// Ilustraciones vectoriales propias inspiradas en cinco espadas de anime.
export function AnimeTally({ count }: { count: number }) {
  const id = useId().replaceAll(':', '');
  return <div className="matches anime-tally" aria-hidden="true">
    {[0,1,2].map(group => <svg key={group} viewBox="0 0 110 110" data-points={Math.max(0,Math.min(5,count-group*5))}>
      <defs><linearGradient id={`${id}-steel-${group}`} x1="0" x2="1"><stop stopColor="#eff9ff"/><stop offset=".45" stopColor="#b3ccdf"/><stop offset=".5" stopColor="#f6fcff"/><stop offset="1" stopColor="#718da9"/></linearGradient></defs>
      {[0,1,2,3,4].map(sword => <g key={sword} className={`anime-sword ${count > group*5+sword ? 'sword-filled':'sword-empty'}`} transform={[
          'translate(94 8) rotate(90) scale(.95) translate(-11 0)',
          'translate(94 94) rotate(180) scale(.95) translate(-11 0)',
          'translate(16 94) rotate(-90) scale(.95) translate(-11 0)',
          'translate(16 16) scale(.95) translate(-11 0)',
          'translate(96 8) rotate(45) scale(1.48) translate(-11 0)',
        ][sword]}>
        <title>{['Nichirin · Demon Slayer','Zangetsu · Bleach','Wado Ichimonji · One Piece','Dragon Slayer · Berserk','Elucidator · Sword Art Online'][sword]}</title>
        {sword===0 && <><path d="M10 60Q7 31 13 3L16 0Q11 31 13 60Z" fill="#202a3d" stroke="#e7edf4" strokeWidth=".8"/><path d="M12 57Q10 28 15 3" fill="none" stroke="#e75a51" strokeWidth="1.3"/><path d="M5 60l3-3h7l3 3-3 3H8z" fill="#242e3e" stroke="#f2b656" strokeWidth="1.4"/><path d="M9 64h5v15H9z" fill="#52292e" stroke="#d8d9df"/><path d="m9 66 5 3-5 3 5 3-5 3" fill="none" stroke="#f5e6cc" strokeWidth="1"/></>}
        {sword===1 && <><path d="M8 61 3 23 16 1 18 50 12 62Z" fill="#223044" stroke="#e2ecf5" strokeWidth="1"/><path d="m16 3 2 47-6 10-2-5 3-43z" fill={`url(#${id}-steel-${group})`}/><path d="M8 61h6v17H8z" fill="#f1e7d4" stroke="#b8a98d"/><path d="m8 65 6 2-6 2 6 2-6 2" stroke="#a4a0a3" fill="none"/><path d="M11 78q-8 0-6 5" fill="none" stroke="#ece1ce" strokeWidth="2"/></>}
        {sword===2 && <><path d="M9 60Q6 25 13 4L16 1Q11 32 13 60Z" fill={`url(#${id}-steel-${group})`} stroke="#eff8ff" strokeWidth=".8"/><ellipse cx="11" cy="61" rx="8" ry="2.5" fill="#e4bc69" stroke="#83602e"/><path d="M8 65h6v14H8z" fill="#fff4de" stroke="#ad9462"/><path d="m8 66 6 3-6 3 6 3-6 3" fill="none" stroke="#bbb6af"/><path d="M8 64h6M8 80h6" stroke="#d9b36b" strokeWidth="2"/></>}
        {sword===3 && <><path d="M3 60V14L11 1l8 13v46z" fill="#455167" stroke="#b6c5d5" strokeWidth="1.1"/><path d="M3 14 11 3v57H3z" fill="#788da3"/><path d="M4 15v42" stroke="#dde6ee" strokeWidth="1"/><path d="M0 62h21v3H0z" fill="#8d99a6" stroke="#263143"/><path d="M8 66h6v13H8z" fill="#523c32" stroke="#bfaa82"/><path d="M8 69h6m-6 4h6m-6 4h6" stroke="#bead8c"/><circle cx="11" cy="81" r="2.5" fill="#909fae"/></>}
        {sword===4 && <><path d="m11 0 6 12-3 44 4 5-5 3H8l-5-3 5-5-3-44z" fill="#202638" stroke="#b7d1e7" strokeWidth="1.1"/><path d="M11 7v45" stroke="#e1f0fc" strokeWidth="1"/><path d="m2 61 5-3 4 3 4-3 5 3-4 5-5-3-5 3z" fill="#303b4d" stroke="#d3e6f5"/><path d="M9 66h5v13H9z" fill="#263142" stroke="#a7c4da"/><path d="M8 80h7" stroke="#dce9f5" strokeWidth="2"/></>}
      </g>)}
    </svg>)}
  </div>;
}
