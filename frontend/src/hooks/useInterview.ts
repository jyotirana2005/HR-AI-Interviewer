import { useState, useCallback, useRef } from 'react';
import { InterviewSession, Question, InterviewResponse, InterviewResult, StudentInfo, JobDescription, AIBotState } from '../types';

export const useInterview = () => {
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiBot, setAiBot] = useState<AIBotState>({
    isListening: false,
    isSpeaking: false,
    currentEmotion: 'neutral',
    message: 'Hello! I\'m your AI interviewer. Ready to begin?',
    isWaitingForResponse: false
  });
  const [isRecording, setIsRecording] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Enhanced question generation with backend integration
  const generateQuestionsFromBackend = async (jobDescription: JobDescription): Promise<Question[]> => {
    try {
      // Get current user ID from localStorage
      const currentUser = localStorage.getItem('jobDescription');
      const userId = localStorage.getItem('studentInfo') ?JSON.parse(localStorage.getItem('studentInfo')!).user_id : null
      // const userId = currentUser ? JSON.parse(currentUser).user_id : null;
      
      // Get the timestamp from when job description was saved
      // const jobDescriptionData = localStorage.getItem('jobDescription');
      // let jdTimestamp = new Date().toISOString(); // fallback to current time
      let jdTimestamp = currentUser ? JSON.parse(currentUser).timestamp : null;
      console.log('Generating questions for job description', { timestamp: jdTimestamp, user_id: userId });
      // if (jobDescriptionData) {
      //   try {
      //     const parsedJD = JSON.parse(jobDescriptionData);
      //     // Check if timestamp exists in the saved job description
      //     if (parsedJD.timestamp) {
      //       jdTimestamp = parsedJD.timestamp;
      //     }
      //   } catch (error) {
      //     console.error('Error parsing job description:', error);
      //   }
      // }
      
      const response = await fetch('http://127.0.0.1:5000/generate_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timestamp: jdTimestamp,
          user_id: userId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      // Transform backend response to Question format
      const questions: Question[] = data.questions.map((text: string, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        text: text.trim(),
        type: jobDescription.type === 'technical' ? 'technical' : 'behavioral',
        timeLimit: 120,
        difficulty: jobDescription.level === 'entry' ? 'easy' : jobDescription.level === 'senior' ? 'hard' : 'medium',
        department: 'general',
        category: jobDescription.type === 'technical' ? 'technical-skills' : 'general'
      }));

      return questions;
    } catch (error) {
      console.log('Backend not available, using fallback questions');
      
      // Fallback to default questions if backend fails
      return generateFallbackQuestions(jobDescription);
    }
  };

  const generateFallbackQuestions = (jobDescription: JobDescription): Question[] => {
    const fallbackQuestions = jobDescription.type === 'technical' ? [
      `Tell me about your experience with ${jobDescription.requirements?.split(',')[0] || 'relevant technologies'}.`,
      `How would you approach solving a complex problem in ${jobDescription.title}?`,
      `Describe a challenging project you've worked on related to ${jobDescription.company}'s domain.`,
      `What interests you most about working at ${jobDescription.company}?`,
      `How do you stay updated with the latest trends in your field?`,
      `Walk me through your problem-solving process for technical challenges.`
    ] : [
      `Tell me about yourself and why you're interested in the ${jobDescription.title} position at ${jobDescription.company}.`,
      `Describe a time when you had to work under pressure. How did you handle it?`,
      `What do you know about ${jobDescription.company} and why do you want to work here?`,
      `Tell me about a time when you had to work with a difficult team member.`,
      `Where do you see yourself in 5 years?`,
      `What are your greatest strengths and how do they relate to this role?`
    ];

    return fallbackQuestions.map((text, index) => ({
      id: `fallback-${index}`,
      text,
      type: jobDescription.type === 'technical' ? 'technical' : 'behavioral',
      timeLimit: 120,
      difficulty: 'medium',
      department: 'general',
      category: 'general'
    }));
  };

  // Speech synthesis for AI bot
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      setAiBot(prev => ({ ...prev, isSpeaking: true, message: text, isWaitingForResponse: false }));
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setAiBot(prev => ({ ...prev, isSpeaking: false, isWaitingForResponse: true }));
      };
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Speech recognition for user responses
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAiBot(prev => ({ ...prev, isListening: true, currentEmotion: 'thinking', isWaitingForResponse: false }));

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setAiBot(prev => ({ 
              ...prev, 
              message: `I heard: "${finalTranscript}". Please continue or click stop when finished.`
            }));
          }
        };
        
        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAiBot(prev => ({ ...prev, isListening: false, currentEmotion: 'happy', isWaitingForResponse: false }));
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Audio recorded:', audioBlob);
        
        setTimeout(() => {
          setAiBot(prev => ({ 
            ...prev, 
            message: "Great response! I'm analyzing your answer. Let's move to the next question.",
            currentEmotion: 'happy'
          }));
        }, 1000);
      };
    }
  }, [isRecording]);

  const startInterview = useCallback(async (studentInfo: StudentInfo, jobDescription: JobDescription) => {
      const questions = await generateQuestionsFromBackend(jobDescription);
  
      const session: InterviewSession = {
        id: Math.random().toString(36).substr(2, 9),
        userId: studentInfo.userId || 'current-user',
        jobDescription,
        studentInfo,
        questions,
        responses: [],
        result: null,
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        duration: 0,
        currentQuestionIndex: 0,
      };
  
      setCurrentSession(session);
      setCurrentQuestionIndex(0);
      setInterviewStartTime(Date.now());
  
      setTimeout(() => {
        speak(
          `Hello ${studentInfo.name}! I'm your AI interviewer today. I'll be conducting a comprehensive ${jobDescription.type} interview for the ${jobDescription.title} position. We'll have about 6 questions, and you can take your time to answer each one. Let's begin!`
        );
      }, 1000);
  
      return session;
    },
    [speak]
  );
  



  

  const submitResponse = useCallback((questionId: string, answer: string, duration: number, audioBlob?: Blob) => {
    if (!currentSession) return;

    const responseLength = answer.length;
    const hasSpecificExamples = /example|instance|time when|experience|project|situation/i.test(answer);
    const hasQuantifiableResults = /\d+%|\d+ years?|\d+ people|\$\d+|increased|decreased|improved|achieved|delivered/i.test(answer);
    const hasRelevantKeywords = currentSession.jobDescription.requirements ? 
      new RegExp(currentSession.jobDescription.requirements.split(/[,\s]+/).slice(0, 5).join('|'), 'i').test(answer) : false;
    
    const keywords = answer.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)];

    let confidence = Math.floor(Math.random() * 20) + 70;
    let clarity = Math.floor(Math.random() * 20) + 75;
    let relevanceScore = 60;
    
    if (responseLength > 100) confidence += 5;
    if (responseLength > 200) confidence += 5;
    if (hasSpecificExamples) {
      confidence += 10;
      relevanceScore += 15;
    }
    if (hasQuantifiableResults) {
      confidence += 8;
      relevanceScore += 10;
    }
    if (hasRelevantKeywords) {
      confidence += 7;
      relevanceScore += 12;
    }
    if (duration > 30 && duration < 180) clarity += 5;
    if (uniqueKeywords.length > 10) clarity += 5;
    
    confidence = Math.min(100, confidence);
    clarity = Math.min(100, clarity);
    relevanceScore = Math.min(100, relevanceScore);

    const emotionalTones = ['confident', 'nervous', 'enthusiastic', 'calm', 'passionate'];
    const emotionalTone = emotionalTones[Math.floor(Math.random() * emotionalTones.length)];

    const response: InterviewResponse = {
      questionId,
      answer,
      audioBlob,
      duration,
      confidence,
      clarity,
      emotionalTone,
      keywords: uniqueKeywords.slice(0, 10),
      relevanceScore
    };

    const updatedSession = {
      ...currentSession,
      responses: [...currentSession.responses, response]
    };

    setCurrentSession(updatedSession);
  }, [currentSession]);

  const nextQuestion = useCallback(() => {
    if (!currentSession) return false;
    
    if (currentQuestionIndex < currentSession.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      setTimeout(() => {
        const nextQuestion = currentSession.questions[nextIndex];
        speak(nextQuestion.text);
      }, 2000);
      
      return true;
    }
    return false;
  }, [currentSession, currentQuestionIndex, speak]);

  const stopInterview = useCallback(() => {
    if (!currentSession) return null;

    const stoppedSession = {
      ...currentSession,
      status: 'stopped' as const,
      duration: Math.floor((Date.now() - interviewStartTime) / 1000),
      completedAt: new Date().toISOString()
    };

    setCurrentSession(stoppedSession);
    speak("Interview stopped. Thank you for your time. You can review your responses and continue later if needed.");
    
    return stoppedSession;
  }, [currentSession, interviewStartTime, speak]);

  const completeInterview = useCallback((): InterviewResult | null => {
    if (!currentSession || currentSession.responses.length === 0) return null;

    const responses = currentSession.responses;
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    const avgClarity = responses.reduce((sum, r) => sum + r.clarity, 0) / responses.length;
    const avgRelevance = responses.reduce((sum, r) => sum + (r.relevanceScore || 70), 0) / responses.length;
    const interviewDuration = Math.floor((Date.now() - interviewStartTime) / 1000);
    const completionRate = (responses.length / currentSession.questions.length) * 100;
    
    const technicalScore = currentSession.jobDescription.type === 'technical' ? 
      Math.floor(avgConfidence * 0.7 + avgRelevance * 0.3) : 
      Math.floor(Math.random() * 20) + 75;
    
    const communicationScore = Math.floor(avgClarity * 0.8 + avgConfidence * 0.2);
    const overallScore = Math.floor((avgConfidence + avgClarity + avgRelevance + completionRate) / 4);
    
    const result: InterviewResult = {
      overallScore,
      categoryScores: {
        communication: communicationScore,
        technical: technicalScore,
        confidence: Math.floor(avgConfidence),
        clarity: Math.floor(avgClarity),
        emotionalIntelligence: Math.floor(Math.random() * 25) + 70
      },
      responses,
      feedback: [
        "Your responses demonstrated good structure and thoughtfulness.",
        "You maintained professional composure throughout the interview.",
        avgRelevance > 80 ? "Your examples were highly relevant and well-articulated." : "Your examples were relevant and well-articulated.",
        currentSession.jobDescription.type === 'technical' ? 
          "Your technical knowledge appears solid for this role." :
          "Consider providing more quantified achievements in future interviews."
      ],
      recommendations: [
        "Practice the STAR method for behavioral questions",
        `Research more about ${currentSession.jobDescription.company}'s recent developments`,
        avgClarity < 80 ? "Work on reducing filler words for clearer communication" : "Continue maintaining clear communication",
        currentSession.jobDescription.type === 'technical' ? 
          "Continue building hands-on experience with relevant technologies" :
          "Prepare more specific examples of your achievements"
      ],
      strengths: [
        "Clear and articulate communication",
        "Professional demeanor and confidence",
        avgRelevance > 75 ? "Excellent use of relevant examples" : "Good use of relevant examples",
        currentSession.jobDescription.type === 'technical' ? 
          "Strong technical knowledge demonstration" :
          "Strong understanding of role requirements"
      ],
      areasForImprovement: [
        avgRelevance < 70 ? "Provide more specific and relevant examples" : "Could provide more quantified results",
        "Body language and eye contact",
        currentSession.jobDescription.type === 'technical' ? 
          "Explaining complex concepts more simply" :
          "Elaborating on leadership experiences",
        "Asking more insightful questions about the role"
      ],
      interviewDuration,
      completionRate,
      detailedAnalysis: {
        responseQuality: Math.floor(avgRelevance),
        technicalAccuracy: technicalScore,
        communicationSkills: communicationScore,
        problemSolvingAbility: Math.floor(avgConfidence * 0.8 + avgRelevance * 0.2)
      }
    };

    const completedSession = {
      ...currentSession,
      result,
      status: 'completed' as const,
      duration: interviewDuration,
      completedAt: new Date().toISOString()
    };

    setCurrentSession(completedSession);
    
    // Store interview in database for HR dashboard
    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    interviews.push(completedSession);
    localStorage.setItem('interviews', JSON.stringify(interviews));
    
    speak(`Excellent! We've completed the interview. You scored ${result.overallScore} out of 100. I'll now prepare your detailed feedback report. Thank you for your time!`);
    
    return result;
  }, [currentSession, interviewStartTime, speak]);

  const getCurrentQuestion = useCallback(() => {
    if (!currentSession) return null;
    return currentSession.questions[currentQuestionIndex] || null;
  }, [currentSession, currentQuestionIndex]);

  return {
    currentSession,
    currentQuestionIndex,
    aiBot,
    isRecording,
    startInterview,
    submitResponse,
    nextQuestion,
    stopInterview,
    completeInterview,
    getCurrentQuestion,
    startListening,
    stopListening,
    speak,
    questionsRemaining: currentSession ? currentSession.questions.length - currentQuestionIndex - 1 : 0,
    progress: currentSession ? ((currentQuestionIndex + 1) / currentSession.questions.length) * 100 : 0
  };
};
