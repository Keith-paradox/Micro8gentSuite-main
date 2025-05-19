import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import JudyAssistant from "@/components/icons/JudyAssistant";

const AIAssistant = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Add the ElevenLabs script to the document when the component mounts
  useEffect(() => {
    // Check if the script already exists to avoid duplicates
    if (!document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]')) {
      const script = document.createElement('script');
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
    
    return () => {
      // You could remove the script on unmount, but it might be better to leave it
      // in case the user navigates back to this page
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Mobile sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowMobileSidebar(false)}></div>
          <div className="relative flex h-full flex-col bg-white w-80">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar 
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
        />

        {/* Page Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">Talk to Judy</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center">
              {/* Judy Assistant graphic */}
              <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                <JudyAssistant width={180} height={180} />
              </div>
              
              <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-semibold">Your AI Assistant</h2>
                  <div className="ml-2 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    Powered by AI
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Ask Judy anything about your business, schedule appointments, or get technical support.
                  She's here to help your customers and streamline your operations.
                </p>
                
                {/* ElevenLabs Convai Widget */}
                <div className="w-full border border-gray-200 rounded-lg p-4">
                  {/* Using dangerouslySetInnerHTML to add the custom element */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: '<elevenlabs-convai agent-id="OWuZT83muGVlhDLF3kGp"></elevenlabs-convai>'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAssistant;