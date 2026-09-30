import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSignature, 
  Upload, 
  PenTool, 
  RotateCcw, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  ShieldCheck,
  Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types/constants';

export const DigitalSignatureModal = ({
  isOpen,
  onClose,
  targetUser = null,
  onSignatureSaved = null
}) => {
  const { currentUser, uploadUserSignature, removeUserSignature } = useAuth();
  const user = targetUser || currentUser;

  const [activeTab, setActiveTab] = useState('UPLOAD'); // 'UPLOAD' | 'DRAW' | 'PREVIEW'
  const [signaturePreview, setSignaturePreview] = useState(user?.signature || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#0F172A');
  const [penWidth, setPenWidth] = useState(2.5);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.signature) {
      setSignaturePreview(user.signature);
    } else {
      setSignaturePreview(null);
    }
    setErrorMsg('');
    setSuccessMsg('');
    setHasDrawn(false);
    setHistory([]);
  }, [user, isOpen]);

  // Setup canvas when switching to DRAW tab
  useEffect(() => {
    if (activeTab === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set high DPI scale
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      // Save blank state
      setHistory([canvas.toDataURL()]);
    }
  }, [activeTab]);

  if (!isOpen || !user) return null;

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Signature file size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setSignaturePreview(result);
      setSuccessMsg('Signature loaded. Click "Save Digital Signature" to confirm.');
    };
    reader.readAsDataURL(file);
  };

  // Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setHistory(prev => [...prev, dataUrl]);
      setSignaturePreview(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setHistory([canvas.toDataURL()]);
    if (activeTab === 'DRAW') {
      setSignaturePreview(null);
    }
  };

  const undoLastStroke = () => {
    if (history.length <= 1) {
      clearCanvas();
      return;
    }
    const newHist = history.slice(0, -1);
    setHistory(newHist);
    const lastImg = newHist[newHist.length - 1];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      setSignaturePreview(lastImg);
    };
    img.src = lastImg;
  };

  // Commit Signature
  const handleSaveSignature = async () => {
    if (!signaturePreview) {
      setErrorMsg('Please upload or draw a signature first.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await uploadUserSignature(user.id, signaturePreview);
      if (res.success) {
        setSuccessMsg(`Digital signature successfully attached to ${user.name}'s profile.`);
        if (onSignatureSaved) onSignatureSaved(signaturePreview);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to save digital signature.');
      }
    } catch (err) {
      setErrorMsg('Error saving signature to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSignature = async () => {
    if (!window.confirm(`Are you sure you want to remove the digital signature for ${user.name}?`)) return;
    setIsLoading(true);
    try {
      await removeUserSignature(user.id);
      setSignaturePreview(null);
      setSuccessMsg('Digital signature successfully removed.');
      if (onSignatureSaved) onSignatureSaved(null);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Error removing signature.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '100%', borderRadius: '14px', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--brand-primary, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSignature size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Official Digital Signature
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Stamp for {user.name} ({ROLE_LABELS[user.role] || user.role})
              </span>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-surface)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              border: 'none',
              background: activeTab === 'UPLOAD' ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
              borderBottom: activeTab === 'UPLOAD' ? '2px solid var(--brand-primary)' : '2px solid transparent',
              color: activeTab === 'UPLOAD' ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <Upload size={15} />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DRAW')}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              border: 'none',
              background: activeTab === 'DRAW' ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
              borderBottom: activeTab === 'DRAW' ? '2px solid var(--brand-primary)' : '2px solid transparent',
              color: activeTab === 'DRAW' ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <PenTool size={15} />
            <span>Draw with Pen</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'var(--danger-bg, #FEF2F2)',
              color: 'var(--danger-text, #991B1B)',
              border: '1px solid var(--danger-border, #F87171)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: 'var(--success-bg, #ECFDF5)',
              color: 'var(--success-text, #065F46)',
              border: '1px solid var(--success-border, #34D399)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'UPLOAD' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  transition: 'all 0.2s ease',
                  marginBottom: '1rem'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto'
                }}>
                  <Upload size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Click or drag signature image to upload
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, WebP or SVG format (Transparent background recommended, Max 5MB)
                </div>
              </div>
            </div>
          )}

          {/* DRAW TAB */}
          {activeTab === 'DRAW' && (
            <div>
              {/* Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.65rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Ink:</span>
                  <button
                    type="button"
                    onClick={() => setPenColor('#0F172A')}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#0F172A',
                      border: penColor === '#0F172A' ? '2px solid var(--brand-primary)' : '1px solid #CBD5E1',
                      cursor: 'pointer'
                    }}
                    title="Black ink"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#1E40AF')}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#1E40AF',
                      border: penColor === '#1E40AF' ? '2px solid var(--brand-primary)' : '1px solid #CBD5E1',
                      cursor: 'pointer'
                    }}
                    title="Blue ink"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={undoLastStroke}
                    disabled={history.length <= 1}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                    title="Undo stroke"
                  >
                    <RotateCcw size={12} />
                    <span>Undo</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearCanvas}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: 'var(--danger-solid)' }}
                    title="Clear pad"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Canvas surface */}
              <div style={{
                border: '1.5px solid var(--border-medium)',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                position: 'relative',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                marginBottom: '1rem'
              }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{
                    width: '100%',
                    height: '160px',
                    display: 'block',
                    cursor: 'crosshair',
                    touchAction: 'none'
                  }}
                />

                {/* Subtle signing baseline guide */}
                <div style={{
                  position: 'absolute',
                  bottom: '36px',
                  left: '20px',
                  right: '20px',
                  borderBottom: '1px dashed #CBD5E1',
                  pointerEvents: 'none',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', paddingBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sign on line ✗
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURE PREVIEW AREA */}
          {signaturePreview && (
            <div style={{
              marginTop: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="var(--success-solid, #059669)" />
                  <span>Verified Signature Preview</span>
                </span>

                {user.signature && (
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-solid, #DC2626)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Delete Signature</span>
                  </button>
                )}
              </div>

              <div style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '0.5rem'
              }}>
                <img
                  src={signaturePreview}
                  alt={`Signature of ${user.name}`}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveSignature}
              disabled={isLoading || !signaturePreview}
              style={{ minWidth: '160px' }}
            >
              {isLoading ? 'Saving...' : 'Save Digital Signature'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
