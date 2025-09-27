import { db } from './_generated/server';

export default async function fetchOnlineUsers() {
  return await db.query('online_users').filter((q) => q.eq(q.field('online_flag'), 1)).collect();
}
