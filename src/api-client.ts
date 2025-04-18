import axios from 'axios';
import { 
  ApiConfig, 
  SearchType, 
  NumberSearchOptions,
  NameSearchOptions,
  ResponseType,
  SearchTarget
} from './types';

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
  async searchByNumber(corporateNumber: string, options: NumberSearchOptions = {}): Promise<string> {
    const params = new URLSearchParams();
    params.append('id', this.config.applicationId);
    params.append('number', corporateNumber);
    params.append('type', this.config.responseType);
    
    // オプションパラメータの設定
    if (options.history) {
      params.append('history', options.history);
    }

    const url = `${this.config.baseUrl}/${this.config.version}/${SearchType.BY_NUMBER}`;
    const queryString = params.toString();
    const fullUrl = `${url}?${queryString}`;
    
    try {
      const response = await axios.get(fullUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: Status ${error.response.status}, ${JSON.stringify(error.response.data)}`);
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
  async searchByName(corporateName: string, options: NameSearchOptions = {}): Promise<string> {
    // 日本語が含まれているかチェック
    const containsJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(corporateName);
    console.error('含まれている日本語：', corporateName);
    console.error('日本語を含むか：', containsJapanese);
    
    // 法人名のURLエンコード - RFC3986に準拠した方法で
    // 通常のencodeURIComponent()はRFC3986に完全準拠していないので、追加の置換を行う
    const encodedName = encodeURIComponent(corporateName)
      .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`) // RFC3986に準拠していない文字をエンコード
      .replace(/%20/g, '+'); // スペースを+に置換（一部のAPIで必要）
    console.error('エンコード後の法人名:', encodedName);

    const params = new URLSearchParams();
    params.append('id', this.config.applicationId);
    
    // 特殊なパラメータとしてnameを処理
    // URLSearchParamsはURLエンコードを行うが、APIが特別な処理を期待している可能性がある
    // 直接URLにパラメータを追加する形式で試してみる
    params.append('type', this.config.responseType);
    
    // URL自体にnameパラメータを含める
    let nameParam = `&name=${encodedName}`;
    
    // デフォルトのターゲットを設定（日本語が含まれている場合は JIS 第一・第二水準）
    if (containsJapanese && !options.target) {
      options.target = SearchTarget.JIS_LEVEL_1_2;
    }
    
    // オプションパラメータの設定
    if (options.mode) params.append('mode', options.mode);
    if (options.target) params.append('target', options.target);
    if (options.address) params.append('address', options.address);
    if (options.kind) params.append('kind', options.kind);
    if (options.change) params.append('change', options.change);
    if (options.close) params.append('close', options.close);
    if (options.from) params.append('from', options.from);
    if (options.to) params.append('to', options.to);
    if (options.divide) params.append('divide', options.divide);

    const url = `${this.config.baseUrl}/${this.config.version}/${SearchType.BY_NAME}`;
    
    // 基本的なパラメータを取得し、nameパラメータを手動で追加
    const queryString = params.toString() + nameParam;

    console.error('リクエストURL:', url);
    console.error('リクエストパラメータ:', queryString);
    console.error('オプション:', JSON.stringify(options));
    
    try {
      const fullUrl = `${url}?${queryString}`;
      console.error('完全なURL:', fullUrl);
      const response = await axios.get(fullUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('APIエラー詳細:', error.response.data);
        throw new Error(`API Error: Status ${error.response.status}, ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}