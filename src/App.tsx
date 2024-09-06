import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ReactComponent as MySVG } from './MySVG.svg';
import './App.css';

// Define the type for the letter elements
type LetterRef = HTMLSpanElement | null;

const MyComponent: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lettersRef = useRef<LetterRef[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flipState = useRef<boolean>(false); 
  const currentLetterIndex = useRef<number>(0);

  useEffect(() => {
    const svgElement = svgRef.current;
    const container = containerRef.current;

    if (!svgElement || !container) return;

    const containerWidth = container.offsetWidth;
    const svgWidth = svgElement.getBoundingClientRect().width;
    const margin = 20; 

    // Animate the SVG element
    const animation = gsap.to(svgElement, {
      x: containerWidth - svgWidth, // Add margin here
      duration: 2,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
      onRepeat: () => {
        // Toggle the flip state on each repeat (flipping the SVG)
        flipState.current = !flipState.current;
        const rotation = flipState.current ? 180 : 0;

        // Apply the flip rotation
        gsap.to(svgElement, {
          rotationY: rotation,
          duration: 0.5,
          ease: 'power1.inOut',
        });

        // If the SVG has returned to the start (left side), make all letters visible after a delay
        if (!flipState.current) {
          lettersRef.current.forEach((letter) => {
            if (letter) {
              gsap.to(letter, { opacity: 1, duration: 0.5, delay: 0.5 }); // Add delay here
            }
          });
        }
      },
      onUpdate: () => {
        const svgRect = svgElement.getBoundingClientRect();
        lettersRef.current.forEach((letter, index) => {
          if (letter) {
            const letterRect = letter.getBoundingClientRect();
            const svgLeft = svgRect.left;
            const svgRight = svgRect.right;
            const letterLeft = letterRect.left;
            const letterRight = letterRect.right;

            if (!flipState.current) {
              if (svgRight > letterLeft && svgLeft < letterRight) {
                currentLetterIndex.current = index; 
                gsap.to(letter, { opacity: 0, duration: 0.2 });
              }
            } else {

              if (svgRight > letterLeft && svgLeft < letterRight) {
                gsap.to(letter, { opacity: 1, duration: 0.2, delay: 0.5 });
              }
            }
          }
        });
      },
    });

    return () => {
      animation.kill(); // Clean up the GSAP animation on component unmount
    };
  }, []);

  return (
    <div ref={containerRef} className="text-container" style={{ position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <MySVG ref={svgRef} width="60px" height="60px" className="my-svg" style={{
        position: 'absolute',
        left: 0,  // Start the SVG at the left edge of the container
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1
      }} />
      <div className="text-layer" style={{ marginLeft: '30px' }}> {/* Added margin-left to create space */}
        {"SUMMIT".split("").map((char, i) => (
          <span
            key={i}
            ref={(el) => (lettersRef.current[i] = el)}
            style={{ display: 'inline-block', fontSize: '2rem', marginRight: '2px' }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MyComponent;
