const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Analytics Data API v1を使用
const analyticsdata = google.analyticsdata('v1beta');

async function fetchAnalyticsData() {
  try {
    console.log('🔍 Google Analytics データを取得中...');

    // 環境変数からサービスアカウント情報を取得
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
    };

    // 認証設定
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      throw new Error('GA4_PROPERTY_ID が設定されていません');
    }

    // 累計データを取得（サービス開始日から現在まで）
    const startDate = '2024-01-15'; // サービス開始日
    const endDate = 'today';

    console.log(`📅 データ期間: ${startDate} - ${endDate}`);

    // 基本イベント数を取得
    const basicEventsResponse = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        dimensions: [
          {
            name: 'eventName',
          },
        ],
        metrics: [
          {
            name: 'eventCount',
          },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['pokemon_answer', 'game_clear', 'game_over'],
            },
          },
        },
      },
    });

    // スコアと チェーン長の最大値を取得
    const maxValuesResponse = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        dimensions: [
          {
            name: 'eventName',
          },
        ],
        metrics: [
          {
            name: 'eventCount',
          },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['game_clear', 'game_over'],
            },
          },
        },
        // カスタムメトリクスでスコアとチェーン長の最大値を取得
        metricFilter: {
          filter: {
            fieldName: 'eventCount',
            numericFilter: {
              operation: 'GREATER_THAN',
              value: {
                int64Value: '0',
              },
            },
          },
        },
      },
    });

    // レスポンスデータを整理
    const stats = {
      totalPokemonAnswers: 0,
      totalGameClears: 0,
      totalGameOvers: 0,
      totalGames: 0,
      clearRate: 0,
      averageAnswersPerGame: 0,
      maxScore: 0, // 注意: GA4の標準レポートでは直接取得困難
      maxChainLength: 0, // 注意: GA4の標準レポートでは直接取得困難
      serviceStartDate: startDate,
      lastUpdated: new Date().toISOString(),
    };

    // 基本統計を処理
    if (basicEventsResponse.data.rows) {
      basicEventsResponse.data.rows.forEach((row) => {
        const eventName = row.dimensionValues?.[0]?.value;
        const eventCount = parseInt(row.metricValues?.[0]?.value || '0');

        switch (eventName) {
          case 'pokemon_answer':
            stats.totalPokemonAnswers = eventCount;
            break;
          case 'game_clear':
            stats.totalGameClears = eventCount;
            break;
          case 'game_over':
            stats.totalGameOvers = eventCount;
            break;
        }
      });
    }

    // 計算統計
    stats.totalGames = stats.totalGameClears + stats.totalGameOvers;
    stats.clearRate = stats.totalGames > 0 
      ? (stats.totalGameClears / stats.totalGames) * 100 
      : 0;
    stats.averageAnswersPerGame = stats.totalGames > 0
      ? stats.totalPokemonAnswers / stats.totalGames
      : 0;

    // 注意: maxScore と maxChainLength は GA4 の標準レポートでは直接取得が困難
    // 将来的にはカスタムディメンション/メトリクスまたは BigQuery エクスポートが必要
    // 現在は仮の値を設定
    stats.maxScore = 0;
    stats.maxChainLength = 0;

    console.log('📊 取得した統計データ:');
    console.log(`- 総回答数: ${stats.totalPokemonAnswers.toLocaleString()}`);
    console.log(`- クリア数: ${stats.totalGameClears.toLocaleString()}`);
    console.log(`- ゲームオーバー数: ${stats.totalGameOvers.toLocaleString()}`);
    console.log(`- 成功率: ${stats.clearRate.toFixed(1)}%`);

    // JSONファイルに出力
    const outputPath = path.join(process.cwd(), 'public', 'stats.json');
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));

    console.log(`✅ 統計データを ${outputPath} に保存しました`);
    return stats;

  } catch (error) {
    console.error('❌ Analytics API Error:', error);
    
    // エラー時はデフォルトデータを出力
    const defaultStats = {
      totalPokemonAnswers: 0,
      totalGameClears: 0,
      totalGameOvers: 0,
      totalGames: 0,
      clearRate: 0,
      averageAnswersPerGame: 0,
      maxScore: 0,
      maxChainLength: 0,
      serviceStartDate: '2024-01-15',
      lastUpdated: new Date().toISOString(),
      error: error.message,
    };

    const outputPath = path.join(process.cwd(), 'public', 'stats.json');
    fs.writeFileSync(outputPath, JSON.stringify(defaultStats, null, 2));
    
    console.log('⚠️ エラーのため、デフォルトデータを出力しました');
    throw error;
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  fetchAnalyticsData()
    .then(() => {
      console.log('🎉 統計データの取得が完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 統計データの取得に失敗しました:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchAnalyticsData };
