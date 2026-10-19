import { useCallback, useEffect, useRef, useState } from 'react'
import api, { API_BASE_URL, getErrorMessage } from '../api/client'

const RUNNER_WS_URL = import.meta.env.VITE_RUNNER_WS_URL

const emptyRun = () => ({
  running: false,
  ready: false,
  runError: '',
  result: null,
  events: [],
})

export default function useInteractiveRun() {
  const [run, setRun] = useState(emptyRun)
  const socketRef = useRef(null)
  const completeRef = useRef(false)
  const connectingRef = useRef(false)
  const sequenceRef = useRef(0)

  useEffect(() => () => {
    sequenceRef.current += 1
    socketRef.current?.close()
  }, [])

  const execute = useCallback(({ code }) => {
    if (connectingRef.current || (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING)) return

    completeRef.current = false
    connectingRef.current = true
    setRun({ ...emptyRun(), running: true })
    const sequence = ++sequenceRef.current

    const connect = async () => {
      let ticket
      if (RUNNER_WS_URL) {
        try {
          const response = await api.post('/execute/interactive-ticket')
          ticket = response.data.ticket
          if (typeof ticket !== 'string' || !ticket) throw new Error('The server returned an invalid runner ticket.')
        } catch (error) {
          if (sequence !== sequenceRef.current) return
          completeRef.current = true
          connectingRef.current = false
          setRun((current) => ({
            ...current,
            running: false,
            runError: getErrorMessage(error, 'Could not authorize the code runner.'),
          }))
          return
        }
      }
      if (sequence !== sequenceRef.current) return

      let socket
      try {
        const socketUrl = RUNNER_WS_URL
          ? new URL(RUNNER_WS_URL, window.location.origin)
          : new URL(API_BASE_URL, window.location.origin)
        if (socketUrl.protocol === 'https:') socketUrl.protocol = 'wss:'
        if (socketUrl.protocol === 'http:') socketUrl.protocol = 'ws:'
        if (!RUNNER_WS_URL) socketUrl.pathname = `${socketUrl.pathname.replace(/\/$/, '')}/execute/interactive`
        if (import.meta.env.PROD && socketUrl.protocol !== 'wss:') {
          throw new Error('The production runner WebSocket must use WSS.')
        }
        socket = new WebSocket(socketUrl)
      } catch (error) {
        completeRef.current = true
        connectingRef.current = false
        setRun((current) => ({
          ...current,
          running: false,
          runError: error.message || 'The code runner URL is invalid.',
        }))
        return
      }
      socketRef.current = socket

      socket.addEventListener('open', () => {
        connectingRef.current = false
        socket.send(JSON.stringify(ticket
          ? { type: 'authenticate', ticket }
          : { type: 'start', code }))
      })
      socket.addEventListener('message', (event) => {
        let message
        try {
          message = JSON.parse(event.data)
        } catch {
          completeRef.current = true
          setRun((current) => ({ ...current, running: false, runError: 'Received an invalid response from the code runner.' }))
          socket.close()
          return
        }

        if (message.type === 'authorized') {
          socket.send(JSON.stringify({ type: 'start', code }))
        } else if (message.type === 'compile') {
          setRun((current) => ({
            ...current,
            compileOutput: message.output,
            ...(message.ok ? {} : { result: { status: 'Compilation Error', compileOutput: message.output } }),
          }))
        } else if (message.type === 'ready') {
          setRun((current) => ({ ...current, ready: true }))
        } else if (message.type === 'output') {
          setRun((current) => ({
            ...current,
            events: [...current.events, { stream: message.stream, data: message.data }],
          }))
        } else if (message.type === 'exit') {
          completeRef.current = true
          setRun((current) => ({
            ...current,
            running: false,
            ready: false,
            result: {
              ...current.result,
              status: message.status,
              exitCode: message.exitCode,
              timeMs: message.timeMs,
              stdout: current.events.filter((item) => item.stream === 'stdout').map((item) => item.data).join(''),
              stderr: current.events.filter((item) => item.stream === 'stderr').map((item) => item.data).join(''),
              compileOutput: current.compileOutput,
            },
          }))
        } else if (message.type === 'error') {
          completeRef.current = true
          setRun((current) => ({ ...current, running: false, ready: false, runError: message.message }))
        }
      })
      socket.addEventListener('error', () => {
        if (!completeRef.current) {
          completeRef.current = true
          setRun((current) => ({
            ...current,
            running: false,
            ready: false,
            runError: 'Could not connect to the code runner. Please try again.',
          }))
        }
      })
      socket.addEventListener('close', () => {
        connectingRef.current = false
        if (!completeRef.current) {
          completeRef.current = true
          setRun((current) => ({
            ...current,
            running: false,
            ready: false,
            runError: 'The code runner connection closed unexpectedly.',
          }))
        }
        if (socketRef.current === socket) socketRef.current = null
      })
    }

    void connect()
  }, [])

  const sendInput = useCallback((data) => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'input', data }))
      return true
    }
    return false
  }, [])

  const stop = useCallback(() => {
    sequenceRef.current += 1
    connectingRef.current = false
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'stop' }))
    socket?.close()
    socketRef.current = null
    completeRef.current = true
    setRun((current) => ({ ...current, running: false, ready: false }))
  }, [])

  const clear = useCallback(() => {
    if (run.running) return
    sequenceRef.current += 1
    connectingRef.current = false
    socketRef.current?.close()
    socketRef.current = null
    completeRef.current = true
    setRun(emptyRun())
  }, [run.running])

  return { run, execute, sendInput, stop, clear }
}
