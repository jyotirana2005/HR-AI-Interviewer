import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, MessageSquare, Brain, Download, RotateCcw, Star, CheckCircle, AlertTriangle, Award } from 'lucide-react';
import Layout from '../components/Layout';
import { InterviewResult } from '../types';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('interviewResult');
    if (!storedResult) {
      navigate('/student-info');
      return;
    }
    setResult(JSON.parse(storedResult));
  }, [navigate]);

  const handleDownloadReport = () => {
    if (!result) return;
    
    const reportContent = `
AI INTERVIEW FEEDBACK REPORT
============================

Overall Performance: ${result.overallScore}/100
Interview Duration: ${Math.floor(result.interviewDuration / 60)}:${(result.interviewDuration % 60).toString().padStart(2, '0')}
Completion Rate: ${result.completionRate}%

CATEGORY SCORES:
- Communication: ${result.categoryScores.communication}/100
- Technical: ${result.categoryScores.technical}/100
- Confidence: ${result.categoryScores.confidence}/100
- Clarity: ${result.categoryScores.clarity}/100
- Emotional Intelligence: ${result.categoryScores.emotionalIntelligence}/100

STRENGTHS:
${result.strengths.map(s => `- ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${result.areasForImprovement.map(a => `- ${a}`).join('\n')}

FEEDBACK:
${result.feedback.map(f => `- ${f}`).join('\n')}

RECOMMENDATIONS:
${result.recommendations.map(r => `- ${r}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
AI Interviewer Pro - Next-Gen Interview Platform
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-interview-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (score >= 60) return <Star className="h-5 w-5 text-yellow-400" />;
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Exceptional', emoji: '🏆', color: 'from-yellow-400 to-orange-500' };
    if (score >= 80) return { level: 'Excellent', emoji: '🌟', color: 'from-green-400 to-emerald-500' };
    if (score >= 70) return { level: 'Good', emoji: '👍', color: 'from-blue-400 to-cyan-500' };
    if (score >= 60) return { level: 'Fair', emoji: '📈', color: 'from-yellow-400 to-amber-500' };
    return { level: 'Needs Improvement', emoji: '💪', color: 'from-red-400 to-pink-500' };
  };

  if (!result) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Loading Results...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const performance = getPerformanceLevel(result.overallScore);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyber-blue to-purple-600 rounded-full mb-4 glow-blue">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 neon-text">Interview Complete!</h1>
          <p className="text-gray-300">Here's your comprehensive AI-powered performance analysis</p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          className={`bg-gradient-to-r ${performance.color} rounded-3xl p-8 mb-8 text-white shadow-2xl`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-6xl mb-2">{performance.emoji}</div>
            <h2 className="text-2xl font-bold mb-4">{performance.level} Performance</h2>
            <div className="text-7xl font-bold mb-2">{result.overallScore}</div>
            <div className="text-xl opacity-90 mb-4">out of 100</div>
            <div className="flex justify-center space-x-8 text-sm opacity-80">
              <div>
                <div className="font-semibold">Duration</div>
                <div>{Math.floor(result.interviewDuration / 60)}:{(result.interviewDuration % 60).toString().padStart(2, '0')}</div>
              </div>
              <div>
                <div className="font-semibold">Completion</div>
                <div>{result.completionRate}%</div>
              </div>
              <div>
                <div className="font-semibold">Questions</div>
                <div>{result.responses.length} answered</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Scores */}
          <motion.div
            className="glass rounded-3xl p-8 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-cyber-blue" />
              Performance Breakdown
            </h3>
            
            <div className="space-y-4">
              {Object.entries(result.categoryScores).map(([category, score], index) => (
                <motion.div
                  key={category}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    {getScoreIcon(score)}
                    <span className="font-medium text-white capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-dark-200/50 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-cyber-blue to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strengths */}
          <motion.div
            className="glass rounded-3xl p-8 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-400" />
              Your Strengths
            </h3>
            
            <div className="space-y-3">
              {result.strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">{strength}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feedback and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Areas for Improvement */}
          <motion.div
            className="glass rounded-3xl p-8 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-400" />
              Areas for Improvement
            </h3>
            
            <div className="space-y-3">
              {result.areasForImprovement.map((area, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">{area}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            className="glass rounded-3xl p-8 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-400" />
              AI Recommendations
            </h3>
            
            <div className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Feedback */}
        <motion.div
          className="glass rounded-3xl p-8 border border-white/10 shadow-2xl mt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-cyber-blue" />
            Detailed AI Feedback
          </h3>
          
          <div className="space-y-4">
            {result.feedback.map((feedback, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-cyber-blue/10 to-purple-600/10 rounded-2xl p-4 border border-cyber-blue/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <p className="text-gray-300">{feedback}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button
            onClick={handleDownloadReport}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-2 glow-green"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/student-info')}
            className="bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-2 glow-blue"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Take Another Interview</span>
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ResultsPage;