import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';

interface AnalyticsData {
  sessionId: string;
  timestamp: string;
  faceDetectionAccuracy: number;
  responseQuality: number;
  engagementLevel: number;
  technicalScore?: number;
}

interface InterviewAnalyticsProps {
  sessionId: string;
  isVisible: boolean;
}

const InterviewAnalytics: React.FC<InterviewAnalyticsProps> = ({ sessionId, isVisible }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    currentEngagement: 0,
    faceDetectionStatus: 'checking',
    responseCount: 0,
    averageResponseTime: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/analytics/${sessionId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.analytics || []);
          setRealTimeMetrics(data.realTimeMetrics || realTimeMetrics);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    // Fetch analytics every 5 seconds during interview
    const interval = setInterval(fetchAnalytics, 5000);
    fetchAnalytics(); // Initial fetch

    return () => clearInterval(interval);
  }, [sessionId, isVisible]);

  const sendAnalyticsEvent = async (eventType: string, data: any) => {
    try {
      await fetch('http://127.0.0.1:5000/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType,
          timestamp: new Date().toISOString(),
          data
        })
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/10 mt-4"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-cyber-blue" />
        Real-time Analytics
      </h3>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-200/30 rounded-xl p-3 text-center">
          <Users className="h-6 w-6 text-green-400 mx-auto mb-1" />
          <div className="text-sm text-gray-300">Engagement</div>
          <div className="text-lg font-bold text-green-400">
            {realTimeMetrics.currentEngagement}%
          </div>
        </div>

        <div className="bg-dark-200/30 rounded-xl p-3 text-center">
          <Clock className="h-6 w-6 text-blue-400 mx-auto mb-1" />
          <div className="text-sm text-gray-300">Avg Response</div>
          <div className="text-lg font-bold text-blue-400">
            {realTimeMetrics.averageResponseTime}s
          </div>
        </div>

        <div className="bg-dark-200/30 rounded-xl p-3 text-center">
          <Award className="h-6 w-6 text-purple-400 mx-auto mb-1" />
          <div className="text-sm text-gray-300">Responses</div>
          <div className="text-lg font-bold text-purple-400">
            {realTimeMetrics.responseCount}
          </div>
        </div>

        <div className="bg-dark-200/30 rounded-xl p-3 text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
            realTimeMetrics.faceDetectionStatus === 'detected' ? 'bg-green-400' : 
            realTimeMetrics.faceDetectionStatus === 'checking' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <div className="text-sm text-gray-300">Face Status</div>
          <div className="text-xs text-gray-400 capitalize">
            {realTimeMetrics.faceDetectionStatus}
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      {analyticsData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="engagementLevel" 
                stroke="#00d4ff" 
                strokeWidth={2}
                name="Engagement"
              />
              <Line 
                type="monotone" 
                dataKey="responseQuality" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Response Quality"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default InterviewAnalytics;