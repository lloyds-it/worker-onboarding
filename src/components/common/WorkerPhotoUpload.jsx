import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, RefreshCw, CheckCircle2, User, Sparkles, X } from 'lucide-react';

// Preset high quality vector portraits for fast demo testing
const SAMPLE_AVATARS = [
  {
    name: 'Industrial Worker 1',
    url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#E2E8F0"/>
        <!-- Torso / Blue Boiler Suit -->
        <path d="M40 200 L40 160 Q40 140 70 135 L100 145 L130 135 Q160 140 160 160 L160 200 Z" fill="#1E3A8A"/>
        <path d="M85 142 L100 150 L115 142 L115 180 L85 180 Z" fill="#3B82F6"/>
        <!-- High Vis Stripe -->
        <rect x="55" y="155" width="90" height="8" fill="#FACC15"/>
        <!-- Neck -->
        <rect x="88" y="115" width="24" height="28" fill="#D97706" rx="4"/>
        <!-- Head -->
        <ellipse cx="100" cy="90" rx="35" ry="42" fill="#D97706"/>
        <!-- Hair -->
        <path d="M68 85 Q70 52 100 52 Q130 52 132 85 Q115 62 100 62 Q85 62 68 85 Z" fill="#1E293B"/>
        <!-- Eyes -->
        <circle cx="86" cy="88" r="4" fill="#0F172A"/>
        <circle cx="114" cy="88" r="4" fill="#0F172A"/>
        <!-- Eyebrows -->
        <path d="M78 81 Q86 78 94 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M106 81 Q114 78 122 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Nose -->
        <path d="M100 87 L98 98 L103 98" stroke="#B45309" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Mustache -->
        <path d="M85 108 Q100 104 115 108 Q100 114 85 108 Z" fill="#1E293B"/>
        <!-- Smile -->
        <path d="M89 116 Q100 120 111 116" stroke="#92400E" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Safety Helmet (Yellow) -->
        <path d="M62 68 Q100 32 138 68 Q144 70 140 75 L60 75 Q56 70 62 68 Z" fill="#EAB308"/>
        <rect x="56" y="73" width="88" height="6" fill="#CA8A04" rx="3"/>
        <path d="M96 40 L104 40 L103 68 L97 68 Z" fill="#FDE047"/>
      </svg>
    `)
  },
  {
    name: 'Industrial Worker 2',
    url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#F1F5F9"/>
        <!-- Torso / Red Jacket -->
        <path d="M40 200 L40 160 Q40 140 70 135 L100 145 L130 135 Q160 140 160 160 L160 200 Z" fill="#DC2626"/>
        <rect x="55" y="160" width="90" height="8" fill="#F8FAFC"/>
        <!-- Neck -->
        <rect x="88" y="115" width="24" height="28" fill="#C2410C" rx="4"/>
        <!-- Head -->
        <ellipse cx="100" cy="90" rx="35" ry="42" fill="#C2410C"/>
        <!-- Hair -->
        <path d="M68 85 Q70 52 100 52 Q130 52 132 85 Q115 62 100 62 Q85 62 68 85 Z" fill="#0F172A"/>
        <!-- Eyes -->
        <circle cx="86" cy="88" r="4" fill="#0F172A"/>
        <circle cx="114" cy="88" r="4" fill="#0F172A"/>
        <!-- Eyebrows -->
        <path d="M78 81 Q86 78 94 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M106 81 Q114 78 122 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Nose -->
        <path d="M100 87 L98 98 L103 98" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- White Hard Hat -->
        <path d="M62 68 Q100 32 138 68 Q144 70 140 75 L60 75 Q56 70 62 68 Z" fill="#F8FAFC"/>
        <rect x="56" y="73" width="88" height="6" fill="#CBD5E1" rx="3"/>
        <path d="M96 40 L104 40 L103 68 L97 68 Z" fill="#E2E8F0"/>
      </svg>
    `)
  }
];

export const WorkerPhotoUpload = ({ photo, onChange, isReadOnly = false, label = "Worker Photo (Passport Size for Gate Pass)" }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Compress image to ~300x300 JPEG to maintain lightweight localStorage footprint
  const processAndSetImage = (fileOrBlob) => {
    if (!fileOrBlob) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving crop / scale to 1:1 or 4:5
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isReadOnly) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isReadOnly) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processAndSetImage(file);
    }
  };

  // WebCam Support
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebCam access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.warn);
        }
      }, 100);
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError(err.message || 'Unable to access webcam. Please upload an image file instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Square crop from center of video frame
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 360, 360);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onChange(dataUrl);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface-subtle, #F8FAFC)',
      border: isDragging ? '2px dashed var(--brand-primary, #E82329)' : '1px solid var(--border-medium, #E2E8F0)',
      borderRadius: 'var(--radius-md, 8px)',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={18} color="var(--brand-primary, #E82329)" />
          <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary, #0F172A)', margin: 0 }}>
            {label} <span style={{ color: 'var(--brand-primary, #E82329)' }}>*</span>
          </label>
        </div>
        {photo && (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem' }}>
            <CheckCircle2 size={12} />
            Photo Attached for ID Card
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Photo Box matching ID Card specifications */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            width: '120px',
            height: '130px',
            border: photo ? '2px solid #0F172A' : '2px dashed #94A3B8',
            backgroundColor: '#FFFFFF',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: !isReadOnly ? 'pointer' : 'default',
            flexShrink: 0
          }}
          onClick={() => {
            if (!isReadOnly && !isCameraActive && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          title={!isReadOnly ? "Click or drag & drop photo here" : undefined}
        >
          {photo ? (
            <img 
              src={photo} 
              alt="Worker Photograph" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '0.5rem', color: '#64748B' }}>
              <User size={36} strokeWidth={1.5} color="#94A3B8" />
              <div style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '0.25rem', color: '#64748B' }}>
                Affix Photo
              </div>
              <div style={{ width: '5px', height: '5px', backgroundColor: '#2563EB', borderRadius: '50%', margin: '4px auto 0' }} />
            </div>
          )}
        </div>

        {/* Action Controls & Instructions */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            Upload worker's clear portrait photograph. This photo will be printed directly onto the official <strong>Lloyds Metals Temporary Gate Pass ID Card</strong>.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isReadOnly}
          />

          {!isReadOnly && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {/* File Upload Button */}
              <button
                type="button"
                id="btn-upload-worker-photo"
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload Image File</span>
              </button>

              {/* WebCam Capture Button */}
              <button
                type="button"
                id="btn-webcam-worker-photo"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={startCamera}
              >
                <Camera size={14} />
                <span>Take via WebCam</span>
              </button>

              {/* Sample Presets Quick Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', marginLeft: '0.25rem' }}>Presets:</span>
                {SAMPLE_AVATARS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', height: '28px' }}
                    onClick={() => onChange(sample.url)}
                    title={`Use ${sample.name}`}
                  >
                    <Sparkles size={11} color="var(--brand-primary, #E82329)" />
                    <span>Demo {idx + 1}</span>
                  </button>
                ))}
              </div>

              {/* Remove Photo Button */}
              {photo && (
                <button
                  type="button"
                  id="btn-remove-worker-photo"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', color: 'var(--danger-text, #DC2626)', borderColor: 'var(--danger-border, #FCA5A5)' }}
                  onClick={() => onChange('')}
                  title="Remove uploaded photo"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}

          {cameraError && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--danger-text, #DC2626)' }}>
              ⚠️ {cameraError}
            </div>
          )}
        </div>
      </div>

      {/* Live WebCam Modal */}
      {isCameraActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={20} color="#E82329" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  WebCam Photo Capture
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={stopCamera}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              backgroundColor: '#000000',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Passport head guide overlay */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '220px',
                border: '2px dashed rgba(255, 255, 255, 0.7)',
                borderRadius: '50%',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>
                Align worker face inside oval
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-capture-webcam-shot"
                className="btn btn-primary"
                onClick={capturePhoto}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Camera size={16} />
                <span>Capture & Use Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
