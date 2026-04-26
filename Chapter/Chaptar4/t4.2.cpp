#include <iostream>

using std::cin;
using std::cout;
using std::endl;

#define M 10
#define N 5

int main(void)
{
    // 分配一个 M x N 的二维数组，内存是连续的（行优先，row-major）
    // `array` 的类型是 "指向含 N 个 int 的数组的指针"
    int (*array)[N] = new int[M][N];

    // --------- 按行初始化（高效） ---------
    // 外层遍历行 i，内层遍历列 j：对内层循环写入的是连续内存，
    // 缓存命中率高，通常最快（适合 row-major 存储）
    for (int i = 0; i < M; ++i)
        for (int j = 0; j < N; ++j)
            array[i][j] = i * N + j; // 示例赋值

    // --------- 按列写入（次优） ---------
    // 下面的循环外层按列 i，内层按行 j，会以步幅为 N 跳跃访问内存，
    // 这会降低缓存局部性，通常比按行慢（但结果相同，用于说明性能差异）
    for (int i = 0; i < N; ++i)
        for (int j = 0; j < M; ++j)
            array[j][i] = i * N + j; // 按列写入，示意性能影响

    // 释放由 `new []` 分配的连续二维数组
    delete [] array;

    return 0;
}
