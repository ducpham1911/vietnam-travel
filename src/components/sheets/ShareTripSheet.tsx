"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { generateInviteCode, useTripMembers } from "@/db/shared-hooks";

interface ShareTripSheetProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export function ShareTripSheet({ open, onClose, tripId }: ShareTripSheetProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const members = useTripMembers(tripId);

  useEffect(() => {
    if (open && !inviteCode) {
      setLoading(true);
      generateInviteCode(tripId).then((code) => {
        setInviteCode(code);
        setLoading(false);
      });
    }
  }, [open, tripId, inviteCode]);

  const inviteUrl = inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`
    : "";

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Trip">
      <div className="space-y-5">
        {/* Invite link */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-2 block">
            Invite Link
          </label>
          {loading ? (
            <div className="rounded-xl bg-surface-bg px-3 py-3 text-sm text-text-tertiary">
              Generating link...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-xl bg-surface-bg px-3 py-2.5 text-sm text-text-secondary truncate">
                {inviteUrl}
              </div>
              <button
                onClick={handleCopy}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-text-tertiary">
            Link expires in 7 days. Share it with friends to let them join.
          </p>
        </div>

        {/* Members list */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-text-secondary" />
            <span className="text-xs font-medium text-text-secondary">
              Members ({members.length})
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl bg-surface-bg px-3 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/20 text-xs font-bold text-brand-teal">
                  {(member.profile?.display_name ?? "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {member.profile?.display_name ?? member.user_id}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    @{member.profile?.username ?? "unknown"}
                  </p>
                </div>
                {member.role === "owner" && (
                  <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-medium text-brand-gold">
                    Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
