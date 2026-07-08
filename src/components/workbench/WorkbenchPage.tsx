"use client";

import { ArrowUp, ImagePlus, LoaderCircle, Play, Sparkles, Upload } from "lucide-react";
import { useState } from "react";

type WorkbenchPageProps = {
  title: string;
  description: string;
  mode?: "video" | "image" | "tool";
};

const models = ["GPT Image 2", "Seedance", "Veo", "Runway", "Kling"];
const presets = [
  "Cinematic street portrait",
  "Product hero shot",
  "K-pop dance intro",
  "Explosive transition",
  "Documentary scene"
];

export function WorkbenchPage({ title, description, mode = "video" }: WorkbenchPageProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  function simulateGenerate() {
    setGenerating(true);
    window.setTimeout(() => setGenerating(false), 900);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-black text-gray-950">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-600">
            <Sparkles size={14} className="text-kiwi-500" />
            Mock UI, API ready
          </div>
        </div>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="min-h-[520px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              {presets.map((preset, index) => (
                <button
                  key={preset}
                  className="group aspect-[4/3] rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-kiwi-50 p-4 text-left transition hover:border-kiwi-300"
                  onClick={() => setPrompt(preset)}
                >
                  <div className="flex h-full flex-col justify-between">
                    <ImagePlus className="text-gray-400 group-hover:text-kiwi-500" />
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Preset {index + 1}</div>
                      <div className="mt-1 text-sm font-black text-gray-950">{preset}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <Upload className="mx-auto text-gray-400" />
              <div className="mt-3 text-sm font-black text-gray-950">Upload reference asset</div>
              <div className="mt-1 text-xs text-gray-500">Frontend placeholder. Connect this to Java object storage upload API.</div>
            </div>
          </section>
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 text-sm font-black text-gray-950">Creation settings</div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-gray-400">Model</label>
            <select className="mb-4 w-full rounded-xl border-gray-200 text-sm font-semibold">
              {models.map((model) => (
                <option key={model}>{model}</option>
              ))}
            </select>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-gray-400">Prompt</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
              placeholder={`Describe the ${mode} you want to create...`}
              className="w-full rounded-xl border-gray-200 text-sm leading-6"
            />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["16:9", "9:16", "1:1"].map((ratio) => (
                <button key={ratio} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-black hover:bg-gray-50">
                  {ratio}
                </button>
              ))}
            </div>
            <button
              onClick={simulateGenerate}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-black text-white transition hover:bg-gray-800"
            >
              {generating ? <LoaderCircle size={17} className="animate-spin" /> : mode === "tool" ? <Play size={17} /> : <ArrowUp size={17} />}
              {generating ? "Generating..." : "Generate"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
