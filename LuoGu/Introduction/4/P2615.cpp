#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int N{0};
    cin >> N;
    int matrix[N][N];

    for (int i = 0; i < N; ++i)
        for (int j = 0; j < N; ++j)
            matrix[i][j] = 0;

    int x = 0, y = N / 2;
    matrix[x][y] = 1;

    for (int k = 2; k <= N * N; ++k) {
        int nx = (x - 1 + N) % N;
        int ny = (y + 1) % N;
        if (matrix[nx][ny] == 0) {
            x = nx;
            y = ny;
        } else {
            x = (x + 1) % N;
        }
        matrix[x][y] = k;
    }

    for (int i = 0; i < N; i++)
    {
        for (int j = 0; j < N; ++j)
        {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}