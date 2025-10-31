import prisma from '../../../lib/db'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
const user = await getUserFromRequest(req)
if (!user) return res.status(401).json({ error: 'login' })

if (req.method === 'GET') {
// list swaps for user
const swaps = await prisma.swap.findMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] }, include: { skill: true, sender: true, receiver: true } })
res.json(swaps)
return
}

if (req.method === 'POST') {
// create swap request: sender requests skill from skill.owner
const { skillId, hours = 1 } = req.body
const skill = await prisma.skill.findUnique({ where: { id: Number(skillId) } })
if (!skill) return res.status(400).json({ error: 'Skill not found' })
if (skill.ownerId === user.id) return res.status(400).json({ error: 'Cannot request your own skill' })
const swap = await prisma.swap.create({ data: { senderId: user.id, receiverId: skill.ownerId, skillId: skill.id, hours } })
res.json(swap)
return
}

if (req.method === 'PUT') {
// update swap status (accept/complete/cancel)
const { id, action } = req.body
const swap = await prisma.swap.findUnique({ where: { id: Number(id) } })
if (!swap) return res.status(404).json({ error: 'No swap' })

// only receiver can accept
if (action === 'accept') {
if (swap.receiverId !== user.id) return res.status(403).json({ error: 'not allowed' })
const updated = await prisma.swap.update({ where: { id: swap.id }, data: { status: 'accepted' } })
return res.json(updated)
}

if (action === 'complete') {
// either party can mark complete; on completion transfer credits
if (swap.status !== 'accepted') return res.status(400).json({ error: 'must be accepted first' })
// debit sender credits, credit receiver
const sender = await prisma.user.findUnique({ where: { id: swap.senderId } })
if (sender.credits < swap.hours) return res.status(400).json({ error: 'not enough credits' })
await prisma.$transaction([
prisma.user.update({ where: { id: sender.id }, data: { credits: { decrement: swap.hours } } }),
prisma.user.update({ where: { id: swap.receiverId
