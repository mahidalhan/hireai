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
}

const Home: NextPage = () => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const queryText = inputQuery.trim();
    if (!queryText) {
      return;
    }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.text) {
        const aiMessage: Message = {
          id: Date.now().toString() + '-ai',
          sender: 'ai',
          text: data.text,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else if (data.error) {
        setError(data.error);
        const errorMessage: Message = {
          id: Date.now().toString() + '-error',
          sender: 'ai',
          text: `Error: ${data.error}`,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } else {
        const fallbackMessage: Message = {
          id: Date.now().toString() + '-fallback',
          sender: 'ai',
          text: "I received a response, but it's not in the expected format.",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, fallbackMessage]);
      }
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
        <h1 className="text-2xl font-bold text-center">Recruit360 AI Assistant</h1>
      </header>

      <main 
        ref={chatContainerRef}
        className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl lg:max-w-3xl px-4 py-2 rounded-lg shadow ${ 
                msg.sender === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-gray-800 prose prose-sm lg:prose-base break-words'
              } ${msg.text.startsWith('Error:') ? 'bg-red-200 text-red-800' : ''}`}
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
              <p className="text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'} text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
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
