import assert from "assert";
import { greedySnakeMoveBarriers } from "../build/debug.js";

// 带障碍物的贪吃蛇测试函数
function greedy_snake_barriers_checker(initial_snake, food_num, foods, barriers, access) {
    if (initial_snake.length !== 8) throw "Invalid snake length";
    
    let current_snake = [...initial_snake];
    let current_foods = [...foods];
    const barriers_list = [];
    for (let i = 0; i < barriers.length; i += 2) {
        const x = barriers[i];
        const y = barriers[i + 1];
        if (x !== -1 && y !== -1) {
            barriers_list.push({ x, y });
        }
    }
    let turn = 1;

    while (turn <= 200) {
        const direction = greedySnakeMoveBarriers(current_snake, current_foods, barriers);

        if (access === 0) {
            // 预期不可达时，若返回方向不为-1，则测试失败
            if (direction !== -1) {
                return -5; // 预期不可达但返回了移动方向
            } else {
                return 1; // 预期不可达且正确返回-1
            }
        }

        // 无效方向
        if (direction < 0 || direction > 3) return -4; 

        let new_snake = [
            current_snake[0] + (direction == 3) - (direction == 1),
            current_snake[1] + (direction == 0) - (direction == 2),
            current_snake[0],
            current_snake[1],
            current_snake[2],
            current_snake[3],
            current_snake[4],
            current_snake[5],
        ];

        // 超出边界
        if (new_snake[0] < 1 || new_snake[0] > 8 || new_snake[1] < 1 || new_snake[1] > 8) return -1;

        // 撞到障碍物
        if (barriers_list.some(ob => ob.x === new_snake[0] && ob.y === new_snake[1])) return -2;

        // 检查是否吃到食物
        let ate_index = -1;
        for (let i = 0; i < current_foods.length; i += 2) {
            if (new_snake[0] === current_foods[i] && new_snake[1] === current_foods[i + 1]) {
                ate_index = i;
                break;
            }
        }
        
        if (ate_index !== -1) {
            console.log(`第 ${turn} 回合吃到食物！坐标：(${current_foods[ate_index]},${current_foods[ate_index+1]})`);
            current_foods.splice(ate_index, 2);
            food_num -= 1;
        }

        if (food_num === 0) {
            console.log("总回合数: " + turn);
            return turn; 
        }
        
        current_snake = new_snake;
        turn++;
    }
    
    // 超时
    return -3; 
}

// 测试用例
const testCases = [
    {
        snake: [4, 4, 4, 3, 4, 2, 4, 1],
        food_num: 1,
        foods: [4, 5],
        barriers: [5, 4, 8, 8, 8, 7, 8, 6, 8, 5, 8, 4, 8, 3, 8, 2, 8, 1, 7, 8, 7, 7, 7, 6],
        access: 1,
        description: "食物在蛇头上方，有障碍物但可达",
        expected: "success"
    },
    {
        snake: [1, 4, 1, 3, 1, 2, 1, 1],
        food_num: 1,
        foods: [5, 5],
        barriers: [2, 7, 2, 6, 3, 7, 3, 6, 4, 6, 5, 6, 6, 6, 7, 6, 4, 5, 4, 4, 4, 3, 5, 4],
        access: 1,
        description: "蛇需要绕过多个障碍物到达食物",
        expected: "success"
    },
    {
        snake: [1, 4, 1, 3, 1, 2, 1, 1],
        food_num: 1,
        foods: [1, 7],
        barriers: [2, 7, 2, 6, 3, 7, 3, 6, 4, 7, 4, 6, 5, 7, 5, 6, 1, 6, 6, 6, 7, 6, 8, 6],
        access: 0,
        description: "食物被障碍物完全围住，不可达",
        expected: "unreachable"
    },
    {
        snake: [3, 3, 3, 4, 4, 4, 4, 3],
        food_num: 1,
        foods: [1, 1],
        barriers: [1, 2, 2, 2, 3, 2, 3, 3, 4, 3, 5, 3],
        access: 0,
        description: "蛇被障碍物围住，无法到达食物",
        expected: "unreachable"
    },
    {
        snake: [2, 2, 2, 3, 2, 4, 2, 5],
        food_num: 1,
        foods: [5, 5],
        barriers: [3, 5, 3, 6, 3, 7],
        access: 1,
        description: "蛇能够绕过障碍物到达食物",
        expected: "success"
    }
];

let allPassed = true;

testCases.forEach((testCase, index) => {
    const { snake, food_num, foods, barriers, access, description, expected } = testCase;
    const result = greedy_snake_barriers_checker(snake, food_num, foods, barriers, access);
    
    console.log(`\n测试用例 ${index + 1}: ${description}`);
    
    if (access === 0) {
        // 对于不可达的测试用例，返回1表示成功
        if (result === 1) {
            console.log(`  结果: 通过（正确识别不可达）`);
        } else if (result === -5) {
            console.error(`  错误: 预期不可达，但函数未返回-1`);
            allPassed = false;
        } else {
            console.error(`  错误: 未知结果 ${result}`);
            allPassed = false;
        }
    } else {
        // 对于可达的测试用例，结果大于0表示成功
        if (result > 0) {
            console.log(`  结果: 通过（回合数：${result}）`);
        } else {
            const errorMsg = result === -1 ? "蛇撞墙" :
                         result === -2 ? "蛇撞到障碍物" :
                         result === -3 ? "超出回合限制" :
                         result === -4 ? "返回了无效的移动方向" :
                         "未知错误";
            
            console.error(`  错误: ${errorMsg}`);
            allPassed = false;
        }
    }
});

assert.strictEqual(allPassed, true, "部分测试用例未达到预期结果");
console.log("\n所有测试用例均符合预期！");
