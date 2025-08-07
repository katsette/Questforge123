import { genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import { onCallGenkit } from "firebase-functions/https"; 
import { defineSecret } from "firebase-functions/params";
const apiKey = defineSecret("AIzaSyB1RRg88wnOPGmxdCW-SH_LD-XYcAnN9wQ");

import { enableFirebaseTelemetry } from "@genkit-ai/firebase";
import { setGlobalOptions } from "firebase-functions";
enableFirebaseTelemetry();

const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

const menuSuggestionFlow = ai.defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string()
      .describe("A restaurant theme")
      .default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (subject, { sendChunk }) => {
    // Construct a request and send it to the model API.
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const { response, stream } = ai.generateStream({
      model: gemini20Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }

    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.
    return (await response).text;
  }
);

export const menuSuggestion = onCallGenkit(
  {secrets: [apiKey],},
  menuSuggestionFlow
);

setGlobalOptions({ maxInstances: 10 });
