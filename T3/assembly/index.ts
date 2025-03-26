// The entry file of your WebAssembly module.

// 定义方向常量
// 0: 上, 1: 左, 2: 下, 3: 右
enum Direction {
  UP = 0,
  LEFT = 1,
  DOWN = 2,
  RIGHT = 3
}

// 定义坐标类型
class Point {
  x: i32;
  y: i32;

  constructor(x: i32, y: i32) {
    this.x = x;
    this.y = y;
  }

  // 判断两个点是否相等
  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }
}

/**
 * 计算两点之间的曼哈顿距离
 * @param a 第一个点
 * @param b 第二个点
 * @returns 曼哈顿距离
 */
function manhattanDistance(a: Point, b: Point): i32 {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * 检查一个点是否在棋盘内
 * @param p 要检查的点
 * @param n 棋盘大小
 * @returns 是否在棋盘内
 */
function isInBoard(p: Point, n: i32): boolean {
  return p.x >= 1 && p.x <= n && p.y >= 1 && p.y <= n;
}

/**
 * 检查一个点是否在蛇数组中
 * @param p 要检查的点
 * @param snakes 所有蛇的坐标数组
 * @returns 是否在蛇身上
 */
function isOnSnake(p: Point, snakes: Int32Array): boolean {
  const len = snakes.length;
  for (let i = 0; i < len; i += 2) {
    if (snakes[i] !== -1 && p.x == snakes[i] && p.y == snakes[i + 1]) {
      return true;
    }
  }
  return false;
}

/**
 * 检查一个点是否是蛇头
 * @param p 要检查的点
 * @param snake 蛇的坐标数组
 * @returns 是否是蛇头
 */
function isSnakeHead(p: Point, snake: Int32Array): boolean {
  return p.x === snake[0] && p.y === snake[1];
}

/**
 * 检查一个点是否在食物数组中
 * @param p 要检查的点
 * @param foods 食物的坐标数组
 * @param food_num 食物数量
 * @returns 是否是食物
 */
function isFood(p: Point, foods: Int32Array, food_num: i32): boolean {
  for (let i = 0; i < food_num; i++) {
    if (p.x === foods[i * 2] && p.y === foods[i * 2 + 1]) {
      return true;
    }
  }
  return false;
}

/**
 * 获取移动到某个方向的下一个点
 * @param p 当前点
 * @param direction 方向
 * @returns 移动后的点
 */
function getNextPoint(p: Point, direction: i32): Point {
  const next = new Point(p.x, p.y);
  
  switch (direction) {
    case Direction.UP:
      next.y += 1;
      break;
    case Direction.LEFT:
      next.x -= 1;
      break;
    case Direction.DOWN:
      next.y -= 1;
      break;
    case Direction.RIGHT:
      next.x += 1;
      break;
  }
  
  return next;
}

/**
 * 获取两点之间的方向
 * @param from 起点
 * @param to 终点
 * @returns 方向值
 */
function getDirection(from: Point, to: Point): i32 {
  // 优先考虑x轴方向
  if (from.x < to.x) {
    return Direction.RIGHT;
  } else if (from.x > to.x) {
    return Direction.LEFT;
  } else if (from.y < to.y) {
    return Direction.UP;
  } else if (from.y > to.y) {
    return Direction.DOWN;
  }
  
  // 如果两点相同，默认向上
  return Direction.UP;
}

/**
 * 检查一个方向是否安全
 * @param head 蛇头坐标
 * @param direction 要检查的方向
 * @param n 棋盘大小
 * @param allSnakes 所有蛇的坐标数组
 * @param otherSnakeHeads 其他蛇头位置
 * @returns 该方向是否安全
 */
function isSafeDirection(
  head: Point, 
  direction: i32, 
  n: i32, 
  allSnakes: Int32Array, 
  otherSnakeHeads: Array<Point>
): boolean {
  // 获取移动后的位置
  const next = getNextPoint(head, direction);
  
  // 检查是否会撞墙
  if (!isInBoard(next, n)) {
    return false;
  }
  
  // 检查是否会撞到蛇身
  if (isOnSnake(next, allSnakes)) {
    return false;
  }
  
  // 检查是否会与其他蛇头相撞（同归于尽）
  for (let i = 0; i < otherSnakeHeads.length; i++) {
    const otherHead = otherSnakeHeads[i];
    
    // 计算其他蛇可能的下一步位置
    for (let dir = 0; dir < 4; dir++) {
      const otherNext = getNextPoint(otherHead, dir);
      
      // 如果我们的下一步位置与其他蛇的下一步位置相同，会发生相撞
      if (next.equals(otherNext)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 检查移动到某个位置后的危险程度（0-10，0表示安全，10表示非常危险）
 * @param next 要检查的位置
 * @param n 棋盘大小
 * @param allSnakes 所有蛇的坐标
 * @param otherSnakeHeads 其他蛇头位置
 * @returns 危险程度
 */
function getDangerLevel(
  next: Point, 
  n: i32, 
  allSnakes: Int32Array, 
  otherSnakeHeads: Array<Point>
): i32 {
  let danger = 0;
  
  // 检查是否靠近边界，靠近边界危险度增加
  if (next.x === 1 || next.x === n || next.y === 1 || next.y === n) {
    danger += 2;
  }
  
  // 检查周围位置有多少是被蛇占据的
  let blockedDirections = 0;
  for (let dir = 0; dir < 4; dir++) {
    const p = getNextPoint(next, dir);
    if (!isInBoard(p, n) || isOnSnake(p, allSnakes)) {
      blockedDirections++;
    }
  }
  
  // 周围被占据位置越多越危险
  danger += blockedDirections * 2;
  
  // 检查是否靠近其他蛇头
  for (let i = 0; i < otherSnakeHeads.length; i++) {
    const distance = manhattanDistance(next, otherSnakeHeads[i]);
    if (distance <= 2) {
      danger += (3 - distance); // 距离为1时加2，距离为2时加1
    }
  }
  
  return danger;
}

/**
 * 寻找最近的安全食物
 * @param head 蛇头
 * @param n 棋盘大小
 * @param allSnakes 所有蛇的坐标
 * @param foods 食物坐标
 * @param food_num 食物数量
 * @returns 最近的安全食物，如果没有找到返回null
 */
function findNearestSafeFood(
  head: Point, 
  n: i32, 
  allSnakes: Int32Array, 
  foods: Int32Array, 
  food_num: i32,
  otherSnakeHeads: Array<Point>
): Point | null {
  let nearestFood: Point | null = null;
  let minDistance: i32 = i32.MAX_VALUE;
  
  for (let i = 0; i < food_num; i++) {
    const food = new Point(foods[i * 2], foods[i * 2 + 1]);
    const distance = manhattanDistance(head, food);
    
    // 路径安全性检查
    let isSafe = true;
    
    // 简单的路径检查：检查与其他蛇头的距离
    for (let j = 0; j < otherSnakeHeads.length; j++) {
      const otherHead = otherSnakeHeads[j];
      const otherDistance = manhattanDistance(otherHead, food);
      
      // 如果其他蛇离食物更近，可能不安全
      if (otherDistance < distance) {
        isSafe = false;
        break;
      }
    }
    
    // 如果是安全的并且距离最近，更新最近食物
    if (isSafe && distance < minDistance) {
      minDistance = distance;
      nearestFood = food;
    }
  }
  
  // 如果没有找到安全食物，退回到寻找最近食物
  if (nearestFood === null) {
    for (let i = 0; i < food_num; i++) {
      const food = new Point(foods[i * 2], foods[i * 2 + 1]);
      const distance = manhattanDistance(head, food);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestFood = food;
      }
    }
  }
  
  return nearestFood;
}

/**
 * 贪吃蛇移动决策函数
 * @param n 棋盘大小
 * @param snake 自己蛇的坐标
 * @param snake_num 其他蛇的数量
 * @param snakes 其他蛇的坐标
 * @param food_num 食物数量
 * @param foods 食物的坐标
 * @param round 剩余回合数
 * @returns 移动方向
 */
export function greedy_snake_step(
  n: i32, 
  snake: Int32Array, 
  snake_num: i32, 
  snakes: Int32Array, 
  food_num: i32, 
  foods: Int32Array, 
  round: i32
): i32 {
  // 检查是否已经死亡，如果死亡直接返回默认方向
  if (snake[0] === -1 && snake[1] === -1) {
    return Direction.UP;
  }
  
  // 构建蛇头
  const head = new Point(snake[0], snake[1]);
  
  // 构建所有蛇的坐标数组（包括自己）
  let totalLength = snake.length + snakes.length;
  let allSnakes = new Int32Array(totalLength);
  
  // 复制自己的蛇身
  for (let i = 0; i < snake.length; i++) {
    allSnakes[i] = snake[i];
  }
  
  // 复制其他蛇的坐标
  for (let i = 0; i < snakes.length; i++) {
    allSnakes[snake.length + i] = snakes[i];
  }
  
  // 提取其他蛇的头部位置
  const otherSnakeHeads: Array<Point> = [];
  for (let i = 0; i < snake_num; i++) {
    const headX = snakes[i * 8];
    const headY = snakes[i * 8 + 1];
    if (headX !== -1 && headY !== -1) {
      otherSnakeHeads.push(new Point(headX, headY));
    }
  }
  
  // 检查四个方向的安全性
  const safeDirections: Array<i32> = [];
  for (let dir = 0; dir < 4; dir++) {
    if (isSafeDirection(head, dir, n, allSnakes, otherSnakeHeads)) {
      safeDirections.push(dir);
    }
  }
  
  // 如果没有安全方向，选择最不危险的方向
  if (safeDirections.length === 0) {
    let bestDir = Direction.UP;
    let minDanger = i32.MAX_VALUE;
    
    for (let dir = 0; dir < 4; dir++) {
      const next = getNextPoint(head, dir);
      
      // 如果在棋盘外，跳过
      if (!isInBoard(next, n)) {
        continue;
      }
      
      // 检查该方向的危险度
      const danger = getDangerLevel(next, n, allSnakes, otherSnakeHeads);
      
      if (danger < minDanger) {
        minDanger = danger;
        bestDir = dir;
      }
    }
    
    return bestDir;
  }
  
  // 寻找最近的安全食物
  const targetFood = findNearestSafeFood(head, n, allSnakes, foods, food_num, otherSnakeHeads);
  
  if (targetFood !== null) {
    // 评估每个安全方向
    const directionScores: Array<i32> = [0, 0, 0, 0];
    
    for (let i = 0; i < safeDirections.length; i++) {
      const dir = safeDirections[i];
      const next = getNextPoint(head, dir);
      
      // 计算移动后到食物的距离
      const newDistance = manhattanDistance(next, targetFood);
      
      // 计算移动后位置的危险程度
      const danger = getDangerLevel(next, n, allSnakes, otherSnakeHeads);
      
      // 得分 = 距离减少量 - 危险度
      directionScores[dir] = (manhattanDistance(head, targetFood) - newDistance) * 2 - danger;
      
      // 如果移动后的位置是食物，加分
      if (next.equals(targetFood)) {
        directionScores[dir] += 10;
      }
      
      // 如果是当前最后几回合，更倾向于追求食物
      if (round <= 5) {
        // 在最后几回合，重视得分而不是安全
        directionScores[dir] = newDistance === 1 ? 100 : -newDistance;
      }
    }
    
    // 选择得分最高的方向
    let bestDir = safeDirections[0];
    let bestScore = directionScores[bestDir];
    
    for (let i = 1; i < safeDirections.length; i++) {
      const dir = safeDirections[i];
      if (directionScores[dir] > bestScore) {
        bestScore = directionScores[dir];
        bestDir = dir;
      }
    }
    
    return bestDir;
  }
  
  // 如果没有找到食物，采用避险策略
  let bestDir = safeDirections[0];
  let minDanger = getDangerLevel(getNextPoint(head, bestDir), n, allSnakes, otherSnakeHeads);
  
  for (let i = 1; i < safeDirections.length; i++) {
    const dir = safeDirections[i];
    const danger = getDangerLevel(getNextPoint(head, dir), n, allSnakes, otherSnakeHeads);
    
    if (danger < minDanger) {
      minDanger = danger;
      bestDir = dir;
    }
  }
  
  return bestDir;
}

