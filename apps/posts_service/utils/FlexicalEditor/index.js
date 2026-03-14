// utils/FlexicalEditor.js
const { ListItemNode, ListNode } = require('@lexical/list');
const { HeadingNode, QuoteNode ,HorizontalRuleNode} = require('@lexical/rich-text');
const { TableNode, TableCellNode, TableRowNode } = require('@lexical/table');
const { LinkNode, AutoLinkNode } = require('@lexical/link');
const { CodeNode, CodeHighlightNode } = require('@lexical/code');
// const { ImageNode } = require('./nodes/ImageNode');
const { YouTubeNode } = require('./nodes/YouTubeNode');

const nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
  // ImageNode,
  YouTubeNode
];

module.exports = { nodes };