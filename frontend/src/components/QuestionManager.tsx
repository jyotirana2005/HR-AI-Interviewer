import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Search, Filter, BookOpen, Code, Users, Building } from 'lucide-react';
import { Question } from '../types';

interface QuestionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'hr' | 'technical'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // const [jobDescription, setjobdescription] = useState('');
  // const [rawGenerated, setRawGenerated] = useState<string[]>([]);



  
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({
    text: '',
    type: 'behavioral',
    timeLimit: 120,
    difficulty: 'medium',
    department: 'general',
    category: 'general'
  });

  const departments = ['general', 'engineering', 'marketing', 'sales', 'design', 'product', 'finance', 'hr'];
  const categories = ['general', 'leadership', 'teamwork', 'problem-solving', 'communication', 'technical-skills', 'company-culture'];

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, filterType, filterDifficulty, filterDepartment]);

  // const fetchGeneratedQuestions = async () => {
  //   const jobDescription = prompt("Enter job description:");
  //   if (!jobDescription || !jobDescription.trim()) return;
  
  //   try {
  //     const res = await fetch("http://localhost:5000/generate_question", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ job_description: jobDescription }),
  //     });
  
  //     const data = await res.json();
  //     if (!res.ok) {
  //       alert("Failed to fetch: " + data.error);
  //       return;
  //     }
  
  //     setRawGenerated(data.questions || []);
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     alert("Error fetching generated questions");
  //   }
  // };
  

  const loadQuestions = () => {
    const stored = localStorage.getItem('hr-questions');
    if (stored) {
      const loadedQuestions = JSON.parse(stored);
      setQuestions(loadedQuestions);
    } else {
      // Initialize with default questions
      const defaultQuestions: Question[] = [
        {
          id: '1',
          text: 'Tell me about yourself and why you\'re interested in this position.',
          type: 'behavioral',
          timeLimit: 120,
          difficulty: 'easy',
          department: 'general',
          category: 'general'
        },
        {
          id: '2',
          text: 'Describe a challenging project you worked on and how you overcame obstacles.',
          type: 'behavioral',
          timeLimit: 180,
          difficulty: 'medium',
          department: 'general',
          category: 'problem-solving'
        },
        {
          id: '3',
          text: 'Explain the concept of RESTful APIs and their advantages.',
          type: 'technical',
          timeLimit: 240,
          difficulty: 'medium',
          department: 'engineering',
          category: 'technical-skills'
        },
        {
          id: '4',
          text: 'How would you handle a situation where a team member consistently misses deadlines?',
          type: 'situational',
          timeLimit: 150,
          difficulty: 'medium',
          department: 'general',
          category: 'leadership'
        }
      ];
      setQuestions(defaultQuestions);
      localStorage.setItem('hr-questions', JSON.stringify(defaultQuestions));
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(q => {
        if (filterType === 'hr') return q.type === 'behavioral' || q.type === 'situational';
        if (filterType === 'technical') return q.type === 'technical';
        return true;
      });
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(q => q.department === filterDepartment);
    }

    setFilteredQuestions(filtered);
  };

  const saveQuestions = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    localStorage.setItem('hr-questions', JSON.stringify(updatedQuestions));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;

    // Check for duplicates
    const isDuplicate = questions.some(q => 
      q.text.toLowerCase().trim() === newQuestion.text.toLowerCase().trim()
    );

    if (isDuplicate) {
      alert('This question already exists!');
      return;
    }

    const question: Question = {
      ...newQuestion,
      id: Date.now().toString()
    };

    const updatedQuestions = [...questions, question];
    saveQuestions(updatedQuestions);
    
    setNewQuestion({
      text: '',
      type: 'behavioral',
      timeLimit: 120,
      difficulty: 'medium',
      department: 'general',
      category: 'general'
    });
    setIsAddingNew(false);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;

    // Check for duplicates (excluding current question)
    const isDuplicate = questions.some(q => 
      q.id !== editingQuestion.id && 
      q.text.toLowerCase().trim() === editingQuestion.text.toLowerCase().trim()
    );

    if (isDuplicate) {
      alert('This question already exists!');
      return;
    }

    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    );
    saveQuestions(updatedQuestions);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      saveQuestions(updatedQuestions);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <Code className="h-4 w-4" />;
      case 'behavioral': return <Users className="h-4 w-4" />;
      case 'situational': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass rounded-3xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white font-orbitron">Question Bank Manager</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

{/* 

        <button onClick={fetchGeneratedQuestions} className="bg-cyber-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Fetch Raw Generated Questions
        </button>

        {rawGenerated.length > 0 && (
  <div className="bg-dark-200/30 p-4 rounded-lg border border-white/10 text-white mt-4">
    <h3 className="text-lg font-semibold mb-2">Generated Questions:</h3>
    <ul className="list-disc list-inside space-y-2">
      {rawGenerated.map((q, index) => (
        <li key={index} className="text-sm">{q}</li>
      ))}
    </ul>
  </div>
)} */}





        {/* Filters and Search */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-200/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="hr">HR Questions</option>
              <option value="technical">Technical Questions</option>
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as any)}
              className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</option>
              ))}
            </select>

            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-gradient-to-r from-cyber-blue to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <AnimatePresence>
            {/* Add New Question Form */}
            {isAddingNew && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-dark-200/30 rounded-xl p-4 mb-4 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <textarea
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter your question..."
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as any }))}
                      className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="situational">Situational</option>
                    </select>

                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>

                    <select
                      value={newQuestion.department}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, department: e.target.value }))}
                      className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={newQuestion.timeLimit}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      placeholder="Time (seconds)"
                      className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                    />
                  </div>

                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}</option>
                    ))}
                  </select>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddQuestion}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Question</span>
                    </button>
                    <button
                      onClick={() => setIsAddingNew(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-dark-200/30 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  {editingQuestion?.id === question.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <textarea
                        value={editingQuestion.text}
                        onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, text: e.target.value } : null)}
                        rows={3}
                        className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue"
                      />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <select
                          value={editingQuestion.type}
                          onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                          className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="behavioral">Behavioral</option>
                          <option value="technical">Technical</option>
                          <option value="situational">Situational</option>
                        </select>

                        <select
                          value={editingQuestion.difficulty}
                          onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, difficulty: e.target.value as any } : null)}
                          className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>

                        <select
                          value={editingQuestion.department}
                          onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, department: e.target.value } : null)}
                          className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                        >
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={editingQuestion.timeLimit}
                          onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, timeLimit: parseInt(e.target.value) } : null)}
                          className="bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleUpdateQuestion}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingQuestion(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-white leading-relaxed flex-1 mr-4">{question.text}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30">
                          {getTypeIcon(question.type)}
                          <span>{question.type}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          <Building className="h-3 w-3 inline mr-1" />
                          {question.department}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {question.timeLimit}s
                        </span>
                        {question.category && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                            {question.category.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No questions found matching your criteria.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionManager;




