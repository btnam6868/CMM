'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function IdeasPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { t } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [persona, setPersona] = useState('');
  const [industry, setIndustry] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState<{
    persona: string;
    industry: string;
    apiKeyUsed?: any;
  } | null>(null);
  const [savingIdea, setSavingIdea] = useState<string | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [deletingIdea, setDeletingIdea] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
    } else {
      fetchSavedIdeas();
    }
  }, [token, router]);

  const fetchSavedIdeas = async () => {
    try {
      setLoadingSaved(true);
      const response = await api.get('/api/ideas');
      setSavedIdeas(response.data.ideas);
    } catch (error: any) {
      console.error('Error fetching saved ideas:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!persona.trim() || !industry.trim()) {
      toast.error('Vui lòng nhập đầy đủ Persona và Industry');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/ideas/generate', {
        persona: persona.trim(),
        industry: industry.trim()
      });

      setIdeas(response.data.ideas);
      setGeneratedInfo({
        persona: response.data.persona,
        industry: response.data.industry,
        apiKeyUsed: response.data.apiKeyUsed
      });
      toast.success('Đã tạo 10 ideas thành công!');
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      const message = error.response?.data?.message || 'Không thể tạo ideas. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPersona('');
    setIndustry('');
    setIdeas([]);
    setGeneratedInfo(null);
  };

  const handleSaveIdea = async (idea: string, index: number) => {
    if (!generatedInfo) return;

    try {
      setSavingIdea(`${index}`);
      await api.post('/api/ideas/save', {
        persona: generatedInfo.persona,
        industry: generatedInfo.industry,
        idea: idea
      });
      toast.success('Đã lưu idea thành công!');
      // Refresh saved ideas list
      fetchSavedIdeas();
    } catch (error: any) {
      console.error('Error saving idea:', error);
      const message = error.response?.data?.message || 'Không thể lưu idea';
      toast.error(message);
    } finally {
      setSavingIdea(null);
    }
  };

  const handleCreateBrief = (idea: string, persona?: string, industry?: string) => {
    const personaToUse = persona || generatedInfo?.persona || '';
    const industryToUse = industry || generatedInfo?.industry || '';

    // Store idea info in localStorage to pass to briefs page
    localStorage.setItem('briefFromIdea', JSON.stringify({
      persona: personaToUse,
      industry: industryToUse,
      idea: idea
    }));

    // Navigate to briefs page
    router.push('/dashboard/content/briefs');
  };

  const handleDeleteSavedIdea = async (ideaId: string) => {
    try {
      setDeletingIdea(ideaId);
      await api.delete(`/api/ideas/${ideaId}`);
      toast.success('Đã xóa idea thành công!');
      // Refresh saved ideas list
      fetchSavedIdeas();
    } catch (error: any) {
      console.error('Error deleting idea:', error);
      const message = error.response?.data?.message || 'Không thể xóa idea';
      toast.error(message);
    } finally {
      setDeletingIdea(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (!mounted || !token) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Tạo Ideas bằng AI
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinh 10 ý tưởng nội dung với sức mạnh AI
            </p>
          </div>
        </div>

        {/* Generator Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Persona <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="Ví dụ: Marketing Manager, Small Business Owner..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Ví dụ: E-commerce, Healthcare, Technology..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo ideas...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Generate 10 Ideas
                  </>
                )}
              </button>
              {ideas.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Generated Ideas */}
        {ideas.length > 0 && (
          <div className="space-y-4">
            {/* Info Banner */}
            {generatedInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Persona:</strong> {generatedInfo.persona} | <strong>Industry:</strong> {generatedInfo.industry}
                    </p>
                    {generatedInfo.apiKeyUsed && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        API Provider: {generatedInfo.apiKeyUsed.provider} | Usage Count: {generatedInfo.apiKeyUsed.usageCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ideas Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  10 Content Ideas
                </h2>
                <div className="space-y-3">
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {idea}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => handleSaveIdea(idea, index)}
                          disabled={savingIdea === `${index}`}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save idea"
                        >
                          {savingIdea === `${index}` ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(idea);
                            toast.success('Đã copy idea!');
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Copy idea"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCreateBrief(idea)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Create Brief"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {ideas.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chưa có ideas nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Nhập Persona và Industry ở trên, sau đó nhấn "Generate 10 Ideas" để bắt đầu.
            </p>
          </div>
        )}

        {/* Saved Ideas List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ideas Đã Lưu ({savedIdeas.length})
            </h2>
            {savedIdeas.length > 0 && (
              <button
                onClick={fetchSavedIdeas}
                disabled={loadingSaved}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <svg className={`w-4 h-4 ${loadingSaved ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>

          {loadingSaved ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Đang tải ideas đã lưu...</p>
            </div>
          ) : savedIdeas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có ideas nào được lưu. Hãy generate và save ideas!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="space-y-3">
                  {savedIdeas.map((savedIdea) => (
                    <div
                      key={savedIdea.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                              {savedIdea.persona}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              {savedIdea.industry}
                            </span>
                            {savedIdea.is_used && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Used
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-2">
                            {savedIdea.idea}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Saved: {formatDate(savedIdea.created_at)}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(savedIdea.idea);
                              toast.success('Đã copy idea!');
                            }}
                            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy idea"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleCreateBrief(savedIdea.idea, savedIdea.persona, savedIdea.industry)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
                            title="Create Brief"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSavedIdea(savedIdea.id)}
                            disabled={deletingIdea === savedIdea.id}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete idea"
                          >
                            {deletingIdea === savedIdea.id ? (
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
