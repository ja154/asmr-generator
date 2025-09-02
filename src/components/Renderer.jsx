/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {memo, useEffect, useRef, useState} from 'react'
import {outputWidth} from '../lib/consts'

function Renderer({mode, code}) {
  const iframeRef = useRef(null)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.onerror = () => setShowError(true)
    }
  }, [iframeRef])

  return (
    <div className={`renderer ${mode}Renderer`}>
      {mode === 'image' ? (
        <img src={code} alt="Generated image" />
      ) : (
        <iframe
          sandbox="allow-same-origin allow-scripts"
          loading="lazy"
          srcDoc={scaffolds[mode] ? scaffolds[mode](code) : code}
          ref={iframeRef}
        />
      )}

      {showError && (
        <div className="error">
          <p>
            <span className="icon">error</span> This code produced an error.
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(Renderer)

const scaffolds = {
  p5: code => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.8/p5.js"></script>
  <style>
    body {
      padding: 0;
      margin: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #fff;
    }
    body, main, canvas {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <script>
    ${code}

    if (typeof window.setup === 'function') {
      new p5()
    }

    function windowResized() {
      const canvas = document.querySelector('canvas')

      if (canvas) {
        canvas.style.scale = windowWidth / ${outputWidth}
        canvas.style.transformOrigin = '0 0'
      }
    }

    setTimeout(windowResized, 10)
  </script>
</body>
</html>`,

  svg: code => `
<style>
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    overflow: hidden;
  }
  svg {
    width: 100%;
    height: 100%;
  }
</style>
${code}`
}
