import { useState } from 'react';
import { useTranslation } from 'next-i18next';

const SDXLGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const { t } = useTranslation('common');

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setImageBase64(null);

    try {
      const response = await fetch('/api/v1/images/generate-sdxl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate image');
      }

      const data = await response.json();
      setImageBase64(data.img_base64);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Generate with SDXL')}</h2>
      <p className="mb-4 text-gray-600">{t('Use the Hugging Face API to generate an image with Stable Diffusion XL.')}</p>
      <textarea
        className="w-full p-3 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-klein-blue"
        rows={3}
        placeholder={t('Enter a prompt for SDXL...')}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto bg-klein-blue px-6 py-3 rounded text-white font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {loading ? t('Generating...') : t('Generate SDXL Image')}
        </button>
      </div>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {loading && (
        <div className="mt-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-klein-blue"></div>
        </div>
      )}
      {imageBase64 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">{t('Generated Image')}</h3>
          <img
            src={`data:image/png;base64,${imageBase64}`}
            alt="Generated SDXL Image"
            className="rounded-lg shadow-lg w-full"
          />
        </div>
      )}
    </div>
  );
};

export default SDXLGenerator; 