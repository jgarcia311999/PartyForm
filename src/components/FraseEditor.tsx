import { useState, useRef } from 'react';

export default function FraseEditor() {
  const [texto, setTexto] = useState('');
  const [tipoJuego, setTipoJuego] = useState('Sin categoría');
  const [pantalla, setPantalla] = useState<'seleccion' | 'frase'>('frase');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<string[]>([]);
  const [castigo, setCastigo] = useState('1');
  const textAreaRef = useRef<HTMLDivElement>(null);

  const insertarMarcador = (marcador: string) => {
    const el = textAreaRef.current;
    if (!el) return;

    if (marcador === '{Jugador}') {
      const marcadorHTML = `&nbsp;<span contenteditable="false" style="background:#FFD700; color:#000; padding:2px 6px; border-radius:8px; margin:0 2px; display:inline-block;">Jugador</span>&nbsp;`;
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


  const enviar = async () => {
    if (!tipoJuego || texto.trim().length < 10) {
      alert('Por favor, selecciona un tipo de juego y escribe una frase con al menos 10 caracteres.');
      return;
    }

    const textoPlano = textAreaRef.current?.innerText || '';

    const payload = {
      "Marca temporal": new Date().toISOString(),
      "¿Para que tipo de minijuego va?": tipoJuego,
      "Escribe tu frase": textoPlano,
      "Castigo": castigo,
    };

    try {
      const res = await fetch('https://api.sheetbest.com/sheets/e618ed34-13c6-4113-ac4e-5c4278ee1fcc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resultado = await res.text();
      if (res.ok) {
        alert('Frase enviada con éxito');
        window.location.reload();
      } else {
        alert(`Error al enviar: ${resultado}`);
      }
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
        height: '100dvh',
        width: '100dvw',
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        backgroundColor: '#f2f2f2',
      }}
    >
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #999;
          pointer-events: none;
          display: block;
        }
      `}</style>
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 0,
          width: '100%',
          height: '100%',
          padding: '1rem',
          overflow: 'hidden',
          textAlign: 'center',
          color: '#000',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFD700',
            padding: '2.5rem 0rem 2rem 0rem',
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            color: '#000',
            textAlign: 'center',
          }}
        >
          <h1 style={{
            fontSize: '32px',
            margin: 0,
            fontWeight: 'bold',
            letterSpacing: '-0.5px',
          }}>
            Crear nueva frase
          </h1>
          <p style={{ marginTop: '0.75rem', fontSize: '18px', opacity: 0.85 }}>
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
            {/* Eliminado el bloque de input editable aquí */}
            <div style={{ marginTop: '4rem', width: '100%', maxWidth: 320 }}>
  <div style={{
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '2px solid #780000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 360,
    position: 'relative'
  }}>
    <div style={{
      position: 'absolute',
      top: 16,
      left: 20,
      borderBottom: '1px solid #000',
      width: 'calc(100% - 40px)',
      paddingBottom: 4,
      fontWeight: 'bold',
      fontSize: '16px',
      color: '#000'
    }}>
      {tipoJuego || 'Sin categoría'}
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem', textAlign: 'center' }}>
      <div
        ref={textAreaRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setTexto(e.currentTarget.innerHTML)}
        style={{
          fontSize: 18,
          outline: 'none',
          minHeight: '40px',
          width: '100%',
          textAlign: 'center',
          color: '#000',
        }}
        data-placeholder="Escribe tu frase aquí..."
      ></div>
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <span style={{ fontSize: 14, color: '#555' }}>Bebe</span>
        <select
          value={castigo}
          onChange={(e) => setCastigo(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <span style={{ fontSize: 14, color: '#555' }}>{castigo === '1' ? 'chupito' : 'chupitos'}</span>
      </div>
      <img src="src/assets/munyeco_logo.png" alt="icono" style={{ width: 40, height: 40 }} />
    </div>
  </div>
</div>
            
            <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => insertarMarcador('{Jugador}')}
                style={{
                  padding: 12,
                  fontSize: 16,
                  borderRadius: '30px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: '#000',
                  border: '2px solid #FFD700',
                  minWidth: 120,
                }}
              >
                + Jugador
              </button>
              <button
                onClick={() => setPantalla('seleccion')}
                style={{
                  padding: 12,
                  fontSize: 16,
                  borderRadius: '30px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: '#000',
                  border: '2px solid #FFD700',
                  minWidth: 180,
                }}
              >
                Tipo de juego
              </button>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={enviar}
                disabled={!tipoJuego || texto.trim() === ''}
                style={{
                  width: '95%',
                  padding: 12,
                  fontSize: 16,
                  borderRadius: '30px',
                  cursor: 'pointer',
                  backgroundColor: '#FFD700',
                  color: '#000',
                  border: 'none',
                }}
              >
                Enviar frase
              </button>
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
              {['Sin categoría', '¡El Primero Que!', 'El Reloj Bomba', 'En 7 segundos', 'Todos los que…', '¿Quién es mas probable que…?']
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
                <button onClick={() => setPantalla('frase')} style={{ width: '95%', padding: 12, fontSize: 16, borderRadius: '30px', cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>Siguiente</button>
              </div>
            )}
          </div>
          {pantalla === 'seleccion' && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <button onClick={() => setPantalla('frase')} style={{ width: '95%', padding: 12, fontSize: 16, borderRadius: '30px', cursor: 'pointer', backgroundColor: '#FFD700', color: '#000', border: 'none' }}>⬅ Atrás</button>
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