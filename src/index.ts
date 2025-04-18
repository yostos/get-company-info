#!/usr/bin/env node

import dotenv from 'dotenv';
import { CompanyInfoClient } from './api-client';
import { SearchType, ResponseType, NameSearchOptions, NumberSearchOptions } from './types';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' }); // まず.env.localを読み込む
dotenv.config(); // 次に.envを読み込む (上書きされない)

// 必須環境変数のチェック
const applicationId = process.env.APPLICATION_ID;
if (!applicationId) {
  console.error('環境変数APPLICATION_IDが設定されていません。');
  console.error('.env または .env.local ファイルを確認し、アプリケーションIDを設定してください。');
  process.exit(1);
}

// APIクライアントの設定
const apiVersion = process.env.API_VERSION || '4';
// デフォルトはXML/Unicode
let responseType: ResponseType = ResponseType.XML_UNICODE;
const baseUrl = 'https://api.houjin-bangou.nta.go.jp';

// APIクライアントの初期化
const client = new CompanyInfoClient({
  applicationId: applicationId as string, // 型アサーションで string 型であることを明示
  version: apiVersion,
  responseType,
  baseUrl
});

/**
 * コマンドライン引数のパース
 */
function parseCommandLineArgs(): { searchType: string; searchKey: string; options: string; format?: string } {
  const args = process.argv.slice(2);
  const result: { searchType: string; searchKey: string; options: string; format?: string } = {
    searchType: '',
    searchKey: '',
    options: '{}'
  };
  
  // フォーマットオプションの検索と削除
  const formatIndex = args.indexOf('--format');
  if (formatIndex !== -1 && formatIndex + 1 < args.length) {
    result.format = args[formatIndex + 1];
    // フォーマットオプションとその値を引数リストから削除
    args.splice(formatIndex, 2);
  }
  
  if (args.length < 2) {
    console.error('引数が不足しています。使用方法: npm start -- [--format FORMAT] <検索タイプ> <検索キー> [オプション]');
    console.error('検索タイプ: number (法人番号検索) または name (法人名検索)');
    console.error('検索キー: 法人番号または法人名');
    console.error('フォーマット: csv-sjis (CSV/Shift-JIS), csv (CSV/UTF-8), xml (XML/UTF-8、デフォルト)');
    console.error('オプション: JSON形式のオプション文字列（例: {"history":"1"}）');
    process.exit(1);
  }
  
  result.searchType = args[0];
  result.searchKey = args[1];
  if (args.length > 2) {
    result.options = args[2];
  }
  
  return result;
}

/**
 * メイン処理の実行
 */
async function main() {
  try {
    const { searchType, searchKey, options, format } = parseCommandLineArgs();
    
    // フォーマットオプションの処理
    if (format) {
      switch (format.toLowerCase()) {
        case 'csv-sjis':
          responseType = ResponseType.CSV_SHIFT_JIS; // 01: CSV形式/Shift-JIS
          break;
        case 'csv':
          responseType = ResponseType.CSV_UNICODE; // 02: CSV形式/Unicode
          break;
        case 'xml':
          responseType = ResponseType.XML_UNICODE; // 12: XML形式/Unicode
          break;
        default:
          console.error(`無効なフォーマット: ${format}`);
          console.error('有効なフォーマット: csv-sjis, csv, xml');
          process.exit(1);
      }
    }
    
    // APIクライアントの更新（responseTypeが変更された場合のため）
    // applicationIdが確実に存在することを保証（前の条件チェックで存在しない場合はprocess.exitしているため）
    const client = new CompanyInfoClient({
      applicationId: applicationId as string, // 型アサーションで string 型であることを明示
      version: apiVersion,
      responseType,
      baseUrl
    });
    
    let result: string;
    
    // オプションのパース
    const parsedOptions = JSON.parse(options);
    
    // 検索タイプに応じた処理
    switch (searchType) {
      case "number":
        result = await client.searchByNumber(searchKey, parsedOptions as NumberSearchOptions);
        break;
      case "name":
        // 法人名検索の場合、バージョンは2以降である必要がある
        if (Number(apiVersion) < 2) {
          console.error('法人名検索はAPIバージョン2以降で利用可能です。');
          console.error('.envファイルのAPI_VERSIONを2以上に設定してください。');
          process.exit(1);
        }
        result = await client.searchByName(searchKey, parsedOptions as NameSearchOptions);
        break;
      default:
        console.error(`無効な検索タイプ: ${searchType}`);
        console.error('有効な検索タイプ: number (法人番号検索) または name (法人名検索)');
        process.exit(1);
    }
    
    // 結果を標準出力に表示
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`エラーが発生しました: ${error.message}`);
    } else {
      console.error('不明なエラーが発生しました');
    }
    process.exit(1);
  }
}

// メイン処理の実行
main();