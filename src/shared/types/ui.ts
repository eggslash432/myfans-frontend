// front/src/shared/types/ui.ts

import type { ReactNode } from "react";
import type { PostEditValues } from "./posts";

export type PostProps = {
  post: any | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: PostEditValues) => void;
  onAddMedia: (files: FileList) => void;
  onRemoveMedia: (mediaId: string) => void;
};

export type Props = { 
  children: ReactNode 
};

export type SubTitleRule = {
  match: (path: string) => boolean;
  label: string;
};


