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
  // 方向常量: 0=上, 1=左, 2=下, 3=右
  const UP: i32 = 0;
  const LEFT: i32 = 1;
  const DOWN: i32 = 2;
  const RIGHT: i32 = 3;
  
  // 获取蛇头坐标
  const headX = snake[0];
  const headY = snake[1];
  
  // 获取第二节身体坐标，用于避免往回走
  const neckX = snake[2];
  const neckY = snake[3];
  
  // 检查蛇是否已经死亡或数据无效
  // 只有当所有坐标都是-1时才认为蛇真正死亡
  let isDead = true;
  for (let i = 0; i < 8; i++) {
    if (snake[i] != -1) {
      isDead = false;
      break;
    }
  }
  
  // 检查蛇头是否在合法范围内
  if (headX < 1 || headX > n || headY < 1 || headY > n) {
    return UP; // 如果蛇头位置不合法，输出将被忽略
  }
  
  // 如果蛇已死亡，输出将被忽略
  if (isDead) {
    return UP;
  }
  
  // 根据蛇头和第二节的位置，计算当前的移动方向
  let currentDirection: i32 = -1;
  if (headX == neckX) {
    if (headY > neckY) currentDirection = UP;
    else currentDirection = DOWN;
  } else {
    if (headX > neckX) currentDirection = RIGHT;
    else currentDirection = LEFT;
  }
  
  // 创建棋盘状态
  const board = new Int32Array(n * n);
  
  // 标记自己的蛇身（除了蛇头）
  // 蛇头可以移动到下一个位置，所以不需要标记
  for (let i = 2; i < 8; i += 2) {
    const x = snake[i];
    const y = snake[i + 1];
    if (x >= 1 && y >= 1 && x <= n && y <= n) {
      board[(y - 1) * n + (x - 1)] = 1;
    }
  }
  
  // 标记其他蛇的身体
  for (let s = 0; s < snake_num; s++) {
    for (let i = 0; i < 8; i += 2) {
      const x = other_snakes[s * 8 + i];
      const y = other_snakes[s * 8 + i + 1];
      if (x >= 1 && y >= 1 && x <= n && y <= n) {
        board[(y - 1) * n + (x - 1)] = 1;
      }
    }
  }
  
  // 标记果子位置
  for (let i = 0; i < food_num * 2; i += 2) {
    const x = foods[i];
    const y = foods[i + 1];
    if (x >= 1 && y >= 1 && x <= n && y <= n) {
      board[(y - 1) * n + (x - 1)] = 2;
    }
  }
  
  // 计算每个方向的安全性和是否有食物
  const canMove = new Int32Array(4);
  const canEat = new Int32Array(4);
  
  // 上方向
  if (headY > 1) {
    const idx = (headY - 2) * n + (headX - 1);
    canMove[UP] = (board[idx] == 0 || board[idx] == 2) ? 1 : 0;
    canEat[UP] = board[idx] == 2 ? 1 : 0;
  }
  
  // 左方向
  if (headX > 1) {
    const idx = (headY - 1) * n + (headX - 2);
    canMove[LEFT] = (board[idx] == 0 || board[idx] == 2) ? 1 : 0;
    canEat[LEFT] = board[idx] == 2 ? 1 : 0;
  }
  
  // 下方向
  if (headY < n) {
    const idx = headY * n + (headX - 1);
    canMove[DOWN] = (board[idx] == 0 || board[idx] == 2) ? 1 : 0;
    canEat[DOWN] = board[idx] == 2 ? 1 : 0;
  }
  
  // 右方向
  if (headX < n) {
    const idx = (headY - 1) * n + headX;
    canMove[RIGHT] = (board[idx] == 0 || board[idx] == 2) ? 1 : 0;
    canEat[RIGHT] = board[idx] == 2 ? 1 : 0;
  }
  
  // 不允许向与当前移动方向相反的方向移动
  // 例如，如果当前向上，则不能向下
  if (currentDirection == UP) canMove[DOWN] = 0;
  if (currentDirection == DOWN) canMove[UP] = 0;
  if (currentDirection == LEFT) canMove[RIGHT] = 0;
  if (currentDirection == RIGHT) canMove[LEFT] = 0;
  
  // 优先级1：如果能吃到食物，就朝那个方向移动
  for (let dir = 0; dir < 4; dir++) {
    if (canEat[dir] == 1 && canMove[dir] == 1) {
      return dir;
    }
  }
  
  // 计算每个方向到最近食物的距离
  const distances = new Int32Array(4).fill(n * n);
  
  for (let i = 0; i < food_num; i++) {
    const foodX = foods[i * 2];
    const foodY = foods[i * 2 + 1];
    
    if (foodX < 1 || foodY < 1 || foodX > n || foodY > n) continue;
    
    // 只计算安全方向的距离
    if (canMove[UP]) {
      const dist = abs(headX - foodX) + abs((headY - 1) - foodY);
      distances[UP] = min(distances[UP], dist);
    }
    
    if (canMove[LEFT]) {
      const dist = abs((headX - 1) - foodX) + abs(headY - foodY);
      distances[LEFT] = min(distances[LEFT], dist);
    }
    
    if (canMove[DOWN]) {
      const dist = abs(headX - foodX) + abs((headY + 1) - foodY);
      distances[DOWN] = min(distances[DOWN], dist);
    }
    
    if (canMove[RIGHT]) {
      const dist = abs((headX + 1) - foodX) + abs(headY - foodY);
      distances[RIGHT] = min(distances[RIGHT], dist);
    }
  }
  
  // 优先级2：选择距离食物最近的安全方向
  let minDist = n * n;
  let bestDir = -1;
  
  for (let dir = 0; dir < 4; dir++) {
    if (canMove[dir] && distances[dir] < minDist) {
      minDist = distances[dir];
      bestDir = dir;
    }
  }
  
  if (bestDir != -1) {
    return bestDir;
  }
  
  // 优先级3：选择任何安全的方向
  for (let dir = 0; dir < 4; dir++) {
    if (canMove[dir]) {
      return dir;
    }
  }
  
  // 如果没有安全方向，选择一个不会撞墙的方向（可能会撞到蛇）
  if (headY > 1 && currentDirection != DOWN) return UP;
  if (headX > 1 && currentDirection != RIGHT) return LEFT;
  if (headY < n && currentDirection != UP) return DOWN;
  if (headX < n && currentDirection != LEFT) return RIGHT;
  
  // 如果仍然没有可行方向，随机选择一个可移动的方向（虽然这一步不应该发生）
  if (headY > 1) return UP;
  if (headX > 1) return LEFT;
  if (headY < n) return DOWN;
  if (headX < n) return RIGHT;
  
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

