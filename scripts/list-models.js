
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy model to get client? No.
    // There is no listModels method on client instance directly in recent versions?
    // Actually, it's likely not exposed in the high-level SDK easily.
    // But let's try a simple generation with 'gemini-pro' to see if it works.
    
    console.log('Testing gemini-pro...');
    const result = await model.generateContent("Hello");
    console.log('gemini-pro response:', result.response.text());
    
    console.log('Testing gemini-1.5-flash...');
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultFlash = await modelFlash.generateContent("Hello");
    console.log('gemini-1.5-flash response:', resultFlash.response.text());

  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
