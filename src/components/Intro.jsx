/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState} from 'react'
import shuffle from 'lodash.shuffle'
import modes from '../lib/modes'
import {
  addRound,
  setOutputMode,
  setBatchModel,
  setBatchMode
} from '../lib/actions'
import models from '../lib/models'
import useStore from '../lib/store'

export default function Intro() {
  const batchModel = useStore.use.batchModel()
  const [presets] = useState(
    Object.fromEntries(
      Object.entries(modes).map(([key, mode]) => [
        key,
        shuffle(mode.presets.slice(0, 50))
      ])
    )
  )

  return (
    <section className="intro">
      <h2>👋 Welcome to VibeCheck 🌡️</h2>
      <p>
        This is a playground where you can quickly batch-test prompts with
        visual outputs. ✅ 👀 Try one below:
      </p>

      {Object.entries(modes).map(([key, mode]) =>
        mode.imageOutput ? null : (
          <div key={key}>
            <h3>
              {mode.emoji} {mode.name}
            </h3>

            <div className="selector presetList">
              <ul className="presets wrapped">
                {presets[key].map(({label, prompt}) => (
                  <li key={label}>
                    <button
                      onClick={() => {
                        setOutputMode(key)

                        if (key === 'image') {
                          setBatchMode(true)
                          setBatchModel(
                            Object.keys(models).find(k => models[k].imageOutput)
                          )
                        } else if (models[batchModel].imageOutput) {
                          setBatchModel(Object.keys(models)[1])
                        }

                        addRound(prompt)
                      }}
                      className="chip"
                    >
                      {label}
                    </button>
                  </li>
                ))}
                {/* <li>
                <button
                  className="chip primary"
                  onClick={() =>
                    setPresets(prev => ({
                      ...prev,
                      [key]: shuffle(mode.presets).slice(0, 5)
                    }))
                  }
                >
                  <span className="icon">shuffle</span>
                  Show more
                </button>
              </li> */}
              </ul>
            </div>
          </div>
        )
      )}
    </section>
  )
}
