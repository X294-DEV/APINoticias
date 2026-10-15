import { useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, X } from "lucide-react";

export default function ApiKeyDialog({
  configured,
  onSave,
  onForget,
  onClose,
}) {
  // El borrador desaparece al cerrar este diálogo. Nunca se escribe en storage.
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const dialog = useRef(null);
  const keyInput = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    keyInput.current.focus();
  }, []);

  function submit(event) {
    event.preventDefault();
    const key = draft.trim();
    if (!key || key.length > 256 || !/^[A-Za-z0-9_-]+$/.test(key)) {
      setError(
        "Introduce una API Key de GNews sin espacios internos (máximo 256 caracteres).",
      );
      return;
    }
    onSave(key);
  }

  return (
    <dialog
      className="modal api-key-modal"
      ref={dialog}
      aria-labelledby="api-key-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="modal-top">
        <span className="eyebrow">
          <KeyRound size={13} /> TU CONEXIÓN PERSONAL
        </span>
        <button
          className="icon-button"
          aria-label="Cerrar configuración"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <h2 id="api-key-title">Conecta con tu mundo.</h2>
      <p id="api-key-description">
        Coloca tu API Key personal de GNews para consultar noticias.
      </p>
      {configured && (
        <p className="key-status" role="status">
          Tienes una clave personal configurada para esta sesión. Puedes
          reemplazarla o quitarla.
        </p>
      )}
      <form onSubmit={submit} autoComplete="off">
        <label className="api-key-label" htmlFor="personal-api-key">
          Tu API Key
        </label>
        <input
          id="personal-api-key"
          ref={keyInput}
          className="api-key-input"
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={256}
          required
          autoFocus
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          placeholder={
            configured ? "Introduce una nueva clave" : "Pega aquí tu API Key"
          }
          aria-describedby={`api-key-description api-key-privacy${error ? " api-key-error" : ""}`}
          aria-invalid={Boolean(error)}
        />
        {error && (
          <p id="api-key-error" className="key-error" role="alert">
            {error}
          </p>
        )}
        <p id="api-key-privacy" className="key-privacy">
          Solo se conserva en memoria mientras esta página esté abierta. Se
          olvida al recargar o cerrar la pestaña.
        </p>
        <div className="key-actions">
          <button type="submit" className="primary-button">
            Usar clave temporal <ArrowRight size={16} />
          </button>
          {configured && (
            <button type="button" className="forget-key" onClick={onForget}>
              Olvidar clave
            </button>
          )}
        </div>
      </form>
      <a
        className="text-link key-provider"
        href="https://gnews.io/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Obtener una clave en GNews <ArrowRight size={14} />
      </a>
    </dialog>
  );
}
