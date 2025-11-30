import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';

const BACKGROUND = "https://i.ibb.co/5Yx0v1K/reigncoin-logo-background.png";
const WALLET = "bnb1jxjfrxx4v4whfx239paj3k6ecpjec7k4qc3gfs";
const PRICE = 0.021;

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [pending, setPending] = useState(0);
  const [usdt, setUsdt] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date('2026-01-30T00:00:00Z') - new Date();
      if (diff <= 0) return setTimeLeft("SALE ENDED");
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          setPoints(snap.data().points || 0);
          setPending(snap.data().pending || 0);
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const register = async () => { try { const c = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, 'users', c.user.uid), { email, points: 0, pending: 0 }); } catch (e) { alert(e.message); } };
  const login = async () => { try { await signInWithEmailAndPassword(auth, email, password); } catch (e) { alert(e.message); } };
  const logout = async () => { await signOut(auth); setPoints(0); setPending(0); };

  const lockPoints = async () => {
    const amount = parseFloat(usdt);
    if (!amount || amount < 10) return alert("Minimum 10 USDT");
    const newPoints = Math.floor(amount / PRICE);
    await updateDoc(doc(db, 'users', user.uid), { pending: increment(newPoints) });
    setPending(p => p + newPoints);
    setUsdt('');
    alert(`Success! ${newPoints.toLocaleString()} points locked.\nSend ${amount} USDT to:\n${WALLET}\nMemo: ${user.email}`);
  };

  const copyWallet = () => { navigator.clipboard.writeText(WALLET); alert("Wallet copied!"); };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: `url(${BACKGROUND}) center/cover fixed` }}>
        <div className="absolute inset-0 bg-black/95"></div>
        <div className="relative z-10 text-center text-white max-w-xl px-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
          <p className="text-4xl mt-6 mb-10">Private Sale Live</p>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-5 px-12 rounded-full text-2xl font-bold inline-block animate-pulse mb-12">
            FIRST 100 BUYERS = 10% BONUS!
          </div>
          <input className="w-full p-6 mb-5 rounded-2xl bg-white/10 backdrop-blur text-xl" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-6 mb-8 rounded-2xl bg-white/10 backdrop-blur text-xl" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={register} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-3xl py-7 rounded-2xl shadow-2xl hover:scale-105 transition">
            JOIN PRIVATE SALE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: `url(${BACKGROUND}) center/cover fixed` }}>
      <div className="absolute inset-0 bg-black/90"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
          <p className="text-3xl mt-4">Welcome back, {user.email.split('@')[0]} Crown</p>
          <button onClick={logout} className="mt-6 bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full font-bold text-xl transition">
            Logout
          </button>
        </div>

        <div className="text-4xl font-mono text-yellow-400 mb-12">{timeLeft}</div>

        {/* Dashboard Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-4 border-yellow-600 shadow-2xl max-w-3xl w-full text-center">
          <h2 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            {(points + pending).toLocaleString()}
          </h2>
          <p className="text-4xl mt-4 mb-2">Your $REIGNCOIN Points</p>
          {pending > 0 && <p className="text-2xl text-orange-400 mb-8">(incl. {pending.toLocaleString()} pending)</p>}

          {/* Top Up */}
          <div className="bg-black/40 rounded-2xl p-10 mb-10 border border-yellow-600">
            <input
              type="number"
              placeholder="Enter USDT amount (min 10)"
              className="w-full p-6 mb-6 rounded-xl bg-black/60 text-4xl text-center text-yellow-400 placeholder-yellow-600/50"
              value={usdt}
              onChange={e => setUsdt(e.target.value)}
            />
            <p className="text-6xl font-bold text-green-400 mb-8">
              = {usdt ? Math.floor(parseFloat(usdt) / PRICE).toLocaleString() : '0'} $REIGNCOIN
            </p>
            <button onClick={lockPoints} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold text-4xl py-8 rounded-2xl shadow-2xl hover:scale-105 transition">
              LOCK POINTS & COPY WALLET
            </button>
          </div>

          {/* Wallet */}
          <p className="text-2xl mb-4 opacity-90">Send USDT (BNB Chain) to:</p>
          <code onClick={copyWallet} className="block bg-black/70 p-6 rounded-2xl text-yellow-300 text-xl break-all cursor-pointer hover:bg-black/90 border-2 border-yellow-600 font-mono">
            {WALLET}
          </code>
          <p className="mt-8 text-4xl font-bold text-red-500">Memo: {user.email}</p>
        </div>
      </div>
    </div>
  );
}
