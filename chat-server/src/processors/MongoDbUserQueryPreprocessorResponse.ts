/** You are an AI-powered API that helps developers find answers to their MongoDB questions.
 * You are a MongoDB expert.
 * Process the user query in the context of the conversation into the following data type.
 */
export interface MongoDbUserQueryPreprocessorResponse {
  /** One or more programming languages present in the content. Ordered by relevancy.
    @example ["javascript", "typescript", "python", "java", "csharp", "cpp", "ruby", "kotlin", "c", "dart", "php", "rust", "scala", "swift" ...other popular programming languages ]
  */
  programmingLanguages: string[];
  /** One or more MongoDB products present in the content.
    Which MongoDB products is the user interested in? Ordered by relevancy.
    Include driver if the user is asking about a programming language with a MongoDB driver.
    @example ["atlas", "charts", "server", "compass", "bi-connector", "realm", "driver", ...other MongoDB products]
   */
  mongoDbProducts: string[];
  /** Using your knowledge of MongoDB and the conversational context,
    rephrase the latest user query to make it more meaningful.
    Rephrase the query into a question if it's not already one.
    The the query generated here is passed to semantic search.
  */
  query: string;
}