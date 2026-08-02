import { useState, useEffect } from 'react';

export default function VideoCall({ audioOnly = false, onLeave }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    // Load Jitsi Meet Script dynamically
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      setIsLoading(false);
      startCall();
    };
    script.onerror = () => {
      setError('Failed to load video service. Please check your internet connection.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (api) {
        api.dispose(); // Clean up the video call to prevent errors
        setApi(null);
      }
    };
  }, []);

  const startCall = () => {
    if (!window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: 'WinfreyGeorgeFamilyHub',
      width: '100%',
      height: '100%',
      parentNode: document.getElementById('jitsi-container'),
      configOverwrite: {
        startWithVideoMuted: audioOnly, // If audioOnly, video starts muted
        startWithAudioMuted: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'chat'],
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      },
    };

    try {
      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(jitsiApi);
      
      // Listen for hangup to go back to the app
      jitsiApi.on('readyToClose', () => {
        if (onLeave) onLeave();
      });
    } catch (err) {
      setError('Failed to start the call. Please try again.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      zIndex: 9999, 
      background: '#1f2937' 
    }}>
      {isLoading && (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📞</div>
          <p>Connecting you to {audioOnly ? 'Voice' : 'Video'} Call...</p>
        </div>
      )}
      {error && (
        <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '4rem', padding: '1rem' }}>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button 
            onClick={onLeave} 
            style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '2rem', marginTop: '1rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      )}
      <div id="jitsi-container" style={{ width: '100%', height: '100%', display: isLoading || error ? 'none' : 'block' }}></div>
    </div>
  );
}
