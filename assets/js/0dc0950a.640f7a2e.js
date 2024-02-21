"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6321],{57018:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>a,frontMatter:()=>r,metadata:()=>o,toc:()=>h});var s=n(85893),d=n(11151);const r={},i="Chatbot UI",o={id:"ui",title:"Chatbot UI",description:"The MongoDB Chatbot UI is a React.js component library that you can use to build a chatbot UI.",source:"@site/docs/ui.md",sourceDirName:".",slug:"/ui",permalink:"/chatbot/ui",draft:!1,unlisted:!1,editUrl:"https://github.com/mongodb/chatbot/tree/main/docs/docs/ui.md",tags:[],version:"current",frontMatter:{},sidebar:"main",previous:{title:"Evaluate Chatbot Responses",permalink:"/chatbot/server/evaluate"},next:{title:"API Reference",permalink:"/chatbot/reference/"}},c={},h=[{value:"Install",id:"install",level:2},{value:"Usage",id:"usage",level:2},{value:"Components",id:"components",level:2},{value:"<code>Chatbot</code> Root Component",id:"chatbot-root-component",level:3},{value:"<code>ActionButtonTrigger</code>",id:"actionbuttontrigger",level:3},{value:"<code>FloatingActionButtonTrigger</code>",id:"floatingactionbuttontrigger",level:3},{value:"<code>InputBarTrigger</code>",id:"inputbartrigger",level:3},{value:"<code>ModalView</code>",id:"modalview",level:3}];function l(e){const t={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components},{Details:r}=t;return r||function(e,t){throw new Error("Expected "+(t?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.h1,{id:"chatbot-ui",children:"Chatbot UI"}),"\n",(0,s.jsx)(t.p,{children:"The MongoDB Chatbot UI is a React.js component library that you can use to build a chatbot UI."}),"\n",(0,s.jsx)(t.p,{children:"Currently, it's focused on internal MongoDB use cases. However, we may make it more generic in the future if there is sufficient external interest."}),"\n",(0,s.jsxs)(r,{children:[(0,s.jsx)("summary",{children:" Demo GIF "}),(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"Chatbot UI Demo GIF",src:n(30817).Z+"",width:"1308",height:"1054"})})]}),"\n",(0,s.jsx)(t.h2,{id:"install",children:"Install"}),"\n",(0,s.jsxs)(t.p,{children:["Install the ",(0,s.jsx)(t.code,{children:"mongodb-chatbot-ui"})," package from npm. This contains the React.js components that you can use to build a chatbot UI."]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-shell",children:"npm install mongodb-chatbot-ui\n"})}),"\n",(0,s.jsx)(t.h2,{id:"usage",children:"Usage"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-tsx",children:'import Chatbot, {\n  FloatingActionButtonTrigger,\n  InputBarTrigger,\n  ModalView,\n  MongoDbLegalDisclosure,\n  mongoDbVerifyInformationMessage,\n} from "mongodb-chatbot-ui";\n\nfunction MyApp() {\n  const suggestedPrompts = [\n    "How do I create a new MongoDB Atlas cluster?",\n    "Can MongoDB store lists of data?",\n    "How does vector search work?",\n  ];\n  return (\n    <div>\n      <Chatbot name="MongoDB AI" maxInputCharacters={300}>\n        <InputBarTrigger\n          bottomContent={<MongoDbLegalDisclosure />}\n          suggestedPrompts={suggestedPrompts}\n        />\n        <FloatingActionButtonTrigger text="Ask My MongoDB AI" />\n        <ModalView\n          disclaimer={<MongoDbLegalDisclosure />}\n          initialMessageText="Welcome to my MongoDB AI Assistant. What can I help you with?"\n          initialMessageSuggestedPrompts={suggestedPrompts}\n          inputBottomText={mongoDbVerifyInformationMessage}\n        />\n      </Chatbot>\n    </div>\n  );\n}\n'})}),"\n",(0,s.jsx)(t.h2,{id:"components",children:"Components"}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"mongodb-chatbot-ui"})," package exports the following components."]}),"\n",(0,s.jsxs)(t.h3,{id:"chatbot-root-component",children:[(0,s.jsx)(t.code,{children:"Chatbot"})," Root Component"]}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"<Chatbot />"})," component is effectively a React context provider that wraps your chatbot. It accepts the following props:"]}),"\n",(0,s.jsxs)(t.table,{children:[(0,s.jsx)(t.thead,{children:(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.th,{children:"Prop"}),(0,s.jsx)(t.th,{children:"Type"}),(0,s.jsx)(t.th,{children:"Description"}),(0,s.jsx)(t.th,{children:"Default"})]})}),(0,s.jsxs)(t.tbody,{children:[(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"children"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"ReactElement | ReactElement[]"})}),(0,s.jsxs)(t.td,{children:["Trigger and View components for the chatbot, e.g. ",(0,s.jsx)(t.code,{children:"FloatingActionButtonTrigger"})," and ",(0,s.jsx)(t.code,{children:"ModalView"}),"."]}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"darkMode"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"boolean?"})}),(0,s.jsxs)(t.td,{children:["If ",(0,s.jsx)(t.code,{children:"true"}),", the UI renders in dark mode. This overrides any theme ",(0,s.jsx)(t.code,{children:"darkMode"})," setting."]}),(0,s.jsxs)(t.td,{children:["The user's OS preference or theme value of ",(0,s.jsx)(t.code,{children:"darkMode"}),"."]})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"fetchOptions"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"ConversationFetchOptions?"})}),(0,s.jsxs)(t.td,{children:["If set, the provided options are included with every fetch request to the server. For more information on the available fetch options, refer to ",(0,s.jsx)(t.a,{href:"https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options",children:"Supplying request options"})," in the MDN documentation."]}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"isExperimental"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"boolean?"})}),(0,s.jsxs)(t.td,{children:["If ",(0,s.jsx)(t.code,{children:"true"}),", the UI includes EXPERIMENTAL badges throughout."]}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"true"})})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"maxCommentCharacters"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"number?"})}),(0,s.jsx)(t.td,{children:"The maximum number of characters allowed in a user's comment on an assistant message."}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"500"})})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"maxInputCharacters"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"number?"})}),(0,s.jsx)(t.td,{children:"The maximum number of characters allowed in a user message."}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"300"})})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"name"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The name of the chatbot. Used as the default in text throughout the UI."}),(0,s.jsx)(t.td,{children:"If unspecified, the chatbot is anonymous."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"serverBaseUrl"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The base URL for the Chatbot API."}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"https://knowledge.mongodb.com/api/v1"})})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"shouldStream"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"boolean?"})}),(0,s.jsxs)(t.td,{children:["If ",(0,s.jsx)(t.code,{children:"true"}),", responses are streamed with SSE. Otherwise the entire response is awaited."]}),(0,s.jsxs)(t.td,{children:["If the browser supports SSE, ",(0,s.jsx)(t.code,{children:"true"}),", else ",(0,s.jsx)(t.code,{children:"false"}),"."]})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"tck"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"An analytics identifier to add to the end of all hyperlinks."}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:'"docs_chatbot"'})})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"user"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"{ name: string; }?"})}),(0,s.jsx)(t.td,{children:"An object with information about the current user (if there is one)."}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"undefined"})})]})]})]}),"\n",(0,s.jsx)(t.h3,{id:"actionbuttontrigger",children:(0,s.jsx)(t.code,{children:"ActionButtonTrigger"})}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"<ActionButtonTrigger />"})," component opens a view component (like ",(0,s.jsx)(t.code,{children:"<ModalView />"}),") when clicked. It accepts the following props:"]}),"\n",(0,s.jsxs)(t.table,{children:[(0,s.jsx)(t.thead,{children:(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.th,{children:"Prop"}),(0,s.jsx)(t.th,{children:"Type"}),(0,s.jsx)(t.th,{children:"Description"}),(0,s.jsx)(t.th,{children:"Default"})]})}),(0,s.jsxs)(t.tbody,{children:[(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"className"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"A custom class name for the trigger container. Use this to apply custom css styles."}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"darkMode"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"boolean?"})}),(0,s.jsxs)(t.td,{children:["If ",(0,s.jsx)(t.code,{children:"true"}),", this renders in dark mode. This overrides any theme or provider ",(0,s.jsx)(t.code,{children:"darkMode"})," setting."]}),(0,s.jsxs)(t.td,{children:["The user's OS preference or theme value of ",(0,s.jsx)(t.code,{children:"darkMode"}),"."]})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"text"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The text shown in the floating action button."}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:'"MongoDB AI"'})})]})]})]}),"\n",(0,s.jsx)(t.h3,{id:"floatingactionbuttontrigger",children:(0,s.jsx)(t.code,{children:"FloatingActionButtonTrigger"})}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"<FloatingActionButtonTrigger />"})," component opens a view component (like ",(0,s.jsx)(t.code,{children:"<ModalView />"}),") when clicked. It accepts the same props as ",(0,s.jsx)(t.a,{href:"#actionbuttontrigger",children:"ActionButtonTrigger"})," but also includes a default ",(0,s.jsx)(t.code,{children:"position: fixed"})," style that makes the button float in the bottom right of the window on top of the content (",(0,s.jsx)(t.code,{children:"z-index: 100"}),")."]}),"\n",(0,s.jsx)(t.h3,{id:"inputbartrigger",children:(0,s.jsx)(t.code,{children:"InputBarTrigger"})}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"<InputBarTrigger />"})," component opens a view component (like ",(0,s.jsx)(t.code,{children:"<ModalView />"}),") when the user sends their first message. It accepts the following props:"]}),"\n",(0,s.jsxs)(t.table,{children:[(0,s.jsx)(t.thead,{children:(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.th,{children:"Prop"}),(0,s.jsx)(t.th,{children:"Type"}),(0,s.jsx)(t.th,{children:"Description"}),(0,s.jsx)(t.th,{children:"Default"})]})}),(0,s.jsxs)(t.tbody,{children:[(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"bottomContent"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"ReactNode?"})}),(0,s.jsx)(t.td,{children:"Content that appears immediately below the input bar, e.g. for a terms of use disclaimer."}),(0,s.jsx)(t.td,{children:"If not specified, no content is shown."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"className"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"A custom class name for the trigger container. Use this to apply custom css styles."}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"darkMode"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"boolean?"})}),(0,s.jsxs)(t.td,{children:["If ",(0,s.jsx)(t.code,{children:"true"}),", this renders in dark mode. This overrides any theme or provider ",(0,s.jsx)(t.code,{children:"darkMode"})," setting."]}),(0,s.jsxs)(t.td,{children:["The user's OS preference or theme value of ",(0,s.jsx)(t.code,{children:"darkMode"}),"."]})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"fatalErrorMessage"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"A custom error message shown in the input bar when an unrecoverable error has occurred."}),(0,s.jsx)(t.td,{children:'"Something went wrong. Try reloading the page and starting a new conversation."'})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"suggestedPrompts"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string[]?"})}),(0,s.jsx)(t.td,{children:"A list of suggested prompts that appear in the input bar dropdown menu."}),(0,s.jsx)(t.td,{children:"If no prompts are specified, the dropdown is not shown."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"placeholder"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The placeholder text shown when the input bar is empty."}),(0,s.jsx)(t.td,{children:"If not specified, the input bar uses default placeholders."})]})]})]}),"\n",(0,s.jsx)(t.h3,{id:"modalview",children:(0,s.jsx)(t.code,{children:"ModalView"})}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"<ModalView />"})," component renders a chat message feed in a modal window. It accepts the following props:"]}),"\n",(0,s.jsxs)(t.table,{children:[(0,s.jsx)(t.thead,{children:(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.th,{children:"Prop"}),(0,s.jsx)(t.th,{children:"Type"}),(0,s.jsx)(t.th,{children:"Description"}),(0,s.jsx)(t.th,{children:"Default"})]})}),(0,s.jsxs)(t.tbody,{children:[(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"className"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"A custom class name for the view container. Use this to apply custom css styles."}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"darkMode"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"boolean?"})}),(0,s.jsxs)(t.td,{children:["If ",(0,s.jsx)(t.code,{children:"true"}),", this renders in dark mode. This overrides any theme or provider ",(0,s.jsx)(t.code,{children:"darkMode"})," setting."]}),(0,s.jsxs)(t.td,{children:["The user's OS preference or theme value of ",(0,s.jsx)(t.code,{children:"darkMode"}),"."]})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"disclaimer"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"ReactNode?"})}),(0,s.jsx)(t.td,{children:"A disclaimer message shown at the top of the message feed. Can include terms of service, etc."}),(0,s.jsx)(t.td,{children:"If not specified, no disclaimer is shown."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"disclaimerHeading"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"A custom heading for the disclaimer at the top of the message feed."}),(0,s.jsx)(t.td,{children:'"Terms of Use"'})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"fatalErrorMessage"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"A custom error message shown in the input bar when an unrecoverable error has occurred."}),(0,s.jsx)(t.td,{children:'"Something went wrong. Try reloading the page and starting a new conversation."'})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"initialMessageSuggestedPrompts"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string[]?"})}),(0,s.jsx)(t.td,{children:"A list of suggested prompts that appear alongside the initial assistant message."}),(0,s.jsx)(t.td,{children:"If no prompts are specified, then no prompts are shown."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"initialMessageText"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The text content of an initial assistant message at the top of the message feed."}),(0,s.jsx)(t.td,{children:"If no text is specified, then no message is shown."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"inputBarPlaceholder"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The placeholder text shown when the input bar is empty."}),(0,s.jsx)(t.td,{children:"If not specified, the input bar uses default placeholders."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"inputBottomText"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"Text that appears immediately below the input bar."}),(0,s.jsx)(t.td,{children:"If not specified, no bottom text is shown."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"windowTitle"})}),(0,s.jsx)(t.td,{children:(0,s.jsx)(t.code,{children:"string?"})}),(0,s.jsx)(t.td,{children:"The text shown at the top of the chat window."}),(0,s.jsxs)(t.td,{children:["If not specified, this is the ",(0,s.jsx)(t.code,{children:"Chatbot.name"}),". If that's ",(0,s.jsx)(t.code,{children:"undefined"})," the window has no title."]})]})]})]})]})}function a(e={}){const{wrapper:t}={...(0,d.a)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},30817:(e,t,n)=>{n.d(t,{Z:()=>s});const s=n.p+"assets/images/ui-demo-a98c96aafb77d876d00364d1fa4510b1.gif"},11151:(e,t,n)=>{n.d(t,{Z:()=>o,a:()=>i});var s=n(67294);const d={},r=s.createContext(d);function i(e){const t=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:i(e.components),s.createElement(r.Provider,{value:t},e.children)}}}]);