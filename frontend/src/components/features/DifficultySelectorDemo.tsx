import React, { useState } from 'react';
import DifficultySelector from './DifficultySelector';
import type { DifficultyLevelTurkish } from '../../types';

const DifficultySelectorDemo: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevelTurkish | ''>('');
  const [error, setError] = useState<string>('');
  const [disabled, setDisabled] = useState(false);

  const handleDifficultyChange = (value: DifficultyLevelTurkish) => {
    setDifficulty(value);
    setError(''); // Clear error when user makes a selection
  };

  const handleSubmit = () => {
    if (!difficulty) {
      setError('Lütfen bir zorluk seviyesi seçin');
      return;
    }
    alert(`Seçilen zorluk seviyesi: ${difficulty}`);
  };

  const handleReset = () => {
    setDifficulty('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DifficultySelector Demo
          </h1>
          <p className="text-gray-600">
            Bu sayfa DifficultySelector bileşeninin özelliklerini gösterir
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Zorluk Seviyesi Seçimi
          </h2>

          <DifficultySelector
            value={difficulty}
            onChange={handleDifficultyChange}
            error={error}
            disabled={disabled}
            required
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              Seçimi Onayla
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              Sıfırla
            </button>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Devre Dışı Bırak
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mevcut Durum
          </h2>
          
          <div className="space-y-2 text-sm">
            <p>
              <strong>Seçilen Zorluk:</strong> {difficulty || 'Henüz seçilmedi'}
            </p>
            <p>
              <strong>Hata Durumu:</strong> {error || 'Hata yok'}
            </p>
            <p>
              <strong>Devre Dışı:</strong> {disabled ? 'Evet' : 'Hayır'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Özellikler
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Erişilebilirlik</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ARIA etiketleri ve roller</li>
                <li>• Klavye navigasyonu (Enter, Space)</li>
                <li>• Ekran okuyucu desteği</li>
                <li>• Odak yönetimi</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Görsel Özellikler</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Renk kodlu zorluk seviyeleri</li>
                <li>• Hover ve focus efektleri</li>
                <li>• Seçim durumu gösterimi</li>
                <li>• Responsive tasarım</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Form Entegrasyonu</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hata mesajı desteği</li>
                <li>• Doğrulama durumları</li>
                <li>• Zorunlu alan işaretleme</li>
                <li>• Devre dışı bırakma</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Kullanım</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Quiz zorluk seçimi</li>
                <li>• Öğrenme seviyesi belirleme</li>
                <li>• İçerik filtreleme</li>
                <li>• Kullanıcı tercihleri</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelectorDemo;