import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Clock, StopCircle, Camera, Volume2, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import AIBot from '../components/AIBot';
import CameraCheck from '../components/CameraCheck';
import { useInterview } from '../hooks/useInterview';
import { useCamera } from '../hooks/useCamera';
import InterviewAnalytics from '../components/InterviewAnalytics';
import { StudentInfo, JobDescription } from '../types';

const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    startInterview, 
    submitResponse, 
    nextQuestion, 
    stopInterview,
    completeInterview, 
    getCurrentQuestion, 
    aiBot,
    isRecording,
    startListening,
    stopListening,
    speak,
    questionsRemaining, 
    progress,
    currentSession 
  } = useInterview();
  
  const {
    isActive: isCameraActive,
    capturedPhoto,
    isCapturing,
    flashEffect,
    error: cameraError,
    faceDetected,
    eyeBlinkCount,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto
  } = useCamera();

  const [isStarted, setIsStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [showCameraCheck, setShowCameraCheck] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceVerificationPassed, setFaceVerificationPassed] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const interviewTimerRef = useRef<NodeJS.Timeout>();
  const faceCheckTimerRef = useRef<NodeJS.Timeout>();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const currentQuestion = getCurrentQuestion();

  useEffect(() => {
    const initializeInterview = async () => {
      const studentInfo = localStorage.getItem('studentInfo');
      const jobDescription = localStorage.getItem('jobDescription');
      
      if (!studentInfo || !jobDescription) {
        navigate('/student-info');
        return;
      }

      const parsedStudentInfo: StudentInfo = JSON.parse(studentInfo);
      const parsedJobDescription: JobDescription = JSON.parse(jobDescription);
      
      await startInterview(parsedStudentInfo, parsedJobDescription);
    };

    initializeInterview();
  }, [navigate, startInterview]);

  useEffect(() => {
    if (isStarted && isInterviewActive) {
      interviewTimerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      if (currentQuestion) {
        setQuestionStartTime(Date.now());
        setTimeout(() => {
          speak(currentQuestion.text);
        }, 2000);
      }
    }

    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current);
      }
    };
  }, [isStarted, isInterviewActive, currentQuestion, speak]);

  // Face verification system
  useEffect(() => {
    if (isCameraActive && faceDetected) {
      if (!faceCheckTimerRef.current) {
        faceCheckTimerRef.current = setTimeout(() => {
          if (eyeBlinkCount >= 2) { // At least 2 blinks detected
            setFaceVerificationPassed(true);
          }
        }, 10000); // Check after 10 seconds
      }
    }

    return () => {
      if (faceCheckTimerRef.current) {
        clearTimeout(faceCheckTimerRef.current);
        faceCheckTimerRef.current = undefined;
      }
    };
  }, [isCameraActive, faceDetected, eyeBlinkCount]);

  useEffect(() => {
    if (timeElapsed >= 180 && currentSession?.responses.length > 0) {
      handleCompleteInterview();
    }
  }, [timeElapsed, currentSession]);

  // Send analytics events to backend
  const sendAnalyticsEvent = async (eventType: string, data: any) => {
    try {
      await fetch('http://127.0.0.1:5000/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, eventType, timestamp: new Date().toISOString(), data })
      });
    } catch (error) {
      // Silently handle analytics failures - backend may not be available
      console.log('Analytics service unavailable, continuing without analytics');
    }
  };

  const handleCameraReady = (isReady: boolean) => {
    setCameraReady(isReady);
    setShowCameraCheck(false);
    if (isReady) {
      handleStartInterview();
    }
  };

  const handleReschedule = () => {
    alert('Interview rescheduling would be handled by your scheduling system. For this demo, please try again or continue without camera.');
  };

  const handleStartInterview = async () => {
    try {
      try {
        await sendAnalyticsEvent('interview_started', { cameraReady, faceVerificationPassed });
      } catch (error) {
        console.log('Analytics not available, continuing without analytics');
      }
      
      setIsStarted(true);
      setIsInterviewActive(true);
      
      // Always try to start camera for interview
      try {
        await startCamera();
      } catch (error) {
        console.error('Camera error during interview start:', error);
        // Continue without camera if it fails
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsStarted(true);
      setIsInterviewActive(true);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion) return;

    await sendAnalyticsEvent('question_answered', { questionId: currentQuestion.id, duration: Math.floor((Date.now() - questionStartTime) / 1000) });

    const duration = Math.floor((Date.now() - questionStartTime) / 1000);
    submitResponse(currentQuestion.id, currentResponse, duration);
    
    const hasNext = nextQuestion();
    
    if (!hasNext || timeElapsed >= 300) {
      handleCompleteInterview();
    } else {
      setCurrentResponse('');
      setQuestionStartTime(Date.now());
    }
  };

  const handleStopInterview = () => {
    setShowStopConfirm(true);
  };

  const confirmStopInterview = () => {
    try {
      sendAnalyticsEvent('interview_stopped', { timeElapsed, questionsAnswered: currentSession?.responses.length || 0 });
    } catch (error) {
      console.log('Analytics not available, continuing without analytics');
    }
    
    stopInterview();
    if (isCameraActive) {
      stopCamera();
    }
    setIsInterviewActive(false);
    if (interviewTimerRef.current) {
      clearInterval(interviewTimerRef.current);
    }
    navigate('/results');
  };

  const handleCompleteInterview = () => {
    sendAnalyticsEvent('interview_completed', { timeElapsed, totalQuestions: currentSession?.questions.length || 0 });
    
    const result = completeInterview();
    localStorage.setItem('interviewResult', JSON.stringify(result));
    if (isCameraActive) {
      stopCamera();
    }
    setIsInterviewActive(false);
    if (interviewTimerRef.current) {
      clearInterval(interviewTimerRef.current);
    }
    navigate('/results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Initializing AI Interview..." />
        </div>
      </Layout>
    );
  }

  if (showCameraCheck) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Interview Setup</h1>
            <p className="text-gray-300">Let's make sure everything is working properly before we begin</p>
          </motion.div>

          <CameraCheck 
            onCameraReady={handleCameraReady}
            onReschedule={handleReschedule}
          />
        </div>
      </Layout>
    );
  }

  if (!isStarted) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Ready for Your AI Interview?</h1>
            <p className="text-gray-300">Make sure you're in a quiet environment with good lighting</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Camera Setup</h3>
                <div className="bg-dark-200/50 rounded-2xl aspect-video flex items-center justify-center border border-white/10 relative overflow-hidden">
                  {isCameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {flashEffect && (
                        <div className="absolute inset-0 bg-white opacity-80 rounded-2xl" />
                      )}

                      {/* Face Detection Indicators */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${
                          faceDetected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {faceDetected ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          <span>{faceDetected ? 'Face Detected' : 'No Face'}</span>
                        </div>
                        
                        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${
                          eyeBlinkCount >= 2 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          <Eye className="h-3 w-3" />
                          <span>Blinks: {eyeBlinkCount}</span>
                        </div>

                        {faceVerificationPassed && (
                          <div className="flex items-center space-x-2 px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>Verified Human</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Camera will start when you begin</p>
                      {cameraError && (
                        <p className="text-yellow-400 text-sm mt-2">{cameraError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Interview Details</h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Total Questions', value: '6 Dynamic Questions', color: 'cyber-blue' },
                    { label: 'Estimated Time', value: '3-5 minutes', color: 'purple-400' },
                    { label: 'Interview Type', value: 'AI-Powered Speech', color: 'green-400' },
                    { label: 'Face Verification', value: faceVerificationPassed ? 'Passed' : 'In Progress', color: faceVerificationPassed ? 'green-400' : 'yellow-400' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className={`flex items-center justify-between p-3 bg-gradient-to-r from-${item.color}/10 to-transparent rounded-xl border border-${item.color}/20`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      <span className={`text-sm text-${item.color}`}>{item.value}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="text-sm font-medium text-amber-400 mb-2">🎯 AI Features Active</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Dynamic question generation based on your profile</li>
                    <li>• Face detection and human verification</li>
                    <li>• Real-time speech analysis and feedback</li>
                    <li>• Eye blink monitoring for authenticity</li>
                  </ul>
                </motion.div>

                <motion.button
                  onClick={handleStartInterview}
                  disabled={!faceVerificationPassed && isCameraActive}
                  className="w-full bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-2 glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Video className="h-5 w-5" />
                  <span>
                    {isCameraActive && !faceVerificationPassed 
                      ? 'Verifying Human Presence...' 
                      : 'Start AI Interview'
                    }
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Progress Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-cyber-blue">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
                </div>
                <div className="text-gray-300">
                  Question {Math.floor(progress / 16.67) + 1} of 6
                </div>
                
                {/* Face Verification Status */}
                {isCameraActive && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                    faceDetected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {faceDetected ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    <span>{faceDetected ? 'Human Verified' : 'Face Not Detected'}</span>
                  </div>
                )}
              </div>
              
              <motion.button
                onClick={handleStopInterview}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <StopCircle className="h-4 w-4" />
                <span>Stop Interview</span>
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowAnalytics(!showAnalytics)} className="text-xs text-gray-400 hover:text-white">
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </button>
            </div>
            
            <div className="w-full bg-dark-200/50 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-cyber-blue to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Analytics Panel */}
        <InterviewAnalytics sessionId={sessionId} isVisible={showAnalytics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* AI Bot & Controls */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl">
              
              <div className="flex justify-center mb-6">
                <AIBot botState={aiBot} />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Video</h3>
                <div className="bg-dark-200/50 rounded-2xl aspect-video relative overflow-hidden border border-white/10">
                  {isCameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-2xl"
                        onLoadedMetadata={() => {
                          console.log('Video metadata loaded');
                          if (videoRef.current) {
                            videoRef.current.play().catch(console.error);
                          }
                        }}
                        onCanPlay={() => {
                          console.log('Video can play');
                        }}
                        onError={(e) => {
                          console.error('Video error:', e);
                        }}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {flashEffect && (
                        <div className="absolute inset-0 bg-white opacity-80 rounded-2xl" />
                      )}
                      
                      {/* Real-time verification indicators */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                          faceDetected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {faceDetected ? <CheckCircle className="h-2 w-2" /> : <AlertTriangle className="h-2 w-2" />}
                          <span>{faceDetected ? 'Face OK' : 'No Face'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                          <Eye className="h-2 w-2" />
                          <span>Blinks: {eyeBlinkCount}</span>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Camera className="h-4 w-4" />
                      </motion.button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Video className="h-12 w-12 opacity-50 mx-auto mb-2" />
                        <p className="text-sm">Starting camera...</p>
                        {cameraError && (
                          <p className="text-yellow-400 text-xs mt-1">{cameraError}</p>
                        )}
                        <button
                          onClick={startCamera}
                          className="mt-2 bg-cyber-blue text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors"
                        >
                          Retry Camera
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-4 mb-4">
                <motion.button
                  onClick={isRecording ? stopListening : startListening}
                  disabled={!aiBot.isWaitingForResponse}
                  className={`p-3 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white glow-red' 
                      : 'bg-cyber-blue hover:bg-blue-600 text-white glow-blue'
                  }`}
                  whileHover={{ scale: aiBot.isWaitingForResponse ? 1.1 : 1 }}
                  whileTap={{ scale: aiBot.isWaitingForResponse ? 0.9 : 1 }}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </motion.button>
                <motion.button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isCameraActive 
                      ? 'bg-green-500 hover:bg-green-600 text-white glow-green' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isCameraActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </motion.button>
              </div>

              {aiBot.isWaitingForResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-yellow-400 text-sm font-medium mb-2">
                    🎤 Your turn to speak!
                  </p>
                  <p className="text-gray-400 text-xs">
                    Click the microphone to start recording your response
                  </p>
                </motion.div>
              )}

              {capturedPhoto && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Captured Photo</h4>
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-20 object-cover rounded-lg border border-white/10"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Interview Content */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl">
              
              <motion.div
                className="mb-8"
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white font-orbitron">AI is asking...</h2>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-cyber-blue" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Dynamic Question
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-cyber-blue/10 to-purple-600/10 rounded-2xl p-6 border border-cyber-blue/20">
                  <p className="text-lg text-white leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>
              </motion.div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Your Response (Optional - AI listens to your speech)
                </label>
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  placeholder="You can type notes here, but the AI will primarily analyze your spoken response..."
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {questionsRemaining > 0 ? (
                    <span>{questionsRemaining} questions remaining</span>
                  ) : (
                    <span>Final question - interview will complete soon</span>
                  )}
                </div>
                
                <motion.button
                  onClick={handleNextQuestion}
                  disabled={aiBot.isSpeaking}
                  className="bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center space-x-2 glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{questionsRemaining > 0 ? 'Next Question' : 'Complete Interview'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stop Confirmation Modal */}
      <AnimatePresence>
        {showStopConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 border border-white/10 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Stop Interview?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to stop the interview? Your progress will be saved and you'll receive feedback based on your responses so far.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStopConfirm(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={confirmStopInterview}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Stop Interview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default InterviewPage;