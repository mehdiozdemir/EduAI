import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { QuestionParams } from '../../types';

interface QuestionGeneratorProps {
  subject: string;
  topic: string;
  onGenerate: (params: QuestionParams) => void;
  loading?: boolean;
}

function QuestionGenerator({
  subject,
  topic,
  onGenerate,
  loading = false,
}: QuestionGeneratorProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );
  const [educationLevel, setEducationLevel] = useState<
    'middle' | 'high' | 'university'
  >('high');
  const [count, setCount] = useState<number>(5);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!count) {
      newErrors.count = 'Soru sayısı gereklidir';
    } else if (count < 1) {
      newErrors.count = 'En az 1 soru olmalıdır';
    } else if (count > 20) {
      newErrors.count = 'En fazla 20 soru olabilir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const params: QuestionParams = {
      subject,
      topic,
      difficulty,
      count,
      education_level: educationLevel,
    };

    onGenerate(params);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCount(value);

    // Clear count error when user starts typing
    if (errors.count) {
      setErrors(prev => ({ ...prev, count: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Soru Üretici</h2>

      {/* Subject and Topic Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-sm font-medium text-gray-700">Ders:</span>
          <p className="text-lg font-semibold text-blue-600">{subject}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Konu:</span>
          <p className="text-lg font-semibold text-blue-600">{topic}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Zorluk Seviyesi
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={difficulty === 'easy'}
                onChange={e => setDifficulty(e.target.value as 'easy')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                aria-label="Kolay"
              />
              <span className="text-sm text-gray-700">Kolay</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="medium"
                checked={difficulty === 'medium'}
                onChange={e => setDifficulty(e.target.value as 'medium')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                aria-label="Orta"
              />
              <span className="text-sm text-gray-700">Orta</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={difficulty === 'hard'}
                onChange={e => setDifficulty(e.target.value as 'hard')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                aria-label="Zor"
              />
              <span className="text-sm text-gray-700">Zor</span>
            </label>
          </div>
        </div>

        {/* Education Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Eğitim Seviyesi
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="educationLevel"
                value="middle"
                checked={educationLevel === 'middle'}
                onChange={e => setEducationLevel(e.target.value as 'middle')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                aria-label="Ortaokul"
              />
              <span className="text-sm text-gray-700">Ortaokul</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="educationLevel"
                value="high"
                checked={educationLevel === 'high'}
                onChange={e => setEducationLevel(e.target.value as 'high')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
                aria-label="Lise"
              />
              <span className="text-sm text-gray-700">Lise</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="educationLevel"
                value="university"
                checked={educationLevel === 'university'}
                onChange={e =>
                  setEducationLevel(e.target.value as 'university')
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
                aria-label="Üniversite"
              />
              <span className="text-sm text-gray-700">Üniversite</span>
            </label>
          </div>
        </div>

        {/* Question Count */}
        <div>
          <Input
            label="Soru Sayısı"
            type="number"
            value={count.toString()}
            onChange={handleCountChange}
            min={1}
            max={20}
            error={errors.count}
            disabled={loading}
          />
          {count > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {count} soru üretilecek
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sorular Üretiliyor...' : 'Soru Üret'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default QuestionGenerator;
