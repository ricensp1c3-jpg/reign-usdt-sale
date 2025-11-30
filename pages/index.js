import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const wallet = "bnb1jxjfrxx4v4whfx239paj3k6ecpjec7k4qc3gfs";

  // Countdown to Jan 30, 2026
  useEffect(() => {
    const target = new Date('2026-01-30T00:00:00Z').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft("SALE ENDED"); clearInterval(timer); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setPoints(snap.data().points || 0);
      }
    });
  }, []);

  const register = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), { email, points: 0, createdAt: new Date() });
      alert("Welcome to $REIGNCOIN!");
    } catch (e) { alert(e.message); }
  };

  const login = async () => {
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { alert(e.message); }
  };

  const format = (n) => n.toLocaleString();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
            <p className="text-3xl text-yellow-500 mt-2">The King of Memecoins</p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 px-8 rounded-full text-2xl font-bold mb-8 animate-pulse">
            FIRST 100 BUYERS = 10% BONUS POINTS!
          </div>

          <p className="text-3xl mb-2">Private Sale Live</p>
          <p className="text-2xl text-yellow-400 mb-6">1 $REIGN = 0.021 USDT</p>
          <p className="text-xl text-gray-400 mb-8">Distribution: January 30, 2026</p>

          <div className="space-y-4">
            <input className="w-full p-4 bg-gray-900 rounded-xl text-white text-lg" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="w-full p-4 bg-gray-900 rounded-xl" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={register} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold text-2xl py-5 rounded-xl shadow-2xl">JOIN PRIVATE SALE</button>
            <button onClick={login} className="w-full bg-gray-800 hover:bg-gray-700 py-4 rounded-xl text-xl">Already have account? Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
          <p className="text-2xl mt-3">Welcome back, {user.email.split('@')[0]}</p>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block bg-red-600 text-2xl font-bold px-10 py-4 rounded-full animate-pulse">
            FIRST 100 BUYERS = 10% BONUS!
          </div>
          <div className="mt-6 text-3xl font-mono text-yellow-400">{timeLeft}</div>
          <p className="text-gray-400 mt-2">until token distribution</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border-2 border-yellow-600 rounded-3xl p-10 text-center shadow-2xl">
          <h2 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            {format(points)} Points
          </h2>
          <p className="text-3xl mt-3">= {format(points)} $REIGNCOIN on Jan 30</p>

          <div className="grid grid-cols-3 gap-8 my-12">
            <div className="bg-gray-800 p-8 rounded-2xl border border-yellow-600"><p className="text-4xl font-bold text-green-400">{format(4762)}</p><p className="text-xl">100 USDT</p></div>
            <div className="bg-gray-800 p-8 rounded-2xl border border-yellow-600"><p className="text-4xl font-bold text-green-400">{format(23810)}</p><p className="text-xl">500 USDT</p></div>
            <div className="bg-gray-800 p-8 rounded-2xl border border-yellow-600"><p className="text-4xl font-bold text-green-400">{format(47619)}</p><p className="text-xl">1000 USDT</p></div>
          </div>

          <p className="text-2xl mb-6">Send USDT (BNB Chain) to:</p>
          <code className="block bg-black p-6 rounded-xl font-mono text-yellow-300 text-xl break-all border-2 border-yellow-600">{wallet}</code>

          <p className="mt-12 text-3xl font-bold text-red-500">Memo: {user.email}</p>
          <p className="mt-4 text-gray-400 text-lg">Points credited within 12h (or instantly if you message me)</p>
        </div>
      </div>
    </div>
  );
}
