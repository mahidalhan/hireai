// File: components/SearchForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Trash2 } from 'lucide-react'; // For remove buttons

// Define the structure for an enrichment item
interface EnrichmentItem {
  id: string; // For unique key in React lists
  description: string;
  format: 'text' | 'number' | 'date';
}

// Define the structure for a criterion item
interface CriterionItem {
  id: string; // For unique key
  value: string;
}

interface SearchFormProps {
  onSubmit: (data: {
    query: string;
    criteria: string[];
    enrichments: { description: string; format: 'text' | 'number' | 'date' }[];
  }) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState<string>('');
  const [criteria, setCriteria] = useState<CriterionItem[]>([
    { id: crypto.randomUUID(), value: '' },
  ]);
  const [enrichments, setEnrichments] = useState<EnrichmentItem[]>([
    { id: crypto.randomUUID(), description: '', format: 'text' },
  ]);

  // --- Criteria Handlers ---
  const handleAddCriterion = () => {
    setCriteria([...criteria, { id: crypto.randomUUID(), value: '' }]);
  };

  const handleCriterionChange = (id: string, value: string) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, value } : c))
    );
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  // --- Enrichments Handlers ---
  const handleAddEnrichment = () => {
    setEnrichments([
      ...enrichments,
      { id: crypto.randomUUID(), description: '', format: 'text' },
    ]);
  };

  const handleEnrichmentChange = (
    id: string,
    field: 'description' | 'format',
    value: string
  ) => {
    setEnrichments(
      enrichments.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
            }
          : e
      )
    );
  };

  const handleRemoveEnrichment = (id: string) => {
    setEnrichments(enrichments.filter((e) => e.id !== id));
  };

  // --- Form Submission ---
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      query,
      criteria: criteria.map(c => c.value).filter(c => c.trim() !== ''), // Submit only non-empty criteria
      enrichments: enrichments.filter(e => e.description.trim() !== ''), // Submit only enrichments with descriptions
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
      <div>
        <label htmlFor="query" className="block text-lg font-semibold mb-1">Search Query</label>
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'AI research labs in California'"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Criteria Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold">Criteria</h3>
          <button 
            type="button" 
            onClick={handleAddCriterion} 
            className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
          >
            Add Criterion
          </button>
        </div>
        {criteria.map((criterion, index) => (
          <div key={criterion.id} className="flex items-center space-x-2">
            <input
              type="text"
              value={criterion.value}
              onChange={(e) => handleCriterionChange(criterion.id, e.target.value)}
              placeholder={`Criterion ${index + 1} (e.g., 'focuses on NLP')`}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {criteria.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveCriterion(criterion.id)}
                className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Enrichments Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold">Enrichments</h3>
          <button 
            type="button" 
            onClick={handleAddEnrichment} 
            className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
          >
            Add Enrichment
          </button>
        </div>
        {enrichments.map((enrichment, index) => (
          <div key={enrichment.id} className="p-3 border rounded space-y-2 bg-muted/50">
            <div className="flex items-center space-x-2">
                <label htmlFor={`enrichment-desc-${enrichment.id}`} className="sr-only">Description</label>
                <input
                  id={`enrichment-desc-${enrichment.id}`}
                  type="text"
                  value={enrichment.description}
                  onChange={(e) =>
                      handleEnrichmentChange(enrichment.id, 'description', e.target.value)
                  }
                  placeholder={`Enrichment ${index + 1} Description (e.g., 'founding year')`}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {/* Always show remove button for enrichments if there's at least one */}
                <button
                    type="button"
                    onClick={() => handleRemoveEnrichment(enrichment.id)}
                    className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <div>
                <label htmlFor={`enrichment-format-${enrichment.id}`} className="sr-only">Format</label>
                <select
                  id={`enrichment-format-${enrichment.id}`}
                  value={enrichment.format}
                  onChange={(e) => handleEnrichmentChange(enrichment.id, 'format', e.target.value as 'text' | 'number' | 'date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
            </div>
          </div>
        ))}
      </div>

      <button 
        type="submit" 
        disabled={isLoading} 
        className={`w-full py-2 px-4 rounded-md shadow-sm text-white font-medium ${
          isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </span>
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
}
