# 亲友二人问卷生成器
![maven](https://img.shields.io/badge/Python-blue)
![maven](https://img.shields.io/badge/JavaScript-yellow)
![maven](https://img.shields.io/badge/Redis-red)
![maven](https://img.shields.io/badge/Vercel-black)<br>
一个简单的亲友二人问卷生成器，使用HTML5 Canvas绘图，使用Vercel提供服务，使用Redis数据库<br>
### 简介
本项目支持使用Vercel搭建，您可以Fork本仓库后访问 [Vercel](https://vercel.com) 使用GitHub登录并导入您的Fork仓库在根目录创建Project。<br>
一个简单的 [示例页面](https://cnfq.lie.moe/) 和 [问卷原图](https://github.com/ZiAzusa/character-relation-questionnaire/blob/main/assets/demo.jpg)<br>
<br>
本项目支持速率限制，您可以打开 [api/handle.py](https://github.com/ZiAzusa/character-relation-questionnaire/blob/main/api/handle.py) 进行相关配置<br>
注意！本项目需要使用Redis数据库，请在Vercel的环境变量配置以下信息：<br>
| 键 | 值 |
| --- | --- |
|REDIS_HOST|您的Redis数据库地址|
|REDIS_PORT|您的Redis数据库端口|
|REDIS_PWD|您的Redis数据库密码|

若您的Redis数据库空间极为有限，建议设置<b>Data eviction policy</b>为<b>volatile-lru</b><br>
### 特别说明
项目参考了腾讯文档收集表的一部分CSS样式，问卷原图由朋友友情提供，项目使用MIT许可证。

---

Made with ♡ by [梓漪(ZiAzusa)](https://intro.lie.moe/)
