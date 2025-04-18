# 法人情報検索APIクライアント

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.3.3-blue)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/jest-%5E29.7.0-red)](https://jestjs.io/)
[![Axios](https://img.shields.io/badge/axios-%5E1.6.7-orange)](https://axios-http.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

国税庁の[法人番号システムWeb-API](https://www.houjin-bangou.nta.go.jp/webapi/index.html)検証のために作成したツールです。
法人番号システム Web-APIを利用して、コマンドラインから法人番号または法人名から法人情報を取得することができます。

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

- 法人番号による検索
- 法人名による検索
- 各種検索オプションのサポート
- XMLまたはCSV形式での結果取得

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

2. `.env`ファイルを編集し、以下の項目を設定します

```
# 国税庁Web-API アプリケーションID (必須)
APPLICATION_ID=your_application_id_here

# APIバージョン (1-4)
API_VERSION=4
```

### テスト用環境設定

開発やテスト環境では、`.env.local`ファイルを使用することができます。このファイルは`.gitignore`に含まれているため、アプリケーションIDなどの機密情報を誤ってGitリポジトリにコミットするリスクを避けることができます。

```bash
# テスト用のローカル環境変数ファイルをコピー
cp .env.example .env.local

# .env.localファイルを編集してテスト用の設定を行う
```

※ アプリケーションIDは国税庁への申請が必要です。詳細は[国税庁法人番号公表サイト](https://www.houjin-bangou.nta.go.jp/)を参照してください。

## 使用方法

### 基本的な使い方

```bash
# npmスクリプトを使用する場合
npm start -- [--format FORMAT] --type TYPE <検索キー> [--options OPTIONS]

# 直接実行する場合
node dist/index.js [--format FORMAT] --type TYPE <検索キー> [--options OPTIONS]

# ヘルプを表示
npm start -- --help
```

### パラメータ

- `[--format FORMAT]`: 出力形式を指定（省略可能、デフォルト: xml）
  - `csv-sjis`: CSV形式/Shift-JIS
  - `csv`: CSV形式/UTF-8
  - `xml`: XML形式/UTF-8
- `--type TYPE`: 検索タイプを指定（必須）
  - `number`: 法人番号検索
  - `name`: 法人名検索
- `<検索キー>`: 検索したい法人番号または法人名
- `[--options OPTIONS]`: オプション設定をJSON形式で指定（省略可能、デフォルト: {}）

### 例

#### 法人番号で検索

```bash
# 基本的な法人番号検索
npm start -- --type number 1234567890123

# 変更履歴を含めて検索
npm start -- --type number 1234567890123 --options '{"history":"1"}'

# CSV/UTF-8形式で出力
npm start -- --format csv --type number 1234567890123

# CSV/Shift-JIS形式で出力
npm start -- --format csv-sjis --type number 1234567890123
```

#### 法人名で検索

```bash
# 基本的な法人名検索
npm start -- --type name 国税商事

# オプション付きの法人名検索
npm start -- --type name 国税商事 --options '{"mode":"2","target":"1","change":"1"}'

# XML形式での指定（デフォルトと同じ）
npm start -- --format xml --type name 国税商事
```

### 検索オプション

#### 法人番号検索のオプション

- `history`: 変更履歴要否（`0`: 含めない、`1`: 含める）

#### 法人名検索のオプション

- `mode`: 検索方式（`1`: 前方一致検索、`2`: 部分一致検索）
- `target`: 検索対象（`1`: JIS第一・第二水準、`2`: JIS第一～第四水準、`3`: 英語表記）
- `address`: 所在地コード
- `kind`: 法人種別（`01`: 国の機関、`02`: 地方公共団体、`03`: 設立登記法人、`04`: 外国会社等・その他）
- `change`: 変更履歴（`0`: 含めない、`1`: 含める）
- `close`: 登記記録の閉鎖等（`0`: 含めない、`1`: 含める）
- `from`: 法人番号指定年月日開始日（YYYY-MM-DD形式）
- `to`: 法人番号指定年月日終了日（YYYY-MM-DD形式）
- `divide`: 分割番号

## ライセンス

MITライセンス
