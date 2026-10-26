import React from "react";

export type DnaHeroProps = { fallbackUrl: string };

export default function DnaHero({ fallbackUrl }: DnaHeroProps) {
  return (
    <div className="dna-hero">
      <img
        className="dna-hero-image"
        src={fallbackUrl}
        alt="Bronze and ivory DNA double helix"
        width="960"
        height="1440"
        fetchPriority="high"
        loading="eager"
        draggable={false}
      />
    </div>
  );
}
