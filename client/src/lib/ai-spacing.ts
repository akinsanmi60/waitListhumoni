import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.VITE_XAI_API_KEY,
});

interface SpacingConfig {
  mobilePadding: string;
  tabletPadding: string;
  desktopPadding: string;
  gaps: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export async function getOptimizedSpacing(
  screenWidth: number,
  contentType: "hero" | "features" | "values",
  contentLength: number
): Promise<SpacingConfig> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content:
            "You are a spacing optimization expert. Provide responsive spacing values in rem units.",
        },
        {
          role: "user",
          content: `Optimize spacing for:
           - Screen width: ${screenWidth}px
           - Content type: ${contentType}
           - Content length: ${contentLength} characters
           Return JSON with mobilePadding, tabletPadding, desktopPadding, and gaps object.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content as string);
  } catch (error) {
    console.error("AI spacing optimization failed:", error);
    // Fallback values if AI fails
    return {
      mobilePadding: "1rem",
      tabletPadding: "2rem",
      desktopPadding: "4rem",
      gaps: {
        mobile: "1rem",
        tablet: "2rem",
        desktop: "3rem",
      },
    };
  }
}
