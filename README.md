# 法人情報検索APIクライアント

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.3.3-blue)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/jest-%5E29.7.0-red)](https://jestjs.io/)
[![Axios](https://img.shields.io/badge/axios-%5E1.6.7-orange)](https://axios-http.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

このツールは法人情報を取得するための複数のAPIに対応したコマンドラインクライアントです：

1. **財務省（国税庁）API**：[法人番号システムWeb-API](https://www.houjin-bangou.nta.go.jp/webapi/index.html)で法人番号や法人名から基本情報を取得
2. **経済産業省API**：[gBizINFO API](https://info.gbiz.go.jp/)で法人番号から詳細な企業情報を取得

コマンドラインから簡単に法人情報を検索・取得することができます。

あくまで検証目的なのでエラー処理などは端折っています。

また、開発にはClaude Codeの支援を使っています。

## 主な依存関係

### 本番環境

- [Node.js](https://nodejs.org/) - JavaScriptランタイム
- [TypeScript](https://www.typescriptlang.org/) - 型付きJavaScript
- [Axios](https://axios-http.com/) - HTTPクライアント
- [dotenv](https://github.com/motdotla/dotenv) - 環境変数管理

### 開発環境

- [Jest](https://jestjs.io/) - テストフレームワーク
- [ts-jest](https://kulshekhar.github.io/ts-jest/) - JestでTypeScriptをサポート
- [ESLint](https://eslint.org/) - コード品質管理
- [ts-node](https://typestrong.org/ts-node/) - TypeScriptの実行環境

## 機能

### 財務省（国税庁）API
- 法人番号による検索
- 法人名による検索
- 各種検索オプションのサポート
- XMLまたはCSV形式での結果取得

### 経済産業省API（gBizINFO）
- 法人番号による企業情報検索
- 詳細情報の取得（認定・届出、表彰、財務、特許、調達、補助金、職場情報）
- JSON形式での結果取得

## インストール

```bash
# 依存パッケージのインストール
npm install

# TypeScriptのビルド
npm run build
```

## 環境設定

1. `.env.example`ファイルを`.env`にコピーし、必要な設定を行います。

```bash
cp .env.example .env
```

2. `.env`ファイルを編集し、使用するAPIに応じて以下の項目を設定します

```
# 財務省API設定
MOF_APPLICATION_ID=your_mof_application_id_here
MOF_API_VERSION=4

# 経済産業省API設定
METI_API_TOKEN=your_meti_api_token_here
METI_API_VERSION=1
METI_API_URL=https://info.gbiz.go.jp
```

### テスト用環境設定

開発やテスト環境では、`.env.local`ファイルを使用することができます。このファイルは`.gitignore`に含まれているため、APIトークンなどの機密情報を誤ってGitリポジトリにコミットするリスクを避けることができます。

```bash
# テスト用のローカル環境変数ファイルをコピー
cp .env.example .env.local

# .env.localファイルを編集してテスト用の設定を行う
```

※ 財務省APIのアプリケーションIDは国税庁への申請が必要です。詳細は[国税庁法人番号公表サイト](https://www.houjin-bangou.nta.go.jp/)を参照してください。
※ 経済産業省APIのアクセストークンはgBizINFOへの申請が必要です。詳細は[gBizINFO](https://info.gbiz.go.jp/)を参照してください。

## 使用方法

### 基本的な使い方

```bash
# npmスクリプトを使用する場合
npm start -- [--api API] [--format FORMAT] --type TYPE <検索キー> [--options OPTIONS]

# 直接実行する場合
node dist/index.js [--api API] [--format FORMAT] --type TYPE <検索キー> [--options OPTIONS]

# ヘルプを表示
npm start -- --help
```

### パラメータ

- `[--api API]`: 使用するAPIを指定（省略可能、デフォルト: mof）
  - `mof`: 財務省（国税庁）API
  - `meti`: 経済産業省API（gBizINFO）
- `[--format FORMAT]`: 出力形式を指定（省略可能）
  - 財務省API: （デフォルト: xml）
    - `csv-sjis`: CSV形式/Shift-JIS
    - `csv`: CSV形式/UTF-8
    - `xml`: XML形式/UTF-8
  - 経済産業省API:
    - `json`: JSON形式（唯一のサポート形式）
- `--type TYPE`: 検索タイプを指定（必須）
  - `number`: 法人番号検索
  - `name`: 法人名検索（財務省APIのみ対応）
- `<検索キー>`: 検索したい法人番号または法人名
- `[--options OPTIONS]`: オプション設定をJSON形式で指定（省略可能、デフォルト: {}）

### 例

#### 財務省API: 法人番号で検索

```bash
# 基本的な法人番号検索
npm start -- --api mof --type number 1234567890123

# 変更履歴を含めて検索
npm start -- --api mof --type number 1234567890123 --options '{"history":"1"}'

# CSV/UTF-8形式で出力
npm start -- --api mof --format csv --type number 1234567890123

# CSV/Shift-JIS形式で出力
npm start -- --api mof --format csv-sjis --type number 1234567890123
```

#### 財務省API: 法人名で検索

```bash
# 基本的な法人名検索
npm start -- --api mof --type name 国税商事

# オプション付きの法人名検索
npm start -- --api mof --type name 国税商事 --options '{"mode":"2","target":"1","change":"1"}'

# XML形式での指定（デフォルトと同じ）
npm start -- --api mof --format xml --type name 国税商事
```

#### 経済産業省API（gBizINFO): 法人番号で検索

```bash
# 基本的な法人番号検索
npm start -- --api meti --format json --type number 1234567890123

# 詳細情報を含めて検索
npm start -- --api meti --format json --type number 1234567890123 --options '{"detail":true}'
```

### 検索オプション

#### 財務省API: 法人番号検索のオプション

- `history`: 変更履歴要否（`0`: 含めない、`1`: 含める）

#### 財務省API: 法人名検索のオプション

- `mode`: 検索方式（`1`: 前方一致検索、`2`: 部分一致検索）
- `target`: 検索対象（`1`: JIS第一・第二水準、`2`: JIS第一～第四水準、`3`: 英語表記）
- `address`: 所在地コード
- `kind`: 法人種別（`01`: 国の機関、`02`: 地方公共団体、`03`: 設立登記法人、`04`: 外国会社等・その他）
- `change`: 変更履歴（`0`: 含めない、`1`: 含める）
- `close`: 登記記録の閉鎖等（`0`: 含めない、`1`: 含める）
- `from`: 法人番号指定年月日開始日（YYYY-MM-DD形式）
- `to`: 法人番号指定年月日終了日（YYYY-MM-DD形式）
- `divide`: 分割番号

#### 経済産業省API（gBizINFO）: 法人番号検索のオプション

- `detail`: 詳細情報取得（`true`: 詳細情報を含める、`false`: 基本情報のみ）
  - 詳細情報には以下が含まれます：
    - 届出・認定情報
    - 表彰情報
    - 財務情報
    - 特許情報
    - 調達情報
    - 補助金情報
    - 職場情報

## ライセンス

MITライセンス
