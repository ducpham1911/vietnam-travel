"use client";

import { Drawer } from "vaul";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] rounded-t-2xl bg-card-bg outline-none">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-elevated-bg" />
          <Drawer.Title className="px-4 pt-3 pb-2 text-lg font-bold">{title}</Drawer.Title>
          <div className="overflow-y-auto px-4 pb-8 max-h-[calc(90dvh-80px)]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
