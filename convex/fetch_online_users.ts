import { query } from "./_generated/server";
import { DatabaseReader } from "./_generated/server";

/**
 * Convex query to retrieve all online users from the "online_users" table where online_flag = 1.
 */
export default query(async ({ db }: { db: DatabaseReader }) => {
    // Fetch documents from the "online_users" table where online_flag is 1
    const onlineUsers = await db.query("online_users")
        .filter(q => q.eq(q.field("online_flag"), 1))
        .collect();
    return onlineUsers;
});