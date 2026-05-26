import React, { useMemo } from "react";

const ThemeParticles = ({ activeTheme = "fortaleza" }) => {
  const particles = useMemo(() => {
    let count = 0;
    let type = "";

    if (activeTheme === "fortaleza") {
      count = 15;
      type = "particle-dust";
    } else if (activeTheme === "bosque") {
      count = 20;
      type = "particle-firefly";
    } else if (activeTheme === "infierno") {
      count = 25;
      type = "particle-ash";
    } else if (activeTheme === "tundra") {
      count = 35;
      type = "particle-snowflake";
    } else {
      return []; // Piratas no usa partículas flotantes, usa olas y niebla
    }

    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 6 + (type === "particle-snowflake" ? 2 : 4);
      const left = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = Math.random() * 10 + (type === "particle-snowflake" ? 6 : 8);

      return {
        id: i,
        className: `particle ${type}`,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        },
      };
    });
  }, [activeTheme]);

  if (activeTheme === "piratas") {
    return (
      <>
        <div className="mist-overlay" />
        <div className="sea-waves" />
        <div className="sea-waves-2" />
      </>
    );
  }

  return (
    <div className="particle-container">
      {particles.map((p) => (
        <div key={p.id} className={p.className} style={p.style} />
      ))}
    </div>
  );
};

export default ThemeParticles;
