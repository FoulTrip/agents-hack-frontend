import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    let rawContent = text || "";

    // If a PDF is uploaded, extract text via Gemini's multimodal API
    if (file && file.type === "application/pdf") {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: "application/pdf",
                      data: base64,
                    },
                  },
                  {
                    text: `Extract and summarize the full content of this document as a structured project brief in Spanish. 
Include: objectives, key requirements, technical constraints, stakeholders, timeline if mentioned, and any specific deliverables.
Format it clearly so an AI engineering team can use it as their project brief.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!geminiResp.ok) {
        const err = await geminiResp.text();
        return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
      }

      const geminiData = await geminiResp.json();
      rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    if (!rawContent.trim()) {
      return NextResponse.json({ error: "No content to process" }, { status: 400 });
    }

    // Generate a structured brief from the combined content
    const structureResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres el asistente de Project Management de TripKode Software Factory.
Analiza el siguiente brief de proyecto y devuelve un JSON estructurado con este formato exacto:

{
  "title": "Título corto del proyecto",
  "summary": "Resumen ejecutivo en 2-3 oraciones",
  "prompt": "Descripción técnica completa para lanzar el pipeline de agentes de software (mínimo 3 párrafos detallados)",
  "agents": [
    { "role": "requirements_agent", "task": "Tarea específica para el Advisor Agent" },
    { "role": "architecture_agent", "task": "Tarea específica para el Architect Agent" },
    { "role": "development_agent", "task": "Tarea específica para el Developer Agent" },
    { "role": "qa_agent", "task": "Tarea específica para el QA Agent" },
    { "role": "documentation_agent", "task": "Tarea específica para el Docs Agent" },
    { "role": "devops_agent", "task": "Tarea específica para el DevOps Agent" }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "complexity": "low|medium|high",
  "estimatedPhases": 6
}

Contenido del proyecto:
${rawContent}

Responde SOLO con el JSON, sin markdown ni explicaciones adicionales.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!structureResp.ok) {
      const err = await structureResp.text();
      return NextResponse.json({ error: `Gemini JSON error: ${err}` }, { status: 500 });
    }

    const structureData = await structureResp.json();
    const rawJson = structureData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean and parse JSON
    const cleanJson = rawJson.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const brief = JSON.parse(cleanJson);

    return NextResponse.json({ brief, rawContent });
  } catch (e: any) {
    console.error("[parse-document]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
