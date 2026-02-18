import fs from "fs";
import path from "path";
import BeyondWithHumanityClient from "./beyond-with-humanity-client";

function getArtworks(): { colLeft: string[]; colCenter: string[]; colRight: string[] } {
  const dir = path.join(process.cwd(), "public/images/beyond-with-humanity");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp|gif|mp4)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/(\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    });

  const colLeft: string[] = [];
  const colCenter: string[] = [];
  const colRight: string[] = [];

  files.forEach((file, i) => {
    const src = `/images/beyond-with-humanity/${file}`;
    if (i % 3 === 0) colLeft.push(src);
    else if (i % 3 === 1) colCenter.push(src);
    else colRight.push(src);
  });

  // Reverse so newest (highest number) appears at top
  colLeft.reverse();
  colCenter.reverse();
  colRight.reverse();

  return { colLeft, colCenter, colRight };
}

export default function BeyondWithHumanityPage() {
  const { colLeft, colCenter, colRight } = getArtworks();
  return <BeyondWithHumanityClient colLeft={colLeft} colCenter={colCenter} colRight={colRight} />;
}
