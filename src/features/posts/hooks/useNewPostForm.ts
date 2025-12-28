// front/src/pages/posts/newPost/useNewPostForm.ts

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createPostSmart,
  getCreatorMe,
  getMyPlans,
  createPlan as createPlanApi,
  uploadPostMedia,
} from '@/lib/api';
import type { 
  AgeRating, 
  Visibility, 
  Plan,
  MediaPreview, 
} from '@/shared';
import { 
  prune, 
  recalcIsSample,  
} from '@/shared';

async function fetchMyPlans(): Promise<Plan[]> {
  try {
    const res = await getMyPlans();
    return res?.plans ?? [];
  } catch {
    return [];
  }
}

function extractErrorMessage(e: any, fallback: string) {
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export function useNewPostForm(isAdmin: boolean) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [visibility, setVisibility] = useState<Visibility>('free');
  const [ageRating, setAgeRating] = useState<AgeRating>('all');
  const [isDraft, setIsDraft] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const [ppvPrice, setPpvPrice] = useState<string>('500');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [creator, setCreator] = useState<any | null>(null);
  const [creatorErr, setCreatorErr] = useState('');

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [sampleMediaIndex, setSampleMediaIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // admin の場合は常に free
  useEffect(() => {
    if (isAdmin) setVisibility('free');
  }, [isAdmin]);

  // 初回プラン取得
  useEffect(() => {
    if (isAdmin) {
      setPlans([]);
      return;
    }
    (async () => {
      const ps = await fetchMyPlans();
      setPlans(ps ?? []);
    })();
  }, [isAdmin]);

  // クリエイター情報
  useEffect(() => {
    if (isAdmin) {
      setCreator(null);
      setCreatorErr('');
      return;
    }

    (async () => {
      try {
        const res = await getCreatorMe();
        setCreator(res);
        setCreatorErr('');
      } catch (e: any) {
        const status = e?.response?.status;

        // ✅ 404 は「未登録/未承認」など “想定内” として扱う
        if (status === 404) {
          setCreator(null);
          setCreatorErr(
            'クリエイター登録（または承認）が未完了です。管理画面で承認後に再度お試しください。'
          );
          return;
        }

        const msg = extractErrorMessage(e, 'クリエイター情報の取得に失敗しました');
        console.error('getCreatorMe failed:', e);
        setCreator(null);
        setCreatorErr(msg);
      }
    })();
  }, [isAdmin]);

  // visibility 変更でクリア
  useEffect(() => {
    if (visibility !== 'plan') setSelectedPlanId('');
    if (visibility !== 'paid_single') setPpvPrice('500');
  }, [visibility]);

  // KYC判定（creator が取れない場合は pending 扱い）
  const kyc = creator?.kyc ?? {};
  const kycStatus = kyc.status ?? creator?.stripeKycStatus ?? 'pending';
  const isKycOk = isAdmin ? true : kycStatus === 'approved';

  const hasVideo = useMemo(
    () => mediaPreviews.some((p) => p.kind === 'video'),
    [mediaPreviews]
  );

  const sampleSelected = useMemo(() => {
    const idx = sampleMediaIndex;
    if (idx === null) return false;
    if (idx < 0 || idx >= mediaPreviews.length) return false;
    return mediaPreviews[idx]?.kind === 'video';
  }, [sampleMediaIndex, mediaPreviews]);

  const clearMedia = () => {
    mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setMediaFiles([]);
    setMediaPreviews([]);
    setSampleMediaIndex(null);
  };

  const clearSample = () => {
    setSampleMediaIndex(null);
    setMediaPreviews((prev) => recalcIsSample(prev, null));
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const arr = Array.from(files);
    setMediaFiles((prev) => [...prev, ...arr]);

    const newPreviews: MediaPreview[] = arr.map((f) => {
      const url = URL.createObjectURL(f);
      const mime = f.type || '';
      let kind: MediaPreview['kind'] = 'image';
      if (mime.startsWith('video/')) kind = 'video';
      else if (mime.startsWith('audio/')) kind = 'audio';
      return { url, kind };
    });

    setMediaPreviews((prev) => {
      const merged = [...prev, ...newPreviews];
      return recalcIsSample(merged, sampleMediaIndex);
    });

    e.target.value = '';
  };

  const selectSample = (i: number) => {
    setSampleMediaIndex(i);
    setMediaPreviews((prev) => recalcIsSample(prev, i));
  };

  const buildPayload = () => {
    const base: any = {
      title: title.trim(),
      body,
      visibility,
      ageRating,
      publishedStatus: isDraft ? 'draft' : 'published',
      accessRules: {
        allowByPlanIds: [],
        allowByPpv: false,
      },
    };

    if (visibility === 'plan') {
      if (!selectedPlanId) throw new Error('プランを選択してください');
      base.planId = selectedPlanId;
      base.accessRules.allowByPlanIds = [selectedPlanId];
    }

    if (visibility === 'paid_single') {
      const price = Number(ppvPrice);
      if (!Number.isFinite(price) || price < 100) {
        throw new Error('PPV価格は100円以上の整数を入力してください');
      }
      base.priceJpy = price;
      base.accessRules.allowByPpv = true;
      base.accessRules.ppvPriceJpy = price;
    }

    return prune(base);
  };

  const loadPlans = async () => {
    if (isAdmin) return;
    const res = await getMyPlans();
    setPlans(res?.plans ?? []);
  };

  const createPlan = async () => {
    if (isAdmin) return;
    if (!newPlanName || !newPlanPrice) return;

    await createPlanApi({
      name: newPlanName,
      priceJpy: parseInt(newPlanPrice, 10),
    });

    setShowPlanModal(false);
    await loadPlans();
  };

  const submit = async () => {
    setError(null);
    setOkMsg(null);

    if (!title.trim()) throw new Error('タイトルを入力してください');
    if (!body) throw new Error('本文を入力してください');

    // ✅ KYC未完了でも draft はOK（UI側でも制御してるが念のため二重防御）
    if (!isAdmin && !isKycOk && !isDraft) {
      throw new Error('本人確認（KYC）が未完了のため、公開投稿はできません。下書きで保存してください。');
    }

    const payload = buildPayload();

    setSubmitting(true);
    try {
      const res: any = await createPostSmart(payload);

      const postId =
        res?.postId ??
        res?.post?.id ??
        res?.id ??
        res?.data?.postId ??
        res?.data?.post?.id ??
        res?.data?.id;

      if (postId && mediaFiles.length > 0) {
        const idx = sampleMediaIndex;
        const isVideoSample =
          typeof idx === 'number' &&
          idx >= 0 &&
          idx < mediaFiles.length &&
          (mediaFiles[idx]?.type ?? '').startsWith('video/');

        await uploadPostMedia(postId, mediaFiles, isVideoSample ? idx : undefined);
      }

      setOkMsg(isDraft ? '下書きを保存しました。' : '投稿が完了しました。');

      // reset
      setTitle('');
      setBody('');
      setMediaFiles([]);
      mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
      setMediaPreviews([]);
      setSampleMediaIndex(null);
    } catch (e: any) {
      const msg = extractErrorMessage(e, '投稿に失敗しました');
      setError(`投稿失敗: ${msg}`);
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // state
    title,
    setTitle,
    body,
    setBody,
    visibility,
    setVisibility,
    ageRating,
    setAgeRating,
    isDraft,
    setIsDraft,

    plans,
    selectedPlanId,
    setSelectedPlanId,

    ppvPrice,
    setPpvPrice,

    submitting,
    error,
    okMsg,

    creator,
    creatorErr,
    isKycOk,

    // modal
    showPlanModal,
    setShowPlanModal,
    newPlanName,
    setNewPlanName,
    newPlanPrice,
    setNewPlanPrice,
    createPlan,

    // media
    mediaFiles,
    mediaPreviews,
    sampleMediaIndex,
    fileInputRef,
    hasVideo,
    sampleSelected,
    handleMediaChange,
    clearMedia,
    clearSample,
    selectSample,

    // actions
    submit,
  };
}
