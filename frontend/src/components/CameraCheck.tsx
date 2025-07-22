import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertTriangle, CheckCircle, RefreshCw, Settings, Calendar } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

interface CameraCheckProps {
  onCameraReady: (isReady: boolean) => void;
  onReschedule?: () => void;
}

const CameraCheck: React.FC<CameraCheckProps> = ({ onCameraReady, onReschedule }) => {
  const [checkStatus, setCheckStatus] = useState<'checking' | 'success' | 'error' | 'no-camera'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [troubleshootingStep, setTroubleshootingStep] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [detectionActive, setDetectionActive] = useState(false);
  
  const {
    isActive,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto
  } = useCamera();

  const overlayRef = useRef<HTMLDivElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout>();

  // Enhanced face detection with backend integration
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

      // Capture frame from video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg');

      // Send to backend for detection
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const result = await response.json();
      
      if (result.success) {
        drawFaceBoxes(result.faces || []);
        setFaceCount(result.count || 0);
        
        // Update status based on face detection
        if (result.count > 0) {
          setCheckStatus('success');
          onCameraReady(true);
        } else if (checkStatus === 'checking') {
          // Keep checking if no faces detected yet
        }
      } else {
        console.error('Detection failed:', result.error);
        // Fallback to client-side detection
        performClientSideDetection();
      }
    } catch (error) {
      console.error('Backend detection error:', error);
      // Fallback to client-side detection
      performClientSideDetection();
    }
  };

  const performClientSideDetection = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple client-side face detection (fallback)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let skinPixels = 0;
    const totalPixels = data.length / 4;
    
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
    const faceDetected = skinRatio > 0.02; // At least 2% skin tone pixels
    
    if (faceDetected) {
      setFaceCount(1);
      setCheckStatus('success');
      onCameraReady(true);
    } else {
      setFaceCount(0);
    }
  };

  const drawFaceBoxes = (faces: { x: number; y: number; width: number; height: number; confidence?: number }[]) => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Clear existing boxes
    overlay.innerHTML = '';
    
    // Draw new boxes for each detected face
    faces.forEach((face, index) => {
      const box = document.createElement('div');
      box.className = 'face-box';
      box.style.position = 'absolute';
      box.style.left = face.x + 'px';
      box.style.top = face.y + 'px';
      box.style.width = face.width + 'px';
      box.style.height = face.height + 'px';
      box.style.border = '3px solid #00d4ff';
      box.style.borderRadius = '8px';
      box.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
      box.style.pointerEvents = 'none';
      box.style.zIndex = '10';
      
      // Add confidence label if available
      if (face.confidence) {
        const label = document.createElement('div');
        label.textContent = `Face ${index + 1}: ${Math.round(face.confidence * 100)}%`;
        label.style.position = 'absolute';
        label.style.top = '-25px';
        label.style.left = '0';
        label.style.color = '#00d4ff';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        box.appendChild(label);
      }
      
      overlay.appendChild(box);
    });
  };

  // Start face detection when camera is active
  useEffect(() => {
    if (isActive && checkStatus === 'checking') {
      setDetectionActive(true);
      detectionIntervalRef.current = setInterval(detectFaces, 500); // Detect every 500ms
    } else {
      setDetectionActive(false);
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isActive, checkStatus]);

  const troubleshootingSteps = [
    {
      title: "Check Camera Permissions",
      description: "Make sure your browser has permission to access your camera",
      action: "Click the camera icon in your browser's address bar and allow camera access"
    },
    {
      title: "Check Camera Connection",
      description: "Ensure your camera is properly connected and not being used by another application",
      action: "Close other video applications (Zoom, Teams, etc.) and try again"
    },
    {
      title: "Try Different Browser",
      description: "Some browsers work better with camera access",
      action: "Try using Chrome, Firefox, or Edge for the best experience"
    },
    {
      title: "Restart Browser",
      description: "Sometimes a browser restart can resolve camera issues",
      action: "Close and reopen your browser, then return to this page"
    }
  ];

  useEffect(() => {
    performCameraCheck();
  }, []);

  const performCameraCheck = async () => {
    setCheckStatus('checking');
    setErrorMessage('');
    
    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setCheckStatus('no-camera');
        setErrorMessage('No camera detected on this device');
        onCameraReady(false);
        return;
      }

      // Try to start camera
      await startCamera();
      
      // Wait a moment to ensure camera is working
      setTimeout(() => {
        if (isActive) {
          // Camera started successfully, now wait for face detection
          setCheckStatus('checking');
        } else {
          setCheckStatus('error');
          setErrorMessage('Camera failed to start properly');
          onCameraReady(false);
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Camera check failed:', error);
      setCheckStatus('error');
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No camera found. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError') {
        setErrorMessage('Camera is being used by another application. Please close other video apps and try again.');
      } else {
        setErrorMessage('Unable to access camera. Please check your camera settings and try again.');
      }
      
      onCameraReady(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    performCameraCheck();
  };

  const handleProceedWithoutCamera = () => {
    onCameraReady(true); // Allow proceeding without camera
  };

  const renderTroubleshooting = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Troubleshooting Steps</h3>
      {troubleshootingSteps.map((step, index) => (
        <motion.div
          key={index}
          className={`p-4 rounded-xl border ${
            index === troubleshootingStep 
              ? 'border-cyber-blue bg-cyber-blue/10' 
              : 'border-white/10 bg-dark-200/30'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              index === troubleshootingStep 
                ? 'bg-cyber-blue text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white mb-1">{step.title}</h4>
              <p className="text-gray-300 text-sm mb-2">{step.description}</p>
              <p className="text-cyber-blue text-sm">{step.action}</p>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div className="flex space-x-3 mt-6">
        <button
          onClick={() => setTroubleshootingStep(prev => Math.min(prev + 1, troubleshootingSteps.length - 1))}
          disabled={troubleshootingStep >= troubleshootingSteps.length - 1}
          className="bg-cyber-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
        <button
          onClick={handleRetry}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">Camera & Face Detection Check</h2>
        <p className="text-gray-300">We need to verify your camera is working and can detect your face</p>
      </div>

      {/* Camera Preview with Face Detection */}
      <div className="mb-6">
        <div className="bg-dark-200/50 rounded-2xl aspect-video flex items-center justify-center border border-white/10 relative overflow-hidden">
          {checkStatus === 'checking' && (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-white">
                {detectionActive ? `Detecting faces... Found: ${faceCount}` : 'Starting camera...'}
              </p>
            </div>
          )}
          
          {(checkStatus === 'success' || checkStatus === 'checking') && isActive && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => {
                  const canvas = canvasRef.current;
                  const video = videoRef.current;
                  if (canvas && video) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                  }
                }}
                className="w-full h-full object-cover rounded-2xl"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face detection overlay */}
              <div 
                ref={overlayRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
              />
              
              {/* Status indicators */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 ${
                  checkStatus === 'success' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {checkStatus === 'success' ? 'Face Detected!' : 'Looking for face...'}
                  </span>
                </div>
                
                <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm">
                  Faces: {faceCount}
                </div>
                
                {detectionActive && (
                  <div className="bg-cyber-blue/80 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                    AI Detection Active
                  </div>
                )}
              </div>
            </div>
          )}

          {(checkStatus === 'error' || checkStatus === 'no-camera') && (
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-medium mb-2">Camera Issue Detected</p>
              <p className="text-gray-300 text-sm">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status and Actions */}
      {checkStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">Camera and Face Detection Working!</p>
            <p className="text-gray-300 text-sm">
              {faceCount > 0 ? `${faceCount} face(s) detected. You're ready for the interview.` : 'Camera is working perfectly!'}
            </p>
          </div>
          
          <button
            onClick={() => onCameraReady(true)}
            className="bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic"
          >
            Continue to Interview
          </button>
        </motion.div>
      )}

      {checkStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 font-medium text-center">Camera Access Failed</p>
            <p className="text-gray-300 text-sm text-center">{errorMessage}</p>
          </div>

          {retryCount < 3 ? (
            renderTroubleshooting()
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-300">Still having trouble? You have a few options:</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleProceedWithoutCamera}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Continue Without Camera</span>
                </button>
                
                {onReschedule && (
                  <button
                    onClick={onReschedule}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Reschedule Interview</span>
                  </button>
                )}
                
                <button
                  onClick={handleRetry}
                  className="bg-cyber-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {checkStatus === 'no-camera' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <Camera className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-400 font-medium">No Camera Detected</p>
            <p className="text-gray-300 text-sm">This device doesn't have a camera or it's not accessible</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleProceedWithoutCamera}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Continue Without Camera
            </button>
            
            {onReschedule && (
              <button
                onClick={onReschedule}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Reschedule Interview</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CameraCheck;