import axios from "axios";
import {
  ApiConfig,
  SearchType,
  NumberSearchOptions,
  NameSearchOptions,
  ResponseType,
  SearchTarget,
  ApiType,
  MetiNumberSearchOptions,
} from "./types";

/**
 * 法人情報APIクライアントクラス
 */
export class CompanyInfoClient {
  private config: ApiConfig;

  /**
   * コンストラクタ
   * @param config APIクライアント設定
   */
  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * 法人番号を指定して情報を取得
   * @param corporateNumber 法人番号（カンマ区切りで最大10件まで指定可能）
   * @param options 検索オプション
   * @returns APIレスポンス
   */
  async searchByNumber(
    corporateNumber: string,
    options: NumberSearchOptions | MetiNumberSearchOptions = {},
  ): Promise<string> {
    // 経済産業省APIの場合
    if (this.config.apiType === ApiType.METI) {
      return this.searchByNumberMeti(
        corporateNumber,
        options as MetiNumberSearchOptions,
      );
    }

    // 財務省APIの場合（デフォルト）
    const params = new URLSearchParams();
    params.append("id", this.config.applicationId);
    params.append("number", corporateNumber);
    params.append("type", this.config.responseType);

    // オプションパラメータの設定
    if ("history" in options && options.history) {
      params.append("history", options.history);
    }

    const url = `${this.config.baseUrl}/${this.config.version}/${SearchType.BY_NUMBER}`;
    const queryString = params.toString();
    const fullUrl = `${url}?${queryString}`;

    try {
      const response = await axios.get(fullUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `API Error: Status ${error.response.status}, ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 経済産業省APIを使用して法人番号から情報を取得
   * @param corporateNumber 法人番号
   * @param options 検索オプション
   * @returns APIレスポンス（JSON形式）
   */
  private async searchByNumberMeti(
    corporateNumber: string,
    options: MetiNumberSearchOptions = {},
  ): Promise<string> {
    // applicationIdをAPIキーとして使用
    const apiKey = this.config.applicationId;

    // gBizINFO APIのエンドポイント
    const endpoint = `/hojin/v1/hojin/${corporateNumber}`;

    const headers = {
      "X-hojinInfo-api-token": apiKey,
      "Content-Type": "application/json",
    };

    try {
      // デバッグ用：リクエストURL表示
      console.error(`リクエストURL: ${this.config.baseUrl}${endpoint}`);
      console.error(
        `認証ヘッダー: X-hojinInfo-api-token ${apiKey.substring(0, 5)}...`,
      );

      // 基本企業情報の取得
      const response = await axios.get(`${this.config.baseUrl}${endpoint}`, {
        headers,
        validateStatus: function (status) {
          return status < 500; // 500未満のステータスコードは成功とみなす（エラーレスポンスも解析するため）
        },
      });

      let result = response.data;

      // 詳細情報が要求された場合、他のエンドポイントも呼び出す
      if (options.detail) {
        const endpoints = [
          `/hojin/v1/hojin/${corporateNumber}/certification`,
          `/hojin/v1/hojin/${corporateNumber}/commendation`,
          `/hojin/v1/hojin/${corporateNumber}/finance`,
          `/hojin/v1/hojin/${corporateNumber}/patent`,
          `/hojin/v1/hojin/${corporateNumber}/procurement`,
          `/hojin/v1/hojin/${corporateNumber}/subsidy`,
          `/hojin/v1/hojin/${corporateNumber}/workplace`,
        ];

        const detailResponses = await Promise.all(
          endpoints.map((endpoint) =>
            axios
              .get(`${this.config.baseUrl}${endpoint}`, { headers })
              .catch((err) => ({
                data: { error: `Failed to fetch ${endpoint}` },
              })),
          ),
        );

        // 基本情報に詳細情報を追加
        result = {
          basic: result,
          certification: detailResponses[0].data,
          commendation: detailResponses[1].data,
          finance: detailResponses[2].data,
          patent: detailResponses[3].data,
          procurement: detailResponses[4].data,
          subsidy: detailResponses[5].data,
          workplace: detailResponses[6].data,
        };
      }

      // レスポンスの詳細情報を表示
      if (response.status >= 400) {
        console.error(`ステータスコード: ${response.status}`);
        console.log(
          `レスポンス内容: ${JSON.stringify(response.data).substring(0, 200)}...`,
        );
        throw new Error(
          `METI API Error: Status ${response.status}, ${JSON.stringify(response.data)}`,
        );
      }

      return JSON.stringify(result);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `METI API Error: Status ${error.response.status}, ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 法人名を指定して情報を取得
   * @param corporateName 法人名
   * @param options 検索オプション
   * @returns APIレスポンス
   */
  async searchByName(
    corporateName: string,
    options: NameSearchOptions = {},
  ): Promise<string> {
    // 日本語が含まれているかチェック
    const containsJapanese =
      /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(
        corporateName,
      );
    console.error("含まれている日本語：", corporateName);
    console.error("日本語を含むか：", containsJapanese);

    // 法人名のURLエンコード - RFC3986に準拠した方法で
    // 通常のencodeURIComponent()はRFC3986に完全準拠していないので、追加の置換を行う
    const encodedName = encodeURIComponent(corporateName)
      .replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
      ) // RFC3986に準拠していない文字をエンコード
      .replace(/%20/g, "+"); // スペースを+に置換（一部のAPIで必要）
    console.error("エンコード後の法人名:", encodedName);

    const params = new URLSearchParams();
    params.append("id", this.config.applicationId);

    // 特殊なパラメータとしてnameを処理
    // URLSearchParamsはURLエンコードを行うが、APIが特別な処理を期待している可能性がある
    // 直接URLにパラメータを追加する形式で試してみる
    params.append("type", this.config.responseType);

    // URL自体にnameパラメータを含める
    let nameParam = `&name=${encodedName}`;

    // デフォルトのターゲットを設定（日本語が含まれている場合は JIS 第一・第二水準）
    if (containsJapanese && !options.target) {
      options.target = SearchTarget.JIS_LEVEL_1_2;
    }

    // オプションパラメータの設定
    if (options.mode) params.append("mode", options.mode);
    if (options.target) params.append("target", options.target);
    if (options.address) params.append("address", options.address);
    if (options.kind) params.append("kind", options.kind);
    if (options.change) params.append("change", options.change);
    if (options.close) params.append("close", options.close);
    if (options.from) params.append("from", options.from);
    if (options.to) params.append("to", options.to);
    if (options.divide) params.append("divide", options.divide);

    const url = `${this.config.baseUrl}/${this.config.version}/${SearchType.BY_NAME}`;

    // 基本的なパラメータを取得し、nameパラメータを手動で追加
    const queryString = params.toString() + nameParam;

    console.error("リクエストURL:", url);
    console.error("リクエストパラメータ:", queryString);
    console.error("オプション:", JSON.stringify(options));

    try {
      const fullUrl = `${url}?${queryString}`;
      console.error("完全なURL:", fullUrl);
      const response = await axios.get(fullUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("APIエラー詳細:", error.response.data);
        throw new Error(
          `API Error: Status ${error.response.status}, ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }
}
