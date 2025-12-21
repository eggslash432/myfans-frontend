フロントエンド：

ディレクトリ移動
cd front

１：フロントをビルドする

# 初回 or 依存更新時
npm install

# 本番ビルド
npm run build:prod
（viteは優先して.env.localを読んでしまうっぽいのでこのコマンドでやる）
# → himefan/front/dist/ 配下に静的ファイルができるはず

２：一度だけやるセットアップ（S3バケット作成）
aws s3api create-bucket \
  --bucket himefan-frontend-prod \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

３：ビルド成果物を S3 にアップロード
aws s3 sync dist/ s3://himefan-frontend-prod --delete

4：CloudFront 側のキャッシュ更新（invalidate）
aws cloudfront create-invalidation \
  --distribution-id E5YXR9HFNLKJ0 \
  --paths "/*"

⚪︎まとめた処理
cd front
npm run build:prod
aws s3 sync dist/ s3://himefan-frontend-prod --delete
aws cloudfront create-invalidation \
  --distribution-id E5YXR9HFNLKJ0 \
  --paths "/*"