import { createClient } from "@/utils/supabase/server";

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return !!data;
}

export async function getAdminRole(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("Error getting admin role:", error);
    return null;
  }

  return data.role;
}

export async function addAdminUser(
  userId: string,
  role = "admin",
): Promise<boolean> {
  const supabase = await createClient();

  // Verificar si el usuario actual es super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const currentUserRole = await getAdminRole(user.id);

  if (currentUserRole !== "super_admin") {
    console.error("Only super_admin can add new admins");
    return false;
  }

  // Añadir el nuevo administrador
  const { error } = await supabase
    .from("admin_users")
    .insert({ user_id: userId, role });

  if (error) {
    console.error("Error adding admin user:", error);
    return false;
  }

  return true;
}

export async function removeAdminUser(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Verificar si el usuario actual es super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const currentUserRole = await getAdminRole(user.id);

  if (currentUserRole !== "super_admin") {
    console.error("Only super_admin can remove admins");
    return false;
  }

  // Eliminar el administrador
  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing admin user:", error);
    return false;
  }

  return true;
}
