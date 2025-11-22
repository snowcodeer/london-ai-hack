import { ProblemCategory } from '../types';
import { OPENAI_API_KEY } from '@env';

export interface VisionAnalysisResult {
  description: string;
  category: ProblemCategory;
  urgency: 'low' | 'medium' | 'high';
  keyDetails: string[];
}

// Helper function to extract JSON from various formats
function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text.trim();
}

export async function analyzeImageWithVision(
  imageBase64: string
): Promise<VisionAnalysisResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please check your app.json configuration.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing home and business maintenance problems from photos.
            Analyze the image and provide:
            1. A clear description of the problem
            2. The problem category (plumbing, electrical, hvac, carpentry, painting, landscaping, appliance_repair, general_handyman, or other)
            3. Urgency level (low, medium, high)
            4. Key details a service professional should know

            You must respond with valid JSON only, no markdown formatting, no code blocks, just the raw JSON object.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this problem and tell me what service is needed. Return ONLY a JSON object in this format:
{
  "description": "detailed description",
  "category": "category_name",
  "urgency": "urgency_level",
  "keyDetails": ["detail1", "detail2", "detail3"]
}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract and parse the JSON response
    try {
      const jsonString = extractJSON(content);
      const result = JSON.parse(jsonString);

      // Validate required fields
      if (!result.description || !result.category || !result.urgency) {
        throw new Error('Invalid response format: missing required fields');
      }

      return result as VisionAnalysisResult;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Parse error:', parseError);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
