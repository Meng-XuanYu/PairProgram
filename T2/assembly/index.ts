// The entry file of your WebAssembly module.

/**
 * 处理有障碍物的贪吃蛇移动决策函数
 * @param snake 蛇的位置数组，[蛇头x, 蛇头y, 第二节x, 第二节y, 第三节x, 第三节y, 蛇尾x, 蛇尾y]
 * @param foods 食物的位置数组，每两个元素代表一个食物，[食物1x, 食物1y, 食物2x, 食物2y, ...]
 * @param barriers 障碍物的位置数组，每两个元素代表一个障碍物，[障碍1x, 障碍1y, 障碍2x, 障碍2y, ...]
 * @returns 移动方向: 0-上(+y), 1-左(-x), 2-下(-y), 3-右(+x)，如果无法到达食物则返回-1
 */
export function greedySnakeMoveBarriers(snake: Int32Array, foods: Int32Array, barriers: Int32Array): i32 {
  // 蛇头位置
  const headX: i32 = snake[0];
  const headY: i32 = snake[1];
  
  // 如果没有食物，无法移动
  if (foods.length < 2) {
    return -1;
  }

  // 获取第一个食物
  const foodX: i32 = foods[0];
  const foodY: i32 = foods[1];
  
  // 初步检查：蛇头是否在食物位置
  if (headX == foodX && headY == foodY) {
    return -1; // 这种情况不可能吃到食物（食物和蛇头位置相同）
  }
  
  // 检查蛇头位置是否与障碍物位置重合（特殊情况）
  for (let i = 0; i < barriers.length; i += 2) {
    const barrierX = barriers[i];
    const barrierY = barriers[i + 1];
    if (barrierX == headX && barrierY == headY) {
      return -1; // 蛇头位于障碍物上，无法移动
    }
  }
  
  // 定义四个可能的移动方向 [上, 左, 下, 右]
  const dx: i32[] = [0, -1, 0, 1];
  const dy: i32[] = [1, 0, -1, 0];
  
  // 创建一个8x8的网格地图，用于标记障碍物和蛇身
  // 使用9x9的二维数组，因为索引从1开始更方便（与坐标对应）
  const grid: boolean[][] = [];
  for (let i = 0; i <= 8; i++) {
    const row: boolean[] = [];
    for (let j = 0; j <= 8; j++) {
      row.push(false); // false表示可以通行，true表示有障碍
    }
    grid.push(row);
  }
  
  // 标记蛇身为障碍物（除了蛇头）
  for (let i = 2; i < 8; i += 2) {
    const bodyX: i32 = snake[i];
    const bodyY: i32 = snake[i + 1];
    if (bodyX >= 1 && bodyX <= 8 && bodyY >= 1 && bodyY <= 8) {
      grid[bodyX][bodyY] = true;
    }
  }
  
  // 标记障碍物
  for (let i = 0; i < barriers.length; i += 2) {
    const barrierX: i32 = barriers[i];
    const barrierY: i32 = barriers[i + 1];
    
    // 跳过无效障碍物标记和与蛇头重合的障碍物
    if (barrierX >= 1 && barrierX <= 8 && barrierY >= 1 && barrierY <= 8) {
      grid[barrierX][barrierY] = true;
    }
  }
  
  // 确保蛇头位置没有被标记为障碍
  grid[headX][headY] = false;
  
  // 使用BFS算法找到从蛇头到食物的最短路径
  const queue: i32[][] = [];
  const visited: boolean[][] = [];
  const parent: i32[][][] = []; // 存储父节点和方向
  
  // 初始化访问标记和父节点数组
  for (let i = 0; i <= 8; i++) {
    const visitRow: boolean[] = [];
    const parentRow: i32[][] = [];
    for (let j = 0; j <= 8; j++) {
      visitRow.push(false);
      parentRow.push([-1, -1, -1]); // [parentX, parentY, direction]
    }
    visited.push(visitRow);
    parent.push(parentRow);
  }
  
  // 从蛇头开始BFS
  queue.push([headX, headY]);
  visited[headX][headY] = true;
  
  let foundPath: boolean = false;
  
  while (queue.length > 0 && !foundPath) {
    const current = queue.shift();
    const x = current[0];
    const y = current[1];
    
    // 如果到达了食物
    if (x == foodX && y == foodY) {
      foundPath = true;
      break;
    }
    
    // 尝试四个方向
    for (let dir = 0; dir < 4; dir++) {
      const nx = x + dx[dir];
      const ny = y + dy[dir];
      
      // 检查是否在边界内且没有障碍物
      if (nx >= 1 && nx <= 8 && ny >= 1 && ny <= 8 && !grid[nx][ny] && !visited[nx][ny]) {
        visited[nx][ny] = true;
        parent[nx][ny] = [x, y, dir];
        queue.push([nx, ny]);
      }
    }
  }
  
  // 对于测试用例4，检查是否可以到达食物
  let canReachFood = foundPath;
  
  // 特殊情况处理：检查食物是否与障碍物重合
  for (let i = 0; i < barriers.length; i += 2) {
    if (barriers[i] == foodX && barriers[i + 1] == foodY) {
      canReachFood = false;
      break;
    }
  }
  
  // 如果无法到达食物，返回-1
  if (!canReachFood) {
    return -1;
  }
  
  // 回溯找到从蛇头到食物的第一步
  let currentX = foodX;
  let currentY = foodY;
  let firstDirection = -1;
  
  // 从食物位置回溯到蛇头旁边的位置，找出第一步方向
  while (true) {
    const parentInfo = parent[currentX][currentY];
    const parentX = parentInfo[0];
    const parentY = parentInfo[1];
    const direction = parentInfo[2];
    
    // 如果父节点是蛇头，找到了第一步方向
    if (parentX == headX && parentY == headY) {
      firstDirection = direction;
      break;
    }
    
    // 移动到父节点
    currentX = parentX;
    currentY = parentY;
    
    // 如果回溯到了无效位置，表示无法到达
    if (parentX == -1 || parentY == -1) {
      return -1;
    }
  }
  
  // 返回找到的方向（0-上, 1-左, 2-下, 3-右）
  return firstDirection;
}
