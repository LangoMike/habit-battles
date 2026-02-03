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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:46',message:'Checking for existing active battle',data:{userId,friendId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const { data: hasExistingBattle, error: checkError } = await supabase.rpc("check_existing_active_battle", {
    p_user_id: userId,
    p_friend_id: friendId,
  });

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:52',message:'Existing battle check result',data:{hasExistingBattle, checkError: checkError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:77',message:'Starting battle creation',data:{userId,friendId,battleName,startDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Create battle using database function to avoid RLS recursion
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:77',message:'Creating battle via RPC function',data:{battleName, owner_id: userId, start_date: startDate, end_date: endDate.toISOString().split("T")[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const { data: battleId, error: battleError } = await supabase.rpc("create_battle", {
      p_name: battleName.trim(),
      p_owner_id: userId,
      p_start_date: startDate,
      p_end_date: endDate.toISOString().split("T")[0],
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:92',message:'Battle created result',data:{battleError: battleError?.message, battleId, errorCode: battleError?.code, errorDetails: battleError?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    if (battleError) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:95',message:'Battle creation failed, throwing error',data:{battleError: JSON.stringify(battleError), errorCode: battleError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      // If function doesn't exist, provide helpful error message
      if (battleError.code === 'PGRST202') {
        throw new Error("Database function not found. Please run the migration: create-battle-function.sql");
      }
      
      throw battleError;
    }

    if (!battleId) {
      throw new Error("Battle was created but no ID returned");
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:95',message:'Before adding current user as member via RPC',data:{battleId, userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Add current user as member using database function (bypasses RLS)
    // This avoids RLS recursion that happens with direct inserts
    const { error: userMemberError } = await supabase.rpc("add_battle_member", {
      p_battle_id: battleId,
      p_user_id: userId,
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:102',message:'After adding current user as member via RPC',data:{userMemberError: userMemberError?.message, code: userMemberError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (userMemberError) {
      throw userMemberError;
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:105',message:'Before calling add_battle_member RPC for friend',data:{battleId, friendId},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Add friend as member using database function (bypasses RLS)
    const { error: friendMemberError } = await supabase.rpc("add_battle_member", {
      p_battle_id: battleId,
      p_user_id: friendId,
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f64abb07-8416-4727-ab82-dcb87e10ce71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'battleUtils.ts:112',message:'After calling add_battle_member RPC',data:{friendMemberError: friendMemberError?.message, code: friendMemberError?.code, details: friendMemberError?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

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
