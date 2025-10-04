const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Analytics Data API v1を使用
const analyticsdata = google.analyticsdata('v1beta');

// 認証設定を取得する関数
async function getAuthConfig() {
  let credentials;
  let propertyId;
  
  try {
    // 環境変数が設定されている場合は環境変数を使用
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GA4_PROPERTY_ID) {
      credentials = {
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
      propertyId = process.env.GA4_PROPERTY_ID;
      console.log('📋 環境変数から認証情報を取得しました');
    } else {
      // ローカル開発環境ではサービスアカウントファイルを使用
      const credentialsPath = path.join(process.cwd(), 'credentials', 'service-account.json');
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // GA4設定ファイルからプロパティIDを取得
      const ga4ConfigPath = path.join(process.cwd(), 'credentials', 'ga4-config.json');
      const ga4Config = JSON.parse(fs.readFileSync(ga4ConfigPath, 'utf8'));
      propertyId = ga4Config.propertyId;
      console.log('📋 サービスアカウントファイルから認証情報を取得しました');
      console.log(`📊 GA4プロパティID: ${propertyId}`);
    }
  } catch (fileError) {
    throw new Error(`認証情報の取得に失敗しました: ${fileError.message}`);
  }

  // 認証設定
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID が設定されていません');
  }

  return { authClient, propertyId };
}

// 基本統計を取得する関数
async function fetchBasicStats(authClient, propertyId, startDate, endDate) {
  console.log('📊 基本統計を取得中...');
  
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

  const stats = {
    totalPokemonAnswers: 0,
    totalGameClears: 0,
    totalGameOvers: 0,
    totalGames: 0,
    clearRate: 0,
    averageAnswersPerGame: 0,
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

  return stats;
}

// 最高記録を取得する関数
async function fetchMaximumRecords(authClient, propertyId, startDate, endDate) {
  console.log('🏆 最高記録を取得中...');
  
  try {
    const gameEventsResponse = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: startDate, endDate: endDate }],
        dimensions: [
          { name: 'eventName' },
          { name: 'customEvent:game_mode' },
          { name: 'customEvent:d_score_single' },
          { name: 'customEvent:d_score_timeattack' },
          { name: 'customEvent:d_chain_length_single' },
          { name: 'customEvent:d_chain_length_timeattack' }
        ],
        metrics: [
          { name: 'eventCount' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['game_clear', 'game_over']
            }
          }
        },
        limit: 10000
      }
    });

    let maxScoreSingle = 0;
    let maxScoreTA = 0;
    let maxChainLengthSingle = 0;
    let maxChainLengthTA = 0;

    if (gameEventsResponse.data.rows) {
      gameEventsResponse.data.rows.forEach(row => {
        const dimensionValues = row.dimensionValues || [];
        
        const eventName = dimensionValues[0]?.value;
        const gameMode = dimensionValues[1]?.value;
        const scoreSingle = parseInt(dimensionValues[2]?.value || '0');
        const scoreTA = parseInt(dimensionValues[3]?.value || '0');
        const chainLengthSingle = parseInt(dimensionValues[4]?.value || '0');
        const chainLengthTA = parseInt(dimensionValues[5]?.value || '0');

        // モード別に分けて最高値を更新
        if (gameMode === 'single') {
          if (scoreSingle > maxScoreSingle) maxScoreSingle = scoreSingle;
          if (chainLengthSingle > maxChainLengthSingle) maxChainLengthSingle = chainLengthSingle;
        } else if (gameMode === 'timeattack') {
          if (scoreTA > maxScoreTA) maxScoreTA = scoreTA;
          if (chainLengthTA > maxChainLengthTA) maxChainLengthTA = chainLengthTA;
        }
      });
    }

    return {
      maxScore: maxScoreSingle,
      maxScoreTA: maxScoreTA,
      maxChainLength: maxChainLengthSingle,
      maxChainLengthTA: maxChainLengthTA
    };

  } catch (error) {
    console.warn('⚠️ 最高記録取得に失敗:', error.message);
    return {
      maxScore: 0,
      maxScoreTA: 0,
      maxChainLength: 0,
      maxChainLengthTA: 0
    };
  }
}

// Pokemon使用統計を取得する関数
async function fetchPokemonStats(authClient, propertyId, startDate, endDate) {
  console.log('🔍 Pokemon使用統計を取得中...');
  
  try {
    const pokemonStatsResponse = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: startDate, endDate: endDate }],
        dimensions: [
          { name: 'customEvent:pokemon_name' }
        ],
        metrics: [
          { name: 'eventCount' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'pokemon_answer' }
          }
        },
        orderBys: [
          {
            metric: { metricName: 'eventCount' },
            desc: true
          }
        ],
        limit: 10
      }
    });
    
    let mostUsedPokemon = null;
    let mostUsedPokemonCount = 0;
    
    if (pokemonStatsResponse.data.rows && pokemonStatsResponse.data.rows.length > 0) {
      // (not set)を除外して最初の有効なPokemonを取得
      for (const row of pokemonStatsResponse.data.rows) {
        const pokemonName = row.dimensionValues?.[0]?.value;
        const usageCount = parseInt(row.metricValues?.[0]?.value || '0');
        
        if (pokemonName && pokemonName !== '(not set)') {
          mostUsedPokemon = pokemonName;
          mostUsedPokemonCount = usageCount;
          console.log(`🏆 最も使用されたPokemon: ${pokemonName} (${usageCount}回)`);
          break;
        }
      }
    }

    return {
      mostUsedPokemon,
      mostUsedPokemonCount
    };

  } catch (error) {
    console.warn('⚠️ Pokemon統計取得でエラー:', error.message);
    return {
      mostUsedPokemon: null,
      mostUsedPokemonCount: 0
    };
  }
}

// メイン関数 - 引数で実行する機能を選択
async function fetchAnalyticsData(options = {}) {
  try {
    console.log('🔍 Google Analytics データを取得中...');

    // デフォルトオプション
    const {
      includeBasicStats = true,
      includeMaximumRecords = true,
      includePokemonStats = true,
      startDate = '2024-01-15',
      endDate = 'today'
    } = options;

    // 認証設定を取得
    const { authClient, propertyId } = await getAuthConfig();
    
    console.log(`📅 データ期間: ${startDate} - ${endDate}`);

    // 基本統計データ構造
    const stats = {
      totalPokemonAnswers: 0,
      totalGameClears: 0,
      totalGameOvers: 0,
      totalGames: 0,
      clearRate: 0,
      averageAnswersPerGame: 0,
      maxScore: 0,
      maxScoreTA: 0,
      maxChainLength: 0,
      maxChainLengthTA: 0,
      mostUsedPokemon: null,
      mostUsedPokemonCount: 0,
      serviceStartDate: startDate,
      lastUpdated: new Date().toISOString(),
    };

    // 基本統計を取得
    if (includeBasicStats) {
      const basicStats = await fetchBasicStats(authClient, propertyId, startDate, endDate);
      Object.assign(stats, basicStats);
    }

    // 最高記録を取得
    if (includeMaximumRecords) {
      const maxRecords = await fetchMaximumRecords(authClient, propertyId, startDate, endDate);
      Object.assign(stats, maxRecords);
    }

    // Pokemon統計を取得
    if (includePokemonStats) {
      const pokemonStats = await fetchPokemonStats(authClient, propertyId, startDate, endDate);
      Object.assign(stats, pokemonStats);
    }

    console.log('📊 取得した統計データ:');
    
    // 基本統計の表示
    if (includeBasicStats) {
      console.log(`- 総回答数: ${stats.totalPokemonAnswers.toLocaleString()}`);
      console.log(`- クリア数: ${stats.totalGameClears.toLocaleString()}`);
      console.log(`- ゲームオーバー数: ${stats.totalGameOvers.toLocaleString()}`);
      console.log(`- 成功率: ${stats.clearRate.toFixed(1)}%`);
    }
    
    // 最高記録の表示
    if (includeMaximumRecords) {
      console.log(`- 最高スコア（シングル）: ${stats.maxScore.toLocaleString()}`);
      console.log(`- 最高スコア（タイムアタック）: ${stats.maxScoreTA.toLocaleString()}`);
      console.log(`- 最高チェーン（シングル）: ${stats.maxChainLength}`);
      console.log(`- 最高チェーン（タイムアタック）: ${stats.maxChainLengthTA}`);
    }
    
    // Pokemon統計の表示
    if (includePokemonStats) {
      if (stats.mostUsedPokemon) {
        console.log(`- 最も使用されたPokemon: ${stats.mostUsedPokemon} (${stats.mostUsedPokemonCount}回)`);
      } else {
        console.log('- 最も使用されたPokemon: データなし');
      }
    }

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
      maxScoreTA: 0,
      maxChainLength: 0,
      maxChainLengthTA: 0,
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
  // コマンドライン引数からオプションを取得
  const args = process.argv.slice(2);
  const options = {};

  // 引数の解析
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--basic-only':
        options.includeBasicStats = true;
        options.includeMaximumRecords = false;
        options.includePokemonStats = false;
        break;
      case '--max-only':
        options.includeBasicStats = false;
        options.includeMaximumRecords = true;
        options.includePokemonStats = false;
        break;
      case '--pokemon-only':
        options.includeBasicStats = false;
        options.includeMaximumRecords = false;
        options.includePokemonStats = true;
        break;
      case '--start-date':
        options.startDate = args[++i];
        break;
      case '--end-date':
        options.endDate = args[++i];
        break;
      case '--help':
        console.log(`
📊 fetch-stats.js 使用法:

基本実行:
  node scripts/fetch-stats.js

オプション:
  --basic-only        基本統計のみ取得
  --max-only          最高記録のみ取得
  --pokemon-only      Pokemon統計のみ取得
  --start-date DATE   開始日 (例: 2024-01-01)
  --end-date DATE     終了日 (例: 2024-12-31)
  --help              このヘルプを表示

例:
  node scripts/fetch-stats.js --basic-only
  node scripts/fetch-stats.js --max-only --start-date 2024-10-01
        `);
        process.exit(0);
        break;
    }
  }

  fetchAnalyticsData(options)
    .then(() => {
      console.log('🎉 統計データの取得が完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 統計データの取得に失敗しました:', error.message);
      process.exit(1);
    });
}

module.exports = { 
  fetchAnalyticsData,
  fetchBasicStats,
  fetchMaximumRecords,
  fetchPokemonStats,
  getAuthConfig
};