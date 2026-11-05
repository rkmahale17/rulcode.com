export const generateId = () => Math.random().toString(36).substring(2, 9);

const baseElement = () => ({
  version: 1,
  versionNonce: Math.floor(Math.random() * 1000000000),
  isDeleted: false,
  fillStyle: "hachure",
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  angle: 0,
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  seed: Math.floor(Math.random() * 1000000000),
  groupIds: [],
  boundElements: [],
  locked: false,
  link: null,
});

export const createTextElement = (
  x: number,
  y: number,
  text: string,
  width: number = 20,
  height: number = 25
) => {
  const id = generateId();
  return {
    ...baseElement(),
    id,
    type: "text",
    x,
    y,
    width,
    height,
    text,
    originalText: text,
    fontSize: 20,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    baseline: 18,
    strokeColor: "#1e1e1e",
  };
};

export const createRectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  text?: string,
  backgroundColor: string = "transparent"
) => {
  const rectId = generateId();
  const elements: any[] = [];
  const groupId = generateId();

  const rect: any = {
    ...baseElement(),
    id: rectId,
    type: "rectangle",
    x,
    y,
    width,
    height,
    strokeSharpness: "sharp",
    backgroundColor,
    groupIds: [groupId],
  };

  elements.push(rect);

  if (text) {
    const textEl: any = createTextElement(
      x + width / 2 - (text.length * 6),
      y + height / 2 - 12,
      text
    );
    textEl.groupIds = [groupId];
    elements.push(textEl);
  }

  return elements;
};

export const createEllipse = (
  x: number,
  y: number,
  width: number,
  height: number,
  text?: string,
  backgroundColor: string = "transparent"
) => {
  const ellipseId = generateId();
  const elements: any[] = [];
  const groupId = generateId();

  const ellipse: any = {
    ...baseElement(),
    id: ellipseId,
    type: "ellipse",
    x,
    y,
    width,
    height,
    strokeSharpness: "round",
    backgroundColor,
    groupIds: [groupId],
  };

  elements.push(ellipse);

  if (text) {
    const textEl: any = createTextElement(
      x + width / 2 - (text.length * 6),
      y + height / 2 - 12,
      text
    );
    textEl.groupIds = [groupId];
    elements.push(textEl);
  }

  return elements;
};

export const createArrow = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  label?: string
) => {
  const id = generateId();
  const groupId = generateId();
  const elements: any[] = [];

  const dx = endX - startX;
  const dy = endY - startY;

  const arrow = {
    ...baseElement(),
    id,
    type: "arrow",
    x: startX,
    y: startY,
    width: Math.abs(dx),
    height: Math.abs(dy),
    points: [
      [0, 0],
      [dx, dy],
    ],
    startBinding: null,
    endBinding: null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: "arrow",
    strokeSharpness: "round",
    groupIds: label ? [groupId] : [],
  };

  elements.push(arrow);

  if (label) {
    const textEl = createTextElement(startX + dx / 2, startY + dy / 2 - 20, label);
    textEl.groupIds = [groupId];
    elements.push(textEl);
  }

  return elements;
};

// DSA Specific Generators

export const generateArrayElements = (startX: number, startY: number, length: number = 4) => {
  const elements: any[] = [];
  const cellWidth = 60;
  const cellHeight = 60;
  const groupId = generateId();
  const defaultValues = [1, 2, 3, 4, 5, 6];

  for (let i = 0; i < length; i++) {
    const val = defaultValues[i] !== undefined ? defaultValues[i] : 0;
    const rectEls = createRectangle(
      startX + i * cellWidth,
      startY,
      cellWidth,
      cellHeight,
      `${val}`
    );
    // group the whole array
    rectEls.forEach((el) => el.groupIds.push(groupId));
    
    // Add indices below
    const indexText = createTextElement(
      startX + i * cellWidth + cellWidth / 2 - 5,
      startY + cellHeight + 10,
      `${i}`
    );
    indexText.fontSize = 16;
    indexText.strokeColor = "#888888";
    indexText.groupIds.push(groupId);
    
    elements.push(...rectEls, indexText);
  }

  return elements;
};

export const generateLinkedListElements = (startX: number, startY: number, length: number = 4) => {
  const elements: any[] = [];
  const nodeWidth = 80;
  const nodeHeight = 50;
  const spacing = 60;
  const groupId = generateId();
  const defaultValues = [1, 2, 3, 4, 5];

  for (let i = 0; i < length; i++) {
    const x = startX + i * (nodeWidth + spacing);
    const val = defaultValues[i] !== undefined ? defaultValues[i] : 0;
    
    // Node Box
    const rectEls = createRectangle(x, startY, nodeWidth, nodeHeight, `${val}`);
    
    // Split line for 'next' pointer
    const line = {
      ...baseElement(),
      id: generateId(),
      type: "line",
      x: x + 50,
      y: startY,
      width: 0,
      height: nodeHeight,
      points: [[0, 0], [0, nodeHeight]],
      strokeSharpness: "sharp",
    };

    const nodeElements = [...rectEls, line];
    nodeElements.forEach(el => el.groupIds.push(groupId));
    elements.push(...nodeElements);

    // Arrow to next node
    if (i < length - 1) {
      const arrowEls = createArrow(
        x + nodeWidth - 15,
        startY + nodeHeight / 2,
        x + nodeWidth + spacing,
        startY + nodeHeight / 2
      );
      arrowEls.forEach(el => el.groupIds.push(groupId));
      elements.push(...arrowEls);
    } else {
      // Null pointer
      const nullText = createTextElement(
        x + nodeWidth + 20,
        startY + nodeHeight / 2 - 10,
        "null"
      );
      nullText.groupIds.push(groupId);
      elements.push(nullText);
      
      const arrowEls = createArrow(
        x + nodeWidth - 15,
        startY + nodeHeight / 2,
        x + nodeWidth + 15,
        startY + nodeHeight / 2
      );
      arrowEls.forEach(el => el.groupIds.push(groupId));
      elements.push(...arrowEls);
    }
  }

  return elements;
};

export const generateBinaryTreeElements = (startX: number, startY: number) => {
  const elements: any[] = [];
  const groupId = generateId();
  const radius = 50;

  const positions = [
    { id: 1, x: startX, y: startY, label: "1" },
    { id: 2, x: startX - 80, y: startY + 80, label: "2" },
    { id: 3, x: startX + 80, y: startY + 80, label: "3" },
    { id: 4, x: startX - 120, y: startY + 160, label: "4" },
    { id: 5, x: startX - 40, y: startY + 160, label: "5" },
    { id: 6, x: startX + 40, y: startY + 160, label: "6" },
    { id: 7, x: startX + 120, y: startY + 160, label: "7" },
  ];

  const edges = [
    [1, 2], [1, 3],
    [2, 4], [2, 5],
    [3, 6], [3, 7]
  ];

  // Draw edges first so they are behind nodes
  edges.forEach(([fromId, toId]) => {
    const from = positions.find(p => p.id === fromId)!;
    const to = positions.find(p => p.id === toId)!;
    const arrowEls = createArrow(
      from.x + radius / 2,
      from.y + radius,
      to.x + radius / 2,
      to.y
    );
    arrowEls.forEach(el => el.groupIds.push(groupId));
    elements.push(...arrowEls);
  });

  // Draw nodes
  positions.forEach(pos => {
    const nodeEls = createEllipse(pos.x, pos.y, radius, radius, pos.label, "#eef2ff");
    nodeEls.forEach(el => el.groupIds.push(groupId));
    elements.push(...nodeEls);
  });

  return elements;
};

export const generateGraphElements = (startX: number, startY: number) => {
  const elements: any[] = [];
  const groupId = generateId();
  const radius = 60;

  const positions = [
    { id: 1, x: startX, y: startY, label: "A" },
    { id: 2, x: startX - 100, y: startY + 100, label: "B" },
    { id: 3, x: startX + 100, y: startY + 100, label: "C" },
    { id: 4, x: startX, y: startY + 200, label: "D" },
  ];

  const edges = [
    [1, 2], [1, 3],
    [2, 3], [2, 4],
    [3, 4]
  ];

  edges.forEach(([fromId, toId]) => {
    const from = positions.find(p => p.id === fromId)!;
    const to = positions.find(p => p.id === toId)!;
    const arrowEls = createArrow(
      from.x + radius / 2,
      from.y + radius / 2,
      to.x + radius / 2,
      to.y + radius / 2
    );
    arrowEls.forEach(el => el.groupIds.push(groupId));
    elements.push(...arrowEls);
  });

  positions.forEach(pos => {
    const nodeEls = createEllipse(pos.x, pos.y, radius, radius, pos.label, "#fce4ec");
    nodeEls.forEach(el => el.groupIds.push(groupId));
    elements.push(...nodeEls);
  });
  
  return elements;
};

export const generatePointerElement = (x: number, y: number, label: string = "i") => {
  const elements = createArrow(x, y + 60, x, y, label);
  const groupId = generateId();
  elements.forEach(el => el.groupIds.push(groupId));
  return elements;
};

export const generateHighlightBox = (x: number, y: number, width: number = 60, height: number = 60) => {
  const rectEls = createRectangle(x, y, width, height, "", "#ffecb3");
  rectEls.forEach(el => {
    el.opacity = 50;
    el.strokeColor = "transparent";
  });
  return rectEls;
};
