import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode';
import { auth, db } from '../firebase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [qr, setQr] = useState('');
  const wallet = "bnb1jxjfrxx4v4whfx239paj3k6ecpjec7k4qc3gfs";

  useEffect(() => {
    QRCode.toDataURL(wallet).then(setQr);
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
      alert("Registered! Welcome to $REIGNCOIN 👑");
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
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
          <p className="text-2xl mt-4">Private Sale • 1 $REIGN = 0.021 USDT</p>
          <p className="text-yellow-400 text-lg mt-2">Distribution: January 30, 2026</p>
          <div className="mt-10 space-y-4">
            <input className="w-full p-4 bg-gray-900 rounded-lg text-white" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="w-full p-4 bg-gray-900 rounded-lg" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={register} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-lg text-xl">REGISTER</button>
              <button onClick={login} className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-lg text-xl">LOGIN</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">$REIGNCOIN</h1>
          <p className="text-2xl mt-2">Welcome, {user.email.split('@')[0]} 👑</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600 rounded-2xl p-8 text-center">
          <h2 className="text-6xl font-bold text-yellow-400">{format(points)} Points</h2>
          <p className="text-2xl mt-2">= {format(points)} $REIGNCOIN on Jan 30</p>

          <div className="grid grid-cols-3 gap-6 my-10 text-center">
            <div className="bg-gray-800 p-6 rounded-xl"><p className="text-3xl font-bold text-green-400">{format(4762)}</p><p>100 USDT</p></div>
            <div className="bg-gray-800 p-6 rounded-xl"><p className="text-3xl font-bold text-green-400">{format(23810)}</p><p>500 USDT</p></div>
            <div className="bg-gray-800 p-6 rounded-xl"><p className="text-3xl font-bold text-green-400">{format(47619)}</p><p>1000 USDT</p></div>
          </div>

          <p className="text-xl mb-4">Send USDT (BNB Chain) →</p>
          <code className="block bg-gray-900 p-5 rounded-lg font-mono text-yellow-300 break-all text-lg">{wallet}</code>
          {qr && <img src={qr} alt="QR" className="mx-auto mt-6 w-80 h-80 border-4 border-yellow-500 rounded-2xl" />}
          <p className="mt-6 text-red-400 font-bold text-xl">Memo / Comment: {user.email}</p>
          <p className="mt-4 text-gray-400">Points added manually within 12h (or instantly if you tell me)</p>
        </div>
      </div>
    </div>
  );
}
