"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);

  useEffect(() => {
    document.body.style.setProperty(
      "--gradient-background-start",
      gradientBackgroundStart
    );
    document.body.style.setProperty(
      "--gradient-background-end",
      gradientBackgroundEnd
    );
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, []);

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) {
        return;
      }
      setCurX(curX + (tgX - curX) / 20);
      setCurY(curY + (tgY - curY) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(
        curX
      )}px, ${Math.round(curY)}px)`;
    }

    move();
  }, [tgX, tgY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  return (
    <div
      className={cn(
        "w-full h-full fixed inset-0 overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>
        </defs>
      </svg>
      <div
        className={cn(
          "",
          isSafari ? "blur-[2px]" : "[filter:url(#blurMe)_blur(12px)]"
        )}
        style={{
          transform: "translateZ(0)",
        }}
      >
        <div
          className={cn(
            "animate-gradient absolute [background:radial-gradient(circle_at_50%_50%,var(--first-color)_0,transparent_50%)] rotate-x-[60deg]",
            "opacity-50"
          )}
          style={{ width: "60%", height: "60%" }}
        />
        <div
          className={cn(
            "animate-gradient absolute [background:radial-gradient(circle_at_50%_50%,var(--second-color)_0,transparent_50%)]",
            "opacity-50"
          )}
          style={{ width: "50%", height: "50%" }}
        />
        <div
          className={cn(
            "animate-gradient absolute [background:radial-gradient(circle_at_50%_50%,var(--third-color)_0,transparent_50%)]",
            "opacity-50"
          )}
          style={{ width: "50%", height: "50%" }}
        />
        <div
          className={cn(
            "animate-gradient absolute [background:radial-gradient(circle_at_50%_50%,var(--fourth-color)_0,transparent_50%)]",
            "opacity-50"
          )}
          style={{ width: "50%", height: "50%" }}
        />
        <div
          className={cn(
            "animate-gradient absolute [background:radial-gradient(circle_at_50%_50%,var(--fifth-color)_0,transparent_50%)]",
            "opacity-50"
          )}
          style={{ width: "50%", height: "50%" }}
        />
      </div>

      <div
        className={cn(
          "absolute [background:radial-gradient(circle_at_50%_50%,var(--pointer-color)_0,transparent_50%)]",
          "opacity-35"
        )}
        style={{ width: size, height: size }}
        ref={interactiveRef}
      />

      {interactive && (
        <div
          className="absolute inset-0 z-10"
          onMouseMove={handleMouseMove}
        />
      )}

      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
};
