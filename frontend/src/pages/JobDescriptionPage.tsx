import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, FileText, ArrowRight, Briefcase, Target, Users, Zap, Code, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { JobDescription } from '../types';

const JobDescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies] = useState([
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Spotify',
    'Uber', 'Airbnb', 'Stripe', 'Shopify', 'Zoom', 'Slack', 'Adobe', 'Salesforce',
    'Oracle', 'IBM', 'Intel', 'NVIDIA', 'PayPal', 'Twitter', 'LinkedIn', 'Dropbox'
  ]);
  
  const [formData, setFormData] = useState<JobDescription>({
    title: '',
    company: '',
    description: '',
    requirements: '',
    level: 'entry',
    type: 'hr'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  //const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   localStorage.setItem('jobDescription', JSON.stringify(formData));
  //   navigate('/interview');
 // };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Add timestamp when saving job description
  const jobDescriptionWithTimestamp = {
    ...formData,
    userId: localStorage.getItem('studentInfo'),
    timestamp: new Date().toISOString()
  };

  try {
    // Save to localStorage with timestamp (for offline functionality)
    localStorage.setItem('jobDescription', JSON.stringify(jobDescriptionWithTimestamp));

    // Send to backend for processing and question generation
    const response = await fetch('http://localhost:5000/save-job-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...jobDescriptionWithTimestamp,
        userId: localStorage.getItem('studentInfo') ? 
          JSON.parse(localStorage.getItem('studentInfo')!).user_id : null
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Job description saved to backend:', data);
      
      // Store job ID if provided by backend
      if (data.job_id) {
        localStorage.setItem('currentJobId', data.job_id);
      }
      
      navigate('/interview');
    } else {
      const data = await response.json();
      console.error('Backend error:', data.error);
      
      // Continue anyway with localStorage data
      console.log('Continuing with offline mode...');
      navigate('/interview');
    }
  } catch (error) {
    console.error('Network or server error:', error);
    
    // Continue with offline mode if backend is unavailable
    console.log('Backend unavailable, continuing with offline mode...');
    navigate('/interview');
  }
};

  
  const isFormValid = formData.title && formData.company && formData.description;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Interview Setup</h1>
          <p className="text-gray-300">Configure your interview details for this session</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Interview Type Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Target className="h-5 w-5 mr-2 text-cyber-blue" />
                Interview Type
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.type === 'hr' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/10 bg-dark-200/30 hover:border-green-500/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'hr' }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="h-6 w-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">HR Interview</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    General behavioral questions, company culture fit, and soft skills assessment
                  </p>
                  <div className="mt-3 text-xs text-green-400">
                    • Tell me about yourself • Why this company? • Strengths & weaknesses
                  </div>
                </motion.div>

                <motion.div
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.type === 'technical' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-white/10 bg-dark-200/30 hover:border-purple-500/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'technical' }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Code className="h-6 w-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Technical Interview</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Role-specific technical questions, problem-solving, and domain expertise
                  </p>
                  <div className="mt-3 text-xs text-purple-400">
                    • Technical challenges • System design • Coding concepts
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Job Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-cyber-blue" />
                Position Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                      required
                    >
                      <option value="">Select a company</option>
                      {companies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                      <option value="other">Other (specify in description)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    placeholder="e.g., Software Engineer, Product Manager"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5+ years)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-400" />
                Job Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    placeholder="Paste the job description here or describe the role responsibilities, what the company does, and what you'll be working on..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
                    Requirements & Qualifications
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    rows={4}
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    placeholder="List the key requirements, skills, and qualifications mentioned in the job posting..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Interview Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 border border-white/10 holographic"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-cyber-blue" />
                What to Expect in Your {formData.type === 'hr' ? 'HR' : 'Technical'} Interview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(formData.type === 'hr' ? [
                  {
                    icon: Users,
                    title: 'Behavioral Questions',
                    desc: 'Tell me about yourself, strengths/weaknesses',
                    color: 'text-green-400'
                  },
                  {
                    icon: Building,
                    title: 'Company-Specific',
                    desc: 'Why this company, culture fit assessment',
                    color: 'text-blue-400'
                  },
                  {
                    icon: MessageSquare,
                    title: 'Situational',
                    desc: 'Problem-solving, teamwork scenarios',
                    color: 'text-purple-400'
                  }
                ] : [
                  {
                    icon: Code,
                    title: 'Technical Concepts',
                    desc: 'Domain-specific knowledge and expertise',
                    color: 'text-purple-400'
                  },
                  {
                    icon: Zap,
                    title: 'Problem Solving',
                    desc: 'Analytical thinking and approach',
                    color: 'text-yellow-400'
                  },
                  {
                    icon: Target,
                    title: 'System Design',
                    desc: 'Architecture and scalability concepts',
                    color: 'text-cyan-400'
                  }
                ]).map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="bg-dark-200/30 rounded-xl p-4 border border-white/5"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className={`h-6 w-6 ${item.color} mb-2`} />
                    <h4 className="font-medium text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="pt-6 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:ring-offset-2 focus:ring-offset-dark-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-futuristic flex items-center justify-center space-x-2 glow-blue"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start {formData.type === 'hr' ? 'HR' : 'Technical'} Interview</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default JobDescriptionPage;