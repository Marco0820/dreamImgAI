import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  models: any[]; // In a real app, this would have a proper type
  selectedModel: string;
  onModelChange: (model: string) => void;
}

// Example models, these would likely come from the API
const exampleModels = [
    { id: 'dall-e-3', name: 'DALL·E 3' },
    { id: 'stable-diffusion-xl-1024-v1-0', name: 'Stable Diffusion XL' },
    { id: 'midjourney', name: 'Midjourney (Coming Soon)', disabled: true },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onModelChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Select Model</h2>
      <div className="flex flex-wrap gap-3">
        {exampleModels.map((model) => (
          <button
            key={model.id}
            onClick={() => !model.disabled && onModelChange(model.id)}
            disabled={model.disabled}
            className={`px-5 py-3 rounded-lg font-semibold text-sm transition-all
              ${selectedModel === model.id 
                ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}
              ${model.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector; 