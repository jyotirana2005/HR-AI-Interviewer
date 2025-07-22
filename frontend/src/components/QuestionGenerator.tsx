import React, { useState } from 'react';
// import './App.css';

function g_App() {
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/generate_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch questions');

      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Interview Question Generator</h1>
      <textarea
        rows={6}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Enter job description here..."
      />
      <br />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {error && <p className="error">Error: {error}</p>}
      <div className="questions">
        {questions.length > 0 && <h2>Generated Questions:</h2>}
        <ul>
          {questions.map((q, index) => (
            <li key={index}>{q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default g_App;
