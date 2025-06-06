import React, { useState, useRef } from 'react';

export default function FraseEditor() {
  const [texto, setTexto] = useState('');
  const [jugadores, setJugadores] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const insertarMarcador = (marcador: string) => {
    const el = textAreaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nuevoTexto = texto.slice(0, start) + marcador + texto.slice(end);
    setTexto(nuevoTexto);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + marcador.length;
    }, 0);
  };

  const enviar = async () => {
    const payload = {
      frase: texto,
      jugadores,
      fecha: new Date().toISOString(),
    };

    try {
      const res = await fetch('https://sheet.best/api/sheets/YOUR_SHEET_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      alert(res.ok ? 'Frase enviada con éxito' : 'Error al enviar');
    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Crear nueva frase</h1>
      <textarea
        ref={textAreaRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{ width: '100%', height: 100 }}
      />
      <div style={{ margin: '1rem 0' }}>
        <button onClick={() => insertarMarcador('{Jugador1}')} style={{ marginRight: 8 }}>
          + Jugador 1
        </button>
        <button onClick={() => insertarMarcador('{Jugador2}')}>+ Jugador 2</button>
      </div>
      <label>¿Cuántos jugadores implica?</label>
      <select value={jugadores} onChange={(e) => setJugadores(Number(e.target.value))}>
        <option value={0}>Ninguno</option>
        <option value={1}>Uno</option>
        <option value={2}>Dos</option>
      </select>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={enviar}>Enviar frase</button>
      </div>
    </div>
  );
}