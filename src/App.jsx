import React, { useState } from 'react';

export default function ManningAudioGuidedResponsive() {
  // State Parameter Saluran Terbuka (Persamaan Manning)
  const [n, setN] = useState(0.013); // Koefisien Kekasaran Manning
  const [s, setS] = useState(0.001); // Kemiringan Dasar Saluran (S)
  const [y, setY] = useState(1.0);   // Kedalaman Air (y) dalam meter
  const [b] = useState(3.0);         // Lebar Saluran (b) konstan

  // State Audio
  const [activeAudioLabel, setActiveAudioLabel] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Perhitungan Hidrolika
  const area = b * y;
  const perimeter = b + 2 * y;
  const R = area / perimeter; // Jari-jari Hidrolik
  const V = (1 / n) * Math.pow(R, 2/3) * Math.pow(s, 1/2); // Kecepatan (m/s)
  const Q = V * area; // Debit (m³/s)

  // LOGIKA RESPONSIF ANIMASI:
  // 1. Durasi animasi partikel air (semakin besar V, durasi semakin kecil / makin cepat gerakannya)
  const particleAnimationDuration = Math.max(0.2, 3.0 - (V * 0.35));

  // 2. Kategori status aliran berdasarkan Kecepatan V
  let flowStatus = "Aliran Tenang / Subkritis";
  let flowColor = "#0284c7";
  if (V > 2.5) {
    flowStatus = "Aliran Cepat / Superkritis (Waspada Erosi)";
    flowColor = "#ea580c";
  } else if (V > 1.5) {
    flowStatus = "Aliran Normal & Stabil";
    flowColor = "#16a34a";
  }

  // Fungsi Web Speech API
  const playAudioGuide = (label, text) => {
    if (!('speechSynthesis' in window)) {
      alert("Browser Anda tidak mendukung Text-to-Speech.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveAudioLabel(label);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveAudioLabel('');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveAudioLabel('');
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333', padding: '16px' }}>
      
      {/* Header & Judul Modul */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase' }}>Audio-Guided Interactive Simulation</span>
          <h2 style={{ "text-align": "center"}}>Aliran Saluran Terbuka </h2>
        </div>
        
        <div>
          <button 
            onClick={() => playAudioGuide('Pengantar Umum', 'Selamat datang di simulasi audio terpandu saluran terbuka. Ubah parameter slider di bawah untuk melihat animasi air dan kecepatan aliran merespons secara langsung.')}
            style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            🎧 Putar Panduan
          </button>
        </div>
      </div>

      {/* CANVAS UTAMA SIMULASI (Animasi Responsif Penuh) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', background: '#f8fafc', padding: '20px', marginBottom: '20px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: '#475569' }}>Visualisasi Penampang & Dinamika Aliran</h4>
          <span style={{ fontSize: '12px', background: flowColor, color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
            {flowStatus}
          </span>
        </div>

        {/* Area Gambar Simulasi Saluran yang Responsif */}
        <div style={{ height: '190px', background: '#0f172a', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          
          {/* Garis Kemiringan Dinding Saluran (Miring tipis merepresentasikan S) */}
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: '30px', 
            right: '30px', 
            height: '150px', 
            borderBottom: '4px solid #64748b', 
            borderLeft: '4px solid #64748b', 
            borderRight: '4px solid #64748b', 
            borderRadius: '0 0 6px 6px',
            transform: `rotate(${s * 800}deg)`, // Animasi kemiringan visual bereaksi terhadap S
            transition: 'transform 0.4s ease'
          }} />

          {/* Badan Air (Tinggi merespons langsung variabel y secara real-time) */}
          <div style={{ 
            position: 'absolute', 
            bottom: '4px', 
            left: '34px', 
            right: '34px', 
            height: `${Math.min(y * 55, 135)}px`, 
            background: 'linear-gradient(180deg, rgba(56,189,248,0.55) 0%, rgba(2,132,199,0.85) 100% )',
            transition: 'height 0.25s ease-out'
          }}>
            {/* Animasi Partikel Aliran: Kecepatan bergerak responsif terhadap nilai V */}
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: `${15 + (i * 16)}px`,
                  left: `${(i * 18) % 85}%`,
                  color: '#bae6fd',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  opacity: 0.85,
                  animation: `responsiveFlow ${particleAnimationDuration}s linear infinite`
                }}>
                  {V > 2.0 ? '⚡ ➔' : '➔'}
                </div>
              ))}
            </div>
          </div>

          {/* HUD Metrik Real-Time di Dalam Kanvas */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '6px', color: '#fff', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            ⚡ Kecepatan (V): <b>{V.toFixed(2)} m/s</b><br />
            🌊 Debit Saluran (Q): <b>{Q.toFixed(2)} m³/s</b>
          </div>

          {/* AUDIO HOTSPOT: Tombol Audio Geometri */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <button 
              onClick={() => playAudioGuide('Geometri Saluran', `Kedalaman air saat ini ${y} meter menghasilkan jari-jari hidrolik R sebesar ${R.toFixed(2)} meter. Perhatikan animasi tinggi air dan laju partikel yang menyesuaikan.`)}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '20px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              🔊 Audio Geometri
            </button>
          </div>

        </div>
      </div>

      {/* PANEL KONTROL PARAMETER & AUDIO HOTSPOTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        
        {/* Kontrol 1: Kekasaran n */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Kekasaran (n): {n}</span>
            <button 
              onClick={() => playAudioGuide('Koefisien Kekasaran n', `Koefisien kekasaran n bernilai ${n}. Semakin besar n, hambatan dinding meningkat dan laju partikel air pada animasi akan melambat.`)}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px', fontSize: '10px', cursor: 'pointer' }}>
              🔊 Dengar
            </button>
          </div>
          <input 
            type="range" min="0.010" max="0.030" step="0.001" value={n} 
            onChange={(e) => setN(parseFloat(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Kontrol 2: Kemiringan S */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Kemiringan (S): {s}</span>
            <button 
              onClick={() => playAudioGuide('Kemiringan Dasar S', `Kemiringan dasar S bernilai ${s}. Mengubah nilai ini akan langsung memengaruhi kemiringan visual saluran dan mempercepat laju aliran air.`)}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px', fontSize: '10px', cursor: 'pointer' }}>
              🔊 Dengar
            </button>
          </div>
          <input 
            type="range" min="0.0001" max="0.005" step="0.0002" value={s} 
            onChange={(e) => setS(parseFloat(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Kontrol 3: Kedalaman Air y */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Kedalaman (y): {y}m</span>
            <button 
              onClick={() => playAudioGuide('Kedalaman Air y', `Kedalaman air y bernilai ${y} meter. Tinggi blok air pada animasi kanvas akan naik atau turun secara proporsional.`)}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px', fontSize: '10px', cursor: 'pointer' }}>
              🔊 Dengar
            </button>
          </div>
          <input 
            type="range" min="0.3" max="2.0" step="0.1" value={y} 
            onChange={(e) => setY(parseFloat(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

      </div>

      {/* WIDGET STATUS AUDIO AKTIF */}
      {isSpeaking && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '8px', fontSize: '13px', color: '#0369a1' }}>
          <span>🎧 <b>Audio Guide [{activeAudioLabel}]:</b> Sedang memutar penjelasan...</span>
          <button onClick={stopAudio} style={{ padding: '3px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
            Hentikan
          </button>
        </div>
      )}

      {/* CSS Keyframes untuk Kecepatan Animasi Aliran yang Dinamis */}
      <style>{`
        @keyframes responsiveFlow {
          0% { transform: translateX(-15px); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(380px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}