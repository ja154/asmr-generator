/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
import modes from './modes'
import llmGen from './llm'
import models from './models'

const get = useStore.getState
const set = useStore.setState

export const init = () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })
}

const newOutput = (model, mode, isBatch) => ({
  model,
  isBatch,
  id: crypto.randomUUID(),
  startTime: Date.now(),
  outputData: null,
  isBusy: true,
  gotError: false,
  outputMode: mode,
  rating: 0,
  isFavorite: false,
  comments: ''
})

export const addRound = (prompt, promptImage) => {
  scrollTo({top: 0, left: 0, behavior: 'smooth'})

  const {outputMode, batchMode, batchSize, batchModel, versusModels} = get()

  if (!batchMode && Object.values(versusModels).every(active => !active)) {
    return
  }

  const newRound = {
    prompt,
    systemInstruction: modes[outputMode].systemInstruction,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    outputMode,
    outputs: batchMode
      ? new Array(batchSize)
          .fill(null)
          .map(() => newOutput(batchModel, outputMode, true))
      : Object.entries(versusModels)
          .filter(([, active]) => active)
          .map(([model]) => newOutput(model, outputMode))
  }

  newRound.outputs.forEach(async (output, i) => {
    const isImage = output.outputMode === 'image'
    let res

    try {
      res = await llmGen({
        model: models[output.model].modelString,
        thinking: models[output.model].thinking,
        thinkingCapable: models[output.model].thinkingCapable,
        systemInstruction: isImage ? null : newRound.systemInstruction,
        prompt: isImage
          ? newRound.systemInstruction + `\n${newRound.prompt}`
          : newRound.prompt,
        imageOutput: isImage,
        promptImage
      })
    } catch (e) {
      set(state => {
        const round = state.feed.find(round => round.id === newRound.id)
        if (!round) {
          return
        }
        round.outputs[i] = {
          ...output,
          isBusy: false,
          gotError: true,
          totalTime: Date.now() - output.startTime
        }
      })
      return
    }

    set(state => {
      const output = newRound.outputs[i]
      const round = state.feed.find(round => round.id === newRound.id)

      if (!round) {
        return
      }

      round.outputs[i] = {
        ...output,
        outputData: res
          .replace(/```\w+/gm, '')
          .replace(/```\n?$/gm, '')
          .trim(),
        isBusy: false,
        totalTime: Date.now() - output.startTime
      }
    })
  })

  set(state => {
    state.feed.unshift(newRound)
  })
}

export const setOutputMode = mode =>
  set(state => {
    state.outputMode = mode
  })

export const setBatchModel = model =>
  set(state => {
    state.batchModel = model
  })

export const setBatchMode = active =>
  set(state => {
    state.batchMode = active

    if (!active && state.outputMode === 'image') {
      state.outputMode = Object.keys(modes)[0]
    }
  })

export const setBatchSize = size =>
  set(state => {
    state.batchSize = size
  })

export const setVersusModel = (model, active) =>
  set(state => {
    state.versusModels[model] = active
  })

export const removeRound = id =>
  set(state => {
    state.feed = state.feed.filter(round => round.id !== id)
  })

export const reset = () => {
  set(state => {
    state.feed = []
  })
}

init()
