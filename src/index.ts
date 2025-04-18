#!/usr/bin/env node

import dotenv from 'dotenv';
import { Command } from 'commander';
import { CompanyInfoClient } from './api-client';
import { ResponseType, NameSearchOptions, NumberSearchOptions } from './types';

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

// プログラムの定義
const program = new Command();

program
  .name('company-info')
  .description('法人番号検索APIクライアント')
  .version('1.0.0');

program
  .option('--format <format>', '出力フォーマット (csv-sjis, csv, xml)', 'xml')
  .requiredOption('--type <type>', '検索タイプ (number または name)')
  .argument('<searchKey>', '検索キー（法人番号または法人名）')
  .option('--options <json>', 'JSONフォーマットのオプション', '{}')
  .action(async (searchKey, options) => {
    try {
      const { format, type, options: jsonOptions } = options;
      
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
      
      // APIクライアントの初期化（responseTypeが変更された場合のため）
      const client = new CompanyInfoClient({
        applicationId: applicationId as string,
        version: apiVersion,
        responseType,
        baseUrl
      });
      
      let result: string;
      
      // オプションのパース
      const parsedOptions = JSON.parse(jsonOptions);
      
      // 検索タイプに応じた処理
      switch (type) {
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
          console.error(`無効な検索タイプ: ${type}`);
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
  });

// プログラムの実行
program.parse();