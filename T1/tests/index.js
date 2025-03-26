import assert from "assert";
import { greedy_snake_move } from "../build/debug.js";
// 贪吃蛇移动测试辅助函数
function greedy_snake_fn_checker(snake, food, maxTurns = 200) {
    // 复制前8个元素作为蛇的初始状态（[头x, 头y, 身体1x, 身体1y, 身体2x, 身体2y, 身体3x, 身体3y]）
    let now_snake = snake.slice(0, 8);
    let turn = 1;
    while (true) {
        const result = greedy_snake_move(now_snake, food);
        // 根据返回值计算新头部坐标：
        // result == 3: 右移, result == 1: 左移, result == 0: 上移, result == 2: 下移
        const new_head_x = now_snake[0] + (result === 3 ? 1 : 0) - (result === 1 ? 1 : 0);
        const new_head_y = now_snake[1] + (result === 0 ? 1 : 0) - (result === 2 ? 1 : 0);
        const new_snake = [
            new_head_x, new_head_y,
            now_snake[0], now_snake[1],
            now_snake[2], now_snake[3],
            now_snake[4], now_snake[5]
        ];

        // 检查是否撞墙（坐标超出 1~8）
        if (new_head_x < 1 || new_head_x > 8 || new_head_y < 1 || new_head_y > 8) {
            return -1; // 撞墙
        }
        // 检查是否撞到自己
        if ((new_head_x === new_snake[2] && new_head_y === new_snake[3]) ||
            (new_head_x === new_snake[4] && new_head_y === new_snake[5]) ||
            (new_head_x === new_snake[6] && new_head_y === new_snake[7])) {
            return -2; // 撞到自己
        }
        // 检查是否吃到食物
        if (new_head_x === food[0] && new_head_y === food[1]) {
            return turn;
        }
        now_snake = new_snake;
        if (turn >= maxTurns) {
            return -3; // 超出回合限制
        }
        turn++;
    }
}

// 定义测试用例，每个用例包含蛇的初始状态、食物位置、描述及预期结果（"success" 表示期望吃到食物，"failure" 表示预期失败）
const testCases = [
    {
        snake: [4, 4, 4, 5, 4, 6, 4, 7],
        food: [1, 1],
        description: "蛇从中间向左上角行进，测试斜向运动",
        expected: "success"
    },
    {
        snake: [1, 1, 1, 2, 1, 3, 1, 4],
        food: [1, 5],
        description: "蛇垂直向上，食物正好在前方",
        expected: "success"
    },
    {
        snake: [1, 1, 1, 2, 2, 2, 2, 1],
        food: [1, 5],
        description: "蛇呈Z字形，需要绕开自己的身体",
        expected: "success"
    },
    {
        snake: [1, 1, 2, 1, 2, 2, 1, 2],
        food: [1, 5],
        description: "蛇为方形排列，需要绕过身体去吃远处的食物",
        expected: "success"
    },
    {
        snake: [5, 5, 5, 6, 5, 7, 5, 8],
        food: [8, 8],
        description: "蛇起点在中间，食物在右下角，测试长距离路径规划",
        expected: "success"
    },
    {
        snake: [2, 2, 2, 3, 2, 4, 2, 5],
        food: [2, 1],
        description: "蛇头朝上，食物在其后方，下移即可吃到食物",
        expected: "success"
    },
    {
        snake: [8, 8, 7, 8, 6, 8, 5, 8],
        food: [8, 5],
        description: "蛇位于右上角，食物在下方，测试临近墙体时的决策",
        expected: "success"
    },
    {
        snake: [4, 4, 4, 3, 4, 2, 4, 1],
        food: [4, 8],
        description: "蛇初始向下排列，食物在远处上方，测试长距离追逐",
        expected: "success"
    },
    {
        snake: [3, 3, 3, 4, 4, 4, 4, 3],
        food: [1, 1],
        description: "蛇从中间向左上角行进，测试斜向运动,并且蛇身为正方形",
        expected: "success"
    },
];

let allPassed = true;

testCases.forEach((testCase, index) => {
    const { snake, food, description, expected } = testCase;
    const result = greedy_snake_fn_checker(snake, food);
    const passed = result >= 0;
    console.log(`\n测试用例 ${index + 1}: ${description}`);
    if (passed) {
        console.log(`  结果: 通过（回合数：${result}）`);
    } else {
        const errorMsg = result === -1 ? "蛇撞墙" :
                         result === -2 ? "蛇撞到自己" :
                         "超出回合限制";
        console.log(`  结果: 失败（${errorMsg}）`);
    }
    
    // 根据预期结果判断
    if (expected === "success" && !passed) {
        console.error(`  用例 ${index + 1} 预期通过，但测试失败`);
        allPassed = false;
    }
    if (expected === "failure" && passed) {
        console.warn(`  用例 ${index + 1} 预期失败，但测试通过`);
    }
});

// 断言所有预期通过的用例均成功
assert.strictEqual(allPassed, true, "部分测试用例未达到预期结果");
console.log("\n所有测试用例均符合预期！");
