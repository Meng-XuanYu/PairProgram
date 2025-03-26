// The entry file of your WebAssembly module.

/**
 * 决定蛇的移动方向
 * @param snake 蛇的位置数组，[蛇头x, 蛇头y, 第二节x, 第二节y, 第三节x, 第三节y, 蛇尾x, 蛇尾y]
 * @param food 食物的位置数组，[食物x, 食物y]
 * @returns 移动方向: 0-上(+y), 1-左(-x), 2-下(-y), 3-右(+x)
 */
export function greedy_snake_move(snake: Int32Array, food: Int32Array): i32 {
  // 蛇头位置
  const headX: i32 = snake[0];
  const headY: i32 = snake[1];
  
  // 食物位置
  const foodX: i32 = food[0];
  const foodY: i32 = food[1];
  
  // 计算蛇头和食物之间的曼哈顿距离
  const dx: i32 = foodX - headX;
  const dy: i32 = foodY - headY;
  
  // 可能的移动方向
  const possibleMoves = new Array<i32>(4);
  for (let i = 0; i < 4; i++) {
    possibleMoves[i] = 1; // 初始假设所有方向都可移动
  }
  
  // 检查边界 (1-8范围)
  if (headX <= 1) possibleMoves[1] = 0; // 不能向左
  if (headX >= 8) possibleMoves[3] = 0; // 不能向右
  if (headY <= 1) possibleMoves[2] = 0; // 不能向下
  if (headY >= 8) possibleMoves[0] = 0; // 不能向上
  
  // 检查是否会碰到蛇身
  const nextHeadPositions = [
    [headX, headY + 1], // 上
    [headX - 1, headY], // 左
    [headX, headY - 1], // 下
    [headX + 1, headY]  // 右
  ];
  
  // 检查每个可能的移动是否会碰到蛇身
  for (let i = 0; i < 4; i++) {
    const nx = nextHeadPositions[i][0];
    const ny = nextHeadPositions[i][1];
    
    // 检查是否会碰到蛇身（除了蛇尾，因为蛇尾会移动）
    for (let j = 2; j < 6; j += 2) {
      if (nx == snake[j] && ny == snake[j + 1]) {
        possibleMoves[i] = 0;
        break;
      }
    }
  }
  
  // 优先选择 x 轴或 y 轴上离食物更近的方向
  if (dx > 0 && possibleMoves[3]) return 3; // 向右
  if (dx < 0 && possibleMoves[1]) return 1; // 向左
  if (dy > 0 && possibleMoves[0]) return 0; // 向上
  if (dy < 0 && possibleMoves[2]) return 2; // 向下
  
  // 如果不能直接朝食物移动，选择任何安全方向
  for (let i = 0; i < 4; i++) {
    if (possibleMoves[i]) return i;
  }
  
  // 如果没有安全方向（这种情况不应该发生如果前面的逻辑正确），默认向上
  return 0;
}
