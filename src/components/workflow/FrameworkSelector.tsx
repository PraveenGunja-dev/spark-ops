import React from 'react';
import { Check, Info } from 'lucide-react';
import {
  ExecutionFramework,
  FrameworkConfig,
  AVAILABLE_FRAMEWORKS,
  WorkflowPattern,
  getRecommendationReason,
} from '@/lib/workflow-frameworks';

interface FrameworkSelectorProps {
  selectedFramework: ExecutionFramework;
  onSelect: (framework: ExecutionFramework) => void;
  workflowPattern?: WorkflowPattern;
  nodeCount?: number;
  hasConditions?: boolean;
  hasParallelPaths?: boolean;
  className?: string;
  recommendedFramework?: ExecutionFramework;
}

export function FrameworkSelector({
  selectedFramework,
  onSelect,
  workflowPattern,
  nodeCount = 1,
  hasConditions = false,
  hasParallelPaths = false,
  className = '',
  recommendedFramework,
}: FrameworkSelectorProps) {
  const frameworks = Object.values(AVAILABLE_FRAMEWORKS);

  const isRecommended = (framework: ExecutionFramework) => {
    return framework === recommendedFramework;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Execution Framework
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose the best framework for your workflow type
          </p>
        </div>
        {recommendedFramework && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              AI Recommendation Available
            </span>
          </div>
        )}
      </div>

      {/* Recommendation Message */}
      {recommendedFramework && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 {getRecommendationReason(recommendedFramework, nodeCount, hasConditions, hasParallelPaths)}
          </p>
        </div>
      )}

      {/* Framework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map((framework) => (
          <FrameworkCard
            key={framework.framework}
            config={framework}
            isSelected={selectedFramework === framework.framework}
            isRecommended={isRecommended(framework.framework)}
            onSelect={() => onSelect(framework.framework)}
          />
        ))}
      </div>
    </div>
  );
}

interface FrameworkCardProps {
  config: FrameworkConfig;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

function FrameworkCard({
  config,
  isSelected,
  isRecommended,
  onSelect,
}: FrameworkCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative p-5 rounded-xl border-2 transition-all text-left
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
          Recommended
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start gap-3 ${isRecommended ? 'mt-6' : ''}`}>
        <div className="text-3xl">{config.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {config.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {config.description}
          </p>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Best For
        </p>
        <div className="flex flex-wrap gap-1.5">
          {config.useCases.map((useCase) => (
            <span
              key={useCase}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-md"
            >
              {useCase.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Pros */}
      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Advantages
        </p>
        <ul className="space-y-1">
          {config.pros.slice(0, 3).map((pro, idx) => (
            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{pro}</span>
            </li>
          ))}
          {config.pros.length > 3 && (
            <li className="text-xs text-gray-500 dark:text-gray-500 italic">
              +{config.pros.length - 3} more...
            </li>
          )}
        </ul>
      </div>

      {/* Cons (if any) */}
      {config.cons && config.cons.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Considerations
          </p>
          <ul className="space-y-1">
            {config.cons.slice(0, 2).map((con, idx) => (
              <li key={idx} className="text-xs text-gray-500 dark:text-gray-500 flex items-start gap-1.5">
                <span className="mt-0.5">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}
