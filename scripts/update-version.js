#!/usr/bin/env node

/**
 * バージョン情報をpackage.jsonからversion.txtに同期するスクリプト
 */

const fs = require('fs');
const path = require('path');

function updateVersionFile() {
  try {
    // package.jsonからバージョンを取得
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const version = packageJson.version;

    // version.txtに書き込み
    const versionPath = path.join(process.cwd(), 'public', 'version', 'version.txt');
    fs.writeFileSync(versionPath, version + '\n');

    console.log(`✅ バージョン情報を更新しました: ${version}`);
    console.log(`📁 出力先: ${versionPath}`);

  } catch (error) {
    console.error('❌ バージョン更新エラー:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  updateVersionFile();
}

module.exports = { updateVersionFile };
