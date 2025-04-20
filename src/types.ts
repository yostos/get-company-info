/**
 * 検索タイプの列挙型
 */
export enum SearchType {
  BY_NUMBER = "num",
  BY_NAME = "name",
}

/**
 * API種別の列挙型
 */
export enum ApiType {
  MOF = "mof",  // 財務省API
  METI = "meti" // 経済産業省API
}

/**
 * 応答形式の列挙型
 */
export enum ResponseType {
  CSV_SHIFT_JIS = "01",
  CSV_UNICODE = "02",
  XML_UNICODE = "12",
  JSON = "json"
}

/**
 * 法人種別の列挙型
 */
export enum CorporateKind {
  GOVERNMENT = "01",
  LOCAL_GOVERNMENT = "02",
  REGISTERED_CORPORATION = "03",
  FOREIGN_CORPORATION = "04",
}

/**
 * 検索方式の列挙型（法人名検索用）
 */
export enum SearchMode {
  PREFIX_MATCH = "1",
  PARTIAL_MATCH = "2",
}

/**
 * 検索対象の列挙型（法人名検索用）
 */
export enum SearchTarget {
  JIS_LEVEL_1_2 = "1",
  JIS_LEVEL_1_4 = "2",
  ENGLISH = "3",
}

/**
 * 検索オプションのインターフェース（法人番号検索用）
 */
export interface NumberSearchOptions {
  /**
   * 変更履歴を含めるかどうか
   * 0: 含めない (デフォルト)
   * 1: 含める
   */
  history?: "0" | "1";
}

/**
 * 検索オプションのインターフェース（法人名検索用）
 */
export interface NameSearchOptions {
  /**
   * 検索方式
   * 1: 前方一致検索 (デフォルト)
   * 2: 部分一致検索
   */
  mode?: SearchMode;

  /**
   * 検索対象
   * 1: JIS第一・第二水準（あいまい検索） (デフォルト)
   * 2: JIS第一～第四水準（完全一致検索）
   * 3: 英語表記（英語表記登録情報検索）
   */
  target?: SearchTarget;

  /**
   * 所在地（都道府県コードまたは都道府県コード+市区町村コード）
   */
  address?: string;

  /**
   * 法人種別（カンマ区切りで最大4種類まで指定可能）
   */
  kind?: string;

  /**
   * 変更履歴
   * 0: 含めない (デフォルト)
   * 1: 含める
   */
  change?: "0" | "1";

  /**
   * 登記記録の閉鎖等
   * 0: 含めない
   * 1: 含める (デフォルト)
   */
  close?: "0" | "1";

  /**
   * 法人番号指定年月日の開始日
   * YYYY-MM-DD形式
   */
  from?: string;

  /**
   * 法人番号指定年月日の終了日
   * YYYY-MM-DD形式
   */
  to?: string;

  /**
   * 分割番号
   * 1 (デフォルト) ～ 99999
   */
  divide?: string;
}

/**
 * 経済産業省APIオプションのインターフェース（法人番号検索用）
 */
export interface MetiNumberSearchOptions {
  /**
   * 詳細情報を含めるかどうか
   */
  detail?: boolean;
}

/**
 * APIリクエストのための設定インターフェース
 */
export interface ApiConfig {
  applicationId: string;
  version: string;
  responseType: ResponseType;
  baseUrl: string;
  apiType: ApiType;
}

