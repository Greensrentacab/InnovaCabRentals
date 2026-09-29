/**
 * Logo.tsx
 *
 * Vector (inline SVG) wordmark for Innova Cabs Bangalore.
 * Stacked lockup: INNOVA (white) / CABS (orange) / BANGALORE (gray, letter-spaced).
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
  title = 'Innova Cabs Bangalore',
}: LogoProps) {
  const content = (
    <>
      <text
        x="4"
        y="34"
        fontFamily="var(--font-inter), Inter, Arial, sans-serif"
        fontWeight={800}
        fontSize="30"
        letterSpacing="-0.5"
        fill="#FFFFFF"
      >
        INNOVA
      </text>
      <text
        x="4"
        y="68"
        fontFamily="var(--font-inter), Inter, Arial, sans-serif"
        fontWeight={800}
        fontSize="30"
        letterSpacing="-0.5"
        fill="#F0562B"
      >
        CABS
      </text>
      <text
        x="4"
        y="90"
        fontFamily="var(--font-inter), Inter, Arial, sans-serif"
        fontWeight={600}
        fontSize="12"
        letterSpacing="3"
        fill="#9CA3AF"
      >
        BANGALORE
      </text>
    </>
  );

  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 190 110"
        role="img"
        aria-label={title}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <rect x="0" y="0" width="190" height="110" rx="16" fill="#0B1B33" />
        {content}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 170 96"
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
