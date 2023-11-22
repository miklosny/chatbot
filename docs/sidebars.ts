import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  main: ["index", "quick-start", "mongodb",{
    type: 'category',
    label: 'Data Ingest CLI',
    collapsible: false,
    collapsed: false,
    items: ["ingest/configure", "ingest/configuration-reference","ingest/command-reference", "ingest/data-sources", "ingest/fine-tune"]
  }, {
    type: 'category',
    label: 'Chat Server',
    collapsible: false,
    collapsed: false,
    items: ["server/configure", {
      type: "link",
      label: "OpenAPI Spec",
      href: "/server/openapi",
    }]
  }, "ui"],
};

export default sidebars;
