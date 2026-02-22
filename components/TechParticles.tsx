
import React, { useEffect, useRef } from 'react';

const TechParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interaction State
  const mouse = useRef({ x: 0, y: 0, active: false });
  const gyro = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let parentElement: HTMLElement | null = null;

    // --- Particle Class ---
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; // Random low drift speed
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1; // Random size
      }

      update() {
        // 1. Base Velocity
        this.x += this.vx;
        this.y += this.vy;

        // 2. Gyroscope Influence (Mobile Tilt)
        // Adds a global drift based on device orientation
        this.x += gyro.current.x * 2; 
        this.y += gyro.current.y * 2;

        // 3. Mouse Interaction (Repulsion)
        if (mouse.current.active) {
            const dx = mouse.current.x - this.x;
            const dy = mouse.current.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const interactionRadius = 150;

            if (distance < interactionRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (interactionRadius - distance) / interactionRadius;
                
                // Gentle push away
                const repulsionStrength = 2; 
                this.x -= forceDirectionX * force * repulsionStrength;
                this.y -= forceDirectionY * force * repulsionStrength;
            }
        }

        // 4. Screen Wrapping
        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        
        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      }
    }

    // --- Initialization & Loop ---
    const initParticles = () => {
        particles = [];
        // Calculate density based on area
        const numberOfParticles = Math.floor((width * height) / 15000); 
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    };

    const drawConnections = () => {
        const connectDistance = 120;
        
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectDistance) {
                    const opacity = 1 - (distance / connectDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`; // Very faint lines
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawConnections();
        
        animationFrameId = requestAnimationFrame(animate);
    };

    // --- Event Handlers ---
    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
        mouse.current.active = true;
    };
    
    const handleMouseLeave = () => {
        mouse.current.active = false;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
        // Normalize gamma (-90 to 90) and beta (-180 to 180) to small factors
        if (e.gamma !== null) gyro.current.x = e.gamma / 90; 
        if (e.beta !== null) gyro.current.y = e.beta / 180;
    };

    // --- Setup Listeners ---
    parentElement = canvas.parentElement;
    let resizeObserver: ResizeObserver | null = null;

    if (parentElement) {
        // Observe resize for responsive canvas
        resizeObserver = new ResizeObserver(() => {
            // Wrap in requestAnimationFrame to avoid "ResizeObserver loop completed with undelivered notifications"
            window.requestAnimationFrame(() => handleResize());
        });
        resizeObserver.observe(parentElement);
        
        // Mouse Listeners
        parentElement.addEventListener('mousemove', handleMouseMove);
        parentElement.addEventListener('mouseleave', handleMouseLeave);
    }
    
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    // Start
    handleResize();
    animate();

    // Cleanup
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        if (parentElement) {
            parentElement.removeEventListener('mousemove', handleMouseMove);
            parentElement.removeEventListener('mouseleave', handleMouseLeave);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default TechParticles;
