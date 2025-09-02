/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import 'immer'
import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import {createSelectorFunctions} from 'auto-zustand-selectors-hook'
import modes from './modes'
import models from './models'

export default createSelectorFunctions(
  create(
    immer(() => ({
      didInit: false,
      feed: [],
      outputMode: Object.keys(modes)[0],
      batchMode: true,
      batchSize: 3,
      batchModel: Object.keys(models)[1],
      versusModels: Object.fromEntries(
        Object.keys(models)
          .filter(model => !models[model].imageOutput)
          .map(model => [model, true])
      )
    }))
  )
)
