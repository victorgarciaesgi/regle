import satori from 'satori';
import { html } from 'satori-html';
import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import { kebabCase } from 'lodash-es';

export async function generateSatoriBanner({
  name,
  title,
  description,
  bread,
}: {
  name: string;
  title: string;
  description: string;
  bread: string[];
}) {
  const fontBuffer = await fs.promises.readFile(path.resolve(import.meta.dirname, './theme/inter.ttf'));

  const convertedHtml = html`<div
    style="height:100%;width:100%;display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:space-between;background-color:#0b0d0c;font-size:32px;font-weight:600;padding:0 40px;column-gap:40px;background-image:radial-gradient(circle at 25px 25px, rgba(255,255,255, 0.5) 1%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 187, 127, 0.3) 2%, transparent 0%);background-size:100px 100px"
  >
    <div style="display:flex;flex-direction:column;max-width:450px;flex-wrap:wrap;row-gap:4px;color:white">
      <div
        style="font-size:24px;font-weight:normal;line-height:1.3;color:transparent;background-image:linear-gradient(90deg, #1aedaa, #00bb7f);background-clip:text;-webkit-background-clip:text"
      >
        Regle docs
      </div>
      <span style="font-size:46px;color:#fff">${title}</span
      ><span style="font-size:26px;margin-top:10px;font-weight:normal;color:#ddd">${description}</span>
    </div>
    <div style="display:flex;position:relative">
      <svg
        width="230"
        height="230"
        style="position:absolute;top:60%;transform:translate(0%, -50%)"
        viewBox="0 0 501 501"
      >
        <g>
          <path
            d="m147 110 155.1 24.6c45.2 7.1 60.4 70.6 24.3 101.4L147 388.8v-84.5L274.3 196 147 178z"
            style="fill:#00bb7f"
          ></path>
          <path d="m249.6 325.8 33.2 62.7h80l-58-109.7z" style="fill:#fff"></path>
        </g></svg
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        width="900"
        style="top:-30px;left:-200px;opacity:0.7;z-index:-1"
        height="500"
      >
        <defs>
          <filter id="f" x="-100%" y="-100%" width="400%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="100"></feGaussianBlur>
          </filter>
        </defs>
        <circle cx="400" cy="300" r="200" fill="#00bb7f" filter="url(#f)"></circle>
      </svg>
    </div>
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
    shapeRendering: 2,
  });
  const outputDir = path.resolve(__dirname, './dist/assets');
  fs.mkdirSync(outputDir, { recursive: true });
  const parsedName = kebabCase(name);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  await fs.promises.writeFile(path.join(outputDir, `og-images_${parsedName}.png`), pngBuffer);

  return `assets/og-images_${parsedName}.png`;
}
