// ============================================================================
// 算法技巧模板 - 位操作、矩阵变换、游戏论等
// ============================================================================

#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <cmath>

using namespace std;

// ============================================================================
// 1. 位操作技巧 (Bit Manipulation)
// ============================================================================
/*
 * 优势：
 * - 时间复杂度：O(1) 常数时间
 * - 空间优化：用单个整数存储多个二进制标志
 * - 性能：CPU 级别原生支持
 * 
 * 应用场景：
 * - 权限管理（位掩码）
 * - 快速集合操作
 * - 状态压缩
 */

class BitTricks {
public:
    // 1. 检查是否为 2 的幂：(n & (n-1)) == 0
    // 原理：2的幂的二进制表示只有一个1，如 8 = 1000, 7 = 0111
    // 1000 & 0111 = 0000，所以 (8 & 7) == 0
    static bool isPowerOfTwo(int n) {
        if (n <= 0) return false;
        return (n & (n - 1)) == 0;
    }
    
    // 2. 获取最低的1位：n & -n
    // 原理：-n 是 n 的二进制补码，按位与得到最低位的1
    // 例：6 = 0110, -6 = 1010, 0110 & 1010 = 0010 = 2
    static int lowestSetBit(int n) {
        return n & -n;
    }
    
    // 3. 移除最低的1位：n & (n-1)
    // 原理：n-1 将最低的1变成0，其后的0变成1
    // 例：6 = 0110, 5 = 0101, 0110 & 0101 = 0100 = 4
    static int removeLowestSetBit(int n) {
        return n & (n - 1);
    }
    
    // 4. 计算二进制中1的个数
    // 方法一：逐位检查（O(log n)）
    static int countSetBits_v1(int n) {
        int count = 0;
        while (n) {
            count += n & 1;
            n >>= 1;
        }
        return count;
    }
    
    // 方法二：Brian Kernighan 算法（更高效，O(个数)）
    static int countSetBits_v2(int n) {
        int count = 0;
        while (n) {
            n &= (n - 1);  // 移除最低的1位
            count++;
        }
        return count;
    }
    
    // 5. 切换特定位：n ^= (1 << i)
    static int toggleBit(int n, int pos) {
        return n ^ (1 << pos);
    }
    
    // 6. 设置特定位为1：n |= (1 << i)
    static int setBit(int n, int pos) {
        return n | (1 << pos);
    }
    
    // 7. 清除特定位为0：n &= ~(1 << i)
    static int clearBit(int n, int pos) {
        return n & ~(1 << pos);
    }
};


// ============================================================================
// 2. 矩阵变换 (Matrix Transformations)
// ============================================================================
/*
 * 常见变换：
 * - 旋转 90°
 * - 水平翻转
 * - 垂直翻转
 * - 转置
 * 
 * 应用场景：
 * - 图片处理
 * - 游戏开发（方向变换）
 * - 计算几何
 */

class MatrixTransform {
public:
    // 矩阵类型定义
    typedef vector<vector<int>> Matrix;
    
    // 1. 顺时针旋转 90 度
    // result[j][n-1-i] = grid[i][j]
    // 时间复杂度：O(n²)，空间复杂度：O(n²)
    static Matrix rotateClockwise(const Matrix& grid) {
        int n = grid.size();
        Matrix result(n, vector<int>(n));
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                result[j][n - 1 - i] = grid[i][j];
            }
        }
        return result;
    }
    
    // 2. 逆时针旋转 90 度
    // result[n-1-j][i] = grid[i][j]
    static Matrix rotateCounterClockwise(const Matrix& grid) {
        int n = grid.size();
        Matrix result(n, vector<int>(n));
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                result[n - 1 - j][i] = grid[i][j];
            }
        }
        return result;
    }
    
    // 3. 水平翻转（左右镜像）
    // result[i][j] = grid[i][n-1-j]
    static Matrix flipHorizontal(const Matrix& grid) {
        int n = grid.size();
        Matrix result(n, vector<int>(n));
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                result[i][j] = grid[i][n - 1 - j];
            }
        }
        return result;
    }
    
    // 4. 垂直翻转（上下镜像）
    // result[i][j] = grid[n-1-i][j]
    static Matrix flipVertical(const Matrix& grid) {
        int n = grid.size();
        Matrix result(n, vector<int>(n));
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                result[i][j] = grid[n - 1 - i][j];
            }
        }
        return result;
    }
    
    // 5. 转置（主对角线翻转）
    // result[j][i] = grid[i][j]
    static Matrix transpose(const Matrix& grid) {
        int n = grid.size();
        Matrix result(n, vector<int>(n));
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                result[j][i] = grid[i][j];
            }
        }
        return result;
    }
    
    // 打印矩阵
    static void print(const Matrix& grid) {
        for (const auto& row : grid) {
            for (int val : row) {
                cout << val << " ";
            }
            cout << "\n";
        }
        cout << "\n";
    }
};


// ============================================================================
// 3. 数学技巧 (Mathematical Tricks)
// ============================================================================
/*
 * 常见问题的快速解法
 */

class MathTricks {
public:
    // 1. 缺失数问题（O(n)）
    // 给定 1 到 n 的数字，缺一个，找缺失的数
    // 解法：sum(1..n) - sum(array)
    static int findMissing(const vector<int>& arr, int n) {
        long long totalSum = (long long)n * (n + 1) / 2;
        long long arraySum = 0;
        for (int x : arr) {
            arraySum += x;
        }
        return totalSum - arraySum;
    }
    
    // 2. 不进位加法（模拟加法过程）
    static int addWithoutCarry(int a, int b) {
        while (b != 0) {
            int carry = a & b;  // 计算进位
            a = a ^ b;          // 不进位加法
            b = carry << 1;     // 进位左移
        }
        return a;
    }
    
    // 3. 判断是否为质数（O(√n)）
    // 利用 6k±1 优化
    static bool isPrime(int n) {
        if (n < 2) return false;
        if (n == 2 || n == 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;
        
        // 所有质数都可表示为 6k±1
        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0)
                return false;
        }
        return true;
    }
};


// ============================================================================
// 4. 游戏论与状态搜索 (Game Theory & State Search)
// ============================================================================
/*
 * 原理：
 * - 递归 + 备忘录实现状态搜索
 * - 博弈论中的必胜状态分析
 * - 动态规划优化
 * 
 * 应用场景：
 * - 游戏 AI
 * - 最优策略计算
 * - 状态空间搜索
 */

class GameTheory {
public:
    // Nim 游戏示例：两个玩家轮流从一堆中取物
    // 关键：XOR 全部堆，如果结果为 0，当前玩家必败
    
    static bool isWinningPosition(vector<int> piles) {
        int xorSum = 0;
        for (int pile : piles) {
            xorSum ^= pile;
        }
        return xorSum != 0;
    }
    
    // 一般性游戏状态搜索（带备忘录）
    static bool canWin(string state, map<string, bool>& memo) {
        // 如果当前状态已计算过，直接返回
        if (memo.count(state)) {
            return memo[state];
        }
        
        // 基础情况：如果没有可移动的步骤，当前玩家必败
        // 这里需要根据具体游戏规则实现
        // ...
        
        // 递归情况：尝试所有可能的移动
        // 如果任何一个移动导致对手必败，当前玩家必胜
        bool canCurrentWin = false;
        // 生成所有可能的下一状态
        // for (auto nextState : getNextStates(state)) {
        //     if (!canWin(nextState, memo)) {
        //         canCurrentWin = true;
        //         break;
        //     }
        // }
        
        return memo[state] = canCurrentWin;
    }
};


// ============================================================================
// 5. 排序与查找技巧 (Sorting & Searching)
// ============================================================================

class SortingTricks {
public:
    // 冒泡排序（带计数）
    // 复杂度：O(n²)
    static void bubbleSort(vector<int>& arr, int& comparisons, int& moves) {
        comparisons = 0;
        moves = 0;
        int n = arr.size();
        
        for (int i = 1; i < n; i++) {
            bool swapped = false;
            for (int j = n - 1; j >= i; j--) {
                comparisons++;
                if (arr[j - 1] > arr[j]) {
                    moves++;
                    swap(arr[j - 1], arr[j]);
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
    
    // 二分查找（返回最接近的值的位置）
    // 复杂度：O(log n)
    static int binarySearch(const vector<int>& arr, int target) {
        int left = 0, right = arr.size() - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        
        return -1;  // 未找到
    }
};


// ============================================================================
// 使用示例
// ============================================================================

/*
int main() {
    // 位操作示例
    {
        cout << "=== Bit Tricks ===\n";
        cout << "Is 8 power of 2? " << (BitTricks::isPowerOfTwo(8) ? "yes" : "no") << "\n";
        cout << "Is 10 power of 2? " << (BitTricks::isPowerOfTwo(10) ? "yes" : "no") << "\n";
        cout << "Lowest set bit of 12: " << BitTricks::lowestSetBit(12) << "\n";
        cout << "Count set bits in 7: " << BitTricks::countSetBits_v2(7) << "\n";
    }
    
    // 矩阵变换示例
    {
        cout << "\n=== Matrix Transform ===\n";
        MatrixTransform::Matrix grid = {{1, 2}, {3, 4}};
        cout << "Original:\n";
        MatrixTransform::print(grid);
        
        auto rotated = MatrixTransform::rotateClockwise(grid);
        cout << "Rotated 90 degrees:\n";
        MatrixTransform::print(rotated);
    }
    
    // 数学技巧示例
    {
        cout << "\n=== Math Tricks ===\n";
        cout << "Is 17 prime? " << (MathTricks::isPrime(17) ? "yes" : "no") << "\n";
        cout << "Is 18 prime? " << (MathTricks::isPrime(18) ? "yes" : "no") << "\n";
    }
    
    return 0;
}
*/
