/**
 * Logo.tsx
 *
 * Vector (inline SVG) wordmark for Innova Cab Rentals.
 * Lockup: "INNOVA CABS" (white + orange) over BANGALORE (gray, letter-spaced).
 *
 * Rendered inline (not as an <img>) so it stays crisp at any size, inherits no
 * network request, and can be dropped on any background.
 *
 * Variants:
 * - "mark": text only, transparent background — use on the navy header/footer.
 * - "full": text on a rounded navy card — use standalone (share previews, print, favicons).
 */

interface LogoProps {
  variant?: 'mark' | 'full';
  className?: string;
  title?: string;
}

export default function Logo({
  variant = 'mark',
  className,
  title = 'Innova Cab Rentals',
}: LogoProps) {
  const content = (
    <>
      <text
        x="4"
        y="32"
        fontFamily="var(--font-inter), Inter, Arial, sans-serif"
        fontWeight={800}
        fontSize="30"
        letterSpacing="-0.5"
        fill="#FFFFFF"
      >
        INNOVA <tspan fill="#F0562B">CABS</tspan>
      </text>
      <text
        x="4"
        y="58"
        fontFamily="var(--font-inter), Inter, Arial, sans-serif"
        fontWeight={700}
        fontSize="20"
        textLength="206"
        lengthAdjust="spacing"
        fill="#9CA3AF"
      >
        BANGALORE
      </text>
    </>
  );

  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 230 90"
        role="img"
        aria-label={title}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <rect x="0" y="0" width="230" height="90" rx="16" fill="#0B1B33" />
        {content}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 214 66"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {content}
    </svg>
  );
}
