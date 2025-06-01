'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { createClient } from '@/lib/supabase/client';

export function SearchFormSimple() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('process-search', {
        body: JSON.stringify({ query }),
      });

      if (error) {
        throw new Error(error.message);
      }

      // Handle response data
      console.log('Search results:', data);
      alert('Search completed! Check console for results');
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg items-center space-x-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for candidates..."
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}