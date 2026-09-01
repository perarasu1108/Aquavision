/**
 * Gemini AI Service for natural language water resource Q&A
 * Requires GEMINI_API_KEY in environment variables
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isAvailable = true;
    } else {
      this.isAvailable = false;
      console.warn('⚠️  GEMINI_API_KEY not set. AI chat will use fallback responses.');
    }
  }

  async chat(message, context) {
    if (!this.isAvailable) {
      throw new Error('Gemini API not configured');
    }

    const systemPrompt = `You are AquaVision AI, an intelligent assistant for a Water Resource Management System. 
You help government water resource department officials understand and manage groundwater data.

Current system data context:
- Total Borewells: ${context.totalBorewells}
- Active Borewells: ${context.activeBorewells}
- Average Water Level: ${context.avgWaterLevel}m below ground
- Critical Borewells (>15m deep): ${context.criticalBorewells}
- Total Recharge Structures: ${context.totalRechargeStructures}
- Unresolved Alerts: ${context.unresolvedAlerts}
- Monthly Extraction: ${(context.monthlyExtraction / 1000).toFixed(0)} kL
- District Data: ${JSON.stringify(context.districtData)}

Provide helpful, data-driven responses about water resources. Use the context data to answer questions accurately.
Format responses with markdown for clarity. Include relevant numbers and percentages.
Keep responses concise but informative. Suggest actionable steps when appropriate.`;

    try {
      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: message }
      ]);

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw error;
    }
  }

  async generateReport(data) {
    if (!this.isAvailable) {
      return 'AI report generation requires Gemini API configuration. Please set GEMINI_API_KEY in your environment variables.';
    }

    const prompt = `Generate a concise executive summary report for a Water Resource Department based on this data:
${JSON.stringify(data, null, 2)}

Include:
1. Key metrics overview
2. Concerns and risks
3. Recommended actions
4. Positive trends

Format as a professional report with headers and bullet points.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini Report Error:', error.message);
      return 'Unable to generate report. Please check API configuration.';
    }
  }
}

module.exports = new GeminiService();
