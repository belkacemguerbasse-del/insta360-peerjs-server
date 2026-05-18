'use strict'

const path             = require('path')
const express          = require('express')
const cors             = require('cors')
const { ExpressPeerServer } = require('peer')

const PORT = process.env.PORT || 3000
const PEER_PATH = '/peerjs'

const app = express()
app.use(cors())

// Healthcheck JSON (monitoring)
app.get('/health', (req, res) => {
  res.json({
    service: 'insta360-peerjs-server',
    status: 'ok',
    path: PEER_PATH,
    time: new Date().toISOString()
  })
})

// Pages statiques (homepage + viewer.html)
app.use(express.static(path.join(__dirname, 'public')))

// Démarre HTTP server
const server = app.listen(PORT, () => {
  console.log(`[peerjs-server] HTTP listening on port ${PORT}`)
})

// Monte PeerJS sur /peerjs (signaling)
const peerServer = ExpressPeerServer(server, {
  path: '/',
  proxied: true,            // derrière le reverse proxy Hostinger (nginx)
  allow_discovery: false,
})

peerServer.on('connection', client => {
  console.log(`[peerjs-server] + client connected: ${client.getId()}`)
})
peerServer.on('disconnect', client => {
  console.log(`[peerjs-server] - client disconnected: ${client.getId()}`)
})

app.use(PEER_PATH, peerServer)
