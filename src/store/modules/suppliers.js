import request from '@/api/request'

const state = {
  supplierList: []
}

const mutations = {
  SET_SUPPLIERS: (state, suppliers) => {
    state.supplierList = suppliers
  }
}

const actions = {
  // user login
  querySuppliers({ commit }, params) {
    return new Promise((resolve, reject) => {
      request({
        url: '/querySuppliers',
        method: 'get',
        params
      }).then(res => {
        const { data } = res

        commit('SET_SUPPLIERS', data.suppliers)

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
