/*
 * @Author: 魏进 3413105907@qq.com
 * @Date: 2025-03-26 13:48:29
 * @LastEditors: 魏进 3413105907@qq.com
 * @LastEditTime: 2025-03-29 10:35:02
 * @FilePath: \online-recruitment-system-frontend\src\utils\websocket.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { getUserId,getGradeId,getRole } from './auth'
import { Notification } from 'element-ui'
import Vue from 'vue'

// 定义 WebSocket 实例
let socket
const baseSocketUrl = 'ws://localhost:8080/websocket'
// eslint-disable-next-line no-unused-vars
let isConnected = false
let reconnectTimer
const reconnectInterval = 5000 // 重连间隔时间，单位：毫秒
// websocket收到消息回调
// eslint-disable-next-line no-unused-vars
// let messageCallback
let reconnectCount = 0
const maxReconnectCount = 10 // 设置最大重连次数
// eslint-disable-next-line no-unused-vars
let isManuallyClosed = false // 标记是否是主动断开连接

// 定义全局事件总线
const EventBus = new Vue()

// 连接 WebSocket
const connectWebSocket = () => {
  if (!getUserId()) {
    console.error('用户 ID 未设置，无法连接 WebSocket')
    return
  }
  const socketUrl = `${baseSocketUrl}?userId=${getUserId()}`
  socket = new WebSocket(socketUrl)

  socket.onopen = () => {
    console.log('WebSocket 连接成功')
    isConnected = true
    // 连接成功，清除定时任务
    clearInterval(reconnectTimer)
  }

  socket.onmessage = (event) => {
    console.log('收到消息:', event.data)
    const res = JSON.parse(event.data)
    if (res.type === 'NOTICE' && getRole() === 'student' && res.data.gradeIds.includes(getGradeId())) {
      // 弹出通知
      Notification({
        title: `通知`,
        // dangerouslyUseHTMLString: true,
        message: `你有一条新公告请及时查收`
      })
    }
    // 使用事件总线发送时间
    EventBus.$emit('websocket-message', res)
  }

  socket.onclose = () => {
    console.log('WebSocket 连接关闭')
    isConnected = false
    // 非主动断开连接，或未达到最大连接次数，尝试重新连接
    if (!isManuallyClosed && reconnectCount < maxReconnectCount) {
      console.log('尝试重连...')
      // 清除之前的定时任务
      if (reconnectTimer) {
        clearInterval(reconnectTimer)
      }
      // 指数型增加重连间隔时间
      const currentInterval = reconnectInterval * Math.pow(2, reconnectCount)
      reconnectTimer = setInterval(connectWebSocket, currentInterval)
      reconnectCount++
    } else {
      // 主动断开连接或达到最大连接次数，清除定时任务
      clearInterval(reconnectTimer)
      if (isManuallyClosed) {
        console.log('主动断开连接，停止重连')
      } else {
        console.log('已达到最大重连次数，停止重连')
      }
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket 发生错误:', error)
  }
}

// 封装发送消息的方法
function sendMessage(message) {
  console.log('-------------')
  console.log(socket)
  if (!socket) {
    console.error('WebSocket 未初始化，尝试重新连接')
    this.$message({ type: 'error', message: 'WebSocket 未初始化，尝试重新连接,请稍后再试' })
    connectWebSocket()
    return false
  }
  const readyState = socket.readyState
  if (readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
    return true
  }
  if (readyState === WebSocket.CONNECTING) {
    console.log('WebSocket 正在连接中，请稍后再试')
    this.$message({ type: 'error', message: 'WebSocket 正在连接中，请稍后再试' })
    return false
  }
  if (readyState === WebSocket.CLOSING) {
    console.log('WebSocket 正在关闭，无法发送消息')
    this.$message({ type: 'error', message: 'WebSocket 正在关闭，无法发送消息' })
    return false
  } if (readyState === WebSocket.CLOSED) {
    console.log('WebSocket 已关闭，尝试重新连接')
    this.$message({ type: 'error', message: 'WebSocket 已关闭，尝试重新连接' })
    connectWebSocket()
    return false
  }
}

// 断开 WebSocket 连接的方法
function disconnectWebSocket() {
  if (socket) {
    isManuallyClosed = true // 标记为主动断开
    clearInterval(reconnectTimer) // 清除重连定时器
    socket.close()
    console.log('主动断开 WebSocket 连接')
  }
}

export {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
  EventBus
}
