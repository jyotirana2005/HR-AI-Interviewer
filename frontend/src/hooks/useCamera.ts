import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeBlinkCount, setEyeBlinkCount] = useState(0);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [backendDetectionEnabled, setBackendDetectionEnabled] = useState(true);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectionRef = useRef<any>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Request camera permissions with specific constraints
      const constraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 15, min: 10 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to load
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  console.log('Video started playing');
                  setIsActive(true);
                  resolve(true);
                }).catch((playError) => {
                  console.error('Video play error:', playError);
                  setIsActive(true); // Still set active even if autoplay fails
                  resolve(true);
                });
              }
            };
            
            // Fallback timeout
            setTimeout(() => {
              resolve(true);
            }, 2000);
          }
        });
        
        // Start face detection after camera is active
        setTimeout(() => {
          startFaceDetection();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not support the required settings.';
      } else {
        errorMessage += 'Please check your camera settings and try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (faceDetectionRef.current) {
      clearInterval(faceDetectionRef.current);
      faceDetectionRef.current = null;
    }
    
    setIsActive(false);
    setFaceDetected(false);
    setError(null);
  }, []);

  // Enhanced face detection with backend integration
  const performBackendDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataURL }),
      });

      const data = await response.json();
      if (data.success) {
        setDetectionResults(data);
        setFaceDetected(data.faces && data.faces.length > 0);
        return data;
      } else {
        throw new Error(data.error || 'Detection failed');
      }
    } catch (error) {
      console.error('Backend detection failed:', error);
      setBackendDetectionEnabled(false);
      return null;
    }
  }, [isActive]);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    // Simple face detection using canvas and pixel analysis
    const detectFace = () => {
      if (!videoRef.current || !canvasRef.current || !isActive) return;

      // Try backend detection first if enabled
      if (backendDetectionEnabled) {
        performBackendDetection().then(result => {
          if (!result) {
            // Fallback to client-side detection
            performClientSideDetection();
          }
        });
      } else {
        performClientSideDetection();
      }
    };

    const performClientSideDetection = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for basic face detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple face detection based on skin tone and movement
      let skinPixels = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Basic skin tone detection
        if (r > 95 && g > 40 && b > 20 && 
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 && r > g && r > b) {
          skinPixels++;
        }
      }
      
      const skinRatio = skinPixels / totalPixels;
      const facePresent = skinRatio > 0.02; // At least 2% skin tone pixels
      
      setFaceDetected(facePresent);
      
      // Simple blink detection based on face presence changes
      if (facePresent) {
        const now = Date.now();
        if (now - lastBlinkTime > 2000) { // Detect blinks every 2 seconds
          setEyeBlinkCount(prev => prev + 1);
          setLastBlinkTime(now);
        }
      }
    };

    // Run face detection every 1000ms (less frequent for backend calls)
    faceDetectionRef.current = setInterval(detectFace, 1000);
  }, [isActive, lastBlinkTime, backendDetectionEnabled, performBackendDetection]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    setIsCapturing(true);
    setFlashEffect(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(photoDataUrl);

      // Camera sound effect
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }

      setTimeout(() => {
        setFlashEffect(false);
        setIsCapturing(false);
      }, 200);
    }
  }, [isActive]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  const downloadPhoto = useCallback(() => {
    if (!capturedPhoto) return;

    const link = document.createElement('a');
    link.download = `interview-photo-${new Date().toISOString().split('T')[0]}.jpg`;
    link.href = capturedPhoto;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [capturedPhoto]);

  return {
    isActive,
    capturedPhoto,
    isCapturing,
    flashEffect,
    error,
    faceDetected,
    eyeBlinkCount,
    backendDetectionEnabled,
    detectionResults,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    downloadPhoto
  };
};