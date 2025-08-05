import React, { useState } from 'react';
import QuestionCountSelector from './QuestionCountSelector';
import type { QuestionCountOption } from '../../types';

const QuestionCountSelectorDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState<QuestionCountOption | null>(null);
  const [requiredValue, setRequiredValue] = useState<QuestionCountOption | null>(null);
  const [errorValue, setErrorValue] = useState<QuestionCountOption | null>(null);
  const [disabledValue, setDisabledValue] = useState<QuestionCountOption | null>(10);
  const [customValue, setCustomValue] = useState<QuestionCountOption | null>(null);

  const [showError, setShowError] = useState(false);

  const handleErrorSubmit = () => {
    if (!errorValue) {
      setShowError(true);
    } else {
      setShowError(false);
      alert(`Selected: ${errorValue} questions`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          QuestionCountSelector Component Demo
        </h1>
        <p className="text-gray-600">
          Interactive examples of the QuestionCountSelector component
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Basic Usage */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Usage</h2>
          <QuestionCountSelector
            value={basicValue}
            onChange={setBasicValue}
          />
          {basicValue && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Selected: <strong>{basicValue} questions</strong>
              </p>
            </div>
          )}
        </div>

        {/* Required Field */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Field</h2>
          <QuestionCountSelector
            value={requiredValue}
            onChange={setRequiredValue}
            required
            helperText="Bu alan zorunludur"
          />
          {requiredValue && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Valid selection: <strong>{requiredValue} questions</strong>
              </p>
            </div>
          )}
        </div>

        {/* Error State */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Handling</h2>
          <QuestionCountSelector
            value={errorValue}
            onChange={(value) => {
              setErrorValue(value);
              setShowError(false);
            }}
            error={showError ? 'Lütfen bir soru sayısı seçin' : undefined}
            required
          />
          <button
            onClick={handleErrorSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>

        {/* Disabled State */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Disabled State</h2>
          <QuestionCountSelector
            value={disabledValue}
            onChange={setDisabledValue}
            disabled
            helperText="This selector is disabled"
          />
          <p className="mt-4 text-sm text-gray-600">
            Pre-selected value: <strong>{disabledValue} questions</strong>
          </p>
        </div>

        {/* Custom Labels */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Labels</h2>
          <QuestionCountSelector
            value={customValue}
            onChange={setCustomValue}
            label="Quiz Uzunluğu"
            helperText="İstediğiniz quiz uzunluğunu belirleyin"
            className="max-w-2xl"
          />
          {customValue && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md max-w-2xl">
              <h3 className="font-medium text-gray-900 mb-2">Selection Summary:</h3>
              <p className="text-sm text-gray-700">
                Quiz Length: <strong>{customValue} questions</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Estimated time: {customValue * 1.5} minutes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Example */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactive Quiz Setup</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <QuestionCountSelector
              value={basicValue}
              onChange={setBasicValue}
              label="Soru Sayısı Seçimi"
              helperText="Quiz için uygun soru sayısını belirleyin"
              required
            />
          </div>
          <div className="flex items-center">
            {basicValue ? (
              <div className="p-4 bg-white rounded-lg border border-blue-200 w-full">
                <h3 className="font-medium text-gray-900 mb-2">Quiz Preview</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Questions:</span> <strong>{basicValue}</strong></p>
                  <p><span className="text-gray-600">Estimated time:</span> <strong>{basicValue * 1.5} minutes</strong></p>
                  <p><span className="text-gray-600">Difficulty:</span> <strong>Mixed</strong></p>
                </div>
                <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Start Quiz
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 w-full text-center">
                <p className="text-gray-500">Select question count to preview quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
        <pre className="text-sm overflow-x-auto">
          <code>{`import QuestionCountSelector from './QuestionCountSelector';
import type { QuestionCountOption } from '../../types';

const MyComponent = () => {
  const [questionCount, setQuestionCount] = useState<QuestionCountOption | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    if (!questionCount) {
      setError('Please select a question count');
      return;
    }
    // Process the selection
    console.log('Selected:', questionCount);
  };

  return (
    <QuestionCountSelector
      value={questionCount}
      onChange={setQuestionCount}
      error={error}
      required
      label="Quiz Length"
      helperText="Choose the number of questions for your quiz"
    />
  );
};`}</code>
        </pre>
      </div>
    </div>
  );
};

export default QuestionCountSelectorDemo;