import { generate } from '@genkit-ai/ai';
import { geminiPro } from '@genkit-ai/googleai';
import { configureGenkit, apiKey } from '@genkit-ai/core';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import * as z from 'zod'; 
import { setGlobalOptions } from 'firebase-functions';

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });


configureGenkit({ models: [

    geminiPro({
      apiKey: apiKey,
      // The Gemini API is not yet available in all regions.
      // See https://ai.google.dev/models/regions
      // for more information.
      // To use a different region, you can specify it here, e.g.:
      // apiRegion: 'asia-northeast1',
    }),
  ],
  logLevel: 'debug',
  // For Genkit to connect to your Firebase project, you'll need to
  // have Firebase Admin SDK credentials.
  // If you are running Genkit locally, and have authenticated via the Firebase CLI,
  // Genkit will detect your credentials automatically.
  // If you are deploying Genkit to a Cloud Function, the credentials will
  // be available automatically.
  // If you are running Genkit in a different environment, you may need to
  // explicitly provide them.
  // firebase: {
  //   projectId: 'YOUR_PROJECT_ID',
  // },
});

export const menuSuggestionFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string().describe('The subject of the restaurant.'),
    outputSchema: z.string(),
  },
  async (subject: any) => {
    const llmResponse = await generate({
      model: geminiPro,
      prompt: `Suggest a name for a menu item for a ${subject} themed restaurant.`,
      config: {
        temperature: 0.8,
      },
    });

    return llmResponse.text();
  }
);

export const evaluateMenuSuggestion = defineFlow(
  {
    name: 'evaluateMenuSuggestion',
    inputSchema: z.object({
      subject: z.string(),
      menuName: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({ subject, menuName }) => {
    const llmResponse = await generate({
      model: geminiPro,
      prompt: `Is "${menuName}" a good name for a menu item for a ${subject} themed restaurant?`,
      config: {
        temperature: 0.2,
      },
    });

    return llmResponse.text();
  }
);

export const simpleRagFlow = defineFlow(
  {
    name: 'simpleRagFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (query: any) => {
    const ragResponse = await runFlow(menuSuggestionFlow, query);
    return ragResponse;
  }
);