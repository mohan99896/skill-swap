import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
const user = await getUserFromRequest(req)
if (!user) return res.status(401).json({ error: 'Not authenticated' })
// hide password
const { password, ...safe } = user
res.json(safe)
}
