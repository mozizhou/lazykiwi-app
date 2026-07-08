import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { landingCards } from "@/data/navigation";
import { appUrl } from "@/lib/routes";

export function FeatureGrid() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black text-gray-950">Creator workflows</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
              The first version mirrors the product draft: generation, effects, tools, and pricing are ready to connect to Java APIs.
            </p>
          </div>
          <Link href={appUrl("/app/image-generator")} className="inline-flex items-center gap-2 text-sm font-black text-gray-950">
            Open workspace
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {landingCards.map((card) => (
            <Link key={card.title} href={card.href} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image src={card.image} alt={card.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-black text-gray-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
