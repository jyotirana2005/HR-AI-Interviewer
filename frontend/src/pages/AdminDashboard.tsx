import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Building, 
  BarChart3, 
  Filter,
  Search,
  Download,
  Eye,
  LogOut,
  RefreshCw,
  Award,
  Target,
  Globe,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import ThreeDBackground from '../components/3DBackground';
import { AdminDashboardStats, InterviewSession } from '../types';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth?role=candidate');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = () => {
    // Load all data from localStorage (mock database)
    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Generate comprehensive admin stats
    const companies = [...new Set(interviews.map((i: InterviewSession) => i.jobDescription.company))];
    const totalUsers = users.length;
    const totalInterviews = interviews.length + Math.floor(Math.random() * 500) + 200;
    const todayInterviews = Math.floor(Math.random() * 50) + 20;
    
    // Company-wise statistics
    const companyWiseStats = companies.map(company => ({
      company,
      interviews: interviews.filter((i: InterviewSession) => i.jobDescription.company === company).length + Math.floor(Math.random() * 50) + 10,
      avgScore: Math.floor(Math.random() * 25) + 70,
      candidates: Math.floor(Math.random() * 30) + 15
    }));

    // Monthly trends
    const monthlyTrends = [
      { month: 'Jan', interviews: 120, avgScore: 78 },
      { month: 'Feb', interviews: 150, avgScore: 82 },
      { month: 'Mar', interviews: 180, avgScore: 75 },
      { month: 'Apr', interviews: 220, avgScore: 88 },
      { month: 'May', interviews: 190, avgScore: 85 },
      { month: 'Jun', interviews: 250, avgScore: 79 }
    ];

    // Top performing companies
    const topPerformingCompanies = companyWiseStats
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // Skills analysis
    const skillsAnalysis = [
      { skill: 'JavaScript', frequency: 85, avgScore: 82 },
      { skill: 'React', frequency: 78, avgScore: 79 },
      { skill: 'Python', frequency: 65, avgScore: 85 },
      { skill: 'Communication', frequency: 95, avgScore: 77 },
      { skill: 'Leadership', frequency: 45, avgScore: 88 },
      { skill: 'Problem Solving', frequency: 88, avgScore: 81 }
    ];

    const mockStats: AdminDashboardStats = {
      totalUsers,
      totalInterviews,
      totalCompanies: companies.length + 15,
      todayInterviews,
      averageScore: Math.floor(Math.random() * 20) + 75,
      completionRate: Math.floor(Math.random() * 15) + 85,
      companyWiseStats,
      monthlyTrends,
      topPerformingCompanies,
      skillsAnalysis,
      recentInterviews: interviews.slice(-15)
    };
    
    setStats(mockStats);
  };

  const filteredInterviews = stats?.recentInterviews.filter(interview => {
    const matchesSearch = interview.studentInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobDescription.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'all' || interview.jobDescription.company === selectedCompany;
    return matchesSearch && matchesCompany;
  }) || [];

  const exportData = () => {
    if (!stats) return;
    
    const exportContent = {
      summary: {
        totalUsers: stats.totalUsers,
        totalInterviews: stats.totalInterviews,
        totalCompanies: stats.totalCompanies,
        averageScore: stats.averageScore
      },
      companyStats: stats.companyWiseStats,
      monthlyTrends: stats.monthlyTrends,
      topCompanies: stats.topPerformingCompanies,
      skillsAnalysis: stats.skillsAnalysis,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!stats) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-cyber-blue mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Admin Dashboard...</h2>
          <p className="text-gray-400">Analyzing platform data</p>
        </div>
      </div>
    );
  }

  const pieColors = ['#00d4ff', '#9333ea', '#22c55e', '#f97316', '#ec4899', '#8b5cf6'];

  return (
    <div className="min-h-screen animated-bg relative">
      <ThreeDBackground />
      
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white/10 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-2 rounded-xl glow-red">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-orbitron">ADMIN DASHBOARD</h1>
                <p className="text-sm text-gray-300 font-mono">Platform Analytics & Management</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={loadAdminData}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
              
              <motion.button
                onClick={exportData}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4" />
              </motion.button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{user?.name}</span>
              </div>
              
              <motion.button
                onClick={logout}
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors btn-futuristic px-3 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2 font-orbitron">
            Platform Overview 🚀
          </h2>
          <p className="text-gray-300">Complete analytics and insights across all companies and users</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Total Users',
              value: stats.totalUsers.toLocaleString(),
              icon: Users,
              color: 'from-cyber-blue to-blue-600',
              change: '+15%'
            },
            {
              title: 'Total Interviews',
              value: stats.totalInterviews.toLocaleString(),
              icon: Target,
              color: 'from-green-500 to-emerald-600',
              change: '+23%'
            },
            {
              title: 'Companies',
              value: stats.totalCompanies,
              icon: Building,
              color: 'from-purple-500 to-pink-600',
              change: '+8%'
            },
            {
              title: 'Platform Score',
              value: `${stats.averageScore}%`,
              icon: Award,
              color: 'from-orange-500 to-red-600',
              change: '+5%'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/10 holographic"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-orbitron">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white font-orbitron">Monthly Trends</h3>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="month">Last 6 Months</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="interviews" 
                  stroke="#00d4ff" 
                  fill="url(#colorInterviews)" 
                />
                <defs>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Company Performance */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6 font-orbitron">Top Performing Companies</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topPerformingCompanies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="company" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="avgScore" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Skills Analysis & Company Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Skills Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6 font-orbitron">Skills Analysis</h3>
            <div className="space-y-4">
              {stats.skillsAnalysis.map((skill, index) => (
                <motion.div
                  key={skill.skill}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-cyber-blue" />
                    <span className="font-medium text-white">{skill.skill}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-dark-200/50 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-cyber-blue to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.frequency}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-sm text-gray-300 w-12">{skill.frequency}%</span>
                    <span className="text-sm text-green-400 w-12">{skill.avgScore}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Company Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6 font-orbitron">Company Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.companyWiseStats.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="interviews"
                  label={({ company, interviews }) => `${company}: ${interviews}`}
                >
                  {stats.companyWiseStats.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* All Interviews Table */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white font-orbitron">All Platform Interviews</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-dark-200/50 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue"
                />
              </div>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="all">All Companies</option>
                {[...new Set(stats.recentInterviews.map(i => i.jobDescription.company))].map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Candidate</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Position</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.length > 0 ? (
                  filteredInterviews.map((interview, index) => (
                    <motion.tr
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {interview.studentInfo.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{interview.studentInfo.name}</div>
                            <div className="text-gray-400 text-sm">{interview.studentInfo.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-white font-medium">{interview.jobDescription.company}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white">{interview.jobDescription.title}</div>
                        <div className="text-gray-400 text-sm">{interview.jobDescription.level}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`text-lg font-bold ${
                            interview.result && interview.result.overallScore >= 80 ? 'text-green-400' :
                            interview.result && interview.result.overallScore >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {interview.result ? `${interview.result.overallScore}%` : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          interview.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          interview.status === 'stopped' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Download className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No interviews found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;