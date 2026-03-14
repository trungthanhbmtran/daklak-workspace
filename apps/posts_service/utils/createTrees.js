function CreateTree(nodes ) {
    let tree = [];
    let stack = [];

    nodes.sort((a , b ) => a.lft - b.lft);

    for (const node of nodes) {
        let item = { ...node, children: [] };

        while (stack.length > 0 && stack[stack.length - 1].rgt < node.lft) {
            stack.pop();
        }

        if (stack.length === 0) {
            tree.push(item);
        } else {
            stack[stack.length - 1].children.push(item);
        }

        stack.push(item);
    }

    return tree;
}

module.exports = {CreateTree}