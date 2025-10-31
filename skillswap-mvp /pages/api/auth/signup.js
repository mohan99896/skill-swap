import prisma from '../../../lib/db'
import bcrypt from 'bcrypt'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).end()
const { email, password, name } = req.body
if (!email || !password) return res.status(400).json({ error: 'Missing' })
const hashed = await bcrypt.hash(password, 10)
try {
const user = await prisma.user.create({ data: { email, password: hashed, name } })
const token = signToken({ id: user.id })
setTokenCookie(res, token)
res.json({ user: { id: user.id, email: user.email, name: user.name, credits: user.credits } })
} catch (e) {
res.status(400).json({ error: 'User exists or DB error' })
}
}
