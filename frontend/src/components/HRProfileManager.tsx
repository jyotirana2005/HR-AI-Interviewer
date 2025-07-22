import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  X, 
  Edit, 
  Camera, 
  CreditCard, 
  Briefcase,
  Award,
  Calendar,
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import LoadingSpinner from './LoadingSpinner';

interface HRProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const HRProfileManager: React.FC<HRProfileManagerProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    hrId: '',
    employeeId: '',
    department: '',
    designation: '',
    companyExperience: 0,
    areasOfExpertise: [] as string[]
  });
  
  const [currentExpertise, setCurrentExpertise] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [updateHistory, setUpdateHistory] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>({});

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

  const departments = [
    'Human Resources',
    'Engineering',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Product',
    'Design',
    'Legal',
    'Customer Success'
  ];

  const expertiseAreas = [
    'Talent Acquisition',
    'Employee Relations',
    'Performance Management',
    'Compensation & Benefits',
    'Training & Development',
    'HR Analytics',
    'Organizational Development',
    'Compliance',
    'Diversity & Inclusion',
    'Employee Engagement'
  ];

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        hrId: user.hrId || '',
        employeeId: user.employeeId || '',
        department: user.department || '',
        designation: user.designation || '',
        companyExperience: user.companyExperience || 0,
        areasOfExpertise: user.areasOfExpertise || []
      };
      setFormData(userData);
      setOriginalData(userData);
      loadUpdateHistory();
    }
  }, [user]);

  useEffect(() => {
    // Check for changes
    const hasDataChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [formData, originalData]);

  const loadUpdateHistory = () => {
    const history = JSON.parse(localStorage.getItem(`profile-history-${user?.id}`) || '[]');
    setUpdateHistory(history);
  };

  const saveUpdateHistory = (changes: Record<string, { old: any; new: any }>) => {
    const historyEntry = {
      id: Date.now().toString(),
      userId: user?.id,
      changes,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name
    };

    const history = JSON.parse(localStorage.getItem(`profile-history-${user?.id}`) || '[]');
    history.unshift(historyEntry);
    
    // Keep only last 20 entries
    const trimmedHistory = history.slice(0, 20);
    localStorage.setItem(`profile-history-${user?.id}`, JSON.stringify(trimmedHistory));
    setUpdateHistory(trimmedHistory);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const addExpertise = () => {
    if (currentExpertise.trim() && !formData.areasOfExpertise.includes(currentExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        areasOfExpertise: [...prev.areasOfExpertise, currentExpertise.trim()]
      }));
      setCurrentExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfExpertise: prev.areasOfExpertise.filter(e => e !== expertise)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Calculate changes for history
      const changes: Record<string, { old: any; new: any }> = {};
      Object.keys(formData).forEach(key => {
        if (JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])) {
          changes[key] = {
            old: originalData[key],
            new: formData[key as keyof typeof formData]
          };
        }
      });

      const updates = {
        ...formData,
        avatar: capturedPhoto || user?.avatar,
        lastUpdated: new Date().toISOString()
      };

      const success = await updateProfile(updates);
      
      if (success) {
        setSuccess('Profile updated successfully!');
        setOriginalData(formData);
        setHasChanges(false);
        
        // Save update history
        if (Object.keys(changes).length > 0) {
          saveUpdateHistory(changes);
        }
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Failed to update profile. Please try again.');
      }
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

  const getProfileCompletion = () => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.company,
      formData.hrId,
      formData.employeeId,
      formData.department,
      formData.designation,
      formData.companyExperience > 0,
      formData.areasOfExpertise.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  if (!isOpen || !user) return null;

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
            <h2 className="text-2xl font-bold text-white font-orbitron">HR Profile Management</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-dark-200/50 rounded-full h-2 w-32">
                  <motion.div
                    className="bg-gradient-to-r from-cyber-blue to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProfileCompletion()}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-sm text-gray-300">{getProfileCompletion()}% Complete</span>
              </div>
              {hasChanges && (
                <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <History className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2">
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

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-400" />
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="hrId" className="block text-sm font-medium text-gray-300 mb-2">
                      HR ID *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="hrId"
                        name="hrId"
                        type="text"
                        value={formData.hrId}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300 mb-2">
                      Employee ID
                    </label>
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="designation" className="block text-sm font-medium text-gray-300 mb-2">
                      Designation/Role
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior HR Manager"
                        className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyExperience" className="block text-sm font-medium text-gray-300 mb-2">
                      Company Experience (Years)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="companyExperience"
                        name="companyExperience"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.companyExperience}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Areas of Expertise */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-400" />
                  Areas of Expertise
                </h3>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <select
                      value={currentExpertise}
                      onChange={(e) => setCurrentExpertise(e.target.value)}
                      className="flex-1 px-4 py-2 bg-dark-200/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue transition-all duration-200"
                    >
                      <option value="">Select an area of expertise</option>
                      {expertiseAreas.filter(area => !formData.areasOfExpertise.includes(area)).map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addExpertise}
                      disabled={!currentExpertise}
                      className="px-4 py-2 bg-gradient-to-r from-cyber-blue to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.areasOfExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.areasOfExpertise.map((expertise, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border border-yellow-400/30"
                        >
                          {expertise}
                          <button
                            type="button"
                            onClick={() => removeExpertise(expertise)}
                            className="ml-2 text-yellow-400 hover:text-white transition-colors"
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
                  disabled={isLoading || !hasChanges}
                  className="flex-1 bg-gradient-to-r from-cyber-blue to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-futuristic flex items-center justify-center space-x-2 glow-blue disabled:opacity-50"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Update History Sidebar */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-dark-200/30 rounded-xl p-4 border border-white/10"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-400" />
                    Update History
                  </h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updateHistory.length > 0 ? (
                      updateHistory.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-dark-200/50 rounded-lg p-3 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">
                              {new Date(entry.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(entry.updatedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            {Object.entries(entry.changes).map(([field, change]) => (
                              <div key={field} className="text-xs">
                                <span className="text-gray-300 capitalize">
                                  {field.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <div className="ml-2">
                                  <span className="text-red-400 line-through">
                                    {Array.isArray(change.old) ? change.old.join(', ') : change.old || 'Empty'}
                                  </span>
                                  <span className="text-gray-400 mx-1">→</span>
                                  <span className="text-green-400">
                                    {Array.isArray(change.new) ? change.new.join(', ') : change.new || 'Empty'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No update history yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HRProfileManager;