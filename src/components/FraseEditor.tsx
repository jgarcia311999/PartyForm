import { useState, useRef } from 'react';

export default function FraseEditor() {
  const [texto, setTexto] = useState('');
  const [tipoJuego, setTipoJuego] = useState('');
  const tiposConJugadores = [
    '¡El Primero Que!',
    'El Reloj Bomba',
    '¿Quién crees que es mas probable que…?',
  ];
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

  const mostrarEjemplosTipoJuego = () => {
    alert(`Ejemplos por tipo de juego:

¡El Primero Que!
- El primero que toque algo rojo.
- El primero que se ponga de pie.

Todos los que…
- Todos los que han viajado este año.
- Todos los que han llorado viendo una peli.

En 7 segundos
- Haz 5 sentadillas.
- Di 3 canciones de reggaetón.

¿Quién crees que es más probable que…?
- ¿Quién es más probable que se quede dormido en una fiesta?
- ¿Quién es más probable que mande un mensaje a su ex?

El Reloj Bomba
- Di un color y toca algo de ese color.
- Haz una pregunta absurda a alguien.`);
  };

  const mostrarEjemplosJugadores = () => {
    alert(`Usa {Jugador1} y {Jugador2} para insertar jugadores:
- {Jugador1} tiene que imitar a {Jugador2}
- {Jugador2} le cuenta un secreto a {Jugador1}`);
  };

  const enviar = async () => {
    const payload = {
      frase: texto,
      tipoJuego,
      fecha: new Date().toISOString(),
    };

    try {
      const res = await fetch('https://api.sheetbest.com/sheets/e618ed34-13c6-4113-ac4e-5c4278ee1fcc', {
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ padding: 20, maxWidth: 600, width: '100%' }}>
        <h1>Crear nueva frase</h1>

        {/* Tipo de juego */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Elige el tipo de juego</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              '¡El Primero Que!',
              'El Reloj Bomba',
              'En 7 segundos',
              'Todos los que…',
              '¿Quién crees que es mas probable que…?',
              
            ].map((opcion) => (
              <button
                key={opcion}
                onClick={() => setTipoJuego(opcion)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: tipoJuego === opcion ? '2px solid #0070f3' : '1px solid #ccc',
                  backgroundColor: tipoJuego === opcion ? '#e0f0ff' : '#fff',
                  color: tipoJuego === opcion ? '#0070f3' : '#000',
                  cursor: 'pointer',
                }}
              >
                {opcion}
              </button>
            ))}
            <button onClick={mostrarEjemplosTipoJuego} style={btnInfoStyle}>?</button>
          </div>
        </div>

        {/* Frase */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Frase</label>
          <textarea
            ref={textAreaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            style={{ width: '100%', height: 100, marginTop: 4 }}
          />
          {tiposConJugadores.includes(tipoJuego) && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={() => insertarMarcador('{Jugador1}')}>+ Jugador 1</button>
              <button onClick={() => insertarMarcador('{Jugador2}')}>+ Jugador 2</button>
              <button onClick={mostrarEjemplosJugadores} style={btnInfoStyle}>?</button>
            </div>
          )}
        </div>

        {/* Enviar */}
        <div style={{ marginTop: '1rem' }}>
          <button onClick={enviar}>Enviar frase</button>
        </div>
      </div>
    </div>
  );
}

const btnInfoStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: '1px solid #ccc',
  backgroundColor: '#f0f0f0',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  lineHeight: '1',
};