#!/usr/bin/env node

import dotenv from "dotenv";
import { Command } from "commander";
import { CompanyInfoClient } from "./api-client";
import {
  ResponseType,
  NameSearchOptions,
  NumberSearchOptions,
  ApiType,
  MetiNumberSearchOptions,
} from "./types";

// 環境変数の読み込み
dotenv.config({ path: ".env.local" }); // まず.env.localを読み込む
dotenv.config(); // 次に.envを読み込む (上書きされない)

// APIに応じた環境変数の取得
const getApiCredentials = (
  apiType: ApiType,
): { applicationId: string; apiVersion: string } => {
  let applicationId: string | undefined;
  let apiVersion: string | undefined;

  if (apiType === ApiType.MOF) {
    applicationId = process.env.MOF_APPLICATION_ID;
    apiVersion = process.env.MOF_API_VERSION || "4";
  } else if (apiType === ApiType.METI) {
    applicationId = process.env.METI_API_TOKEN;
    apiVersion = process.env.METI_API_VERSION || "1";
  }

  return { applicationId: applicationId || "", apiVersion: apiVersion || "" };
};

// デフォルトは財務省API
let apiType: ApiType = ApiType.MOF;
// デフォルトのAPI設定
let { applicationId, apiVersion } = getApiCredentials(apiType);

// 初期起動時の環境変数チェック
if (!applicationId) {
  console.error("環境変数MOF_APPLICATION_IDが設定されていません。");
  console.error(
    ".env または .env.local ファイルを確認し、MOF_APPLICATION_IDを設定してください。",
  );
  process.exit(1);
}
// デフォルトはXML/Unicode
let responseType: ResponseType = ResponseType.XML_UNICODE;
// APIごとのベースURL
const API_BASE_URLS = {
  [ApiType.MOF]: "https://api.houjin-bangou.nta.go.jp",
  [ApiType.METI]: process.env.METI_API_URL || "https://info.gbiz.go.jp",
};
let baseUrl = API_BASE_URLS[apiType];

// プログラムの定義
const program = new Command();

program
  .name("company-info")
  .description("法人番号検索APIクライアント")
  .version("1.0.0");

program
  .option("--api <api>", "API種別 (mof: 財務省, meti: 経済産業省)", "mof")
  .option(
    "--format <format>",
    "出力フォーマット (財務省API: csv-sjis, csv, xml, 経済産業省API: json)",
    "xml",
  )
  .requiredOption("--type <type>", "検索タイプ (number または name)")
  .argument("<searchKey>", "検索キー（法人番号または法人名）")
  .option("--options <json>", "JSONフォーマットのオプション", "{}")
  .action(async (searchKey, options) => {
    try {
      const { api, format, type, options: jsonOptions } = options;

      // API種別オプションの処理
      if (api) {
        switch (api.toLowerCase()) {
          case "mof":
            apiType = ApiType.MOF;
            break;
          case "meti":
            apiType = ApiType.METI;
            break;
          default:
            console.error(`無効なAPI種別: ${api}`);
            console.error("有効なAPI種別: mof (財務省), meti (経済産業省)");
            process.exit(1);
        }
      }

      // APIに応じた認証情報とベースURLを更新
      const credentials = getApiCredentials(apiType);
      applicationId = credentials.applicationId;
      apiVersion = credentials.apiVersion;
      baseUrl = API_BASE_URLS[apiType];

      // APIキーの確認
      if (!applicationId) {
        if (apiType === ApiType.MOF) {
          console.error("環境変数MOF_APPLICATION_IDが設定されていません。");
          console.error(
            ".env または .env.local ファイルを確認し、MOF_APPLICATION_IDを設定してください。",
          );
        } else {
          console.error("環境変数METI_API_TOKENが設定されていません。");
          console.error(
            ".env または .env.local ファイルを確認し、METI_API_TOKENを設定してください。",
          );
        }
        process.exit(1);
      }

      // フォーマットオプションの処理
      if (format) {
        if (apiType === ApiType.MOF) {
          // 財務省APIのフォーマット
          switch (format.toLowerCase()) {
            case "csv-sjis":
              responseType = ResponseType.CSV_SHIFT_JIS; // 01: CSV形式/Shift-JIS
              break;
            case "csv":
              responseType = ResponseType.CSV_UNICODE; // 02: CSV形式/Unicode
              break;
            case "xml":
              responseType = ResponseType.XML_UNICODE; // 12: XML形式/Unicode
              break;
            case "json":
              console.error("財務省APIはJSON形式をサポートしていません。");
              console.error("有効なフォーマット: csv-sjis, csv, xml");
              process.exit(1);
              break;
            default:
              console.error(`財務省APIで無効なフォーマット: ${format}`);
              console.error("有効なフォーマット: csv-sjis, csv, xml");
              process.exit(1);
          }
        } else if (apiType === ApiType.METI) {
          // 経済産業省APIのフォーマット
          switch (format.toLowerCase()) {
            case "json":
              responseType = ResponseType.JSON;
              break;
            case "csv-sjis":
            case "csv":
            case "xml":
              console.error(
                "経済産業省APIは指定されたフォーマットをサポートしていません。",
              );
              console.error("有効なフォーマット: json");
              process.exit(1);
              break;
            default:
              console.error(`経済産業省APIで無効なフォーマット: ${format}`);
              console.error("有効なフォーマット: json");
              process.exit(1);
          }
        }
      } else {
        // デフォルトのレスポンスタイプをAPI種別に応じて設定
        responseType =
          apiType === ApiType.METI
            ? ResponseType.JSON
            : ResponseType.XML_UNICODE;
      }

      // APIクライアントの初期化（responseTypeが変更された場合のため）
      const client = new CompanyInfoClient({
        applicationId: applicationId as string,
        version: apiVersion,
        responseType,
        baseUrl,
        apiType,
      });

      let result: string;

      // オプションのパース
      const parsedOptions = JSON.parse(jsonOptions);

      // 検索タイプに応じた処理
      switch (type) {
        case "number":
          if (apiType === ApiType.METI) {
            // 経済産業省APIの場合
            result = await client.searchByNumber(
              searchKey,
              parsedOptions as MetiNumberSearchOptions,
            );
          } else {
            // 財務省APIの場合
            result = await client.searchByNumber(
              searchKey,
              parsedOptions as NumberSearchOptions,
            );
          }
          break;
        case "name":
          if (apiType === ApiType.METI) {
            console.error(
              "経済産業省APIでは法人名検索はサポートされていません。",
            );
            console.error("法人番号検索のみ利用可能です。");
            process.exit(1);
          }

          // 財務省APIの法人名検索の場合、バージョンは2以降である必要がある
          if (Number(apiVersion) < 2) {
            console.error("法人名検索はAPIバージョン2以降で利用可能です。");
            console.error(
              ".envファイルのAPI_VERSIONを2以上に設定してください。",
            );
            process.exit(1);
          }
          result = await client.searchByName(
            searchKey,
            parsedOptions as NameSearchOptions,
          );
          break;
        default:
          console.error(`無効な検索タイプ: ${type}`);
          console.error(
            "有効な検索タイプ: number (法人番号検索) または name (法人名検索)",
          );
          process.exit(1);
      }

      // 結果を標準出力に表示
      console.log(result);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`エラーが発生しました: ${error.message}`);
      } else {
        console.error("不明なエラーが発生しました");
      }
      process.exit(1);
    }
  });

// プログラムの実行
program.parse();
