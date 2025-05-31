import type { NextPage } from 'next';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, FormEvent, useRef, useEffect } from 'react';

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
  onClose = () => console.log('Close clicked'), // Default stub
  onMinimize = () => console.log('Minimize clicked'), // Default stub
  onMaximize = () => console.log('Maximize clicked') // Default stub
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const titleText = `STALK.AI - ${userQuery || 'Search Results'}`;

  // This is a trick to parse the Markdown table into a more structured format
  // to apply specific row/cell styling not easily done with ReactMarkdown's default output.
  const tableData = (() => {
    if (!markdownContent) return { headers: [], rows: [] };
    const lines = markdownContent.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] }; // Need at least header and separator

    const headerLine = lines[0];
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    
    const rows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter((cell, index) => index < headers.length + 1)
    );
    // Remove the first and last empty cell if they exist due to leading/trailing |
    const cleanedRows = rows.map(row => {
        let tempRow = [...row];
        if (tempRow.length > headers.length && tempRow[0] === '') tempRow.shift();
        if (tempRow.length > headers.length && tempRow[tempRow.length -1] === '') tempRow.pop();
        return tempRow;
    });

    return { headers, rows: cleanedRows };
  })();

  return (
    <div className="win95-window">
      <div className="win95-title-bar">
        <div className="win95-title-text">{titleText}</div>
        <div className="win95-title-buttons">
          <button onClick={onMinimize} aria-label="Minimize" className="win95-button win95-title-button">_</button>
          <button onClick={onMaximize} aria-label="Maximize" className="win95-button win95-title-button">□</button>
          <button onClick={onClose} aria-label="Close" className="win95-button win95-title-button win95-close-button">×</button>
        </div>
      </div>
      <div className="win95-menu-bar">
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>V</u>iew</span>
        <span><u>O</u>ptions</span>
      </div>
      <div className="win95-query-label-container">
        <div className="win95-query-text">Query: {userQuery}</div>
      </div>
      <div className="win95-table-container">
        {tableData.headers.length > 0 ? (
          <table className="win95-table">
            <thead>
              <tr>
                {tableData.headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => setSelectedRowIndex(rowIndex)}
                  className={selectedRowIndex === rowIndex ? 'selected' : ''}
                >
                  {row.map((cell, cellIndex) => {
                    const isLinkColumn = tableData.headers[cellIndex]?.toLowerCase().includes('url');
                    // Basic check for http/https to identify URLs for styling
                    const isActualLink = typeof cell === 'string' && (cell.startsWith('http://') || cell.startsWith('https://'));
                    if (isLinkColumn && isActualLink) {
                      return <td key={cellIndex}><a href={cell} target="_blank" rel="noopener noreferrer">{cell}</a></td>;
                    }
                    return <td key={cellIndex}>{cell}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '8px', textAlign: 'center' }}>No table data to display.</div>
        )}
      </div>

      <style jsx>{`
        /* Global styles for this component */
        .win95-window {
          font-family: 'MS Sans Serif', 'Tahoma', Arial, sans-serif;
          font-size: 12px; /* Base pixel font size */
          background-color: #C0C0C0; /* light gray */
          border-top: 1px solid #FFFFFF; /* white */
          border-left: 1px solid #FFFFFF; /* white */
          border-bottom: 1px solid #000000; /* black for outer shadow */
          border-right: 1px solid #000000; /* black for outer shadow */
          padding: 2px; /* Overall padding to create inner bevel */
          image-rendering: pixelated; /* Attempt for jagged edges on images/fonts */
          font-smooth: never;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
        }
        .win95-window::before {
          content: '';
          position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          border-top: 1px solid #C0C0C0; /* Inner light gray border */
          border-left: 1px solid #C0C0C0;
          border-bottom: 1px solid #808080; /* dark gray */
          border-right: 1px solid #808080; /* dark gray */
          pointer-events: none; /* Make sure it doesn't interfere with clicks */
        }

        .win95-title-bar {
          background-color: #000080; /* blue */
          color: #FFFFFF; /* white */
          padding: 2px 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 20px; /* Fixed height */
        }
        .win95-title-text {
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .win95-title-buttons {
          display: flex;
        }
        .win95-button {
          background-color: #C0C0C0; /* light gray */
          border-top: 1px solid #FFFFFF;
          border-left: 1px solid #FFFFFF;
          border-bottom: 1px solid #000000;
          border-right: 1px solid #000000;
          width: 16px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'MS Sans Serif', 'Tahoma', Arial, sans-serif; /* Ensure pixel font */
          font-size: 10px; /* Small symbols */
          margin-left: 2px;
          padding: 0;
          box-sizing: border-box;
          line-height: 1; /* For button text */
        }
        .win95-button:active {
          border-top: 1px solid #000000;
          border-left: 1px solid #000000;
          border-bottom: 1px solid #FFFFFF;
          border-right: 1px solid #FFFFFF;
        }
        .win95-close-button {
          font-weight: bold;
        }

        .win95-menu-bar {
          background-color: #C0C0C0; /* light gray */
          padding: 2px 4px;
          display: flex;
          height: 20px; /* Fixed height */
          align-items: center;
        }
        .win95-menu-bar span {
          padding: 2px 6px;
          margin-right: 2px;
          color: #000000; /* black */
          cursor: default;
        }
        .win95-menu-bar span:hover {
          background-color: #808080; /* dark gray */
          color: #FFFFFF; /* white */
        }

        .win95-query-label-container {
          background-color: #C0C0C0; /* light gray */
          padding: 4px;
        }
        .win95-query-text {
          background-color: #C0C0C0; /* light gray */
          border-top: 1px solid #808080; /* dark gray for recessed */
          border-left: 1px solid #808080;
          border-bottom: 1px solid #FFFFFF; /* white for recessed */
          border-right: 1px solid #FFFFFF;
          padding: 4px;
          color: #000000; /* black */
          height: 24px; /* Fixed height */
          display: flex;
          align-items: center;
        }

        .win95-table-container {
          margin: 4px;
          border-top: 1px solid #808080; /* dark gray for recessed */
          border-left: 1px solid #808080;
          border-bottom: 1px solid #FFFFFF; /* white for recessed */
          border-right: 1px solid #FFFFFF;
          overflow-y: auto; /* Scrollable */
          max-height: 320px; /* Example height, adjust as needed */
          background-color: #FFFFFF; /* White background for table content area */
        }
        .win95-table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
        }
        .win95-table th, .win95-table td {
          border: 1px solid #000000; /* black */
          padding: 0 4px; /* Minimal padding */
          text-align: left;
          height: 32px;
          line-height: 32px; /* For vertical centering */
          vertical-align: middle; /* Ensure vertical centering */
          white-space: nowrap; /* Prevent text wrapping by default */
          overflow: hidden;
          text-overflow: ellipsis; /* Add ellipsis if content overflows */
        }
        .win95-table th {
          background-color: #A0A0A0; /* medium gray */
          color: #000000; /* black */
          font-weight: bold;
          border-top: 1px solid #FFFFFF; /* white for raised */
          border-left: 1px solid #FFFFFF;
          border-bottom: 1px solid #808080; /* dark gray for raised */
          border-right: 1px solid #808080;
          position: sticky;
          top: 0; /* Make headers sticky */
          z-index: 1;
        }
        .win95-table td {
          background-color: #C0C0C0; /* light gray */
          color: #000000; /* black */
        }
        .win95-table tr.selected td {
          background-color: #000080; /* blue */
          color: #FFFFFF; /* white */
        }
        .win95-table tr.selected td a {
          color: #FFFF00; /* Yellow for links in selected row, for contrast */
        }
        .win95-table td a {
          color: #0000FF; /* blue */
          text-decoration: underline;
        }
        .win95-table td a:hover {
          color: #FF0000; /* red */
        }
        
        /* Basic Scrollbar Styling - highly browser dependent */
        .win95-table-container::-webkit-scrollbar {
          width: 16px;
          height: 16px;
        }
        .win95-table-container::-webkit-scrollbar-track {
          background: #C0C0C0; /* light gray */
        }
        .win95-table-container::-webkit-scrollbar-thumb {
          background: #808080; /* dark gray */
          border-top: 1px solid #FFFFFF;
          border-left: 1px solid #FFFFFF;
          border-bottom: 1px solid #000000;
          border-right: 1px solid #000000;
        }
        .win95-table-container::-webkit-scrollbar-button {
          background: #C0C0C0;
          border-top: 1px solid #FFFFFF;
          border-left: 1px solid #FFFFFF;
          border-bottom: 1px solid #000000;
          border-right: 1px solid #000000;
          display: block; /* Or none if you don't want arrows */
          height: 16px;
          width: 16px;
        }
        /* Add more specific scrollbar button icons if possible/needed via pseudo-elements */

      `}</style>
    </div>
  );
};


const Home: NextPage = () => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const queryText = inputQuery.trim();
    if (!queryText) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: queryText,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputQuery('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let aiMessage: Message;

      if (data.text) {
        // Heuristic check for Markdown table
        const isTableResponse = data.text.trim().startsWith('|') && data.text.includes('|---');
        aiMessage = {
          id: Date.now().toString() + '-ai',
          sender: 'ai',
          text: data.text,
          timestamp: new Date(),
          isTable: isTableResponse,
          originalUserQuery: isTableResponse ? queryText : undefined,
        };
      } else if (data.error) {
        setError(data.error);
        aiMessage = {
          id: Date.now().toString() + '-error',
          sender: 'ai',
          text: `Error: ${data.error}`,
          timestamp: new Date(),
        };
      } else {
        aiMessage = {
          id: Date.now().toString() + '-fallback',
          sender: 'ai',
          text: "I received a response, but it's not in the expected format.",
          timestamp: new Date(),
        };
      }
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (err: any) {
      console.error('Search failed:', err);
      const errorMessageText = err.message || 'An unexpected error occurred.';
      setError(errorMessageText);
      const errorMessage: Message = {
        id: Date.now().toString() + '-catch-error',
        sender: 'ai',
        text: `Error: ${errorMessageText}`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Head>
        <title>Recruit360 AI Chat</title>
        <meta name="description" content="Chat with Recruit360 AI to find candidates" />
        <link rel="icon" href="/favicon.ico" />
        {/* Global styles for .prose markdown tables - keep if needed for non-retro AI messages */}
        <style jsx global>{`
          .prose table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          .prose th,
          .prose td {
            border: 1px solid #e2e8f0; /* gray-300 */
            padding: 0.5em 0.75em;
            text-align: left;
          }
          .prose thead {
            background-color: #f7fafc; /* gray-100 */
          }
          .prose thead th {
            font-weight: 600;
          }
          .prose tbody tr:nth-child(odd) {
            background-color: #edf2f7; /* gray-200 */
          }
          .prose a {
            color: #4299e1; /* blue-500 */
            text-decoration: underline;
          }
          .prose a:hover {
            color: #2b6cb0; /* blue-700 */
          }
        `}</style>
      </Head>

      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">STALK.AI</h1>
      </header>

      <main 
        ref={chatContainerRef}
        className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50"
      >
        {messages.map((msg) => {
          if (msg.sender === 'ai' && msg.isTable && msg.originalUserQuery) {
            return (
              <RetroTableWindow 
                key={msg.id} 
                markdownContent={msg.text} 
                userQuery={msg.originalUserQuery} 
              />
            );
          }
          // Default message rendering
          return (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl lg:max-w-3xl px-4 py-2 rounded-lg shadow ${ 
                  msg.sender === 'user'
                    ? 'bg-indigo-500 text-white'
                    : msg.text.startsWith('Error:') 
                      ? 'bg-red-200 text-red-800 prose prose-sm lg:prose-base break-words' 
                      : 'bg-white text-gray-800 prose prose-sm lg:prose-base break-words'
                }`}
              >
                {
                  msg.sender === 'ai' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )
                }
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'} text-right`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg shadow bg-white text-gray-800">
              <p className="text-sm italic">AI is thinking...</p>
            </div>
          </div>
        )}
      </main>

      {error && (
          <div className="p-3 bg-red-100 border-t border-red-300 text-red-700 text-sm">
            <p><span className="font-semibold">Error:</span> {error}</p>
          </div>
        )}

      <footer className="bg-white p-4 border-t border-gray-200 shadow- ऊपर">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ask about candidates... (e.g., 'data scientist in New York with Python skills')"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                handleSubmit(e as any); // Trigger form submission
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Send'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Home;
