import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import bcrypt from 'bcrypt'
import prisma from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'
const TOKEN_NAME = 'skillswap_token'

export function signToken(payload) {
return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
try {
return jwt.verify(token, JWT_SECRET)
} catch (e) {
return null
}
}

export function setTokenCookie(res, token) {
res.setHeader('Set-Cookie', cookie.serialize(TOKEN_NAME, token, {
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
maxAge: 60 * 60 * 24 * 7,
path: '/',
sameSite: 'lax'
}))
}

export function removeTokenCookie(res) {
res.setHeader('Set-Cookie', cookie.serialize(TOKEN_NAME, '', {
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
maxAge: 0,
path: '/',
sameSite: 'lax'
}))
}

export async function getUserFromRequest(req) {
const cookies = req.headers.cookie
if (!cookies) return null
const parsed = cookie.parse(cookies || '')
const token = parsed[TOKEN_NAME]
if (!token) return null
const data = verifyToken(token)
if (!data) return null
const user = await prisma.user.findUnique({ where: { id: data.id } })
return user
}
