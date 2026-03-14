// Converted from PlaceholderNode.tsx
const { DecoratorNode } = require("lexical");
const React = require("react");

// NOTE: This placeholder does not import a React component
export class PlaceholderNode extends DecoratorNode {
  static getType() {
    return "placeholder";
  }
  constructor(placeholderType, name, required, isMultiValue, options, values, key) {
    super(key);
    if (!name || name.trim() === "") {
      throw new Error("Placeholder name cannot be empty");
    }
    this.__placeholderType = placeholderType;
    this.__name = name;
    this.__required = required;
    this.__isMultiValue = isMultiValue;
    this.__options = options;
    this.__values = values;
  }
  static clone(node) {
    return new PlaceholderNode(
      node.__placeholderType,
      node.__name,
      node.__required,
      node.__isMultiValue,
      node.__options,
      node.__values,
      node.__key,
    );
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "placeholder",
      version: 1,
      name: this.__name,
      placeholderType: this.__placeholderType,
      required: this.__required,
      isMultiValue: this.__isMultiValue,
      options: this.__options,
      values: this.__values,
    };
  }
  static importJSON(serializedNode) {
    return $createPlaceholderNode(
      serializedNode.placeholderType,
      serializedNode.name,
      serializedNode.required,
      serializedNode.isMultiValue,
      serializedNode.options,
      serializedNode.values,
    );
  }
  decorate() {
    // No React component exported for now
    return React.createElement('span', { className: 'placeholder' }, this.__name);
  }
  getName() {
    return this.__name;
  }
  setName(name) {
    this.__name = name;
  }
  isRequired() {
    return this.__required;
  }
  setRequired(required) {
    this.__required = required;
  }
  isMultiValue() {
    return this.__isMultiValue;
  }
  setIsMultiValue(isMultiValue) {
    this.__isMultiValue = isMultiValue;
  }
  getOptions() {
    return this.__options;
  }
  setOptions(options) {
    this.__options = options;
  }
  getValues() {
    return this.__values;
  }
  setValues(values) {
    this.__values = Array.isArray(values) ? values : [values];
  }
  hasValue() {
    return (
      this.__values !== undefined &&
      this.__values.length > 0 &&
      this.__values.some((value) => value !== "")
    );
  }
}

export function $createPlaceholderNode(placeholderType, name, required = false, isMultiValue = false, options, values) {
  return new PlaceholderNode(
    placeholderType,
    name,
    required,
    isMultiValue,
    options,
    values
  );
}

export function $isPlaceholderNode(node) {
  return node instanceof PlaceholderNode;
}

