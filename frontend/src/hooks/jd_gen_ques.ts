import { useState, useCallback } from 'react';
import { Question } from '../types'; // ✅ Make sure this matches InterviewSession.questions type

export const useGeneratedQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (jobDescription: string): Promise<Question[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/generate_question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions');

      const generated: Question[] = data.questions.map((text: string, idx: number) => ({
        id: `q-${Date.now()}-${idx}`,
        text,
        type: 'technical',        // or 'behavioral', or dynamic if needed
        timeLimit: 120,
        difficulty: 'medium',
        department: 'general',
        category: 'general',
      }));

      setQuestions(generated);
      return generated;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { questions, generateQuestions, loading, error };
};
