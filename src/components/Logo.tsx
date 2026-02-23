
import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, showText = true }) => {
  const fullText = "VIBEXATHON";
  const versionText = "1.0";
  const [displayedText, setDisplayedText] = useState("");
  const [displayedVersion, setDisplayedVersion] = useState("");

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (idx < fullText.length) {
          idx++;
          return fullText.slice(0, idx);
        } else {
          clearInterval(interval);
          // Start version typing after main text finishes
          let vIdx = 0;
          const vInterval = setInterval(() => {
            setDisplayedVersion((vPrev) => {
              if (vIdx < versionText.length) {
                vIdx++;
                return versionText.slice(0, vIdx);
              } else {
                clearInterval(vInterval);
                return vPrev;
              }
            });
          }, 120);
          return prev;
        }
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src={"/assets/vibe_black.png"}
        alt="Vibexathon Logo"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-xl tracking-tighter text-white">
            {displayedText}
            {displayedText.length < fullText.length && <span className="animate-pulse text-indigo-500">|</span>}
          </span>
          <span className="font-black text-xs text-indigo-500 tracking-[0.2em] ml-0.5">
            {displayedVersion}
            {displayedText.length === fullText.length && displayedVersion.length < versionText.length && <span className="animate-pulse text-indigo-500">|</span>}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
