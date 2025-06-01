"use client";

import type { NextPage } from 'next';
import { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isTable?: boolean; // Flag for AI table responses
  originalUserQuery?: string; // The user query that prompted this AI table response
}

interface RetroTableWindowProps {
  markdownContent: string;
  userQuery: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const RetroTableWindow: React.FC<RetroTableWindowProps> = ({ 
  markdownContent,
  userQuery,
  onClose = () => console.log('Close clicked'),
  onMinimize = () => console.log('Minimize clicked'),
  onMaximize = () => console.log('Maximize clicked')
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const titleText = `HIRE.AI - ${userQuery || 'Search Results'}`;
  
  // Parse the markdown content to extract table data
  const tableRows = useMemo(() => {
    const lines = markdownContent.split('\n');
    const tableStart = lines.findIndex(line => line.trim().startsWith('|'));
    if (tableStart === -1) return [];
    
    // Find where the table ends
    let tableEnd = lines.length;
    for (let i = tableStart + 1; i < lines.length; i++) {
      if (!lines[i].trim().startsWith('|')) {
        tableEnd = i;
        break;
      }
    }
    
    // Extract header and rows
    const tableLines = lines.slice(tableStart, tableEnd);
    if (tableLines.length < 3) return []; // Need at least header, separator, and one data row
    
    const headerRow = tableLines[0];
    const headers = headerRow
      .split('|')
      .filter(cell => cell.trim() !== '')
      .map(cell => cell.trim());
    
    // Skip the separator row (index 1)
    const dataRows = tableLines.slice(2).map(row => {
      const cells = row
        .split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => cell.trim());
      return cells;
    });
    
    return { headers, dataRows };
  }, [markdownContent]);
  
  const handleRowClick = (index: number) => {
    setSelectedRowIndex(index === selectedRowIndex ? null : index);
  };
  
  return (
    <div 
      className="stalk-window"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="stalk-window-header">
        <div className="stalk-window-title">{titleText}</div>
        <div className="stalk-window-controls">
          <button 
            className="stalk-window-button minimize" 
            onClick={onMinimize}
            aria-label="Minimize"
          >
            &#8211;
          </button>
          <button 
            className="stalk-window-button maximize" 
            onClick={onMaximize}
            aria-label="Maximize"
          >
            &#9744;
          </button>
          <button 
            className="stalk-window-button close" 
            onClick={onClose}
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>
      </div>
      
      <div className="stalk-toolbar">
        <div className="stalk-toolbar-actions">
          <button className="stalk-action-button" aria-label="Copy to clipboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C16.0018 2.41148 15.7793 2.26012 15.5338 2.15673C15.2882 2.05334 15.0244 2.00003 14.758 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Copy</span>
          </button>
          <button className="stalk-action-button" aria-label="Export as CSV">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Export</span>
          </button>
        </div>
        <div className="stalk-toolbar-info">
          <span className="stalk-results-count">{Array.isArray(tableRows) ? 0 : (tableRows?.dataRows?.length || 0)} results</span>
        </div>
      </div>
      
      
      <div className="stalk-table-container">
        {tableRows && tableRows.headers && tableRows.dataRows ? (
          <table className="stalk-table">
            <thead>
              <tr>
                {tableRows.headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.dataRows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={selectedRowIndex === rowIndex ? 'selected' : ''}
                  onClick={() => handleRowClick(rowIndex)}
                >
                  {row.map((cell, cellIndex) => {
                    // Check if this is a LinkedIn URL column
                    const isLinkedInUrl = Array.isArray(tableRows) ? 
                      (cell.startsWith('https://') && cell.includes('linkedin.com')) : 
                      (tableRows.headers[cellIndex]?.toLowerCase().includes('linkedin') || 
                       tableRows.headers[cellIndex]?.toLowerCase().includes('profile') || 
                       (cell.startsWith('https://') && cell.includes('linkedin.com')));
                    
                    return (
                      <td key={cellIndex}>
                        {isLinkedInUrl ? (
                          <a 
                            href={cell} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="stalk-linkedin-link"
                          >
                            <svg className="linkedin-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            View Profile
                          </a>
                        ) : cell.includes('[') && cell.includes('](') ? (
                          <a 
                            href={cell.match(/\]\((.*?)\)/)?.[1] || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cell.match(/\[(.*?)\]/)?.[1] || cell}
                          </a>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="stalk-empty-table">No table data found</div>
        )}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputQuery,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Call Supabase function to process the search
      const { data, error } = await supabase.functions.invoke('process-search', {
        body: { query: inputQuery },
      });
      
      if (error) throw new Error(error.message);
      
      // Check if the response contains a table
      const isTable = data.text.includes('|') && data.text.includes('\n|');
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.text,
        timestamp: new Date(),
        isTable: isTable,
        originalUserQuery: isTable ? inputQuery : undefined,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error processing search:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="stalk-app">
      <header className="stalk-header">
        <h1 className="stalk-title">HIRE.AI</h1>
        <div className="stalk-header-actions">
          {isLoading && <span className="stalk-loading">Processing...</span>}
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="welcome-container">
              <h1 className="welcome-title">HIRE.AI</h1>
              <p className="welcome-subtitle">Find exceptional talent</p>
              
              <div className="search-examples">
                <div className="example-card">
                  <p>"Find senior ML engineers at Google"</p>
                </div>
                <div className="example-card">
                  <p>"Show React developers in Berlin"</p>
                </div>
                <div className="example-card">
                  <p>"List top cloud architects with AWS experience"</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`stalk-message-container ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div 
                  className={`stalk-message ${
                    message.sender === 'user' ? 'stalk-message-user' : 'stalk-message-ai'
                  }`}
                >
                  {message.isTable ? (
                    <RetroTableWindow 
                      markdownContent={message.text} 
                      userQuery={message.originalUserQuery || ''}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="stalk-message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {error && (
              <div className="stalk-window stalk-error-window">
                <div className="stalk-window-header">
                  <div className="stalk-window-title">Error</div>
                  <div className="stalk-window-controls">
                    <button 
                      className="stalk-window-button close" 
                      onClick={() => setError(null)}
                      aria-label="Close"
                    >
                      &#10005;
                    </button>
                  </div>
                </div>
                <div className="p-4 text-red-600">{error}</div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>
      
      <footer className="stalk-footer">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Describe the talent you're looking for..."
            className="stalk-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="stalk-button"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Home;