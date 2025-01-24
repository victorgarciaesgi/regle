import satori from 'satori';
import { html } from 'satori-html';
import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

export async function generateSatoriBanner({
  title,
  description,
  bread,
}: {
  title: string;
  description: string;
  bread: string[];
}) {
  const fontBuffer = await fs.promises.readFile(path.resolve(import.meta.dirname, './theme/inter.ttf'));

  const convertedHtml = html` <div
    style="height:100%;width:100%;display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:space-between;background-color:#0b0d0c;font-size:32px;font-weight:600;padding:0 40px;column-gap:40px;background-image:radial-gradient(circle at 25px 25px, rgba(255,255,255, 0.5) 1%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 187, 127, 0.3) 2%, transparent 0%);background-size:100px 100px"
  >
    <div style="display:flex;flex-direction:column;max-width:450px;flex-wrap:wrap;row-gap:4px;color:white">
      <span style="font-size:16px;color:#00bb7f">Regle docs</span>
      <span style="font-size:36px;margin:10px 0;font-weight:bold;color:#fff">${title}</span>
      <span style="font-size:22px;color:#fff">${description}</span>
    </div>
    <svg width="210" height="210" viewBox="0 0 501 501">
      <g>
        <path
          d="m147 110 155.1 24.6c45.2 7.1 60.4 70.6 24.3 101.4L147 388.8v-84.5L274.3 196 147 178z"
          style="fill:#00bb7f"
        ></path>
        <path d="m249.6 325.8 33.2 62.7h80l-58-109.7z" style="fill:#fff"></path>
      </g>
    </svg>
  </div>`;

  const svg = await satori(convertedHtml, {
    width: 800,
    height: 400,
    fonts: [
      {
        name: 'Inter',
        data: fontBuffer,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1000,
    },
    font: {
      fontFiles: ['./theme/inter.ttf'],
      loadSystemFonts: false,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng().toString();
}
