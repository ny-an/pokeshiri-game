const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Analytics Data API v1を使用
const analyticsdata = google.analyticsdata('v1beta');

async function fetchMaximumsFromCustomDimensions() {
  try {
    console.log('🔍 カスタムディメンション（d_プレフィックス）から最高記録を取得中...');

    // サービスアカウントファイルから認証情報を取得
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

    // 累計データを取得（サービス開始日から現在まで）
    const startDate = '2024-01-15'; // サービス開始日
    const endDate = 'today';

    console.log(`📅 データ期間: ${startDate} - ${endDate}`);

    // 現在のstats.jsonを読み込み
    const currentStatsPath = path.join(process.cwd(), 'public', 'stats.json');
    let currentStats = {
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
      lastUpdated: new Date().toISOString()
    };
    
    try {
      const existingStats = JSON.parse(fs.readFileSync(currentStatsPath, 'utf8'));
      currentStats = { ...currentStats, ...existingStats };
      console.log('📊 既存の統計データを読み込みました');
    } catch (error) {
      console.warn('⚠️ 既存のstats.jsonの読み込みに失敗:', error.message);
      console.log('📊 新しい統計ファイルを作成します');
    }

    console.log('📊 現在の記録:', {
      maxScore: currentStats.maxScore,
      maxScoreTA: currentStats.maxScoreTA,
      maxChainLength: currentStats.maxChainLength,
      maxChainLengthTA: currentStats.maxChainLengthTA
    });

    // カスタムディメンションから個別レコードを取得
    console.log('🔍 カスタムディメンション（d_プレフィックス）から個別レコードを取得中...');
    
    try {
      // シングルモードのスコアとチェーン長を取得
      const singleModeResponse = await analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDate, endDate: endDate }],
          dimensions: [
            { name: 'customEvent:d_score_single' },
            { name: 'customEvent:d_chain_length_single' }
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
          limit: 10000 // 最大10000件取得
        }
      });

      // タイムアタックモードのスコアとチェーン長を取得
      const timeAttackResponse = await analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDate, endDate: endDate }],
          dimensions: [
            { name: 'customEvent:d_score_timeattack' },
            { name: 'customEvent:d_chain_length_timeattack' }
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
          limit: 10000 // 最大10000件取得
        }
      });

      console.log('📋 シングルモードレスポンス:', JSON.stringify(singleModeResponse.data, null, 2));
      console.log('📋 タイムアタックモードレスポンス:', JSON.stringify(timeAttackResponse.data, null, 2));

      // 最高値を計算
      let maxScoreSingle = currentStats.maxScore;
      let maxScoreTA = currentStats.maxScoreTA;
      let maxChainLengthSingle = currentStats.maxChainLength;
      let maxChainLengthTA = currentStats.maxChainLengthTA;

      // シングルモードの最高値を計算
      if (singleModeResponse.data.rows) {
        console.log(`📊 シングルモードレコード数: ${singleModeResponse.data.rows.length}`);
        
        singleModeResponse.data.rows.forEach((row, index) => {
          const dimensionValues = row.dimensionValues || [];
          const scoreValue = dimensionValues[0]?.value || '0';
          const chainLengthValue = dimensionValues[1]?.value || '0';
          
          // "(not set)"や無効な値を0として処理
          const score = (scoreValue === '(not set)' || scoreValue === '') ? 0 : parseFloat(scoreValue) || 0;
          const chainLength = (chainLengthValue === '(not set)' || chainLengthValue === '') ? 0 : parseFloat(chainLengthValue) || 0;

          console.log(`📋 シングルモードレコード ${index + 1}: score=${score} (raw: "${scoreValue}"), chainLength=${chainLength} (raw: "${chainLengthValue}")`);

          if (score > maxScoreSingle) maxScoreSingle = score;
          if (chainLength > maxChainLengthSingle) maxChainLengthSingle = chainLength;
        });
      }

      // タイムアタックモードの最高値を計算
      if (timeAttackResponse.data.rows) {
        console.log(`📊 タイムアタックモードレコード数: ${timeAttackResponse.data.rows.length}`);
        
        timeAttackResponse.data.rows.forEach((row, index) => {
          const dimensionValues = row.dimensionValues || [];
          const scoreValue = dimensionValues[0]?.value || '0';
          const chainLengthValue = dimensionValues[1]?.value || '0';
          
          // "(not set)"や無効な値を0として処理
          const score = (scoreValue === '(not set)' || scoreValue === '') ? 0 : parseFloat(scoreValue) || 0;
          const chainLength = (chainLengthValue === '(not set)' || chainLengthValue === '') ? 0 : parseFloat(chainLengthValue) || 0;

          console.log(`📋 タイムアタックモードレコード ${index + 1}: score=${score} (raw: "${scoreValue}"), chainLength=${chainLength} (raw: "${chainLengthValue}")`);

          if (score > maxScoreTA) maxScoreTA = score;
          if (chainLength > maxChainLengthTA) maxChainLengthTA = chainLength;
        });
      }

      console.log(`📊 計算された記録:`);
      console.log(`- シングル最高スコア: ${maxScoreSingle}`);
      console.log(`- シングル最長チェーン: ${maxChainLengthSingle}`);
      console.log(`- TA最高スコア: ${maxScoreTA}`);
      console.log(`- TA最長チェーン: ${maxChainLengthTA}`);

      // より高い値で更新
      const finalMaxScore = Math.max(currentStats.maxScore, maxScoreSingle);
      const finalMaxScoreTA = Math.max(currentStats.maxScoreTA, maxScoreTA);
      const finalMaxChainLength = Math.max(currentStats.maxChainLength, maxChainLengthSingle);
      const finalMaxChainLengthTA = Math.max(currentStats.maxChainLengthTA, maxChainLengthTA);

      // stats.jsonを更新
      const updatedStats = {
        ...currentStats,
        maxScore: finalMaxScore,
        maxScoreTA: finalMaxScoreTA,
        maxChainLength: finalMaxChainLength,
        maxChainLengthTA: finalMaxChainLengthTA,
        lastUpdated: new Date().toISOString()
      };

      fs.writeFileSync(currentStatsPath, JSON.stringify(updatedStats, null, 2));
      console.log(`✅ 最高記録を更新して ${currentStatsPath} に保存しました`);

      console.log(`📊 最終記録:`);
      console.log(`- シングル最高スコア: ${finalMaxScore}`);
      console.log(`- シングル最長チェーン: ${finalMaxChainLength}`);
      console.log(`- TA最高スコア: ${finalMaxScoreTA}`);
      console.log(`- TA最長チェーン: ${finalMaxChainLengthTA}`);

      return updatedStats;

    } catch (customError) {
      console.warn('⚠️ カスタムディメンション取得に失敗:', customError.message);
      console.log('💡 カスタムディメンションが正しく設定されていない可能性があります');
      console.log('📋 GA4で以下のカスタムディメンションが設定されているか確認してください:');
      console.log('- d_score_single (イベントスコープ)');
      console.log('- d_score_timeattack (イベントスコープ)');
      console.log('- d_chain_length_single (イベントスコープ)');
      console.log('- d_chain_length_timeattack (イベントスコープ)');
      
      // エラー時は現在の値を維持
      console.log('📊 エラーのため、現在の記録を維持します');
      return currentStats;
    }

  } catch (error) {
    console.error('❌ Analytics API Error:', error);
    throw error;
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  fetchMaximumsFromCustomDimensions()
    .then((stats) => {
      console.log('🎉 最高記録の取得が完了しました');
      console.log('📊 最終結果:', {
        maxScore: stats.maxScore,
        maxScoreTA: stats.maxScoreTA,
        maxChainLength: stats.maxChainLength,
        maxChainLengthTA: stats.maxChainLengthTA
      });
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 最高記録の取得に失敗しました:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchMaximumsFromCustomDimensions };
