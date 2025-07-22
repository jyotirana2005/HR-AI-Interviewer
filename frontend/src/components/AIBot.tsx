import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Volume2, VolumeX, Mic, MicOff, MessageCircle } from 'lucide-react';
import { AIBotState } from '../types';

interface AIBotProps {
  botState: AIBotState;
  className?: string;
}

const AIBot: React.FC<AIBotProps> = ({ botState, className = '' }) => {
  const { isListening, isSpeaking, currentEmotion, message, isWaitingForResponse } = botState;

  const getEmotionColor = () => {
    switch (currentEmotion) {
      case 'happy': return 'from-green-400 to-emerald-600';
      case 'thinking': return 'from-yellow-400 to-orange-600';
      case 'concerned': return 'from-red-400 to-pink-600';
      default: return 'from-cyber-blue to-purple-600';
    }
  };

  const getEmotionExpression = () => {
    switch (currentEmotion) {
      case 'happy': return '😊';
      case 'thinking': return '🤔';
      case 'concerned': return '😐';
      default: return '🤖';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* AI Bot Avatar */}
      <motion.div
        className="relative"
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : 1,
          rotate: isListening ? [0, 5, -5, 0] : 0,
        }}
        transition={{
          duration: isSpeaking ? 0.5 : 2,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getEmotionColor()} opacity-30 blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Main avatar container */}
        <div className={`relative w-40 h-40 rounded-full bg-gradient-to-r ${getEmotionColor()} p-1 shadow-2xl`}>
          <div className="w-full h-full rounded-full bg-dark-100 flex items-center justify-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
            
            {/* Bot icon */}
            <Bot className="w-16 h-16 text-white z-10" />
            
            {/* Emotion overlay */}
            <div className="absolute bottom-3 right-3 text-3xl">
              {getEmotionExpression()}
            </div>

            {/* Speaking/Listening indicator */}
            <motion.div
              className="absolute top-3 left-3"
              animate={{
                scale: (isSpeaking || isListening) ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: (isSpeaking || isListening) ? Infinity : 0,
              }}
            >
              {isSpeaking && <Volume2 className="w-5 h-5 text-green-400" />}
              {isListening && <Mic className="w-5 h-5 text-blue-400" />}
              {!isSpeaking && !isListening && !isWaitingForResponse && <VolumeX className="w-5 h-5 text-gray-400" />}
              {isWaitingForResponse && <MessageCircle className="w-5 h-5 text-yellow-400" />}
            </motion.div>

            {/* Waiting for response indicator */}
            {isWaitingForResponse && (
              <motion.div
                className="absolute bottom-3 left-3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="text-xs text-yellow-400 font-medium">Waiting...</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Status indicators */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? 'bg-green-400' : 
                  isListening ? 'bg-blue-400' : 
                  isWaitingForResponse ? 'bg-yellow-400' :
                  'bg-gray-600'
                }`}
                animate={{
                  scale: (isSpeaking || isListening || isWaitingForResponse) ? [1, 1.5, 1] : 1,
                  opacity: (isSpeaking || isListening || isWaitingForResponse) ? [0.5, 1, 0.5] : 0.5,
                }}
                transition={{
                  duration: 0.6,
                  repeat: (isSpeaking || isListening || isWaitingForResponse) ? Infinity : 0,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Message bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="absolute top-full mt-6 left-1/2 transform -translate-x-1/2 w-96"
        >
          <div className="bg-dark-200/90 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-xl">
            <div className="text-white text-sm leading-relaxed">
              {isSpeaking && (
                <motion.span
                  className="inline-block w-2 h-4 bg-cyber-blue rounded-sm mr-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
              {message}
            </div>
            
            {/* Speech bubble arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-dark-200/90 border-l border-t border-white/10 transform rotate-45" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIBot;