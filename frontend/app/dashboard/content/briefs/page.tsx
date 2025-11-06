'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface BriefFromIdea {
  persona: string;
  industry: string;
  idea: string;
  ideaId?: string;
}

export default function BriefsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { t } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [ideaData, setIdeaData] = useState<BriefFromIdea | null>(null);
  const [generatedBrief, setGeneratedBrief] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBriefs, setSavedBriefs] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
    } else {
      // Check if coming from ideas page
      const storedData = localStorage.getItem('briefFromIdea');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setIdeaData(data);
          localStorage.removeItem('briefFromIdea'); // Clear after reading
        } catch (error) {
          console.error('Error parsing idea data:', error);
        }
      }
      fetchSavedBriefs();
    }
  }, [token, router]);

  const fetchSavedBriefs = async () => {
    try {
      setLoadingSaved(true);
      const response = await api.get('/api/briefs');
      setSavedBriefs(response.data.briefs);
    } catch (error: any) {
      console.error('Error fetching saved briefs:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleGenerateBrief = async () => {
    if (!ideaData) {
      toast.error('No idea data found');
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post('/api/briefs/generate', {
        persona: ideaData.persona,
        industry: ideaData.industry,
        idea: ideaData.idea
      });

      setGeneratedBrief(response.data.brief);
      toast.success('Brief generated successfully!');
    } catch (error: any) {
      console.error('Error generating brief:', error);
      const message = error.response?.data?.message || 'Failed to generate brief';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveBrief = async () => {
    if (!ideaData || !generatedBrief) {
      toast.error('No brief to save');
      return;
    }

    try {
      setSaving(true);
      await api.post('/api/briefs', {
        persona: ideaData.persona,
        industry: ideaData.industry,
        idea: ideaData.idea,
        brief: generatedBrief,
        ideaId: ideaData.ideaId
      });
      toast.success('Brief saved successfully!');
      // Clear current brief and fetch saved briefs
      setGeneratedBrief('');
      setIdeaData(null);
      fetchSavedBriefs();
    } catch (error: any) {
      console.error('Error saving brief:', error);
      const message = error.response?.data?.message || 'Failed to save brief';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setIdeaData(null);
    setGeneratedBrief('');
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
              Tạo Briefs bằng AI
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate detailed content briefs from ideas
            </p>
          </div>
        </div>

        {/* Brief Generator */}
        {ideaData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {/* Idea Info */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Source Idea</h2>
                  <button
                    onClick={handleReset}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                    {ideaData.persona}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {ideaData.industry}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200">{ideaData.idea}</p>
                </div>
              </div>

              {/* Generate Button */}
              {!generatedBrief && (
                <button
                  onClick={handleGenerateBrief}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Brief...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate Brief
                    </>
                  )}
                </button>
              )}

              {/* Generated Brief */}
              {generatedBrief && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Generated Brief</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBrief);
                          toast.success('Brief copied to clipboard!');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Copy
                      </button>
                      <button
                        onClick={handleSaveBrief}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Brief
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">{generatedBrief}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!ideaData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No active brief
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Go to Ideas page and click "Create Brief" on any idea to start.
            </p>
            <button
              onClick={() => router.push('/dashboard/content/ideas')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to Ideas
            </button>
          </div>
        )}

        {/* Saved Briefs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved Briefs ({savedBriefs.length})
            </h2>
            {savedBriefs.length > 0 && (
              <button
                onClick={fetchSavedBriefs}
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
              <p className="text-gray-500 dark:text-gray-400">Loading saved briefs...</p>
            </div>
          ) : savedBriefs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                No saved briefs yet. Generate and save briefs from ideas!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedBriefs.map((savedBrief) => (
                <div
                  key={savedBrief.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                      {savedBrief.persona}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                      {savedBrief.industry}
                    </span>
                  </div>
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Original Idea:</p>
                    <p className="text-gray-800 dark:text-gray-200">{savedBrief.idea}</p>
                  </div>
                  <details className="group">
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      View Brief
                    </summary>
                    <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg">
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200">{savedBrief.brief}</pre>
                      </div>
                    </div>
                  </details>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Created: {formatDate(savedBrief.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
