import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AppDispatch, RootState } from '../store';
import { generateImage, setParameters } from '../store/imageSlice';
import ModelSelector, { Model } from '../components/ModelSelector';
import ParametersPanel from '../components/ParametersPanel';
import HistoryList from '../components/HistoryList';
import SDXLGenerator from '../components/SDXLGenerator';
import { GetStaticProps, type NextPage } from "next";

const GeneratePage: NextPage = () => {
  const [prompt, setPrompt] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('common');
  const { generating, error, parameters } = useSelector((state: RootState) => state.image);
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedModel, setSelectedModel] = useState<Model>({ id: 'dall-e-3', name: 'DALL·E 3' });

  const availableModels: Model[] = [
    { id: 'dall-e-3', name: 'DALL·E 3' },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL' },
  ];

  const handleGenerate = () => {
    if (prompt) {
      dispatch(generateImage({ prompt, model: selectedModel.id, parameters, token }));
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('Generate Your Masterpiece')}</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <textarea
            className="w-full p-3 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-klein-blue"
            rows={4}
            placeholder={t('Describe the image you want to create...')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <ModelSelector
              models={availableModels}
              selectedModel={selectedModel.id}
              onModelChange={handleModelChange}
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 sm:mt-0 w-full sm:w-auto bg-klein-blue px-6 py-3 rounded text-white font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {generating ? 'Generating...' : t('Generate Image')}
            </button>
          </div>
        </div>
        <ParametersPanel
            model={selectedModel.id}
            parameters={parameters}
            onParametersChange={(params) => dispatch(setParameters(params))}
        />
        <SDXLGenerator />
      </div>

      <div className="lg:col-span-1">
        <HistoryList />
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default GeneratePage; 