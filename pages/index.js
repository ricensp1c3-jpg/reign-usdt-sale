import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';

const BACKGROUND_LOGO = "https://i.ibb.co/5Yx0v1K/reigncoin-logo-background.png";
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

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date('2026-01-30T00:00:00Z') - new Date();
      if (diff <= 0) {
        setTimeLeft("SALE ENDED");
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          setPoints(snap.data().points || 0);
          setPending(snap.data().pending || 0);
        }
      }
    });
    return unsub;
  }, []);

  const register = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), { email, points: 0, pending: 0 });
    } catch (e) {
      alert(e.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      alert(e.message);
    }
  };

  const lockPoints = async () => {
    const amount = parseFloat(usdt);
    if (!amount || amount < 10) return alert("Minimum 10 USDT");
    const newPoints = Math.floor(amount / PRICE);
    await updateDoc(doc(db, 'users', user.uid), { pending: increment(newPoints) });
    setPending(p => p + newPoints);
    setUsdt('');
    alert(`Locked ${newPoints.toLocaleString()} points!\nSend ${amount} USDT to:\n${WALLET}\nMemo: ${user.email}`);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(WALLET);
    alert("Wallet address copied!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: `url(${BACKGROUND_LOGO}) center/cover no-repeat fixed` }}>
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="relative z-10 text-center text-white max-w-2xl px-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
          <p className="text-4xl mt-6 mb-10">Private Sale • 1 $REIGN = 0.021 USDT</p>
          <div className="bg-red-600 inline-block px-10 py-4 rounded-full text-2xl font-bold animate-pulse mb-10">
            FIRST 100 BUYERS = 10% BONUS!
          </div>
          <input className="w-full p-5 mb-4 rounded-xl bg-white/10 backdrop-blur text-xl" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-5 mb-6 rounded-xl bg-white/10 backdrop-blur text-xl" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={register} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-3xl py-6 rounded-xl shadow-2xl hover:scale-105 transition">
            JOIN PRIVATE SALE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: `url(${BACKGROUND_LOGO}) center/cover no-repeat fixed` }}>
      <div className="absolute inset-0 bg-black opacity-90"></div>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-6 text-center">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
        <p className="text-3xl mt-4 mb-8">Welcome, {user.email.split('@')[0]} Crown</p>
        <div className="text-4xl font-mono text-yellow-400 mb-10">{timeLeft}</div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-4 border-yellow-600 max-w-2xl w-full">
          <h2 className="text-8xl font-bold text-yellow-400">{(points + pending).toLocaleString()}</h2>
          <p className="text-3xl mb-8">Total Points {pending > 0 && `(incl. ${pending.toLocaleString()} pending)`}</p>

          <input
            type="number"
            placeholder="Enter USDT amount (min 10)"
            className="w-full p-6 rounded-xl bg-black/50 text-3xl text-center text-yellow-400 mb-6"
            value={usdt}
            onChange={e => setUsdt(e.target.value)}
          />
          <p className="text-5xl font-bold text-green-400 mb-8">
            = {usdt ? Math.floor(parseFloat(usdt) / PRICE).toLocaleString() : '0'} $REIGNCOIN
          </p>
          <button onClick={lockPoints} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-3xl py-8 rounded-xl hover:scale-105 transition shadow-2xl mb-10">
            LOCK POINTS & COPY ADDRESS
          </button>

          <p className="text-2xl mb-4">Send USDT (BNB Chain) →</p>
          <code onClick={copyWallet} className="block bg-black/70 p-6 rounded-xl text-yellow-300 text-xl break-all cursor-pointer hover:bg-black/90">
            {WALLET}
          </code>
          <p className="mt-6 text-3xl font-bold text-red-500">Memo: {user.email}</p>
        </div>
      </div>
    </div>
  );
}
