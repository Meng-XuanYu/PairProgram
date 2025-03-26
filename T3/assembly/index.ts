// The entry file of your WebAssembly module.

export function greedy_snake_step(
  n: i32,                // 棋盘大小 n×n
  snake: Int32Array,     // 自己的蛇身坐标
  snake_num: i32,        // 其他蛇的数量
  other_snakes: Int32Array, // 其他蛇的坐标
  food_num: i32,         // 果子的数量
  foods: Int32Array,     // 果子的坐标
  round: i32             // 剩余回合数
): i32 {
  // 方向常量: 0=上(+y), 1=左(-x), 2=下(-y), 3=右(+x)
  const UP: i32 = 0;    // +y方向
  const LEFT: i32 = 1;  // -x方向
  const DOWN: i32 = 2;  // -y方向
  const RIGHT: i32 = 3; // +x方向
  
  // 获取蛇头坐标
  const headX = snake[0];
  const headY = snake[1];
  
  // 获取第二节身体坐标，用于避免往回走
  const neckX = snake[2];
  const neckY = snake[3];
  
  // 检查蛇是否已经死亡 (坐标为-1)
  if (headX == -1 && headY == -1) {
    return UP; // 如果蛇已死亡，输出将被忽略
  }
  
  // 根据蛇头和第二节的位置，计算当前的移动方向
  let currentDirection: i32 = -1;
  if (headX == neckX) {
    if (headY > neckY) currentDirection = UP;    // 头在上，方向向上
    else currentDirection = DOWN;                // 头在下，方向向下
  } else {
    if (headX > neckX) currentDirection = RIGHT; // 头在右，方向向右
    else currentDirection = LEFT;                // 头在左，方向向左
  }
  
  // 创建棋盘状态
  // 0=空格, 1=蛇身, 2=食物, 3=其他蛇头
  const board = new Int32Array(n * n);
  
  // 标记自己的蛇身（除了蛇头）
  for (let i = 2; i < 8; i += 2) {
    const x = snake[i];
    const y = snake[i + 1];
    // 跳过无效坐标（可能是蛇尾部的空位）
    if (x < 1 || y < 1 || x > n || y > n || x == -1 || y == -1) continue;
    
    board[(y - 1) * n + (x - 1)] = 1; // 1表示蛇身
  }
  
  // 标记其他蛇的身体和头部
  for (let s = 0; s < snake_num; s++) {
    // 获取其他蛇的头部坐标
    const otherHeadX = other_snakes[s * 8];
    const otherHeadY = other_snakes[s * 8 + 1];
    
    // 检查其他蛇是否已经死亡（坐标为-1）
    if (otherHeadX == -1 && otherHeadY == -1) {
      continue; // 跳过已死亡的蛇
    }
    
    // 标记其他蛇的头部为3（特殊处理）
    if (otherHeadX >= 1 && otherHeadY >= 1 && otherHeadX <= n && otherHeadY <= n) {
      board[(otherHeadY - 1) * n + (otherHeadX - 1)] = 3; // 3表示其他蛇头
    }
    
    // 标记其他蛇的身体（除了头部）
    for (let i = 2; i < 8; i += 2) {
      const x = other_snakes[s * 8 + i];
      const y = other_snakes[s * 8 + i + 1];
      // 跳过无效坐标
      if (x < 1 || y < 1 || x > n || y > n || x == -1 || y == -1) continue;
      
      board[(y - 1) * n + (x - 1)] = 1; // 1表示障碍物（蛇身）
    }
  }
  
  // 标记果子位置
  for (let i = 0; i < food_num * 2; i += 2) {
    const x = foods[i];
    const y = foods[i + 1];
    // 检查坐标有效性
    if (x < 1 || y < 1 || x > n || y > n) continue;
    
    const idx = (y - 1) * n + (x - 1);
    // 果子优先级低于蛇身，高于蛇头（同位置碰撞规则）
    if (board[idx] != 1) {
      board[idx] = 2; // 2表示食物
    }
  }
  
  // 计算每个方向的安全性和是否有食物
  const canMove = new Int32Array(4);
  const canEat = new Int32Array(4);
  const willDie = new Int32Array(4); // 标记移动后是否会死亡
  
  // 上方向 (+y)
  if (headY < n) { // 检查不会超出上边界
    const idx = headY * n + (headX - 1); // 上方向坐标：(headX, headY+1)
    const cellValue = board[idx];
    // 可以移动到空格或食物位置
    canMove[UP] = (cellValue == 0 || cellValue == 2 || cellValue == 3) ? 1 : 0;
    // 如果目标位置是其他蛇头或蛇身，标记为危险位置
    willDie[UP] = (cellValue == 1 || cellValue == 3) ? 1 : 0;
    canEat[UP] = cellValue == 2 ? 1 : 0;
  } else {
    // 超出边界，不能移动
    canMove[UP] = 0;
    willDie[UP] = 1; // 会死亡
  }
  
  // 左方向 (-x)
  if (headX > 1) { // 检查不会超出左边界
    const idx = (headY - 1) * n + (headX - 2); // 左方向坐标：(headX-1, headY)
    const cellValue = board[idx];
    canMove[LEFT] = (cellValue == 0 || cellValue == 2 || cellValue == 3) ? 1 : 0;
    willDie[LEFT] = (cellValue == 1 || cellValue == 3) ? 1 : 0;
    canEat[LEFT] = cellValue == 2 ? 1 : 0;
  } else {
    canMove[LEFT] = 0;
    willDie[LEFT] = 1;
  }
  
  // 下方向 (-y)
  if (headY > 1) { // 检查不会超出下边界
    const idx = (headY - 2) * n + (headX - 1); // 下方向坐标：(headX, headY-1)
    const cellValue = board[idx];
    canMove[DOWN] = (cellValue == 0 || cellValue == 2 || cellValue == 3) ? 1 : 0;
    willDie[DOWN] = (cellValue == 1 || cellValue == 3) ? 1 : 0;
    canEat[DOWN] = cellValue == 2 ? 1 : 0;
  } else {
    canMove[DOWN] = 0;
    willDie[DOWN] = 1;
  }
  
  // 右方向 (+x)
  if (headX < n) { // 检查不会超出右边界
    const idx = (headY - 1) * n + headX; // 右方向坐标：(headX+1, headY)
    const cellValue = board[idx];
    canMove[RIGHT] = (cellValue == 0 || cellValue == 2 || cellValue == 3) ? 1 : 0;
    willDie[RIGHT] = (cellValue == 1 || cellValue == 3) ? 1 : 0;
    canEat[RIGHT] = cellValue == 2 ? 1 : 0;
  } else {
    canMove[RIGHT] = 0;
    willDie[RIGHT] = 1;
  }
  
  // 不允许向与当前移动方向相反的方向移动（防止直接撞上自己的第二节身体）
  if (currentDirection == UP) canMove[DOWN] = 0;
  if (currentDirection == DOWN) canMove[UP] = 0;
  if (currentDirection == LEFT) canMove[RIGHT] = 0;
  if (currentDirection == RIGHT) canMove[LEFT] = 0;
  
  // 优先级1：如果能吃到食物且不会死亡，就朝那个方向移动
  for (let dir = 0; dir < 4; dir++) {
    if (canEat[dir] == 1 && canMove[dir] == 1 && willDie[dir] == 0) {
      return dir;
    }
  }
  
  // 优先级2：如果能吃到食物（即使可能死亡），也尝试移动
  // 这是一个冒险策略，在某些情况下可能值得
  if (round < 10) { // 只在剩余回合较少时采取冒险策略
    for (let dir = 0; dir < 4; dir++) {
      if (canEat[dir] == 1 && canMove[dir] == 1) {
        return dir;
      }
    }
  }
  
  // 计算每个安全方向到最近食物的距离
  const distances = new Int32Array(4).fill(n * n);
  
  for (let i = 0; i < food_num * 2; i += 2) {
    const foodX = foods[i];
    const foodY = foods[i + 1];
    
    if (foodX < 1 || foodY < 1 || foodX > n || foodY > n) continue;
    
    // 只计算安全方向（不会死亡）的距离
    if (canMove[UP] && willDie[UP] == 0) {
      const dist = abs(headX - foodX) + abs((headY + 1) - foodY); // 上：+y
      distances[UP] = min(distances[UP], dist);
    }
    
    if (canMove[LEFT] && willDie[LEFT] == 0) {
      const dist = abs((headX - 1) - foodX) + abs(headY - foodY); // 左：-x
      distances[LEFT] = min(distances[LEFT], dist);
    }
    
    if (canMove[DOWN] && willDie[DOWN] == 0) {
      const dist = abs(headX - foodX) + abs((headY - 1) - foodY); // 下：-y
      distances[DOWN] = min(distances[DOWN], dist);
    }
    
    if (canMove[RIGHT] && willDie[RIGHT] == 0) {
      const dist = abs((headX + 1) - foodX) + abs(headY - foodY); // 右：+x
      distances[RIGHT] = min(distances[RIGHT], dist);
    }
  }
  
  // 优先级3：选择距离食物最近的安全方向（不会死亡）
  let minDist = n * n;
  let bestDir = -1;
  
  for (let dir = 0; dir < 4; dir++) {
    if (canMove[dir] && willDie[dir] == 0 && distances[dir] < minDist) {
      minDist = distances[dir];
      bestDir = dir;
    }
  }
  
  if (bestDir != -1) {
    return bestDir;
  }
  
  // 优先级4：选择任何安全方向（不会死亡）
  for (let dir = 0; dir < 4; dir++) {
    if (canMove[dir] && willDie[dir] == 0) {
      return dir;
    }
  }
  
  // 优先级5：没有安全的方向，选择任何可以移动的方向（即使可能死亡）
  for (let dir = 0; dir < 4; dir++) {
    if (canMove[dir]) {
      return dir;
    }
  }
  
  // 如果没有安全方向，选择一个不会撞墙的方向（可能会撞到蛇）
  if (headY < n && currentDirection != DOWN) return UP;    // 向上 (+y)
  if (headX > 1 && currentDirection != RIGHT) return LEFT; // 向左 (-x)
  if (headY > 1 && currentDirection != UP) return DOWN;    // 向下 (-y)
  if (headX < n && currentDirection != LEFT) return RIGHT; // 向右 (+x)
  
  // 如果仍然没有可行方向，随机选择一个方向作为最后的尝试
  if (headY < n) return UP;    // 向上 (+y)
  if (headX > 1) return LEFT;  // 向左 (-x)
  if (headY > 1) return DOWN;  // 向下 (-y)
  if (headX < n) return RIGHT; // 向右 (+x)
  
  return UP; // 最后的默认选择
}

// 辅助函数：计算绝对值
function abs(x: i32): i32 {
  return x < 0 ? -x : x;
}

// 辅助函数：取较小值
function min(a: i32, b: i32): i32 {
  return a < b ? a : b;
}

