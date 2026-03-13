import type { Metadata } from "next";
import NostalgiaClient from "./nostalgia-client";

export const metadata: Metadata = {
  title: "Nostalgia | Jiyu Han",
  description: "Nostalgia is a virtual jewelry brand experience featuring a 3D lookbook, scroll-driven zoom gallery, and ambient music.",
  openGraph: {
    title: "Nostalgia | Jiyu Han",
    description: "Nostalgia is a virtual jewelry brand experience featuring a 3D lookbook, scroll-driven zoom gallery, and ambient music.",
    images: [{ url: "/images/projects/Noting-main.png" }],
  },
};

export default function NostalgiaPage() {
  return <NostalgiaClient />;
}
