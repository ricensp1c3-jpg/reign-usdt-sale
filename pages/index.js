import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import QRCode from 'qrcode';
import { auth, db } from '../firebase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [qr, setQr] = useState('');
  const [loading, setLoading] = useState(false);

  const wallet = process.env.NEXT_PUBLIC_USDT_WALLET || '0x9B7eF9D7c52f3D9B5203f6D9f5dF6d9e5f6d9e5f';
  const price = 0.021;

  useEffect(() => {
    QRCode.toDataURL(wallet).then(setQr);
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) localStorage.setItem('referrer', ref);

    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setPoints(snap.data().points || 0);
      }
    });
  }, []);

  const register = async () => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      const referrer = localStorage.getItem('referrer');
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        points: 0,
        referrer: referrer || null,
        createdAt: new Date()
      });
      alert('Registered! Check your email for verification.');
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const login = async () => {
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };

  const calculate = (usdt) => Math.floor(usdt / price).toLocaleString();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">$REIGNCOIN Private Sale</h1>
            <p className="mt-2 text-xl">1 $REIGNCOIN = 0.021 USDT</p>
            <p className="text-green-400">Distribution: January 30, 2026</p>
          </div>
          <input className="w-full p-3 bg-gray-900 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-3 bg-gray-900 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex gap-4">
            <button onClick={register} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded font-bold">{loading ? '...' : 'Register'}</button>
            <button onClick={login} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold">{loading ? '...' : 'Login'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome, {user.email}</h1>
        <div className="bg-gray-900 rounded-xl p-8 text-center space-y-6">
          <div className="text-5xl font-bold text-green-400">{points.toLocaleString()} Points</div>
          <p className="text-xl">= {points.toLocaleString()} $REIGNCOIN on Jan 30</p>

          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="bg-gray-800 p-4 rounded"><p className="text-sm">100 USDT →</p><p className="text-2xl font-bold">{calculate(100)}</p></div>
            <div className="bg-gray-800 p-4 rounded"><p className="text-sm">500 USDT →</p><p className="text-2xl font-bold">{calculate(500)}</p></div>
            <div className="bg-gray-800 p-4 rounded"><p className="text-sm">1000 USDT →</p><p className="text-2xl font-bold">{calculate(1000)}</p></div>
          </div>

          <p className="text-lg">Send USDT (BNB Chain) to:</p>
          <code className="block bg-gray-800 p-4 rounded break-all font-mono">{wallet}</code>
          {qr && <img src={qr} alt="QR" className="mx-auto w-64 h-64" />}
          <p className="text-yellow-400">Important: Use memo / comment: <strong>{email}</strong></p>
          <p className="text-sm text-gray-400">Points auto-added in &lt;15 seconds when we receive your USDT</p>
        </div>
      </div>
    </div>
  );
}
