// front/src/pages/admin/components/AdminNotificationsComposer.tsx
import { useState } from "react";
import type { NotificationType } from "@/shared/prisma-enums";
import { adminSendNotification } from "@/lib/api";

export function AdminNotificationsComposer(props: { onSent?: () => void }) {
  const { onSent } = props;

  const [sendUserId, setSendUserId] = useState("");
  const [sendType, setSendType] = useState<NotificationType>("SYSTEM");
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const send = async () => {
    try {
      setSendMsg("");
      setSending(true);

      const uid = sendUserId.trim();
      if (!uid) return setSendMsg("userId を入力してください。");
      if (!sendTitle.trim()) return setSendMsg("title を入力してください。");
      if (!sendBody.trim()) return setSendMsg("body を入力してください。");

      await adminSendNotification({
        userId: uid,
        type: sendType,
        title: sendTitle.trim(),
        body: sendBody.trim(),
      });

      setSendMsg("送信しました。");
      setSendTitle("");
      setSendBody("");
      onSent?.();
    } catch (e: any) {
      console.error(e);
      setSendMsg(
        e?.message?.includes("HTTP")
          ? `送信に失敗しました（${e.message}）。API未実装なら次で作ろう`
          : "送信に失敗しました。"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 12, display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 800 }}>手動通知（管理者送信）</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label>
          宛先 userId:
          <input
            value={sendUserId}
            onChange={(e) => setSendUserId(e.target.value)}
            placeholder="必須"
            style={{ marginLeft: 6, width: 340 }}
          />
        </label>

        <label>
          type:
          <select
            value={sendType}
            onChange={(e) => setSendType(e.target.value as any)}
            style={{ marginLeft: 6 }}
          >
            <option value="SYSTEM">SYSTEM</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="KYC">KYC</option>
            <option value="REPORT">REPORT</option>
            <option value="POST">POST</option>
            <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
          </select>
        </label>
      </div>

      <label>
        title:
        <input
          value={sendTitle}
          onChange={(e) => setSendTitle(e.target.value)}
          placeholder="必須"
          style={{ marginLeft: 6, width: "min(900px, 100%)" }}
        />
      </label>

      <label>
        body:
        <textarea
          value={sendBody}
          onChange={(e) => setSendBody(e.target.value)}
          placeholder="必須"
          rows={4}
          style={{ marginLeft: 6, width: "min(900px, 100%)" }}
        />
      </label>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => void send()} disabled={sending}>
          送信
        </button>
        {sendMsg && <div style={{ fontSize: 12, opacity: 0.85 }}>{sendMsg}</div>}
      </div>
    </div>
  );
}
