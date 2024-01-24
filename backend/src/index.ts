import 'dotenv/config'

import Koa from 'koa'
import Router from 'koa-router'
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'

import { AppRoutes } from './routes'

// Create koa app
const app = new Koa()
const router = new Router()

// Register all application routes
AppRoutes.forEach((route) => router[route.method](route.path, route.action))

// Run app
app.use(bodyParser())
app.use(json())
app.use(cors())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, '127.0.0.1')

console.log('side-gpt-backend is up and running on port 3000')
