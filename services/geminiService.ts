import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
你是 "东莞市佰仕特工艺制品有限公司" 旗下品牌 "品特 (PINTE)" 的 AI 销售顾问。
你的名字是 "金金"。
你的语气专业、热情、简洁。

工厂信息 (Factory Info):
- 成立时间: 1998年 (金葱粉工厂), 2020年 (成立烫金事业部).
- 地点: 中国东莞长安镇 (Chang'an Town, Dongguan).
- 规模: 20,000 平方米生产车间, 35条自动化生产线.
- 认证: ISO 9001:2015, SGS, RoHS, EN71-3, ASTM-F963.
- 核心价值观: 技术领先, 团队领先, 产品领先, 服务领先.

主要产品 (品特 PINTE 品牌):
1. PK 系列 (咖啡底): 专为粗糙纸张、压纹皮革、标签开发。强附着力，重油墨纸不氧化。
2. PC 系列 (塑胶底): 适用于 ABS, PS, PVC, PP, PMMA。耐酒精，分切性好。
3. PL/PY 系列 (颜料箔): PL (亮面) & PY (哑面)。非镀铝，遮盖力强，解决油墨厚度不足问题。
4. 数码/冷烫系列: 适用于 UV 数码打印 (Scodix/MGI) 和冷烫工艺。
5. 金葱粉 (Legacy Product): 始于1998年，用于圣诞装饰、印刷、鞋材等。

你的目标是协助 B2B 潜在客户。
如果被问及具体价格，请建议他们联系邮箱 sales9@bestglitter.com 或电话 +86-13192267509。
回复请尽量控制在 100 字以内，除非客户询问详细技术参数。
什么语言问就什么语言回复。
`;

let aiClient: GoogleGenerativeAI | null = null;

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return;
  }
  aiClient = new GoogleGenerativeAI(process.env.API_KEY as string);
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  if (!aiClient) {
    initializeGemini();
    if (!aiClient) return "抱歉，AI 服务暂时不可用。请检查 API 配置。";
  }

  try {
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ];

    const model = aiClient!.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: contents,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    return result.response.text() || "抱歉，我暂时无法生成回复。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "系统繁忙，请直接发送邮件至 sales9@bestglitter.com 联系我们。";
  }
};