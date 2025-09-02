/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {outputWidth, outputHeight} from './consts'

const f = s =>
  s
    .replaceAll(/([^\n{])\n([^\n}\s+])/g, '$1 $2')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim()

export default {
  p5: {
    name: 'P5.js',
    emoji: '🎨',
    syntax: 'javascript',
    systemInstruction: f(`\
You are an expert P5.js developer. When given a prompt, you will use your creativity
and coding skills to create a ${outputWidth}x${outputHeight} P5.js sketch that
perfectly satisfies the prompt. Be creative and add animation or interactivity
if appropriate. Do not import any external assets, they won't work. Return ONLY
the P5.js code, nothing else, no commentary.`),
    getTitle: s => `Code ${s}`,
    presets: [
      {
        label: '🐦 birds',
        prompt: 'flock of birds'
      },
      {
        label: '⏰ clock',
        prompt: 'analog clock'
      },
      {
        label: '🖼️ portrait',
        prompt: 'an abstract self portrait'
      },
      {
        label: '😵‍💫 illusion',
        prompt: 'an optical illusion'
      },
      {
        label: '💧 raindrops',
        prompt: 'raindrops'
      },
      {
        label: '📺 TV',
        prompt: 'simulation of a TV with different channels'
      },
      {
        label: '🌈 kaleidoscope',
        prompt: 'colorful interactive kaleidoscope'
      },
      {
        label: '🎉 confetti',
        prompt: 'confetti'
      },
      {
        label: '🎆 fireworks',
        prompt: 'fireworks'
      },
      {
        label: '🐜 ants',
        prompt: 'ant simulation'
      },
      {
        label: '✨ fireflies',
        prompt: 'fireflies'
      },
      {
        label: '🌳 fractal',
        prompt: 'fractal tree'
      },
      {
        label: '🌊 pond',
        prompt: 'pond ripples'
      },
      {
        label: '🚲 pelican riding bicycle',
        prompt: 'a pelican riding a bicycle'
      }
    ]
  },

  svg: {
    name: 'SVG',
    emoji: '📐',
    syntax: 'xml',
    systemInstruction: f(`\
You are an expert at turning image prompts into SVG code. When given a prompt,
use your creativity to code a ${outputWidth}x${outputHeight} SVG rendering of it.
Always add viewBox="0 0 ${outputWidth} ${outputHeight}" to the root svg tag. Do
not import external assets, they won't work. Return ONLY the SVG code, nothing else,
no commentary.`),
    getTitle: s => `Draw ${s}`,
    presets: [
      {
        label: '🦄 unicorn',
        prompt: 'a unicorn'
      },
      {
        label: '🦀 crab',
        prompt: 'a crab'
      },
      {
        label: '🐭 mouse',
        prompt: 'a cute mouse'
      },
      {
        label: '🚲 pelican riding bicycle',
        prompt: 'a pelican riding a bicycle'
      },
      {
        label: '🍉 watermelon',
        prompt: 'a watermelon'
      },
      {
        label: '🎂 cake',
        prompt: 'a birthday cake'
      },
      {
        label: '🍦 ice cream',
        prompt: 'an ice cream cone'
      },
      {
        label: '🏙️ city',
        prompt: 'a city'
      },
      {
        label: '🏖️ beach',
        prompt: 'a beach'
      },
      {
        label: '💻 computer',
        prompt: 'a computer'
      },
      {
        label: '🖥️ GUI',
        prompt: 'a computer GUI with labels'
      },
      {
        label: '🛋️ floor plan',
        prompt: 'a living room floor plan with labels'
      },
      {
        label: '🤖 robot',
        prompt: 'a robot'
      }
    ]
  },

  html: {
    name: 'HTML/JS',
    emoji: '📄',
    syntax: 'html',
    systemInstruction: f(`\
You are an expert web developer. When given a prompt, you will use your creativity
and coding skills to create a minimal web app that perfectly satisfies the prompt.
Try to use only vanilla JavaScript, HTML, and CSS. Try to design the layout so
it looks good in a 4:3 aspect ratio. Write a full HTML page with the styles and
styles and scripts inlined. The app will run inside a sandboxed iframe so do not
use any secure APIs like localStorage and don't make any network calls. Do not
ever import assets like images or videos, they won't work. Try using emojis for
graphics. Return ONLY the HTML page, nothing else, no commentary.`),

    getTitle: s => `Code ${s}`,
    presets: [
      {
        label: '☀️ weather app',
        prompt: 'a simulated weather app'
      },
      {
        label: '📝 todo list',
        prompt: 'a todo list'
      },
      {
        label: '🪙 coin flip',
        prompt: 'coin flipping app, with an animated coin'
      },
      {
        label: '🗓️ calendar',
        prompt: 'a calendar'
      },
      {
        label: '🧮 calculator',
        prompt: 'a calculator'
      },
      {
        label: '🎮 tic-tac-toe',
        prompt: 'tic tac toe game where you play against the computer'
      },
      {
        label: '✏️ drawing app',
        prompt: 'simple drawing app'
      },
      {
        label: '🎨 pixel art',
        prompt: 'pixel art painting app'
      },
      {
        label: '📎 infinite paperclip game',
        prompt: 'infinite paperclip game'
      },
      {
        label: '🖥️ computer terminal',
        prompt: 'a vintage computer terminal simulation'
      },
      {
        label: '🧠 memory game',
        prompt: 'a memory game'
      }
    ]
  },

  three: {
    name: 'Three.js',
    emoji: '3️⃣',
    syntax: 'html',
    systemInstruction: f(`\
You are an expert Three.js developer. When given a prompt, you will use your
creativity and coding skills to create a ${outputWidth}x${outputHeight} Three.js
scene that perfectly satisfies the prompt. Always return a full HTML document
with the Three.js library included. Import the library and any other necessary
libraries via the esm.run CDN (e.g. https://esm.run/three). The HTML page should
only have a fullscreen canvas element that always resizes to the window size.
Remember to set the renderer.setPixelRatio to 2. Always add orbit controls to the
scene so the user can rotate the camera. Never attempt to import external assets
like models, textures, or shaders, they will not work. Return ONLY the HTML
code with embedded JS, nothing else, no commentary.`),
    getTitle: s => `Code ${s}`,
    presets: [
      {
        label: '📦 cubes',
        prompt:
          'a dynamic 3D grid of cubes that react to mouse position by changing scale and color'
      },
      {
        label: '🌌 galaxy',
        prompt:
          'a procedural colorful galaxy with thousands of randomly placed and sized stars (spheres with basic materials)'
      },
      {
        label: '👤 figure',
        prompt:
          'a 3D figure created using basic geometric shapes (spheres for head, cylinders for limbs, etc.) with different colors'
      },
      {
        label: '🐭 mouse',
        prompt: 'a cute 3D mouse'
      },
      {
        label: '🏀 bouncing ball',
        prompt: 'a bouncing 3D ball that casts a dynamic shadow on a plane'
      },
      {
        label: '🌊 undulating surface',
        prompt:
          'something interesting using the Math.sin() function to create an undulating surface in 3D'
      },
      {
        label: '🍩 donuts',
        prompt:
          'a scene composed entirely of interconnected tori (donut shapes) forming a complex structure'
      },
      {
        label: '🪑 table',
        prompt: 'a 3D table and chairs'
      },
      {
        label: '🌳 trees',
        prompt: 'a 3D terrain with trees and blue sky'
      }
    ]
  },

  image: {
    name: 'Images',
    emoji: '🖼️',
    syntax: 'image',
    systemInstruction: f(`\
You are an expert at turning text prompts into images. When given a prompt, you will
use your creativity to create a ${outputWidth}x${outputHeight} image that perfectly
satisfies the prompt.`),
    getTitle: s => s,
    imageOutput: true,
    presets: []
  }
}
