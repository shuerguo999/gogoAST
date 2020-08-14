module.exports = {
    go: {
      match: "tag",
      handle(nodeContent, { parentRef, posIndex }) {
        const brotherNodes = parentRef.content.children;
        let children;
        switch (nodeContent.name) {
          case "view":
            nodeContent.name = "div";
            break;
          case "image":
            nodeContent.name = "img";
            break;
          case "block":
            children = nodeContent.children;
            brotherNodes.splice(posIndex, 1);
            children.forEach((item) => {
              brotherNodes.splice(posIndex, 0, item);
              posIndex++;
            });
            break;
          case "text":
            nodeContent.name = "span";
            break;
        }
      }
    }
  };