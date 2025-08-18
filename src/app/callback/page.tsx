// 'use client';
// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';

// export default function CallbackPage() {
//   const [msg, setMsg] = useState('Signing you in...');
//   useEffect(() => {
//     const hash = window.location.hash; // for older flows
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get('code');
//     if (code) {
//       supabase.auth.exchangeCodeForSession(code).then(({error}) => {
//         if (error) setMsg(`Error: ${error.message}`);
//         else window.location.href = '/dashboard';
//       });
//     } else if (hash.includes('access_token')) {
//       // Fallback for token hash style
//       window.location.href = '/dashboard';
//     } else {
//       setMsg('No auth code found.');
//     }
//   }, []);
//   return <p>{msg}</p>;
// }
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackPage() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');

    // Newer magic-link flow: /callback?code=...
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error(error);
          alert(error.message);
        } else {
          window.location.replace('/dashboard');
        }
      });
      return;
    }

    // Fallback for older hash-based links: /callback#access_token=...
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      window.location.replace('/dashboard');
    }
  }, [params]);

  return <p style={{ padding: 16 }}>Signing you in…</p>;
}