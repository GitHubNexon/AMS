import React, { useState, useRef } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

function ResizableContainer({
  title,
  headerDescription,
  footerDescription,
  width = "100%",
  initialHeight = 300,
  maxHeight = 800,
  children,
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [height, setHeight] = useState(initialHeight);
  const scrollContainerRef = useRef(null);

  const toggleMaximize = () => {
    if (isMaximized) {
      setHeight(initialHeight);
    } else {
      const vh75 = window.innerHeight * 0.75;
      setHeight(Math.min(vh75, maxHeight));
    }
    setIsMaximized(!isMaximized);
  };
  return (
    <>
      {isMaximized && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
      <div
        className={`${
          isMaximized
            ? "fixed inset-0 z-50 flex items-center justify-center p-6"
            : "relative"
        }`}
        style={{ width }}
      >
        <div
          className={`bg-white shadow-lg rounded-md flex flex-col w-full max-w-full transition-all duration-300`}
          style={{ height }}
          ref={scrollContainerRef}
        >
          {/* Header */}
          {(title || headerDescription) && (
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {headerDescription && (
                  <p className="text-gray-600 text-sm">{headerDescription}</p>
                )}
              </div>
              <button
                onClick={toggleMaximize}
                className="p-1 hover:bg-gray-200 rounded"
                aria-label={isMaximized ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isMaximized ? (
                  <MdFullscreenExit size={24} />
                ) : (
                  <MdFullscreen size={24} />
                )}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="overflow-auto flex-1 p-4">{children}</div>

          {/* Footer */}
          {footerDescription && (
            <div className="p-4 border-t text-sm text-gray-600">
              {footerDescription}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ResizableContainer;
