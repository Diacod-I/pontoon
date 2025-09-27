import { db } from './_generated/server';

export default async function updateOnlineStatus(userId: string) {
  const user = await db.query('online_users').filter((q) => q.eq(q.field('user_id'), userId)).first();
  if (!user) throw new Error('User not found');
  const newFlag = user.online_flag === 1 ? 0 : 1;
  await db.patch(user._id, { online_flag: newFlag });
  return newFlag;
}
