import request from '@/api/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// export function getInfo(token) {
//   return request({
//     url: '/user/info',
//     method: 'get',
//     params: { token }
//   })
// }

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
