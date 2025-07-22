import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, BarChart3, Sparkles, Zap, Shield, Brain, ArrowRight, Star, Award, TrendingUp, Crown } from 'lucide-react';
import ThreeDBackground from '../components/3DBackground';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced neural networks analyze speech patterns, confidence, and communication skills',
      color: 'from-purple-500 to-pink-500',
      delay: 0.1
    },
    {
      icon: Zap,
      title: 'Real-time Feedback',
      description: 'Instant scoring and personalized recommendations during your interview',
      color: 'from-yellow-500 to-orange-500',
      delay: 0.2
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with end-to-end encryption for all your data',
      color: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      icon: TrendingUp,
      title: 'Performance Tracking',
      description: 'Track your progress over time with detailed analytics and insights',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.4
    }
  ];

  const stats = [
    { number: '50K+', label: 'Interviews Conducted', icon: Users },
    { number: '98%', label: 'Success Rate', icon: Award },
    { number: '4.9★', label: 'User Rating', icon: Star },
    { number: '24/7', label: 'Available', icon: Zap }
  ];

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <ThreeDBackground />
      
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-cyber-blue to-purple-600 p-3 rounded-2xl glow-blue">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-orbitron">AI INTERVIEWER</h1>
                <p className="text-sm text-gray-300 font-mono">Next-Gen Platform</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/auth?role=candidate')}
                className="btn-futuristic bg-gradient-to-r from-cyber-blue to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 glow-blue"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="h-5 w-5" />
                <span>For Candidates</span>
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/auth?role=hr')}
                className="btn-futuristic bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 glow-green"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-5 w-5" />
                <span>For HR Teams</span>
              </motion.button>

              <motion.button
                onClick={() => navigate('/auth?role=admin')}
                className="btn-futuristic bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 glow-red"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Crown className="h-5 w-5" />
                <span>Admin Panel</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-cyber-blue to-purple-600 rounded-full mb-8 shadow-2xl glow-blue float">
                <Bot className="h-16 w-16 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl lg:text-8xl font-bold text-white mb-6 font-orbitron"
            >
              AI INTERVIEWER
              <span className="block text-4xl lg:text-5xl bg-gradient-to-r from-cyber-blue to-purple-600 bg-clip-text text-transparent mt-4">
                REVOLUTION
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Experience the future of interview preparation with our advanced AI-powered virtual interviewer. 
              Get real-time feedback, personalized coaching, and boost your confidence.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.button
                onClick={() => navigate('/auth?role=candidate')}
                className="bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-4 px-8 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center space-x-3 glow-blue text-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-6 w-6" />
                <span>Start Your Interview</span>
                <ArrowRight className="h-6 w-6" />
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/auth?role=hr')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-2xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 btn-futuristic flex items-center space-x-3 glow-green text-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-6 w-6" />
                <span>HR Dashboard</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass rounded-2xl p-6 text-center border border-white/10 holographic"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <stat.icon className="h-8 w-8 text-cyber-blue mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2 font-orbitron">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-orbitron">
              REVOLUTIONARY FEATURES
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powered by cutting-edge AI technology to give you the most realistic and effective interview experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: feature.delay, duration: 0.8 }}
                className="glass rounded-3xl p-8 border border-white/10 holographic relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -10 }}
                onHoverStart={() => setHoveredCard(feature.title)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-5`} />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  
                  {hoveredCard === feature.title && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <div className={`h-1 bg-gradient-to-r ${feature.color} rounded-full`} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-12 border border-white/10 holographic"
          >
            <h2 className="text-4xl font-bold text-white mb-6 font-orbitron">
              READY TO TRANSFORM YOUR INTERVIEWS?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of successful candidates and HR professionals who trust our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/auth?role=candidate')}
                className="bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-4 px-8 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-3 glow-blue"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="h-5 w-5" />
                <span>Get Started as Candidate</span>
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/auth?role=hr')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-2xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-3 glow-green"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Access HR Dashboard</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;