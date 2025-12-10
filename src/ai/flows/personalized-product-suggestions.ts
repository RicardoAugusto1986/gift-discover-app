'use server';

/**
 * @fileOverview A personalized product suggestion AI agent.
 *
 * - personalizedProductSuggestions - A function that suggests products based on user interactions.
 * - PersonalizedProductSuggestionsInput - The input type for the personalizedProductSuggestions function.
 * - PersonalizedProductSuggestionsOutput - The return type for the personalizedProductSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedProductSuggestionsInputSchema = z.object({
  userInteractions: z
    .string()
    .describe(
      'A list of user interactions, including likes, shares, and clicks, as a string.'
    ),
  availableProducts: z
    .string()
    .describe('A list of available products to suggest, as a string.'),
});
export type PersonalizedProductSuggestionsInput =
  z.infer<typeof PersonalizedProductSuggestionsInputSchema>;

const PersonalizedProductSuggestionsOutputSchema = z.object({
  suggestedProducts: z
    .string()
    .describe('A list of suggested products based on user interactions.'),
});
export type PersonalizedProductSuggestionsOutput =
  z.infer<typeof PersonalizedProductSuggestionsOutputSchema>;

export async function personalizedProductSuggestions(
  input: PersonalizedProductSuggestionsInput
): Promise<PersonalizedProductSuggestionsOutput> {
  return personalizedProductSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedProductSuggestionsPrompt',
  input: {schema: PersonalizedProductSuggestionsInputSchema},
  output: {schema: PersonalizedProductSuggestionsOutputSchema},
  prompt: `You are a product recommendation expert. Based on the user's past
interactions and a list of available products, suggest the most relevant
products to the user.

User Interactions:
{{userInteractions}}

Available Products:
{{availableProducts}}

Suggested Products:`,
});

const personalizedProductSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedProductSuggestionsFlow',
    inputSchema: PersonalizedProductSuggestionsInputSchema,
    outputSchema: PersonalizedProductSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
