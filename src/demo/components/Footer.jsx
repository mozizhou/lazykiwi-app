const FOOTER_COLS = {
  "AI Tools": [
    { label: "Text to Video", url: "/generate/text-to-video" },
    { label: "Image to Video", url: "/generate/image-to-video" }
  ],
  "Models": [
    { type: "subheading", label: "Video Models" },
    { label: "Veo 3", url: "/video-models/veo-3" },
    { label: "Sora 2", url: "/video-models/sora-2" },
    { label: "Kling AI", url: "/video-models/kling-ai" },
    { label: "Seedance 2.0", url: "/video-models/seedance-2" },
    { label: "More Video Models", url: "/video-models/" },
    { type: "subheading", label: "Image Models" },
    { label: "GPT Image 2", url: "/image-models/gpt-image-2" },
    { label: "Nano Banana 2", url: "/image-models/nano-banana-2" },
    { label: "Recraft", url: "/image-models/recraft" },
    { label: "Ideogram", url: "/image-models/ideogram" },
    { label: "Stable Diffusion", url: "/image-models/stable-diffusion" },
    { label: "More Image Models", url: "/image-models/" }
  ],
  "Effects & Templates": [
    { label: "Video Effects", url: "/effects/video-effects" },
    { label: "Photo Effects", url: "/effects/photo-effects" },
    { label: "Meme Generator", url: "/effects/meme-generator" },
    { label: "Face Swap", url: "/effects/face-swap" },
    { label: "Character Swap", url: "/effects/character-swap" }
  ],
  "Generate": [
    { label: "Generate", url: "/generate/" },
    { label: "Text to Video", url: "/generate/text-to-video" },
    { label: "Image to Video", url: "/generate/image-to-video" }
  ],
  "About": [
    { label: "About", url: "/about" },
    { label: "Contact Us", url: "/contact" },
    { label: "Pricing", url: "/pricing" },
    { label: "What's New", url: "/whats-new" },
    { label: "Help Center", url: "/help-center" },
    { label: "Blog", url: "/blog" },
    { label: "Affiliate Program", url: "/affiliate-program" }
  ]
};

export default function Footer({ aliases }) {
  const footerCols = aliases?.title && Array.isArray(aliases.terms) && aliases.terms.length > 0
    ? {
        ...FOOTER_COLS,
        [aliases.title]: aliases.terms.map((term) => ({ label: term }))
      }
    : FOOTER_COLS;

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {Object.entries(footerCols).map(([col, links]) => (
          <div key={col}>
            <h4 className="font-bold mb-6 text-gray-900 text-sm tracking-wide">{col}</h4>
            <ul className="space-y-3">
              {links.map((link, i) => (
                <li key={i} className={link.type === 'subheading' && i !== 0 ? 'pt-4' : ''}>
                  {link.type === 'subheading' ? (
                    <span className="text-[13px] font-bold text-gray-800 block mb-1">
                      {link.label}
                    </span>
                  ) : link.url ? (
                    <a href={link.url} className="text-[13px] text-gray-500 hover:text-kiwi-green-dark cursor-pointer transition-colors font-medium block">
                      {link.label}
                    </a>
                  ) : (
                    <span className="text-[13px] text-gray-500 font-medium block">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
