# Nuxt UI Pro 补丁安装说明

本文档介绍了如何使用本地 npm 包方式来解决 Nuxt UI Pro 许可问题。此方法仅用于开发和学习目的。

## 补丁工作原理

此补丁通过注释掉 Nuxt UI Pro 中的许可证检查代码来工作，从而禁用生产环境中的许可证验证。具体而言，它会修改以下两个文件：

1. **module.mjs**: 注释掉包含以下代码的部分
```js
const theme$1 = theme || { env: "NUXT_UI_PRO_LICENSE", link: "https://ui.nuxt.com/pro" };
const key = process.env[theme$1.env] || nuxt.options.uiPro?.license;
// ... 其他代码
nuxt.hook("build:before", async () => {
  await validateLicense({ key, theme: theme$1, dir: nuxt.options.rootDir });
});
```

2. **unplugin.mjs**: 注释掉包含以下代码的部分
```js
function LicensePlugin(license) {
  const theme$1 = theme || { env: "NUXT_UI_PRO_LICENSE", link: "https://ui.nuxt.com/pro" };
  const key = process.env[theme$1.env] || license;
  // ... 其他代码
  async buildStart() {
    await validateLicense({ key, theme: theme$1, dir: process.cwd() });
  }
};
```

这两个文件都包含在构建过程中验证许可证的代码，需要同时修改才能完全禁用许可证检查。

## 已实施的方案

我们采用了"本地 npm 包 + .gitignore"的方案，这具有以下优势：

1. **简化安装过程**：通过 npm/pnpm 自动化安装，无需手动执行脚本
2. **避免版本控制问题**：补丁代码不会被提交到仓库，降低法律风险
3. **项目隔离**：补丁代码与主项目分离，易于维护
4. **自动执行**：通过 postinstall 钩子自动应用补丁
5. **全面处理**：自动处理所有相关文件，无需手动干预

## 如何使用

该补丁已经集成到项目中。新团队成员只需执行以下步骤：

1. 克隆项目代码
2. 执行以下命令创建本地补丁包目录:

```bash
mkdir -p local-packages/nuxt-ui-pro-patch
```

3. 从团队其他成员处获取补丁包文件并放入此目录:
   - `package.json`
   - `index.js`
   - `verify.js`
   - `README.md`
   - `TROUBLESHOOTING.md`

4. 执行 `pnpm install` 安装依赖（补丁会在安装过程中自动应用）

5. 验证补丁是否成功应用:
   ```bash
   pnpm run verify-patch
   ```

6. 如果验证失败，则手动应用补丁:
   ```bash
   pnpm run apply-patch
   ```

## 注意事项

- 此补丁在安装依赖时自动应用
- 本地补丁包已被添加到 `.gitignore`，不会被提交到版本控制系统
- 如果 Nuxt UI Pro 更新，可能需要更新补丁代码以适应新的文件结构
- 如果补丁失败，可以手动运行 `pnpm run apply-patch` 来应用补丁
- 如遇问题，请参考 `local-packages/nuxt-ui-pro-patch/TROUBLESHOOTING.md` 中的故障排除指南

## 文件结构

```
local-packages/
  nuxt-ui-pro-patch/
    package.json      # 包配置文件（含postinstall钩子）
    index.js          # 补丁脚本（注释许可检查代码）
    verify.js         # 验证脚本（检查补丁是否成功应用）
    README.md         # 使用说明
    TROUBLESHOOTING.md # 故障排除指南
```

## 法律免责声明

此补丁仅用于开发和学习目的。在生产环境中使用 Nuxt UI Pro 应遵循其许可条款并支付相应费用。 