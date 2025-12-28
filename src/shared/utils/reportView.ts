// front/src/pages/shared/utils/reportView.ts

import type React from "react";

export function getStatusMeta(status?: string | null) {
  if (status === "reviewed") {
    return {
      text: "対応済み",
      style: {
        background: "#E6FFFA",
        borderColor: "#99F6E4",
        color: "#0F766E",
      } as React.CSSProperties,
    };
  }
  if (status === "dismissed") {
    return {
      text: "却下",
      style: {
        background: "#F3F4F6",
        borderColor: "#E5E7EB",
        color: "#374151",
      } as React.CSSProperties,
    };
  }
  return {
    text: "未対応",
    style: {
      background: "#FFF7ED",
      borderColor: "#FED7AA",
      color: "#9A3412",
    } as React.CSSProperties,
  };
}

export function isDone(status?: string | null) {
  return status === "reviewed" || status === "dismissed";
}
