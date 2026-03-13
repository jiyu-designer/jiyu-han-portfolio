import type { Metadata } from "next";
import MovingClient from "./moving-client";

export const metadata: Metadata = {
  title: "Moving | Jiyu Han",
  description: "Moving is a media art project featuring four interactive WebGL and canvas visualizations — particle text, flowmap, liquid background, and ocean waves.",
  openGraph: {
    title: "Moving | Jiyu Han",
    description: "Moving is a media art project featuring four interactive WebGL and canvas visualizations — particle text, flowmap, liquid background, and ocean waves.",
    images: [{ url: "/images/projects/Moving-main.png" }],
  },
};

export default function MovingPage() {
  return <MovingClient />;
}
