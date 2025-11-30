import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';

const WALLET = "bnb1jxjfrxx4v4whfx239paj3k6ecpjec7k4qc3gfs";
const PRICE = 0.021;

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [pending, setPending] = useState(0);
  const [usdt, setUsdt] = useState('');

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

  const register = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), { email, points: 0, pending: 0 });
    } catch (e) { alert(e.message); }
  };

  const login = async () => {
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { alert(e.message); }
  };

  const logout = async () => { await signOut(auth); };

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
    alert("Wallet copied!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md w-full px-8">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent mb-12">$REIGNCOIN</h1>
          
          <input
            className="w-full p-5 mb-5 rounded-xl bg-white/10 backdrop-blur text-xl text-center"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full p-5 mb-8 rounded-xl bg-white/10 backdrop-blur text-xl text-center"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <div className="space-y-4">
            <button onClick={register} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-2xl py-5 rounded-xl shadow-2xl hover:scale-105 transition">
              Register
            </button>
            <button onClick={login} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-2xl py-5 rounded-xl transition">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center text-white max-w-2xl w-full">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">$REIGNCOIN</h1>
        <p className="text-3xl mb-8">Welcome, {user.email.split('@')[0]}</p>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-4 border-yellow-600 shadow-2xl">
          <h2 className="text-9xl font-bold text-yellow-400">{(points + pending).toLocaleString()}</h2>
          <p className="text-4xl mt-4 mb-10">Your Points</p>

          <input
            type="number"
            placeholder="Enter USDT amount"
            className="w-full p-6 mb-6 rounded-xl bg-black/50 text-4xl text-center text-yellow-400"
            value={usdt}
            onChange={e => setUsdt(e.target.value)}
          />
          <p className="text-5xl font-bold text-green-400 mb-10">
            = {usdt ? Math.floor(parseFloat(usdt) / PRICE).toLocaleString() : '0'} $REIGNCOIN
          </p>

          <button onClick={lockPoints} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-3xl py-8 rounded-2xl hover:scale-105 transition shadow-2xl mb-10">
            LOCK POINTS & COPY WALLET
          </button>

          <code onClick={copyWallet} className="block bg-black/70 p-6 rounded-2xl text-yellow-300 text-xl break-all cursor-pointer hover:bg-black/90 border-2 border-yellow-600 font-mono">
            {WALLET}
          </code>
          <p className="mt-8 text-3xl font-bold text-red-500">Memo: {user.email}</p>

          <button onClick={logout} className="mt-12 bg-red-600 hover:bg-red-700 px-10 py-4 rounded-full font-bold text-xl transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
