// app/users/page.tsx
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { ne } from "drizzle-orm"
import DataTable, { Column } from "@/components/DataTable";
import UserRowActions, { UserStatusBadge } from "@/app/actions/UserTowActions";

// Define the User type based on your schema inference
type User = typeof users.$inferSelect;

export default async function UserManagement() {
  const allUsers = await db.select().from(users).where(ne(users.role, "system_administrator"));

  // Server Actions
  async function handleEditUser(id: number) { 
    "use server";
    console.log(`Edit triggered for user ID: ${id}`);
  }

  async function handleDeleteUser(id: number) {
    "use server";
    console.log(`Delete triggered for user ID: ${id}`);
    // e.g., await db.delete(users).where(eq(users.id, id));
  }

  async function handleLockUser(id: number, status: boolean) {
    "use server";
    console.log(`User ${id} lock status changed to: ${status}`);
    // e.g., await db.update(users).set({ isLocked: status }).where(eq(users.id, id));
  }

  // Column definitions mapping directly to the data fields and custom cell renders
  const columns: Column<User>[] = [
    {
      header: "Name",
      accessor: "name",
      className: "text-left font-medium text-gray-900",
    },
    {
      header: "Email",
      accessor: "email",
      className: "text-left text-gray-500",
    },
    {
      header: "Role",
      accessor: (user) => <span className="capitalize">{user.role}</span>,
      className: "text-left text-gray-500",
    },
    {
      header: "Status",
      // Assuming a boolean field 'isLocked' exists on your user schema, or default to false
      accessor: (user) => <UserStatusBadge isLocked={(user as any).isLocked ?? false} />,
      className: "text-left",
    },
    {
      header: "Actions",
      accessor: (user) => (
        <UserRowActions
          userId={user.id}
          initialIsLocked={(user as any).isLocked ?? false}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleLock={handleLockUser}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <span className="text-sm text-gray-500">Total Users: {allUsers.length}</span>
      </div>

      <DataTable
        columns={columns}
        data={allUsers}
        keyExtractor={(user) => user.id}
        emptyMessage="No users found to list."
      />
    </div>
  );
}