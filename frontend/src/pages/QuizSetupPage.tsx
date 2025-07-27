import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const QuizSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);

  const handleStart = () => {
    if (!subjectId || !topicId) return;
    navigate(`/quiz/session?subject=${subjectId}&topic=${topicId}&difficulty=${difficulty}&count=${count}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Quiz</h1>
      <div className="space-y-4">
        <input value={subjectId} onChange={e=>setSubjectId(e.target.value)} placeholder="Subject ID" className="border p-2 w-full" />
        <input value={topicId} onChange={e=>setTopicId(e.target.value)} placeholder="Topic ID" className="border p-2 w-full" />
        <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="border p-2 w-full">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} min={1} max={20} className="border p-2 w-full" />
        <Button onClick={handleStart}>Başlat</Button>
      </div>
    </div>
  );
};

export default QuizSetupPage; 