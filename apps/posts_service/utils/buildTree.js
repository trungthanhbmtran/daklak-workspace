export const buildTree = (list) => {
    const root = [];
    const stack = [];

    list.forEach(node => {
        node.children = [];

        if (!stack.length) {
            root.push(node);
            stack.push(node);
            return;
        }

        while (stack.length && node.lft > stack[stack.length - 1].rgt) {
            stack.pop();
        }

        if (stack.length) {
            const parent = stack[stack.length - 1];
            parent.children.push(node);
        } else {
            root.push(node);
        }

        stack.push(node);
    });

    return root;
};
