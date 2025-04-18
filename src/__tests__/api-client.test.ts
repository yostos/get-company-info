import axios from 'axios';
import { CompanyInfoClient } from '../api-client';
import { ApiConfig, ResponseType, SearchMode, SearchTarget } from '../types';

// axiosをモック化
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CompanyInfoClient', () => {
  let client: CompanyInfoClient;
  let config: ApiConfig;

  beforeEach(() => {
    // テスト用の設定
    config = {
      applicationId: 'test-application-id',
      version: '4',
      responseType: ResponseType.XML_UNICODE,
      baseUrl: 'https://api.houjin-bangou.nta.go.jp'
    };
    
    client = new CompanyInfoClient(config);
    
    // モックのリセット
    jest.clearAllMocks();
  });

  describe('searchByNumber', () => {
    test('正しいURLとパラメータでリクエストが送信される', async () => {
      // モックの応答を設定
      const mockResponse = { data: '<xml>テスト応答</xml>' };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // テスト対象メソッドを呼び出し
      const result = await client.searchByNumber('1234567890123');

      // 検証
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.houjin-bangou.nta.go.jp/4/num')
      );
      expect(result).toBe(mockResponse.data);
    });

    test('オプションパラメータが正しく設定される', async () => {
      // モックの応答を設定
      const mockResponse = { data: '<xml>テスト応答</xml>' };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // テスト対象メソッドを呼び出し（オプション付き）
      await client.searchByNumber('1234567890123', { history: '1' });

      // 検証
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/https:\/\/api\.houjin-bangou\.nta\.go\.jp\/4\/num\?.*history=1/)
      );
    });

    test('エラーが適切に処理される', async () => {
      // エラーをモック
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      // エラーが投げられることを確認
      await expect(client.searchByNumber('1234567890123')).rejects.toThrow();
    });
  });

  describe('searchByName', () => {
    test('正しいURLとパラメータでリクエストが送信される', async () => {
      // モックの応答を設定
      const mockResponse = { data: '<xml>テスト応答</xml>' };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // テスト対象メソッドを呼び出し
      const result = await client.searchByName('テスト株式会社');

      // 検証
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      // 完全なURLが呼び出されているのを検証
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.houjin-bangou.nta.go.jp/4/name')
      );
      expect(result).toBe(mockResponse.data);
    });

    test('オプションパラメータが正しく設定される', async () => {
      // モックの応答を設定
      const mockResponse = { data: '<xml>テスト応答</xml>' };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // テスト対象メソッドを呼び出し（オプション付き）
      await client.searchByName('テスト株式会社', {
        mode: SearchMode.PARTIAL_MATCH,
        target: SearchTarget.JIS_LEVEL_1_2,
        change: '1'
      });

      // 検証
      // 完全なURLとパラメータが呼び出されているのを検証
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.houjin-bangou.nta.go.jp/4/name')
      );
    });

    test('エラーが適切に処理される', async () => {
      // エラーをモック
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      // エラーが投げられることを確認
      await expect(client.searchByName('テスト株式会社')).rejects.toThrow();
    });
  });
});