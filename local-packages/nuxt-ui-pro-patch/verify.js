#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要验证的文件列表
const TARGET_FILES = [
  { 
    name: 'module.mjs',
    description: '主模块文件',
    successIndicator: '/* 许可检查已禁用'
  },
  { 
    name: 'unplugin.mjs',
    description: 'Vite插件文件',
    successIndicator: '// 许可检查已禁用',
    warningIndicator: 'await validateLicense('
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

// 验证文件是否已被修补
function verifyFile(filePath, target) {
  // 检查文件是否存在
  if (!filePath || !fs.existsSync(filePath)) {
    return {
      status: 'error',
      message: `错误: 找不到文件 ${filePath || '（路径为空）'}`
    };
  }

  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否包含成功指示器
    if (content.includes(target.successIndicator)) {
      return {
        status: 'success',
        message: '✅ 补丁已成功应用!'
      };
    } else {
      // 检查是否包含警告指示器（未被修补的代码）
      const warningIndicator = target.warningIndicator || 'validateLicense(';
      if (content.includes(warningIndicator)) {
        return {
          status: 'warning',
          message: '❌ 补丁未应用! 许可检查代码仍然存在'
        };
      } else {
        return {
          status: 'unknown',
          message: '⚠️ 无法确定补丁状态。许可检查代码格式可能已更改'
        };
      }
    }
  } catch (error) {
    return {
      status: 'error',
      message: `读取文件时出错: ${error.message}`
    };
  }
}

// 主函数
function main() {
  try {
    console.log('验证Nuxt UI Pro补丁状态...\n');
    
    let totalFiles = 0;
    let successFiles = 0;
    let warningFiles = 0;
    let errorFiles = 0;

    // 处理每个目标文件
    for (const target of TARGET_FILES) {
      if (!target || !target.name) {
        console.warn('警告: 跳过无效的目标文件配置');
        errorFiles++;
        continue;
      }
      
      totalFiles++;
      console.log(`检查 ${target.description} (${target.name}):`);
      
      const filePath = findFile(target.name);
      
      if (!filePath) {
        console.log(`  ❓ 未找到文件，跳过验证\n`);
        errorFiles++;
        continue;
      }
      
      // 验证文件
      const result = verifyFile(filePath, target);
      
      // 输出结果
      console.log(`  ${result.message}`);
      console.log(`  文件路径: ${filePath}\n`);
      
      if (result.status === 'success') {
        successFiles++;
      } else if (result.status === 'warning') {
        warningFiles++;
        console.log(`  请尝试手动运行: pnpm run apply-patch\n`);
      } else {
        errorFiles++;
      }
    }
    
    // 输出总结
    console.log('==== 验证结果摘要 ====');
    console.log(`总文件数: ${totalFiles}`);
    console.log(`成功修补: ${successFiles}`);
    console.log(`未修补: ${warningFiles}`);
    console.log(`状态未知: ${errorFiles}`);
    
    // 根据结果设置退出码
    if (successFiles === totalFiles) {
      console.log('\n所有文件均已成功修补!');
      process.exit(0);
    } else if (warningFiles > 0) {
      console.log('\n有文件未被修补，请运行补丁修复');
      process.exit(1);
    } else {
      console.log('\n无法确定部分文件的补丁状态');
      process.exit(1);
    }
  } catch (error) {
    console.error('验证过程中发生严重错误:', error);
    process.exit(2);
  }
}

// 尝试执行主函数
try {
  main();
} catch (error) {
  console.error('执行验证时出现意外错误:', error);
  process.exit(2);
} 