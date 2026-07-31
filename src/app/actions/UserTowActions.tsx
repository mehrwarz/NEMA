// components/UserRowActions.tsx
"use client";

import { useState } from "react";
import Button from "@/components/Button";

interface UserRowActionsProps {
  userId: number;
  initialIsLocked: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleLock: (id: number, status: boolean) => Promise<void> | void;
}

export function UserStatusBadge({ isLocked }: { isLocked: boolean }) {
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isLocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800" }`}>
      {isLocked ? "Locked" : "Active"}
    </span>
  );
}

export default function UserRowActions({
  userId,
  initialIsLocked,
  onEdit,
  onDelete,
  onToggleLock,
}: UserRowActionsProps) {
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLockToggle = async () => {
    try {
      setIsLoading(true);
      const nextState = !isLocked;
      await onToggleLock(userId, nextState);
      setIsLocked(nextState);
    } catch (error) {
      console.error("Failed to toggle lock status", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button variant="ghost" size="sm" onClick={() => onEdit(userId)}>
        Edit
      </Button>
      <Button
        variant="warning"
        size="sm"
        isLoadingState={isLoading}
        onClick={handleLockToggle}
      >
        {isLocked ? "Unlock" : "Lock"}
      </Button>
      <Button variant="danger" size="sm" onClick={() => onDelete(userId)}>
        Delete
      </Button>
    </div>
  );
}