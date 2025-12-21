// front/src/pages/posts/PostEditModal/usePostEditForm.ts
import { useEffect, useMemo, useState } from "react";
import type { PublishedStatus, Visibility } from "../../../shared/prisma-enums";

export function unwrapPost(post: any) {
  return post?.data ?? post?.post ?? post;
}

export function usePostEditForm(params: {
  post: any;
  isAdminAccount: boolean;
}) {
  const { post, isAdminAccount } = params;

  const rawPost = useMemo(() => unwrapPost(post), [post]);
  const isPublished = rawPost?.publishedStatus === "published";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("free");
  const [priceJpy, setPriceJpy] = useState<number | null>(null);
  const [status, setStatus] = useState<PublishedStatus>("draft");
  const [genreId, setGenreId] = useState<string | null>(
    rawPost?.genreId ?? null
  );  

  useEffect(() => {
    if (!rawPost) return;

    setTitle(rawPost.title ?? "");
    setBody(rawPost.body ?? "");

    let v = (rawPost.visibility as Visibility) ?? "free";
    if (isAdminAccount && v === "paid_single") v = "plan";
    setVisibility(v);

    setPriceJpy(rawPost.priceJpy ?? null);

    const ps = String(rawPost.publishedStatus ?? "draft") as PublishedStatus;
    setStatus(ps === "published" ? "published" : ps === "private" ? "private" : "draft");
    setGenreId(rawPost.genreId ?? null);
  }, [rawPost, isAdminAccount]);

  const buildPayload = () => {
    const payload: any = { 
      title, 
      body, 
      publishedStatus: status,
      genreId,
    };

    // 公開前だけ販売条件を送る（あなたの現仕様）
    if (!isPublished) {
      payload.visibility = visibility;
      payload.priceJpy = visibility === "paid_single" ? (priceJpy ?? 0) : null;
    }
    return payload;
  };

  return {
    rawPost,
    isPublished,

    title, setTitle,
    body, setBody,

    visibility, setVisibility,
    priceJpy, setPriceJpy,

    status, setStatus,
    genreId, setGenreId,

    buildPayload,
  };
}
