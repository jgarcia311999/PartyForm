import { useState, useRef } from 'react';

export default function FraseEditor() {
  const [texto, setTexto] = useState('');
  const [tipoJuego, setTipoJuego] = useState('');
  const [pantalla, setPantalla] = useState<'seleccion' | 'frase'>('frase');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<string[]>([]);
  const tiposConJugadores = [
    '¡El Primero Que!',
    'El Reloj Bomba',
    '¿Quién crees que es mas probable que…?',
  ];
  const textAreaRef = useRef<HTMLDivElement>(null);

  const insertarMarcador = (marcador: string) => {
    const el = textAreaRef.current;
    if (!el) return;

    if (marcador === '{Jugador}') {
      const marcadorHTML = ` <span contenteditable="false" style="background:#FFD700; color:#000; padding:2px 6px; border-radius:8px; margin:0 2px; display:inline-block;">Jugador</span> `;
      // Insert HTML at cursor position in contenteditable div
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const tempEl = document.createElement('div');
      tempEl.innerHTML = marcadorHTML;
      const frag = document.createDocumentFragment();
      let node;
      while ((node = tempEl.firstChild)) {
        frag.appendChild(node);
      }
      range.insertNode(frag);

      // Move cursor after inserted node
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      // Update state with new innerHTML
      setTexto(el.innerHTML);
    } else {
      // For other markers, insert plain text
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(marcador);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      setTexto(el.innerHTML);
    }
    el.focus();
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
    // Convert innerHTML to plain text, removing HTML tags
    const el = textAreaRef.current;
    let textoPlano = texto;
    if (el) {
      textoPlano = el.innerText || el.textContent || texto;
    }

    const payload = {
      "Marca temporal": new Date().toISOString(),
      "¿Para que tipo de minijuego va?": tipoJuego,
      "Escribe tu frase": textoPlano,
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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        boxSizing: 'border-box',
        paddingTop: '5vh',
        padding: 8,
        backgroundColor: '#f2f2f2',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          width: '95%',
          maxWidth: 400,
          padding: '2.5rem 1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          textAlign: 'center',
          color: '#000',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFD700',
            padding: '2rem 1rem',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
            margin: '-2rem -2rem 2rem -2rem',
            color: '#000',
            textAlign: 'center',
          }}
        >
          <h1 style={{
            fontSize: '28px',
            margin: 0,
            fontWeight: 'bold',
            letterSpacing: '-0.5px',
          }}>
            Crear nueva frase
          </h1>
          <p style={{ marginTop: '0.75rem', fontSize: '16px', opacity: 0.85 }}>
            Comparte tu creatividad
          </p>
        </div>

        {/* Pantalla frase */}
        {pantalla === 'frase' && (
          <div
            style={{
              transition: 'all 0.4s ease',
              opacity: pantalla === 'frase' ? 1 : 0,
              height: pantalla === 'frase' ? 'auto' : 0,
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              {pantalla === 'frase' && tiposConJugadores.includes(tipoJuego) && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={() => insertarMarcador('{Jugador1}')} style={{ fontSize: 14, padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>+ Jugador 1</button>
                  <button onClick={() => insertarMarcador('{Jugador2}')} style={{ fontSize: 14, padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>+ Jugador 2</button>
                  <button onClick={mostrarEjemplosJugadores} style={{ ...btnInfoStyle, fontSize: 14, padding: '8px 12px', borderRadius: '6px', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>?</button>
                </div>
              )}
              <label style={{ fontSize: '16px', lineHeight: '20px' }}>Frase</label>
              <div
                ref={textAreaRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setTexto(e.currentTarget.innerHTML)}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  margin: 0,
                  height: 100,
                  marginTop: 8,
                  fontSize: 16,
                  lineHeight: '24px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f5f5f5',
                  color: '#000',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={enviar} disabled={!tipoJuego || texto.trim() === ''} style={{ padding: 12, fontSize: 16, borderRadius: 8, cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none', minWidth: 120 }}>Enviar frase</button>
              <button onClick={() => insertarMarcador('{Jugador}')} style={{ marginLeft: '0.5rem', padding: 12, fontSize: 16, borderRadius: 8, cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none', minWidth: 120 }}>+ Jugador</button>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button onClick={() => setPantalla('seleccion')} style={{ width: '95%', padding: 12, fontSize: 16, borderRadius: 8, cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>Cambiar tipo de frase</button>
            </div>
          </div>
        )}

        {/* Pantalla seleccion */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              transition: 'all 0.4s ease',
              opacity: pantalla === 'seleccion' ? 1 : 0,
              height: pantalla === 'seleccion' ? 'auto' : 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['¡El Primero Que!', 'El Reloj Bomba', 'En 7 segundos', 'Todos los que…', '¿Quién es mas probable que…?']
                .map((opcion) => (
                  <div
                    key={opcion}
                    onClick={() => {
                      setTipoJuego(opcion);
                      setPantalla('frase');
                    }}
                    style={{
                      border: tipoJuego === opcion ? '2px solid #FFD700' : '1px solid #ddd',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      backgroundColor: tipoJuego === opcion ? '#fff8b3' : '#fff',
                      color: '#333',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '16px',
                      lineHeight: '20px',
                    }}
                  >
                    <span>{opcion}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mostrarEjemplosTipoJuego(opcion);
                      }}
                      style={{ ...btnInfoStyle, backgroundColor: '#FFD700', color: '#000', border: 'none' }}
                    >
                      ?
                    </button>
                  </div>
                ))}
            </div>
            {tipoJuego && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button onClick={() => setPantalla('frase')} style={{ width: '95%', padding: 12, fontSize: 16, borderRadius: 8, cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>Siguiente</button>
              </div>
            )}
          </div>
          {pantalla === 'seleccion' && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <button onClick={() => setPantalla('frase')} style={{ width: '95%', padding: 12, fontSize: 16, borderRadius: 8, cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>⬅ Atrás</button>
            </div>
          )}
        </div>
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
  width: '95%',
  maxWidth: '95%',
  marginLeft: '2.5%',
  marginRight: '2.5%',
  textAlign: 'left' as const,
  color: '#000',
  boxSizing: 'border-box' as const,
};