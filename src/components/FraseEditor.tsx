import { useState, useRef } from 'react';

export default function FraseEditor() {
  const [texto, setTexto] = useState('');
  const [tipoJuego, setTipoJuego] = useState('');
  const [opcionesColapsadas, setOpcionesColapsadas] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<string[]>([]);
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

  const mostrarEjemplosTipoJuego = (tipo: string) => {
    const ejemplos: Record<string, string[]> = {
      '¡El Primero Que!': ['El primero que toque algo rojo.', 'El primero que se ponga de pie.'],
      'Todos los que…': ['Todos los que han viajado este año.', 'Todos los que han llorado viendo una peli.'],
      'En 7 segundos': ['Haz 5 sentadillas.', 'Di 3 canciones de reggaetón.'],
      '¿Quién crees que es mas probable que…?': ['¿Quién es más probable que se quede dormido en una fiesta?', '¿Quién es más probable que mande un mensaje a su ex?'],
      'El Reloj Bomba': ['Di un color y toca algo de ese color.', 'Haz una pregunta absurda a alguien.'],
    };

    setModalTitle(`${tipo}`);
    setModalContent(ejemplos[tipo] || []);
    setModalVisible(true);
  };

  const mostrarEjemplosJugadores = () => {
    alert(`Usa {Jugador1} y {Jugador2} para insertar jugadores:
- {Jugador1} tiene que imitar a {Jugador2}
- {Jugador2} le cuenta un secreto a {Jugador1}`);
  };

  const enviar = async () => {
    const payload = {
      "Marca temporal": new Date().toISOString(),
      "¿Para que tipo de minijuego va?": tipoJuego,
      "Escribe tu frase": texto,
    };

    try {
      const res = await fetch('https://api.sheetbest.com/sheets/e618ed34-13c6-4113-ac4e-5c4278ee1fcc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resultado = await res.text();
      alert(res.ok ? 'Frase enviada con éxito' : `Error al enviar: ${resultado}`);
    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ padding: 20, maxWidth: 600, width: '100%' }}>
        <h1>Crear nueva frase</h1>

        {/* Tipo de juego */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Elige el tipo de juego</label>
          {opcionesColapsadas && (
            <div style={{ marginBottom: '0.5rem' }}>
              <button onClick={() => setOpcionesColapsadas(false)} style={{ cursor: 'pointer' }}>⬅ Mostrar todas</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              '¡El Primero Que!',
              'El Reloj Bomba',
              'En 7 segundos',
              'Todos los que…',
              '¿Quién es mas probable que…?',
            ]
              .filter((opcion) => !opcionesColapsadas || opcion === tipoJuego)
              .map((opcion) => (
                <div key={opcion} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setTipoJuego(opcion);
                      setOpcionesColapsadas(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: tipoJuego === opcion ? '2px solid #0070f3' : '1px solid #ccc',
                      backgroundColor: tipoJuego === opcion ? '#e0f0ff' : '#fff',
                      color: tipoJuego === opcion ? '#0070f3' : '#000',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {opcion}
                  </button>
                  <button onClick={() => mostrarEjemplosTipoJuego(opcion)} style={btnInfoStyle}>?</button>
                </div>
              ))}
          </div>
        </div>

        {tipoJuego && (
          <>
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
          </>
        )}
      </div>
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        content={modalContent}
      />
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

function Modal({ visible, onClose, title, content }: { visible: boolean, onClose: () => void, title: string, content: string[] }) {
  if (!visible) return null;

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h3>{title}</h3>
        <ul>
          {content.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <button onClick={onClose} style={{ marginTop: '1rem' }}>Cerrar</button>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: 'fixed' as const,
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '90%',
  marginLeft: '5%',
  marginRight: '5%',
  textAlign: 'left' as const,
  color: '#000',
};