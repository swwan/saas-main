#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修改的文件路径列表
const TARGET_FILES = [
  {
    name: 'module.mjs',
    pattern: /const theme\$1 = theme.*?validateLicense\(\{ key, theme: theme\$1, dir: nuxt\.options\.rootDir \}\);.*?\}\);/s,
    replacement: (match) => `/* 许可检查已禁用
${match}
*/`
  },
  {
    name: 'unplugin.mjs',
    pattern: /await validateLicense\(\{ key, theme: theme\$1, dir: process\.cwd\(\) \}\);/,
    replacement: (match) => `// 许可检查已禁用
      // ${match}
      console.log("Nuxt UI Pro许可验证已禁用");`
  }
];

// 安全地处理路径，防止undefined
function safePath(baseDir, relativePath) {
  if (!baseDir) {
    return null;
  }
  try {
    return path.resolve(baseDir, relativePath);
  } catch (err) {
    console.error(`路径解析错误: ${err.message}`);
    return null;
  }
}

// 查找文件
function findFile(fileName) {
  if (!fileName) {
    console.error('错误: 文件名不能为空');
    return null;
  }

  // 尝试获取当前工作目录
  let cwd;
  try {
    cwd = process.cwd();
  } catch (err) {
    console.error(`获取当前工作目录错误: ${err.message}`);
    cwd = '.';
  }
  
  // 尝试获取执行目录
  let execDir;
  try {
    execDir = path.dirname(process.argv[1] || '.');
  } catch (err) {
    console.error(`获取执行目录错误: ${err.message}`);
    execDir = '.';
  }

  // 可能的路径列表
  const possiblePaths = [
    // 从项目根目录查找
    safePath(cwd, `node_modules/@nuxt/ui-pro/dist/${fileName}`),
    // 从本地包目录向上查找
    safePath(cwd, `../../node_modules/@nuxt/ui-pro/dist/${fileName}`),
    // 从执行目录查找
    safePath(execDir, `../../node_modules/@nuxt/ui-pro/dist/${fileName}`)
  ].filter(Boolean); // 过滤掉null和undefined

  // 尝试每一个可能的路径
  for (const filePath of possiblePaths) {
    if (filePath && fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // 紧急情况：尝试直接在node_modules中查找
  const emergencyPaths = [
    './node_modules/@nuxt/ui-pro/dist/' + fileName,
    '../node_modules/@nuxt/ui-pro/dist/' + fileName,
    '../../node_modules/@nuxt/ui-pro/dist/' + fileName
  ];
  
  for (const filePath of emergencyPaths) {
    try {
      const absolutePath = path.resolve(filePath);
      if (fs.existsSync(absolutePath)) {
        return absolutePath;
      }
    } catch (err) {
      // 忽略错误，继续尝试下一个路径
    }
  }

  return null;
}

// 备份文件
function backupFile(filePath) {
  if (!filePath) {
    return false;
  }
  
  try {
    if (fs.existsSync(filePath) && !fs.existsSync(`${filePath}.bak`)) {
      fs.copyFileSync(filePath, `${filePath}.bak`);
      console.log('已创建备份文件:', `${filePath}.bak`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`创建备份文件错误: ${err.message}`);
    return false;
  }
}

// 修改许可检查代码
function patchLicenseCheck(filePath, pattern, replacement) {
  if (!filePath || !pattern) {
    console.error('错误: 文件路径或模式不能为空');
    return false;
  }

  if (!fs.existsSync(filePath)) {
    console.error('错误: 找不到目标文件:', filePath);
    return false;
  }

  try {
    // 备份原始文件
    backupFile(filePath);

    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');

    // 查找并替换许可检查代码块
    if (pattern.test(content)) {
      // 应用替换函数
      content = content.replace(pattern, replacement);
      
      // 写入修改后的文件
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('成功: 文件已修补 -', filePath);
      return true;
    } else {
      console.warn('警告: 没有找到许可检查代码，可能目标文件结构已更改 -', filePath);
      return false;
    }
  } catch (error) {
    console.error('修改文件时出错:', error);
    return false;
  }
}

// 主函数
function main() {
  try {
    console.log('开始修补Nuxt UI Pro...');
    
    let patchedCount = 0;
    let targetCount = TARGET_FILES.length;
    
    // 处理每个目标文件
    for (const target of TARGET_FILES) {
      if (!target || !target.name) {
        console.warn('警告: 跳过无效的目标文件配置');
        continue;
      }
      
      const filePath = findFile(target.name);
      
      if (!filePath) {
        console.error(`错误: 无法找到目标文件 @nuxt/ui-pro/dist/${target.name}`);
        console.log('请确保已安装 @nuxt/ui-pro 依赖');
        continue;
      }
      
      console.log(`找到目标文件: ${target.name} (${filePath})`);
      
      if (patchLicenseCheck(filePath, target.pattern, target.replacement)) {
        patchedCount++;
      }
    }
    
    if (patchedCount > 0) {
      console.log(`修补完成! 成功修补 ${patchedCount}/${targetCount} 个文件`);
      return true;
    } else {
      console.log('修补失败，所有文件均未能修补');
      return false;
    }
  } catch (error) {
    console.error('补丁执行过程中发生严重错误:', error);
    return false;
  }
}

// 尝试执行主函数
try {
  main();
} catch (error) {
  console.error('执行补丁时出现意外错误:', error);
} 