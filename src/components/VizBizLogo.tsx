import Image from "next/image";
import Link from "next/link";

interface VizBizLogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { mark: "h-9 w-9", word: "text-[1.35rem]" },
  md: { mark: "h-11 w-11", word: "text-2xl" },
  lg: { mark: "h-14 w-14", word: "text-3xl" },
};

export default function VizBizLogo({ variant = "light", size = "sm", className = "" }: VizBizLogoProps) {
  const color = variant === "dark" ? "text-white" : "text-[#0F172A]";
  const aiColor = variant === "dark" ? "text-[#22D3EE]" : "text-[#06B6D4]";
  const selected = sizes[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 no-underline ${className}`} aria-label="VizBiz.ai home">
      <Image
        src="/vizbiz-icon-256.svg"
        alt=""
        aria-hidden="true"
        width={256}
        height={256}
        className={`${selected.mark} rounded-[22%] shadow-[0_0_20px_rgba(34,211,238,0.18)]`}
      />

      <span className={`font-sans font-normal tracking-[-0.035em] ${selected.word} leading-none ${color}`}>
        VizBiz<span className={aiColor}>.ai</span>
      </span>
    </Link>
  );
}
