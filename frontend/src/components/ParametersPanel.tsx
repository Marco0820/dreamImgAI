import React from 'react';

interface ParametersPanelProps {
    model: string;
    parameters: any; // In a real app, this would have a proper type
    onParametersChange: (params: any) => void;
}

const ParametersPanel: React.FC<ParametersPanelProps> = ({ model, parameters, onParametersChange }) => {
    
    const handleParamChange = (param: string, value: string | number) => {
        onParametersChange({ ...parameters, [param]: value });
    };

    const renderDalleParams = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Size</label>
                <select 
                    value={parameters.size} 
                    onChange={(e) => handleParamChange('size', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option>1024x1024</option>
                    <option>1792x1024</option>
                    <option>1024x1792</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Style</label>
                <select 
                    value={parameters.style} 
                    onChange={(e) => handleParamChange('style', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="vivid">Vivid</option>
                    <option value="natural">Natural</option>
                </select>
            </div>
        </>
    );

    const renderStableDiffusionParams = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Width</label>
                <input 
                    type="number" 
                    value={parameters.width || 1024} 
                    onChange={(e) => handleParamChange('width', parseInt(e.target.value))}
                    className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                <input 
                    type="number" 
                    value={parameters.height || 1024} 
                    onChange={(e) => handleParamChange('height', parseInt(e.target.value))}
                    className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
                <input 
                    type="range" 
                    min="10" 
                    max="50"
                    value={parameters.steps || 30} 
                    onChange={(e) => handleParamChange('steps', parseInt(e.target.value))}
                    className="mt-1 block w-full"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{parameters.steps || 30}</span>
            </div>
        </>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Parameters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {model === 'dall-e-3' && renderDalleParams()}
        {model.startsWith('stable-diffusion') && renderStableDiffusionParams()}
      </div>
    </div>
  );
};

export default ParametersPanel; 