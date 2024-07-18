const MY_FOLDER_DATA = {
  path: "/home",
  name: "Home",
  entries: [
    {
      path: "/home/docs",
      name: "Documents",
      entries: [
        {
          path: "dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLjVEVkJ0eHYxU0NHUjlJQThqaU9xYUE_dmVyc2lvbj0x",
          name: "FirstModel.rvt",
        },
        {
          path: "dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLlRlOS1CTVV6UU8yYjZJZEZ4TDk2a3c_dmVyc2lvbj0y",
          name: "SecondModel.rvt",
        },
      ],
    },
  ],
};

class CustomTreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {
  isTreeNodeGroup(node) {
    return node.entries && node.entries.length > 0;
  }

  getTreeNodeId(node) {
    return node.path;
  }

  getTreeNodeLabel(node) {
    return node.name;
  }

  getTreeNodeClass(node) {
    node.children && node.children.length > 0 ? "group" : "leaf";
  }

  forEachChild(node, callback) {
    for (const child of node?.entries) {
      callback(child);
    }
  }

  onTreeNodeClick(tree, node, event) {
    console.log("click", tree, node, event);
    const { path } = node;

    let urn = path;
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      (doc) => {
        console.log(doc.getRoot().getDefaultGeometry());
        return NOP_VIEWER.loadDocumentNode(
          doc,
          doc.getRoot().getDefaultGeometry()
        );
      },
      (code, message, errors) => {
        console.error(code, message, errors);
        alert("Could not load model. See console for more details.");
      }
    );
  }

  onTreeNodeDoubleClick(tree, node, event) {
    console.log("double-click", tree, node, event);
  }

  onTreeNodeRightClick(tree, node, event) {
    console.log("right-click", tree, node, event);
  }

  createTreeNode(node, parent, options, type, depth) {
    const label = super.createTreeNode(node, parent, options, type, depth);
    const icon = label.previousSibling;
    const row = label.parentNode;
    // Center arrow icon
    if (icon) {
      icon.style.backgroundPositionX = "5px";
      icon.style.backgroundPositionY = "5px";
    }
    // Offset rows depending on their tree depth
    row.style.padding = `5px`;
    row.style.paddingLeft = `${5 + (type === "leaf" ? 20 : 0) + depth * 20}px`;
    return label;
  }
}

export class CustomTreeViewPanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, id, title) {
    super(viewer.container, id, title);
    this.container.classList.add("property-panel"); // Re-use some handy defaults
    this.container.dockRight = true;
    this.createScrollContainer({
      left: false,
      heightAdjustment: 70,
      marginTop: 0,
    });
    this.delegate = new CustomTreeDelegate();
    this.tree = new Autodesk.Viewing.UI.Tree(
      this.delegate,
      MY_FOLDER_DATA,
      this.scrollContainer
    );
  }
}
