const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Analytics Data API v1を使用
const analyticsdata = google.analyticsdata('v1beta');

async function fetchAnalyticsData() {
  try {
    console.log('🔍 Google Analytics データを取得中...');

    // サービスアカウントファイルから認証情報を取得
    let credentials;
    let propertyId;
    
    try {
      // 環境変数が設定されている場合は環境変数を使用
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GA4_PROPERTY_PROPERTY_ID) {
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
          }],
        dimensions: [
          {
            name: 'eventName',
          }],
        metrics: [
          {
            name: 'eventCount',
          }],
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

    // レスポンスデータを整理
    const stats = {
      totalPokemonAnswers: 0,
      totalGameClears: 0,
      totalGameOvers: 0,
      totalGames: 0,
      clearRate: 0,
      averageAnswersPerGame: 0,
      maxScore: 0, // シングルモードの最高スコア（後方互換性のため残す）
      maxScoreTA: 0, // タイムアタックモードの最高スコア
      maxChainLength: 0, // シングルモードの最長チェーン（後方互換性のため残す）
      maxChainLengthTA: 0, // タイムアタックモードの最長チェーン
      mostUsedPerson: null, // 最も使用されたPokemon名
      mostUsedPokemonCount: 0, // その使用回数
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

    // イベントから個別レコードを取得して最高値を計算
    try {
      console.log('🔍 個別イベントレコードから最高値を取得開始...');
      
      // game_clearイベントの詳細を取得
      const gameClearResponse = await analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDate, endDate: endDate }],
          dimensions: [
            ({ name: 'customEvent:game_mode' },
            { name: 'customEvent:score' },
            { name: 'customEvent:chain_length' })
          ],
          metrics: [
            { name: 'eventCount' }
          ],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: { value: 'game_clear' }
            }
          },
          orderBys: [
            {
              dimensions: [
                { name: 'customEvent:game_mode' }
              ]
            }
          ],
          limit: 1000
        }
      });

      // game_overイベントの詳細を取得
      const gameOverResponse = await analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        requestedBody: {
          dateRanges: [{ startDate: startDate, endDate: endDate }],
          dimensions: [
            ({ name: 'customEvent:game_mode' },
            { name: 'customEvent:score' },
            { name: 'customEvent:chain_length' })
          ],
          metrics: [
            { name: 'eventCount' }
          ],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: { value: 'game_over' }
            }
          },
          orderBys: [
            {
              dimensions: [
                { name: 'customEvent:game_mode' }
              ]
            }
          ],
          limit: 1000
        }
      });

      console.log('📋 game_clear詳細レスポンス:', JSON.stringify(gameClearResponse.data, null, 2));
      console.log('📋 game_over詳細レスポンス:', JSON.stringify(gameOverResponse.data, null, 2));

      // 結果を処理 - ディメンション値から最高値を計算
      let maxScoreSingle = 0;
      let maxScoreTA = 0;
      let maxChainLengthSingle = 0;
      let maxChainLengthTA = 0;

      // game_clearとgame_overの両方のデータから最高値を取得
      [...(gameClearResponse.data.rows || []), ...(gameOverResponse.data.rows || [])].forEach(row => {
        const dimensionValues = row.dimensionValues || [];
        
        // ディメンション値からパラメータ値を取得
        // 0: game_mode, 1: score, 2: chain_length
        const gameMode = dimensionValues[0]?.value;
        const score = parseInt(dimensionValues[1]?.value || '0');
        const chainLength = parseInt(dimensionValues[2]?.value || '0');

        console.log('🔍 処理中:', { gameMode, score, chainLength });

        // モード別に分けて最高値を更新
        if (gameMode === 'single') {
          if (score > maxScoreSingle) maxScoreSingle = score;
          if (chainLength > maxChainLengthSingle) maxChainLengthSingle = chainLength;
        } else if (gameMode === 'timeattack') {
          if (score > maxScoreTA) maxScoreTA = score;
          if (chainLength > maxChainLengthTA) maxChainLengthTA = chainLength;
        }
      });

      stats.maxScore = maxScoreSingle;
      stats.maxScoreTA = maxScoreTA;
      stats.maxChainLength = maxChainLengthSingle;
      stats.maxChainLengthTA = maxChainLengthTA;

      console.log(`📊 モード別最高記録:`);
      console.log(`- シングル最高スコア: ${stats.maxScore}`);
      console.log(`- シングル最長チェーン: ${stats.maxChainLength}`);
      console.log(`- TA最高スコア: ${stats.maxScoreTA}`);
      console.log(`- TA最長チェーン: ${stats.maxChainLengthTA}`);

    } catch (customError) {
      console.warn('⚠️ イベント詳細の取得に失敗:', customError.message);
      console.log('💡 ガイド設定のイベントパラメータ名が正しくない可能性があります');
      console.log('📋 GA4設定ガイド: docs/development/ga4-setup-guide.md を参照してください');
      
      // エラー情報をstatsに追加
      stats.error = `イベント詳細の取得に失敗: ${customError.message}`;
      
      // イベント詳細取得失敗時はデフォルト値を維持
      stats.maxScore = 0;
      stats.maxScoreTA = 0;
      stats.maxChainLength = 0;
      stats.maxChainLengthTA = 0;
    }

    // 最も使用されたPokemon名の統計を取得
    console.log('🔍 Pokemon使用統計を取得中...');
    try {
      const pokemonStatsResponse = await analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDate, endDate: endDate }],
          dimensions: [
            ({ name: 'customEvent:pokemon_name' })
          ],
          metrics: [
            ({ name: 'eventCount' })
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
      
      console.log('📋 Pokemon使用統計:', JSON.stringify(pokemonStatsResponse.data, null, 2));
      
      // 最も使用されたPokemon名を統計に追加
      if (pokemonStatsResponse.data.rows && pokemonStatsResponse.data.rows.length > 0) {
        // (not set)を除いて最初の有効なPokemonを取得
        for (const row of pokemonStatsResponse.data.rows) {
          const pokemonName = row.dimensionValues?.[0]?.value;
          const usageCount = parseInt(row.metricValues?.[0]?.value || '0');
          
          if (pokemonName && pokemonName !== '(not set)') {
            stats.mostUsedPokemon = pokemonName;
            stats.mostUsedPokemonCount = usageCount;
            console.log(`🏆 最も使用されたPokemon: ${pokemonName} (${usageCount}回)`);
            break;
          }
        }
      }
    } catch (pokemonError) {
      console.warn('⚠️ Pokemon統計取得でエラー:', pokemonError.message);
    }

    // 実際に送信されているイベントパラメータを確認
    console.log('🔍 実際のイベントパラメータを確認中...');
    try {
      const eventParamsResponse = await analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDate, endDate: endDate }],
          dimensions: [
            ({ name: 'eventName' })
          ],
          metrics: [
            ({ name: 'eventCount' })
          ],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: {
                values: ['game_clear', 'game_over', 'pokemon_answer']
              }
            }
          },
          limit: 10
        }
      });
      
      console.log('📋 イベント一覧:', JSON.stringify(eventParamsResponse.data, null, 2));
    } catch (eventError) {
      console.warn('⚠️ イベント確認でエラー:', eventError.message);
    }

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
