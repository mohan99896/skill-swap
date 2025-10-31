import prisma from '../../../lib/db'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
if (req.method === 'GET') {
const all = await prisma.skill.findMany({ include: { owner: true } })
res.json(all)
return
}
if (req.method === 'POST') {
const user = await getUserFromRequest(req)
if (!user) return res.status(401).json({ error: 'login' })
const { title, description } = req.body
const skill = await prisma.skill.create({ data: { title, description, ownerId: user.id } })
res.json(skill)
return
}
res.status(405).end()
}
