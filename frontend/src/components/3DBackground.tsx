import React, { useEffect, useRef } from 'react';

const ThreeDBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Neural network nodes
    const nodes: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
      pulse: number;
    }> = [];

    const colors = ['#00d4ff', '#9333ea', '#22c55e', '#f97316', '#ec4899'];

    // Create nodes
    for (let i = 0; i < 80; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      nodes.forEach((node, index) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
        node.pulse += 0.02;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;
        if (node.z < 0) node.z = 1000;
        if (node.z > 1000) node.z = 0;

        // 3D projection
        const scale = 200 / (200 + node.z);
        const x2d = node.x * scale + canvas.width * (1 - scale) / 2;
        const y2d = node.y * scale + canvas.height * (1 - scale) / 2;
        const size = node.size * scale * (1 + Math.sin(node.pulse) * 0.3);

        // Draw node
        ctx.save();
        ctx.globalAlpha = scale * (0.5 + Math.sin(node.pulse) * 0.3);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = node.color;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw connections
        nodes.slice(index + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const dz = node.z - otherNode.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 150) {
            const otherScale = 200 / (200 + otherNode.z);
            const otherX2d = otherNode.x * otherScale + canvas.width * (1 - otherScale) / 2;
            const otherY2d = otherNode.y * otherScale + canvas.height * (1 - otherScale) / 2;

            ctx.save();
            ctx.globalAlpha = (150 - distance) / 150 * 0.3 * Math.min(scale, otherScale);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(otherX2d, otherY2d);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      // Add floating geometric shapes
      ctx.save();
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * 0.2 + Math.sin(time + i) * 100;
        const y = canvas.height * 0.3 + Math.cos(time + i * 0.7) * 80;
        const rotation = time + i * 0.5;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2;
        ctx.strokeRect(-20, -20, 40, 40);
        ctx.restore();
      }
      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ThreeDBackground;