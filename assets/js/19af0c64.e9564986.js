"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[1538],{80600:(n,e,o)=>{o.r(e),o.d(e,{assets:()=>l,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>r,toc:()=>c});var t=o(85893),a=o(11151);const i={},s="Evaluation CLI",r={id:"evaluation/index",title:"Evaluation CLI",description:"The Evaluation CLI documentation is under active development",source:"@site/docs/evaluation/index.md",sourceDirName:"evaluation",slug:"/evaluation/",permalink:"/chatbot/evaluation/",draft:!1,unlisted:!1,editUrl:"https://github.com/mongodb/chatbot/tree/main/docs/docs/evaluation/index.md",tags:[],version:"current",frontMatter:{},sidebar:"main",previous:{title:"Chatbot UI",permalink:"/chatbot/ui"},next:{title:"API Reference",permalink:"/chatbot/reference/"}},l={},c=[{value:"How It Works",id:"how-it-works",level:2},{value:"Install",id:"install",level:2},{value:"Create a Configuration File",id:"create-a-configuration-file",level:2},{value:"Define Configuration Files with TypeScript",id:"define-configuration-files-with-typescript",level:2},{value:"Example Configuration",id:"example-configuration",level:2},{value:"Additional Example Configurations",id:"additional-example-configurations",level:2}];function d(n){const e={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.a)(),...n.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(e.h1,{id:"evaluation-cli",children:"Evaluation CLI"}),"\n",(0,t.jsx)(e.admonition,{title:"\ud83d\udc77\u200d\u2642\ufe0f Work In Progress \ud83d\udc77\u200d\u2642\ufe0f",type:"warning",children:(0,t.jsx)(e.p,{children:"The Evaluation CLI documentation is under active development\nand will be expanded in the near future."})}),"\n",(0,t.jsx)(e.p,{children:"The MongoDB Chatbot Framework comes with an Evaluation CLI that allows you\nto evaluate the performance of your chatbot and its components."}),"\n",(0,t.jsx)(e.p,{children:"Evaluation is important to ensure that the chatbot is providing accurate and relevant responses to user queries.\nIt also helps you measure the effect of changes to the chatbot's components\nas you develop your application."}),"\n",(0,t.jsx)(e.p,{children:"The CLI evaluates the chatbot's performance by comparing the chatbot's responses to a set of questions with the expected answers."}),"\n",(0,t.jsx)(e.h2,{id:"how-it-works",children:"How It Works"}),"\n",(0,t.jsx)(e.p,{children:"The Evaluation CLI works by running a series of commands that generate, evaluate, and report on the performance of your chatbot."}),"\n",(0,t.jsx)(e.h2,{id:"install",children:"Install"}),"\n",(0,t.jsx)(e.p,{children:"To install the Evaluation CLI, run the following command:"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bash",children:"npm i mongodb-chatbot-evaluation mongodb-chatbot-server\n"})}),"\n",(0,t.jsx)(e.h2,{id:"create-a-configuration-file",children:"Create a Configuration File"}),"\n",(0,t.jsxs)(e.p,{children:["The MongoDB Evaluation CLI uses a ",(0,t.jsx)(e.a,{href:"https://en.wikipedia.org/wiki/CommonJS",children:"CommonJS"}),"\nJavaScript configuration file to determine how to evaluate content."]}),"\n",(0,t.jsxs)(e.p,{children:["Every configuration file must export a ",(0,t.jsx)(e.a,{href:"/chatbot/reference/eval/modules#configconstructor",children:(0,t.jsx)(e.code,{children:"ConfigConstructor"})})," object as its default export."]}),"\n",(0,t.jsx)(e.p,{children:"You must either:"}),"\n",(0,t.jsxs)(e.ul,{children:["\n",(0,t.jsxs)(e.li,{children:["Pass the path to a configuration file to every command with the ",(0,t.jsx)(e.code,{children:"--config"})," flag."]}),"\n",(0,t.jsxs)(e.li,{children:["Put a CommonJS file named ",(0,t.jsx)(e.code,{children:"eval.config.js"})," in the root of your project."]}),"\n"]}),"\n",(0,t.jsxs)(e.p,{children:["For example, to run the ",(0,t.jsx)(e.code,{children:"generate"})," command with a configuration file called ",(0,t.jsx)(e.code,{children:"my-eval.config.js"})," and generation called ",(0,t.jsx)(e.code,{children:"my-conversations"}),", run the following command:"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bash",children:"mongodb-chatbot-evaluation generate --config my-eval.config.js --name my-conversations\n"})}),"\n",(0,t.jsx)(e.h2,{id:"define-configuration-files-with-typescript",children:"Define Configuration Files with TypeScript"}),"\n",(0,t.jsx)(e.admonition,{title:"Use TypeScript Configuration Files!",type:"important",children:(0,t.jsxs)(e.p,{children:["We ",(0,t.jsx)(e.strong,{children:"strongly"})," recommend using TypeScript configuration files.\nThe typing system helps you ensure that your configuration is valid."]})}),"\n",(0,t.jsx)(e.p,{children:"You can use TypeScript to make your configuration file. This allows you to use\nthe type system to ensure that your configuration is valid."}),"\n",(0,t.jsxs)(e.p,{children:["You must compile your configuration file to ",(0,t.jsx)(e.strong,{children:"CommmonJS"})," before running the CLI.\nThe CLI only accepts CommonJS configuration files."]}),"\n",(0,t.jsxs)(e.p,{children:["You can build your CommonJS configuration file with ",(0,t.jsx)(e.code,{children:"tsc"}),":"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bash",children:"tsc --module commonjs --target es2017 --outDir build eval.config.ts\n"})}),"\n",(0,t.jsx)(e.p,{children:"Then run the Evaluation CLI with the compiled configuration file:"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bash",children:"mongodb-chatbot-evaluation generate --config build/eval.config.js --name my-conversations\n"})}),"\n",(0,t.jsx)(e.h2,{id:"example-configuration",children:"Example Configuration"}),"\n",(0,t.jsx)(e.p,{children:"Here's a simple example configuration file for the Evaluation CLI.\nYou can use this configuration file as a starting point for your own configuration."}),"\n",(0,t.jsx)(e.p,{children:"Example configuration file:"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-ts",children:'// eval.config.ts\n\nimport {\n  EvalConfig,\n  makeMongoDbCommandMetadataStore,\n  makeMongoDbGeneratedDataStore,\n  makeGenerateConversationData,\n  getConversationsTestCasesFromYaml,\n  makeEvaluateConversationQuality,\n  makeMongoDbEvaluationStore,\n  makeMongoDbReportStore,\n  mongodbResponseQualityExamples,\n  reportStatsForBinaryEvalRun,\n  makeEvaluateConversationFaithfulness,\n} from "mongodb-chatbot-evaluation";\nimport { makeMongoDbConversationsService } from "mongodb-chatbot-server";\nimport "dotenv/config";\nimport fs from "fs";\nimport path from "path";\nimport { MongoClient, assertEnvVars } from "mongodb-rag-core";\nimport { envVars } from "./envVars";\n\nexport default async () => {\n  const {\n    MONGODB_DATABASE_NAME,\n    MONGODB_CONNECTION_URI,\n    CONVERSATIONS_SERVER_BASE_URL,\n    OPENAI_CHAT_COMPLETION_DEPLOYMENT,\n    OPENAI_ENDPOINT,\n    OPENAI_API_KEY,\n    OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,\n  } = assertEnvVars(envVars);\n\n  const { OpenAIClient, AzureKeyCredential } = await import("@azure/openai");\n  const { OpenAI: LlamaIndexOpenAiLlm } = await import("llamaindex");\n  const miscTestCases = getConversationsTestCasesFromYaml(\n    fs.readFileSync(\n      path.resolve(__dirname, "..", "testCases", "conversations.yml"),\n      "utf8"\n    )\n  );\n  const faqTestCases = getConversationsTestCasesFromYaml(\n    fs.readFileSync(\n      path.resolve(__dirname, "..", "testCases", "faq_conversations.yml"),\n      "utf8"\n    )\n  );\n\n  const storeDbOptions = {\n    connectionUri: MONGODB_CONNECTION_URI,\n    databaseName: MONGODB_DATABASE_NAME,\n  };\n\n  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);\n  await mongodb.connect();\n\n  const db = mongodb.db(MONGODB_DATABASE_NAME);\n  const conversations = makeMongoDbConversationsService(db);\n\n  const evalConfig = {\n    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),\n    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),\n    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),\n    reportStore: makeMongoDbReportStore(storeDbOptions),\n\n    commands: {\n      generate: {\n        conversations: {\n          type: "conversation",\n          testCases: [...miscTestCases, ...faqTestCases],\n          generator: makeGenerateConversationData({\n            conversations,\n            httpHeaders: {\n              Origin: "Testing",\n            },\n            apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,\n          }),\n        },\n        faqConversations: {\n          type: "conversation",\n          testCases: faqTestCases,\n          generator: makeGenerateConversationData({\n            conversations,\n            httpHeaders: {\n              Origin: "Testing",\n            },\n            apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,\n          }),\n        },\n      },\n      evaluate: {\n        conversationQuality: {\n          evaluator: makeEvaluateConversationQuality({\n            deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,\n            openAiClient: new OpenAIClient(\n              OPENAI_ENDPOINT,\n              new AzureKeyCredential(OPENAI_API_KEY)\n            ),\n            fewShotExamples: mongodbResponseQualityExamples,\n          }),\n        },\n        conversationFaithfulness: {\n          evaluator: makeEvaluateConversationFaithfulness({\n            llamaIndexLlm: new LlamaIndexOpenAiLlm({\n              azure: {\n                apiKey: OPENAI_API_KEY,\n                endpoint: OPENAI_ENDPOINT,\n                deploymentName: OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,\n              },\n            }),\n          }),\n        },\n      },\n      report: {\n        conversationQualityRun: {\n          reporter: reportStatsForBinaryEvalRun,\n        },\n        conversationFaithfulnessRun: {\n          reporter: reportStatsForBinaryEvalRun,\n        },\n      },\n    },\n    async afterAll() {\n      await mongodb.close();\n    },\n  } satisfies EvalConfig;\n  return evalConfig;\n};\n'})}),"\n",(0,t.jsx)(e.h2,{id:"additional-example-configurations",children:"Additional Example Configurations"}),"\n",(0,t.jsx)(e.p,{children:"For additional example configurations, check out the following projects:"}),"\n",(0,t.jsxs)(e.ul,{children:["\n",(0,t.jsxs)(e.li,{children:[(0,t.jsx)(e.a,{href:"https://github.com/mongodb/chatbot/blob/main/packages/chatbot-eval-mongodb-public/src/eval.config.ts",children:"MongoDB AI chatbot evaluation"}),": Evaluations for the MongoDB AI chatbot."]}),"\n"]})]})}function u(n={}){const{wrapper:e}={...(0,a.a)(),...n.components};return e?(0,t.jsx)(e,{...n,children:(0,t.jsx)(d,{...n})}):d(n)}},11151:(n,e,o)=>{o.d(e,{Z:()=>r,a:()=>s});var t=o(67294);const a={},i=t.createContext(a);function s(n){const e=t.useContext(i);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function r(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(a):n.components||a:s(n.components),t.createElement(i.Provider,{value:e},n.children)}}}]);