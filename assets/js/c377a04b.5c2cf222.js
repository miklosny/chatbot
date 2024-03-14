"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6971],{59925:(t,e,o)=>{o.r(e),o.d(e,{assets:()=>c,contentTitle:()=>s,default:()=>d,frontMatter:()=>a,metadata:()=>r,toc:()=>l});var n=o(85893),i=o(11151);const a={title:"Home",description:"Build full-stack intelligent chatbot applications using MongoDB and Atlas Vector Search."},s="MongoDB Chatbot Framework",r={id:"index",title:"Home",description:"Build full-stack intelligent chatbot applications using MongoDB and Atlas Vector Search.",source:"@site/docs/index.md",sourceDirName:".",slug:"/",permalink:"/chatbot/",draft:!1,unlisted:!1,editUrl:"https://github.com/mongodb/chatbot/tree/main/docs/docs/index.md",tags:[],version:"current",frontMatter:{title:"Home",description:"Build full-stack intelligent chatbot applications using MongoDB and Atlas Vector Search."},sidebar:"main",next:{title:"Quick Start",permalink:"/chatbot/quick-start"}},c={},l=[{value:"How It Works",id:"how-it-works",level:2},{value:"Quick Start",id:"quick-start",level:2},{value:"Design Principles",id:"design-principles",level:2},{value:"MongoDB Docs Chatbot",id:"mongodb-docs-chatbot",level:2},{value:"How We Built It",id:"how-we-built-it",level:3}];function h(t){const e={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",ul:"ul",...(0,i.a)(),...t.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(e.h1,{id:"mongodb-chatbot-framework",children:"MongoDB Chatbot Framework"}),"\n",(0,n.jsxs)(e.admonition,{title:"\ud83d\udc77\u200d\u2642\ufe0f Work In Progress \ud83d\udc77\u200d\u2642\ufe0f",type:"warning",children:[(0,n.jsx)(e.p,{children:"The MongoDB Chatbot Framework is under active development\nand may undergo breaking changes."}),(0,n.jsx)(e.p,{children:"We aim to keep the documentation up to date with the latest version."})]}),"\n",(0,n.jsxs)(e.p,{children:["Build full-stack intelligent chatbot applications using MongoDB\nand ",(0,n.jsx)(e.a,{href:"https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/",children:"Atlas Vector Search"}),"."]}),"\n",(0,n.jsx)(e.p,{children:"The MongoDB Chatbot Framework is a set of libraries that you can use to build a\nproduction-ready chatbot application. The framework provides first-class support\nfor retrieval augmented generation (RAG), and is extensible to support other\npatterns for building intelligent chatbots."}),"\n",(0,n.jsx)(e.h2,{id:"how-it-works",children:"How It Works"}),"\n",(0,n.jsx)(e.p,{children:"The MongoDB Chatbot Framework has the following core components:"}),"\n",(0,n.jsxs)(e.ul,{children:["\n",(0,n.jsxs)(e.li,{children:[(0,n.jsx)(e.a,{href:"/chatbot/mongodb",children:"MongoDB Atlas"}),": Database for the application that stores content and conversation.\nIndexes content using Atlas Vector Search."]}),"\n",(0,n.jsxs)(e.li,{children:[(0,n.jsx)(e.a,{href:"/chatbot/ingest/configure",children:"Ingest CLI"}),": Configurable CLI application that you can use to ingest content into a MongoDB collection for use with Atlas Vector Search."]}),"\n",(0,n.jsxs)(e.li,{children:[(0,n.jsx)(e.a,{href:"/chatbot/server/configure",children:"Chatbot Server"}),": Express.js server routes that you can use to build a chatbot application."]}),"\n",(0,n.jsxs)(e.li,{children:[(0,n.jsx)(e.a,{href:"/chatbot/ui",children:"Chatbot UI"}),": React.js UI components that you can use to build a chatbot application."]}),"\n",(0,n.jsxs)(e.li,{children:[(0,n.jsx)(e.a,{href:"/chatbot/evaluation/",children:"Evaluation CLI"}),": CLI application that you can use to evaluate the performance of your chatbot and its components."]}),"\n"]}),"\n",(0,n.jsx)(e.h2,{id:"quick-start",children:"Quick Start"}),"\n",(0,n.jsxs)(e.p,{children:["To get started using the MongoDB Chatbot Framework, refer to the ",(0,n.jsx)(e.a,{href:"/chatbot/quick-start",children:"Quick Start"})," guide."]}),"\n",(0,n.jsx)(e.h2,{id:"design-principles",children:"Design Principles"}),"\n",(0,n.jsx)(e.p,{children:"The MongoDB Chatbot Framework is designed around the following principles:"}),"\n",(0,n.jsxs)(e.ul,{children:["\n",(0,n.jsx)(e.li,{children:"Composability: You can use components of the chatbot framework independently of each other.\nFor example, we have some users who are using only our ingestion CLI to ingest content into MongoDB Atlas, but use other tools to build their chatbot and UI."}),"\n",(0,n.jsxs)(e.li,{children:["Pluggability: You can plug in your own implementations of components.\nFor example, you can plug in your own implementations of the ",(0,n.jsx)(e.code,{children:"DataSource"})," interface\nto ingest content from different data sources."]}),"\n",(0,n.jsx)(e.li,{children:"Inversion of Control: The framework makes decisions about boilerplate aspects\nof intelligent chatbot systems so that you can focus on building logic unique to your application."}),"\n"]}),"\n",(0,n.jsx)(e.h2,{id:"mongodb-docs-chatbot",children:"MongoDB Docs Chatbot"}),"\n",(0,n.jsxs)(e.p,{children:["This framework is used to build the MongoDB Docs Chatbot, a RAG chatbot that answers questions about the MongoDB documentation. You can try it out on ",(0,n.jsx)(e.a,{href:"https://www.mongodb.com/docs/",children:"mongodb.com/docs"}),"."]}),"\n",(0,n.jsx)(e.p,{children:"Here's a reference architecture for how the MongoDB Chatbot Framework system works for the MongoDB Docs Chatbot."}),"\n",(0,n.jsx)(e.p,{children:"Data ingestion:"}),"\n",(0,n.jsx)(e.p,{children:(0,n.jsx)(e.img,{alt:"Data Ingestion Architecture",src:o(7036).Z+"",width:"1920",height:"1080"})}),"\n",(0,n.jsx)(e.p,{children:"Chat Server:"}),"\n",(0,n.jsx)(e.p,{children:(0,n.jsx)(e.img,{alt:"Chat Server Architecture",src:o(78608).Z+"",width:"1920",height:"1080"})}),"\n",(0,n.jsx)(e.h3,{id:"how-we-built-it",children:"How We Built It"}),"\n",(0,n.jsxs)(e.ul,{children:["\n",(0,n.jsxs)(e.li,{children:["To learn more about how we built the chatbot, check out the MongoDB Developer Center blog post ",(0,n.jsx)(e.a,{href:"https://www.mongodb.com/developer/products/atlas/taking-rag-to-production-documentation-ai-chatbot/",children:"Taking RAG to Production with the MongoDB Documentation AI Chatbot"}),"."]}),"\n"]})]})}function d(t={}){const{wrapper:e}={...(0,i.a)(),...t.components};return e?(0,n.jsx)(e,{...t,children:(0,n.jsx)(h,{...t})}):h(t)}},7036:(t,e,o)=>{o.d(e,{Z:()=>n});const n=o.p+"assets/images/ingest-diagram-d3f1aa22024eb81bdf2a2d664e047da9.webp"},78608:(t,e,o)=>{o.d(e,{Z:()=>n});const n=o.p+"assets/images/server-diagram-a280c8b3e28ca494edc7a0920a2c6c41.webp"},11151:(t,e,o)=>{o.d(e,{Z:()=>r,a:()=>s});var n=o(67294);const i={},a=n.createContext(i);function s(t){const e=n.useContext(a);return n.useMemo((function(){return"function"==typeof t?t(e):{...e,...t}}),[e,t])}function r(t){let e;return e=t.disableParentContext?"function"==typeof t.components?t.components(i):t.components||i:s(t.components),n.createElement(a.Provider,{value:e},t.children)}}}]);