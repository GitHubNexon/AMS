import React, { useContext, useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { MiscContext } from '../context/MiscContext';
import ContextBootstrap from '../context/ContextBootstrap';

function Layout({ children }) {
  const { expandSidebar, setExpandSidebar } = useContext(MiscContext);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const handleClick = (event) => {
    if ((event.target.id === 'modalized' || event.target.tagName === 'A') && windowSize.width < 800) {
      setExpandSidebar(false);
    }
  };

  // Debounce resize handling
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Toggle sidebar based on window width
    if (window.innerWidth < 800) {
      setExpandSidebar(false);
    } else {
      setExpandSidebar(true);
    }
  };

  useEffect(() => {
    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClick);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClick);
    };
  }, [windowSize.width, setExpandSidebar]); // Ensure dependencies are updated

  return (
    <ContextBootstrap>
    <div className="flex h-[100vh]">
      {/* Sidebar handling */}
      <div className={`flex ${expandSidebar ? (windowSize.width < 800 ? 'sidebar-float' : '') : 'w-0'} overflow-hidden`} id='modalized' >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="overflow-y-hidden flex flex-1 flex-col">
        <Header ww={windowSize.width} />
        <div className="flex-1 overflow-y-scroll bg-gray-200 p-2">
          <div className='bg-white rounded'>
            {children}
          </div>
          <span className="self-end text-end m-[10px] block text-[0.6em] text-gray-400">
            {/* v 1.0 09/26/2024 */}
            {/* v 1.1 10/28/2024 */}
            v 1.2 02/04/2024
          </span>
        </div>
      </div>
    </div>
    </ContextBootstrap>
  );
}

export default Layout;