import { supabase } from './supabaseClient';
import { toast } from 'sonner';

/**
 * Creates a new battle between the current user and a friend
 * Battle name is auto-generated as "username1 vs username2"
 * Start date is automatically set to today
 * @param userId - Current user's ID
 * @param friendId - Friend's ID to battle against
 * @returns Battle ID if successful, null otherwise
 */
export async function createBattle(
  userId: string,
  friendId: string
): Promise<string | null> {
  // Validate inputs
  if (!userId || !friendId) {
    toast.error("Please select a friend to battle");
    return null;
  }

  // Get usernames for battle name
  const [userUsernameData, friendUsernameData] = await Promise.all([
    supabase.rpc("get_username_by_id", { user_id: userId }),
    supabase.rpc("get_username_by_id", { user_id: friendId }),
  ]);

  const userUsername =
    userUsernameData.data && Array.isArray(userUsernameData.data) && userUsernameData.data.length > 0
      ? userUsernameData.data[0]?.username || "You"
      : "You";
  const friendUsername =
    friendUsernameData.data && Array.isArray(friendUsernameData.data) && friendUsernameData.data.length > 0
      ? friendUsernameData.data[0]?.username || "Friend"
      : "Friend";

  // Auto-generate battle name
  const battleName = `${userUsername} vs ${friendUsername}`;

  // Use today as start date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = today.toISOString().split("T")[0];

  // Check for existing active battle with this friend using database function (bypasses RLS)
  const { data: hasExistingBattle, error: checkError } = await supabase.rpc("check_existing_active_battle", {
    p_user_id: userId,
    p_friend_id: friendId,
  });

  if (checkError) {
    console.error("Error checking for existing battle:", checkError);
    // Continue anyway - the database constraint will prevent duplicates
  }

  if (hasExistingBattle) {
    toast.error("You already have an active battle with this friend");
    return null;
  }

  // Calculate end date (7 days from start)
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 6); // 7 days total (including start day)

  try {
    // Create battle using database function to avoid RLS recursion
    const { data: battleId, error: battleError } = await supabase.rpc("create_battle", {
      p_name: battleName.trim(),
      p_owner_id: userId,
      p_start_date: startDate,
      p_end_date: endDate.toISOString().split("T")[0],
    });

    if (battleError) {
      // If function doesn't exist, provide helpful error message
      if (battleError.code === 'PGRST202') {
        throw new Error("Database function not found. Please run the migration: create-battle-function.sql");
      }
      
      throw battleError;
    }

    if (!battleId) {
      throw new Error("Battle was created but no ID returned");
    }

    // Add current user as member using database function (bypasses RLS)
    // This avoids RLS recursion that happens with direct inserts
    const { error: userMemberError } = await supabase.rpc("add_battle_member", {
      p_battle_id: battleId,
      p_user_id: userId,
    });

    if (userMemberError) {
      throw userMemberError;
    }

    // Add friend as member using database function (bypasses RLS)
    const { error: friendMemberError } = await supabase.rpc("add_battle_member", {
      p_battle_id: battleId,
      p_user_id: friendId,
    });

    if (friendMemberError) {
      // If adding friend fails, still keep the battle but show a warning
      console.error("Error adding friend to battle:", friendMemberError);
      toast.warning("Battle created, but failed to add friend. They may need to join manually.");
    }

    toast.success("Battle created!");
    return battleId;
  } catch (error: any) {
    console.error("Error creating battle:", error);
    toast.error(error.message || "Failed to create battle");
    return null;
  }
}
