'use client'
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollOnTop = () => {
  const [showButton, setShowButton] = useState(false);

  // Function to handle scrolling and showing/hiding the button
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  // Scroll to top when the button is clicked
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    // Add event listener to handle scroll behavior
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <button
      className={`fixed z-40 bottom-1 right-4 p-3 rounded-full bg-cyan-900 text-white ${
        showButton ? 'block' : 'hidden'
      }`}
      onClick={scrollToTop}
      title="Scroll to Top"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollOnTop;
