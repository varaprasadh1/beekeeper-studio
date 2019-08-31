
import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import VueXPersistence from 'vuex-persist'
import fs from 'fs'
import path from 'path'
import config from '../config'
import shortid from 'shortid'

import Validate from '../lib/validation'

Vue.use(Vuex)

function fPath(key) {
  return path.join(config.userDirectory, `${key}.json`)
}

const vuexFile = new VueXPersistence({
  restoreState: (key) => {
    try {
      return JSON.parse(fs.readFileSync(fPath(key)))
    } catch(err) {
      if(err.code === 'ENOENT') {
        return null
      } else {
        throw err
      }
    }
  },
  saveState: (key, state) => {
    console.log("saving now")
    fs.writeFileSync(fPath(key), JSON.stringify(state))
  }
})


const store = new Vuex.Store({
  state: {
    connectionConfigs: {},
    queries: {},
    queryRuns: {},
    connectionHistory: []

  },
  mutations: {
    SAVE_CONFIG (state, config) {
      Vue.set(state.connectionConfigs, config.id, config)
    },
    ADD_TO_CONFIG_HISTORY(state, config) {
      state.connectionHistory.push(config)
    }
  },
  actions: {
    async saveConnectionConfig({ commit }, config) {
      const result = await Validate.config(config)
      if(result.valid) {
        if(!config.id) {
          config.id = shortid.generate()
        }
        commit('SAVE_CONFIG', config)
      }
      return result
    },
    async saveRecentConnection({ commit }, config) {
      const cpy = _.clone(config)
      cpy.password = null
      commit('ADD_TO_CONFIG_HISTORY', cpy)
    }
  },
  plugins: [vuexFile.plugin],
})

export default store
