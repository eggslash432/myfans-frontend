// front/src/shared/types/domain/creators/profile.ts
export type UpdateCreatorProfileInput = {
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
};

export type UploadCreatorAvatarResponse = { url: string };
