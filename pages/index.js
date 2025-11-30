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

  const register = async () => { try { const c = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, 'users', c.user.uid), { email, points: 0, pending: 0 }); } catch (e) { alert(e.message); } };
  const login = async () => { try { await signInWithEmailAndPassword(auth, email, password); } catch (e) { alert(e.message); } };
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

  const copyWallet = () => { navigator.clipboard.writeText(WALLET); alert("Wallet copied!"); };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        {/* Logo + Title */}
        <div className="text-center mb-16">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
            $REIGNCOIN
          </h1>
        </div>

        {/* Not Logged In */}
        {!user ? (
          <div className="text-center space-y-8">
            <input className="w-full p-6 rounded-2xl bg-white/10 backdrop-blur text-xl text-center text-white placeholder-gray-400" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="w-full p-6 rounded-2xl bg-white/10 backdrop-blur text-xl text-center text-white" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="space-y-6">
              <button onClick={register} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-3xl py-7 rounded-2xl shadow-2xl hover:scale-105 transition">
                Register
              </button>
              <button onClick={login} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-3xl py-7 rounded-2xl transition">
                Login
              </button>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="text-center space-y-12">
            <p className="text-4xl text-gray-300">Welcome, {user.email.split('@')[0]}</p>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-4 border-yellow-600">
              <h2 className="text-9xl font-bold text-yellow-400">{(points + pending).toLocaleString()}</h2>
              <p className="text-4xl mt-4 text-gray-300">Your Points</p>
              {pending > 0 && <p className="text-2xl text-orange-400 mt-2">({pending.toLocaleString()} pending)</p>}
            </div>

            <input
              type="number"
              placeholder="Enter USDT amount"
              className="w-full p-8 rounded-2xl bg-black/50 text-5xl text-center text-yellow-400"
              value={usdt}
              onChange={e => setUsdt(e.target.value)}
            />
            <p className="text-6xl font-bold text-green-400">
              = {usdt ? Math.floor(parseFloat(usdt) / PRICE).toLocaleString() : '0'} $REIGNCOIN
            </p>

            <button onClick={lockPoints} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-4xl py-10 rounded-2xl hover:scale-105 transition shadow-2xl">
              LOCK POINTS & COPY WALLET
            </button>

            <code onClick={copyWallet} className="block bg-black/70 p-8 rounded-2xl text-yellow-300 text-2xl break-all cursor-pointer hover:bg-black/90 border-2 border-yellow-600 font-mono">
              {WALLET}
            </code>
            <p className="text-4xl font-bold text-red-500">Memo: {user.email}</p>

            <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-12 py-5 rounded-full font-bold text-2xl transition">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
