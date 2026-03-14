function toProtoValue(data) {
    if (data === null || data === undefined) {
      return { nullValue: 'NULL_VALUE' };
    }
  
    if (Array.isArray(data)) {
      return {
        listValue: {
          values: data.map(toProtoValue),
        },
      };
    }
  
    if (typeof data === 'object') {
      return {
        structValue: {
          fields: Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, toProtoValue(v)])
          ),
        },
      };
    }
  
    if (typeof data === 'string') return { stringValue: data };
    if (typeof data === 'number') return { numberValue: data };
    if (typeof data === 'boolean') return { boolValue: data };
  
    return { stringValue: String(data) };
  }
  
  module.exports = { toProtoValue };
  