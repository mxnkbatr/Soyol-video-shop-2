import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ suggestions: [] });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
            },
        });

        const prompt = `
            Та бол Soyol Video Shop-ийн хайлтын туслах байна. 
            Хэрэглэгчийн "${query}" гэсэн хайлтыг шинжлээд, хамгийн тохиромжтой 1 хайлтын санал (suggested query) болон категорийг буцаана уу.
            
            Тусгай хамаарлууд:
            - Гэрэл, студи, зураг авалт гэвэл: 'Aputure' брэндийг санал болгох.
            - Өвөл, дулаан хувцас гэвэл: 'North Face' эсвэл 'Outerwear' санал болгох.
            - "Миний хүүд тохирох тоглоом" гэвэл: 'Toy', 'Education', 'LEGO' гэх мэт санал болгох.
            
            Хариулах формат (JSON):
            {
              "text": "Санал болгох текст",
              "category": "Категори нэр",
              "reason": "товч тайлбар"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const data = JSON.parse(text);

        return NextResponse.json({
            suggestions: [
                {
                    id: 'smart-1',
                    text: data.text,
                    category: data.category,
                    trending: true
                }
            ]
        });
    } catch (error) {
        console.error('Search Suggestion Error:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
