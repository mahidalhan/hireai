// File: components/Resultstable.tsx
'use client';

import { DisplayableWebsetItem } from '@/pages/api/search'; // Adjust path if your api folder is elsewhere
import { ExternalLink } from 'lucide-react';

interface ResultsTableProps {
  items: DisplayableWebsetItem[];
  isLoading: boolean;
}

export default function ResultsTable({ items, isLoading }: ResultsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-2">Loading results...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No results to display. Try a new search.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="p-4 text-sm text-muted-foreground">Search results from Exa Websets.</caption>
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left font-medium w-[200px]">Name/Position</th>
            <th className="p-3 text-left font-medium">URL</th>
            <th className="p-3 text-left font-medium">Criteria Matches</th>
            <th className="p-3 text-left font-medium">Enrichment Values</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/50">
              <td className="p-3">
                <div className="font-medium">{item.name || 'N/A'}</div>
                {item.position && <div className="text-sm text-muted-foreground">{item.position}</div>}
              </td>
              <td className="p-3">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    {item.url.length > 50 ? `${item.url.substring(0, 47)}...` : item.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="p-3">
                {item.criteriaMatches.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {item.criteriaMatches.map((match, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-semibold">{match.criterion}: </span>
                        <span 
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            match.satisfied === 'yes' 
                              ? 'bg-green-500 text-white' 
                              : match.satisfied === 'no' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {match.satisfied}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-muted-foreground">No criteria evaluated.</span>
                )}
              </td>
              <td className="p-3">
                {item.enrichmentValues.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {item.enrichmentValues.map((enrichment, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-semibold">{enrichment.description}: </span>
                        <span>
                          {Array.isArray(enrichment.value) 
                            ? enrichment.value.join(', ') 
                            : enrichment.value?.toString() || 'N/A'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-muted-foreground">No enrichments found.</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}