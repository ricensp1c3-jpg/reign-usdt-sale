import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';

const LOGO_URL = "https://i.ibb.co/0jD7g1N/reigncoin-logo-gold-crown.png"; // your premium logo hosted

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [pending, setPending] = useState(0);
  const [usdt, setUsdt] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const wallet = "bnb1jxjfrxx4v4whfx239paj3k6ecpjec7k4qc3gfs";
  const price = 0.021;

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date('2026-01-30T00:00:00Z') - new Date();
      if (diff <= 0) return setTimeLeft("SALE ENDED");
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          setPoints(snap.data().points || 0);
          setPending(snap.data().pending || 0);
        }
      }
    });
  }, []);

  const register = async () => { try { const c = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, 'users', c.user.uid), { email, points: 0, pending: 0 }); } catch (e) { alert(e.message
