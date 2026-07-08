import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DemoConsole } from "@/components/demo/DemoConsole";

const toolIds = [
  "home",
  "video-generator",
  "image-generator",
  "avatar-talking",
  "photo-effects",
  "video-effects",
  "face-swap",
  "character-swap",
  "meme-generator",
  "background-remover",
  "image-editor",
  "video-editor"
];

type ToolPageProps = {
  params: Promise<{ tool: string }>;
};

export function generateStaticParams() {
  return toolIds.map((tool) => ({ tool }));
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { tool } = await params;
  if (!toolIds.includes(tool)) notFound();

  return (
    <Suspense fallback={null}>
      <DemoConsole initialPage={tool} />
    </Suspense>
  );
}
