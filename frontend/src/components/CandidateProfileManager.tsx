import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Save, 
  X, 
  Camera, 
  Briefcase,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import LoadingSpinner from './LoadingSpinner';

interface CandidateProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CandidateProfileManager: React.FC<CandidateProfileManagerProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    major: '',
    graduationYear: '',
    experience: '',
    skills: [] as string[],
    certifications: [] as string[]
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    isActive,
    capturedPhoto,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto
  } = useCamera();

  const educationLevels = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Certification'
  ];

  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'C++',
    'Communication', 'Leadership', 'Project Management', 'Problem Solving',
    'Teamwork', 'Time Management', 'Critical Thinking', 'Adaptability'
  ];

  const commonCertifications = [
    'AWS Certified Solutions Architect',
    'Google Cloud Professional',
    'Microsoft Azure Fundamentals',
    'PMP (Project Management Professional)',
    'Scrum Master Certification',
    'CompTIA Security+',
    'Cisco CCNA',
    'Salesforce Administrator'
  ];

  useEffect(() => {
    if (user) {
      const studentInfo = localStorage.getItem('studentInfo');
      let userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        education: '',
        major: '',
        graduationYear: '',
        experience: '',
        skills: [] as string[],
        certifications: [] as string[]
      };

      if (studentInfo) {
        const parsed = JSON.parse(studentInfo);
        userData = { ...userData, ...parsed };
      }

      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  useEffect(() => {
    const hasDataChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);

    // Auto-save functionality
    if (hasDataChanged && autoSaveEnabled && user) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, originalData, autoSaveEnabled, user]);

  const handleAutoSave = async () => {
    if (!hasChanges) return;

    try {
      const updates = {
        ...formData,
        avatar: capturedPhoto || user?.avatar,
        lastUpdated: new Date().toISOString(),
        profileCompletion: calculateProfileCompletion()
      };

      localStorage.setItem('studentInfo', JSON.stringify(updates));
      setLastSaved(new Date());
      setOriginalData(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.education,
      formData.major,
      formData.graduationYear,
      formData.experience,
      formData.skills.length > 0,
      formData.certifications.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addCertification = () => {
    if (currentCertification.trim() && !formData.certifications.includes(currentCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, currentCertification.trim()]
      }));
      setCurrentCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updates = {
        ...formData,
        avatar: capturedPhoto || user?.avatar,
        lastUpdated: new Date().toISOString(),
        profileCompletion: calculateProfileCompletion()
      };

      // Save to localStorage
      localStorage.setItem('studentInfo', JSON.stringify(updates));
      
      // Update user profile if needed
      const userUpdates = {
        name: formData.name,
        phone: formData.phone
      };
      
      await updateProfile(userUpdates);
      
      setSuccess('Profile updated successfully!');
      setOriginalData(formData);
      setHasChanges(false);
      setLastSaved(new Date());
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const handleCameraToggle = async () => {
    if (showCamera && isActive) {
      stopCamera();
    }
    setShowCamera(!showCamera);
    
    if (!showCamera && !isActive) {
      try {
        await startCamera();
      } catch (error) {
        setError('Unable to access camera. Please check permissions.');
      }
    }
  };

  if (!isOpen || !user) return null;

  const profileCompletion = calculateProfileCompletion();

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass rounded-3xl p-8 border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-orbitron">Candidate Profile</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-cyber-blue" />
                <div className="w-32 bg-dark-200/50 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-cyber-blue to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-sm text-gray-300">{profileCompletion}% Complete</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoSave" className="text-sm text-gray-300">Auto-save</label>
              </div>
              
              {lastSaved && (
                <div className="text-xs text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              {hasChanges && (
                <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Photo Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-cyber-blue" />
              Profile Photo
            </h3>
            
            <div className="flex items-center space-x-6">
              {/* Photo Preview */}
              <div className="relative">
                {capturedPhoto || user.avatar ? (
                  <div className="relative">
                    <img
                      src={capturedPhoto || user.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-cyber-blue glow-blue"
                    />
                    {capturedPhoto && (
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-dark-200/50 border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCameraToggle}
                  className="btn-futuristic bg-gradient-to-r from-cyber-blue to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>{showCamera ? 'Hide Camera' : 'Open Camera'}</span>
                </button>

                {isActive && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="btn-futuristic bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    Take Photo
                  </button>
                )}
              </div>
            </div>

            {/* Camera Preview */}
            {showCamera && (
              <div className="mt-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-64 h-48 object-cover rounded-xl border border-white/10"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-400" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    required
                    disabled
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-purple-400" />
              Education Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-300 mb-2">
                  Education Level *
                </label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  required
                >
                  <option value="">Select education level</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-300 mb-2">
                  Major/Specialization *
                </label>
                <input
                  id="major"
                  name="major"
                  type="text"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  placeholder="Computer Science, Business, etc."
                  required
                />
              </div>

              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-300 mb-2">
                  Graduation Year *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="text"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    placeholder="2024"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-orange-400" />
              Work Experience
            </h3>
            
            <textarea
              id="experience"
              name="experience"
              rows={4}
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
              placeholder="Describe your relevant work experience, internships, or projects..."
            />
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-400" />
              Skills & Technologies
            </h3>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <select
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  className="flex-1 px-4 py-2 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                >
                  <option value="">Select a skill or type custom</option>
                  {commonSkills.filter(skill => !formData.skills.includes(skill)).map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  placeholder="Or type custom skill"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!currentSkill}
                  className="px-4 py-2 bg-gradient-to-r from-cyber-blue to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-cyber-blue/20 to-purple-600/20 text-cyber-blue border border-cyber-blue/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-cyber-blue hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-400" />
              Certifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <select
                  value={currentCertification}
                  onChange={(e) => setCurrentCertification(e.target.value)}
                  className="flex-1 px-4 py-2 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                >
                  <option value="">Select a certification or type custom</option>
                  {commonCertifications.filter(cert => !formData.certifications.includes(cert)).map(cert => (
                    <option key={cert} value={cert}>{cert}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={currentCertification}
                  onChange={(e) => setCurrentCertification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  className="flex-1 px-4 py-2 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                  placeholder="Or type custom certification"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  disabled={!currentCertification}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((certification, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-400 border border-green-500/30"
                    >
                      {certification}
                      <button
                        type="button"
                        onClick={() => removeCertification(certification)}
                        className="ml-2 text-green-400 hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-3"
            >
              <p className="text-green-400 text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {success}
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-2 glow-blue disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CandidateProfileManager;