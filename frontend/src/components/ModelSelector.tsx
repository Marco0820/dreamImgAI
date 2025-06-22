import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Star } from 'lucide-react';

export interface Model {
  id: string;
  name: string;
  disabled?: boolean;
  paid?: boolean;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onModelChange, disabled = false }) => {
  const selected = models.find(m => m.id === selectedModel) || models[0];

  return (
    <Listbox value={selectedModel} onChange={onModelChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-stone-900/80 py-3 pl-4 pr-12 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm border border-stone-700 h-full flex items-center">
          <span className="block text-base text-stone-200">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute bottom-full mb-2 w-full overflow-auto rounded-md bg-stone-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm border border-stone-700">
            {models.map((model) => (
              <Listbox.Option
                key={model.id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-amber-500/20 text-amber-400' : 'text-gray-200'
                  } ${model.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                }
                value={model.id}
                disabled={model.disabled}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`flex items-center truncate ${
                        selected ? 'font-medium text-amber-400' : 'font-normal'
                      }`}
                    >
                      {model.name}
                      {model.paid && (
                        <Star className="w-4 h-4 ml-2 fill-amber-400 text-amber-400" />
                      )}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default ModelSelector; 