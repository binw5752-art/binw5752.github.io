import { useEffect, useState } from "react";

/** 全局装饰背景 - 鼠标视差墨溅光斑 */
export default function HalftoneBg() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const px = (mouse.x - 0.5) * 40;
  const py = (mouse.y - 0.5) * 40;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 朱砂光斑 */}
      <div
        className="absolute top-[-10%] left-[-10%] h-[40vw] w-[40vw] rounded-full opacity-30 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,61,0.6) 0%, transparent 60%)",
          transform: `translate(${px}px, ${py}px)`,
          transition: "transform 0.6s ease-out",
        }}
      />
      {/* 青瓷光斑 */}
      <div
        className="absolute bottom-[-10%] right-[-10%] h-[40vw] w-[40vw] rounded-full opacity-25 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 60%)",
          transform: `translate(${-px}px, ${-py}px)`,
          transition: "transform 0.6s ease-out",
        }}
      />
      {/* 鎏金光斑 */}
      <div
        className="absolute top-[40%] right-[20%] h-[20vw] w-[20vw] rounded-full opacity-15 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,184,0,0.5) 0%, transparent 60%)",
          transform: `translate(${px * 0.5}px, ${-py * 0.5}px)`,
          transition: "transform 0.6s ease-out",
        }}
      />
    </div>
  );
}
