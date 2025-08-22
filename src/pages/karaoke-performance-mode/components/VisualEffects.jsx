import React, { useState, useEffect, useRef } from 'react';

const VisualEffects = ({
  isActive = false,
  audioLevel = 0,
  pitchAccuracy = 0,
  theme = 'default',
  className = ''
}) => {
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Particle system
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 4 + 2,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      color: getParticleColor(pitchAccuracy)
    });

    const interval = setInterval(() => {
      if (audioLevel > 0.1) {
        setParticles(prev => {
          const newParticles = [...prev];
          
          // Add new particles based on audio level
          const particleCount = Math.floor(audioLevel * 5);
          for (let i = 0; i < particleCount; i++) {
            newParticles?.push(createParticle());
          }
          
          // Update existing particles
          return newParticles?.map(particle => ({
              ...particle,
              x: particle?.x + particle?.vx,
              y: particle?.y + particle?.vy,
              life: particle?.life - particle?.decay
            }))?.filter(particle => particle?.life > 0 && particle?.y > -10);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, audioLevel, pitchAccuracy]);

  const getParticleColor = (accuracy) => {
    if (accuracy > 90) return '#10B981'; // success
    if (accuracy > 70) return '#F59E0B'; // warning
    if (accuracy > 50) return '#6366F1'; // primary
    return '#EF4444'; // error
  };

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !isActive) return;

    const ctx = canvas?.getContext('2d');
    
    const animate = () => {
      // Clear canvas
      ctx?.clearRect(0, 0, canvas?.width, canvas?.height);
      
      // Draw background effects
      drawBackgroundEffects(ctx, canvas?.width, canvas?.height);
      
      // Draw particles
      particles?.forEach(particle => {
        ctx?.save();
        ctx.globalAlpha = particle?.life;
        ctx.fillStyle = particle?.color;
        ctx?.beginPath();
        ctx?.arc(particle?.x, particle?.y, particle?.size, 0, 2 * Math.PI);
        ctx?.fill();
        ctx?.restore();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef?.current) {
        cancelAnimationFrame(animationRef?.current);
      }
    };
  }, [particles, isActive, theme, audioLevel]);

  const drawBackgroundEffects = (ctx, width, height) => {
    const time = Date.now() * 0.001;
    
    // Animated gradient background
    const gradient = ctx?.createLinearGradient(0, 0, width, height);
    
    switch (theme) {
      case 'energetic':
        gradient?.addColorStop(0, `hsla(${(time * 50) % 360}, 70%, 50%, 0.1)`);
        gradient?.addColorStop(1, `hsla(${(time * 30 + 180) % 360}, 70%, 50%, 0.1)`);
        break;
      case 'calm': gradient?.addColorStop(0,'hsla(200, 50%, 30%, 0.05)');
        gradient?.addColorStop(1, 'hsla(240, 50%, 30%, 0.05)');
        break;
      case 'party':
        gradient?.addColorStop(0, `hsla(${(time * 100) % 360}, 80%, 60%, 0.15)`);
        gradient?.addColorStop(0.5, `hsla(${(time * 80 + 120) % 360}, 80%, 60%, 0.15)`);
        gradient?.addColorStop(1, `hsla(${(time * 60 + 240) % 360}, 80%, 60%, 0.15)`);
        break;
      default:
        gradient?.addColorStop(0, 'hsla(220, 30%, 20%, 0.05)');
        gradient?.addColorStop(1, 'hsla(260, 30%, 20%, 0.05)');
    }
    
    ctx.fillStyle = gradient;
    ctx?.fillRect(0, 0, width, height);
    
    // Audio-reactive waves
    if (audioLevel > 0.1) {
      ctx.strokeStyle = getParticleColor(pitchAccuracy);
      ctx.lineWidth = 2;
      ctx.globalAlpha = audioLevel * 0.5;
      
      for (let i = 0; i < 3; i++) {
        ctx?.beginPath();
        const waveHeight = audioLevel * 50 * (i + 1);
        const frequency = 0.01 + i * 0.005;
        
        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.sin(x * frequency + time * 2 + i) * waveHeight;
          if (x === 0) {
            ctx?.moveTo(x, y);
          } else {
            ctx?.lineTo(x, y);
          }
        }
        ctx?.stroke();
      }
      
      ctx.globalAlpha = 1;
    }
  };

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      {/* CSS-based effects overlay */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        {audioLevel > 0.3 && (
          <div className="absolute inset-0">
            {[...Array(3)]?.map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-32 h-32 rounded-full opacity-20 animate-pulse
                  ${pitchAccuracy > 90 ? 'bg-success' : 
                    pitchAccuracy > 70 ? 'bg-warning' : 'bg-primary'}
                `}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + i}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Performance celebration */}
        {pitchAccuracy > 95 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">
              ⭐
            </div>
          </div>
        )}
        
        {/* Beat pulse effect */}
        {audioLevel > 0.5 && (
          <div 
            className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"
            style={{
              animationDuration: '0.5s'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VisualEffects;