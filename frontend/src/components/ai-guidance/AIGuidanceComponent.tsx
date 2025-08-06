import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { MessageCircle, Brain, TrendingUp, Target, User, BarChart3, Lightbulb, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UserProfile {
  name: string;
  learning_level: string;
  strong_subjects: string[];
  weak_subjects: string[];
  total_sessions: number;
  avg_accuracy: number;
}

interface GuidanceResponse {
  main_message: string;
  recommendations: string[];
  next_steps: string[];
  motivational_message: string;
}

interface GuidanceData {
  guidance: GuidanceResponse;
  user_profile: UserProfile;
  recommendations: string[];
  next_steps: string[];
}

export const AIGuidanceComponent: React.FC = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<GuidanceData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde kullanıcı profilini getir
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('eduai_access_token');
        const profileResponse = await fetch('http://localhost:8000/api/v1/guidance/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.status === 'success') {
            setUserProfile(profileData.data.user_profile);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('eduai_access_token');
      const guidanceResponse = await fetch('http://localhost:8000/api/v1/guidance/ask', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (guidanceResponse.ok) {
        const guidanceData = await guidanceResponse.json();
        if (guidanceData.status === 'success') {
          setResponse(guidanceData.data);
        } else {
          setError('Rehberlik alınamadı');
        }
      } else {
        setError('Sunucu hatası');
      }
    } catch (err) {
      setError('Bağlantı hatası');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'ileri': return '🏆';
      case 'orta': return '📈';
      case 'başlangıç': return '🌱';
      default: return '📚';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ileri': return 'from-green-500 to-emerald-600';
      case 'orta': return 'from-blue-500 to-indigo-600';
      case 'başlangıç': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mr-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🤖 AI Rehber
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Kişiselleştirilmiş öğrenme rehberliği ve öneriler
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">👤 Öğrenme Profilin</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{getLevelEmoji(userProfile.learning_level)}</div>
                <div className="text-sm font-medium text-gray-600">Seviye</div>
                <div className={`text-lg font-bold bg-gradient-to-r ${getLevelColor(userProfile.learning_level)} bg-clip-text text-transparent capitalize`}>
                  {userProfile.learning_level}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-gray-600">Ortalama Başarı</div>
                <div className="text-lg font-bold text-green-600">
                  {userProfile.avg_accuracy.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm font-medium text-gray-600">Toplam Seans</div>
                <div className="text-lg font-bold text-blue-600">
                  {userProfile.total_sessions}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm font-medium text-gray-600">Güçlü Dersler</div>
                <div className="text-sm font-medium text-purple-600">
                  {userProfile.strong_subjects.length > 0 
                    ? userProfile.strong_subjects.slice(0, 2).join(', ')
                    : 'Henüz yok'}
                </div>
              </div>
            </div>

            {userProfile.weak_subjects.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center text-yellow-800">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    Gelişim Alanları: {userProfile.weak_subjects.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💬 AI Rehbere Sorun
            </label>
            <Input
              type="text"
              value={question}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              placeholder="Öğrenme ile ilgili herhangi bir sorunuzu sorabilirsiniz..."
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Rehber Düşünüyor...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Rehberlik Al
              </div>
            )}
          </Button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center text-red-800">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold">Hata</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="space-y-6">
          {/* Main Guidance */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🎯 Kişisel Rehberlik
              </h3>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <p className="text-lg text-gray-800 leading-relaxed">
                {response.guidance.main_message}
              </p>
            </div>

            {response.guidance.motivational_message && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center text-blue-800">
                  <Zap className="w-5 h-5 mr-2" />
                  <span className="font-medium">{response.guidance.motivational_message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {response.guidance.recommendations.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  💡 Öneriler
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {response.guidance.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-gray-800">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {response.guidance.next_steps.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🚀 Sonraki Adımlar
                </h3>
              </div>
              
              <div className="space-y-3">
                {response.guidance.next_steps.map((step, index) => (
                  <div key={index} className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                      {index + 1}
                    </div>
                    <p className="text-gray-800 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Questions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mr-4">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            💭 Örnek Sorular
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "Matematikte nasıl daha iyi olabilirim?",
            "Çalışma planım nasıl olmalı?", 
            "Zayıf olduğum konular neler?",
            "Sınav öncesi ne yapmalıyım?",
            "Motivasyonumu nasıl koruyabilirim?",
            "Hangi kaynaklardan çalışmalıyım?"
          ].map((sampleQuestion, index) => (
            <button
              key={index}
              onClick={() => setQuestion(sampleQuestion)}
              className="text-left p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center">
                <div className="text-blue-500 mr-2">❓</div>
                <span className="text-sm text-gray-700 font-medium">{sampleQuestion}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIGuidanceComponent;
