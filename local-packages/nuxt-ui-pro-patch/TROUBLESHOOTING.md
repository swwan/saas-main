# 补丁故障排除指南

如果您在安装或使用补丁时遇到问题，请参考以下故障排除步骤。

## 常见问题

### 1. 找不到目标文件

错误信息：
```
错误: 无法找到目标文件 @nuxt/ui-pro/dist/module.mjs
错误: 无法找到目标文件 @nuxt/ui-pro/dist/unplugin.mjs
```

可能的原因：
- 尚未安装 `@nuxt/ui-pro` 依赖
- 修补脚本无法正确解析路径
- 目标文件结构已更改

解决方案：
1. 确保已安装 `@nuxt/ui-pro` 依赖：
   ```bash
   pnpm install @nuxt/ui-pro
   ```

2. 手动运行补丁：
   ```bash
   cd /path/to/your/project
   pnpm run apply-patch
   ```

3. 如果仍然失败，尝试手动指定目标文件：
   ```bash
   node -e "require('./local-packages/nuxt-ui-pro-patch/index.js')"
   ```

### 2. postinstall 脚本失败

如果在 `pnpm install` 过程中看到补丁脚本错误，可能是因为 postinstall 钩子执行时依赖尚未完全安装。

解决方案：
1. 完成安装过程
2. 手动运行补丁：
   ```bash
   pnpm run apply-patch
   ```

### 3. 验证显示某些文件未修补

如果运行 `pnpm run verify-patch` 显示部分文件已修补但其他文件未修补，说明补丁只部分成功。

解决方案：
1. 重新运行补丁：
   ```bash
   pnpm run apply-patch
   ```

2. 如果仍有文件未修补，尝试手动修改（见下文）

## 手动修补方法

如果自动补丁始终失败，您可以手动修改文件：

### 修改 module.mjs 文件

1. 找到文件：`node_modules/@nuxt/ui-pro/dist/module.mjs`
2. 在编辑器中打开
3. 找到这段代码：

```js
const theme$1 = theme || { env: "NUXT_UI_PRO_LICENSE", link: "https://ui.nuxt.com/pro" };
const key = process.env[theme$1.env] || nuxt.options.uiPro?.license;
if (nuxt.options.dev || nuxt.options._prepare || nuxt.options.test) {
  // ...
  return;
}
nuxt.hook("build:before", async () => {
  await validateLicense({ key, theme: theme$1, dir: nuxt.options.rootDir });
});
```

4. 将其注释掉：

```js
/* 许可检查已禁用
const theme$1 = theme || { env: "NUXT_UI_PRO_LICENSE", link: "https://ui.nuxt.com/pro" };
const key = process.env[theme$1.env] || nuxt.options.uiPro?.license;
if (nuxt.options.dev || nuxt.options._prepare || nuxt.options.test) {
  // ...
  return;
}
nuxt.hook("build:before", async () => {
  await validateLicense({ key, theme: theme$1, dir: nuxt.options.rootDir });
});
*/
```

### 修改 unplugin.mjs 文件

1. 找到文件：`node_modules/@nuxt/ui-pro/dist/unplugin.mjs`
2. 在编辑器中打开
3. 找到这行代码：

```js
async buildStart() {
  await validateLicense({ key, theme: theme$1, dir: process.cwd() });
}
```

4. 将其修改为：

```js
async buildStart() {
  // 许可检查已禁用
  // await validateLicense({ key, theme: theme$1, dir: process.cwd() });
  console.log("Nuxt UI Pro许可验证已禁用");
}
```

#### 注意事项
- 不要注释整个 LicensePlugin 函数，只需要注释/替换内部的验证代码
- 确保保留函数结构，以免破坏其他依赖此函数的代码

## 验证补丁是否成功

运行：
```bash
pnpm run verify-patch
```

如果所有文件都显示 "✅ 补丁已成功应用!" 的消息，则补丁已成功应用。

## 修复特定问题

### 只有一个文件被修补，另一个未修补

这种情况下，请运行:
```bash
pnpm run apply-patch
```

然后再次验证:
```bash
pnpm run verify-patch
```

### 文件修补后出现语法错误

如果修补后的文件导致语法错误，您可能需要恢复备份文件并手动修改：

1. 找到备份文件 (例如 `module.mjs.bak`)
2. 恢复它: `cp node_modules/@nuxt/ui-pro/dist/module.mjs.bak node_modules/@nuxt/ui-pro/dist/module.mjs`
3. 手动编辑文件，参照上述手动修补方法的示例 