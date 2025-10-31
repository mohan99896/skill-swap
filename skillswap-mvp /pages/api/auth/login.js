import prisma from '../../../lib/db'
import bcrypt from 'bcrypt'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).end()
const { email, password } = req.body
const user = await prisma.user.findUnique({ where: { email } })
if (!user) return res.status(401).json({ error: 'Invalid' })
const ok = await bcrypt.compare(password, user.password)
if (!ok) return res.status(401).json({ error: 'Invalid' })
const token = signToken({ id: user.id })
setTokenCookie(res, token)
res.json({ user: { id: user.id, email: user.email, name: user.name, credits: user.credits } })
}
