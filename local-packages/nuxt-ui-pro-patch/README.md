# Nuxt UI Pro 补丁包

这个本地包提供了一种方法来禁用 Nuxt UI Pro 的许可检查机制，仅用于开发和学习目的。

## 工作原理

补丁通过注释掉 `node_modules/@nuxt/ui-pro/dist/module.mjs` 文件中的许可证检查代码来工作，这样在生产环境中就不会触发许可证验证。

## 用法

1. 在项目的 `package.json` 中添加如下依赖:

```json
"dependencies": {
  "nuxt-ui-pro-patch": "file:local-packages/nuxt-ui-pro-patch"
}
```

2. 运行 `npm install` 或 `pnpm install` 来安装依赖

补丁将在安装过程中自动运行（通过 postinstall 脚本）。

## 注意事项

- 这个补丁仅供学习和开发使用
- 建议将 `local-packages` 目录添加到 `.gitignore` 中，以避免将其提交到版本控制系统
- 当 Nuxt UI Pro 更新时，可能需要调整补丁代码以适应新的文件结构 