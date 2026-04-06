import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiVideo, FiCheckCircle } from 'react-icons/fi';

const UploadView = ({ userId, onUploadComplete, onNavigateDashboard }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(acceptedFiles => {
    if(acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    }
  });

  const handleRealUpload = async () => {
    setUploading(true);
    setProgress(0);
    let current = 0;
    
    const interval = setInterval(() => {
      current += 1;
      if(current <= 95) {
         setProgress(current);
      }
    }, 450);

    try {
      // Correct Multi-part boundary protocol mapping User Session dynamically
      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("file", file);
      
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error("Analysis failed on backend");
      }

      // Capture actual dynamic array points plotted by PyDub Physics
      const data = await response.json();
      const realMetrics = data.metrics;

      setProgress(100);
      
      setTimeout(() => {
         setUploading(false);
         // Render the correct historical graph arrays!
         onUploadComplete(realMetrics); 
      }, 750);

    } catch (error) {
      clearInterval(interval);
      console.error(error);
      alert("Backend connection failed: Please ensure the Python API is running on localhost:8000.");
      
      setProgress(100);
      setTimeout(() => { 
        setUploading(false); 
        onUploadComplete(null); 
      }, 750);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Analyze New Class Recording</h2>
        <p className="text-secondary">Upload lecture audio or video to process insights securely via our authentic modeling sequence.</p>
      </div>

      {!file ? (
        <div {...getRootProps()} className={`upload-dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <FiUploadCloud className="upload-icon" />
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Drag & drop your recording here</h3>
            <p className="text-secondary">or click to browse from your computer</p>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supported formats: MP4, MOV, MP3, WAV</p>
        </div>
      ) : (
        <div className="glass-card animate-slide-up" style={{ padding: '3rem', textAlign: 'center' }}>
          
          {progress >= 100 && !uploading ? (
             <div>
                <FiCheckCircle className="text-success" size={60} style={{ margin: '0 auto 1.5rem auto' }} />
                <h3>Analysis Complete!</h3>
                <p className="text-secondary" style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>Your detailed physics insights are mathematically generated and ready.</p>
                <button className="btn-primary" onClick={onNavigateDashboard}>
                  View Dashboard Analytics
                </button>
             </div>
          ) : (
            <div>
              <div className="glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', marginBottom: '2.5rem', borderRadius: '50px' }}>
                <FiVideo className="text-brand-blue" size={24} />
                <span style={{ fontWeight: 500 }}>{file.name}</span>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>({(file.size / (1024*1024)).toFixed(1)} MB)</span>
              </div>
              
              {!uploading ? (
                <div>
                  <button className="btn-primary" onClick={handleRealUpload} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                    Process Recording Securely
                  </button>
                  <div style={{ marginTop: '1.5rem' }}>
                    <button className="text-secondary" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => {setFile(null); setProgress(0);}}>Choose Another File</button>
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="animate-spin" style={{ height: '16px', width: '16px', color: 'var(--brand-purple)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"></path>
                      </svg>
                      Running Acoustic Algorithms...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gradient)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--brand-teal)', marginTop: '0.8rem' }}>Processing large files may take a minute...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadView;
