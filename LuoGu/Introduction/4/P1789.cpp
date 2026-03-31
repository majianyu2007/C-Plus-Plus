#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

void makeTorchLight(vector<vector<bool>> &matrix, int x, int y) {
    int n = matrix.size();
    int dx[] = {0, 1, -1, 0, 0, 1, 1, -1, -1, 2, -2, 0, 0};
    int dy[] = {0, 0, 0, 1, -1, 1, -1, 1, -1, 0, 0, 2, -2};
    for (int i = 0; i < 13; ++i) {
        int nx = x + dx[i];
        int ny = y + dy[i];
        if (nx >= 0 && nx < n && ny >= 0 && ny < n) {
            matrix[nx][ny] = true;
        }
    }
}

void makeFluriteLight(vector<vector<bool>> &matrix, int x, int y) {
    int n = matrix.size();
    for (int i = x - 2; i <= x + 2; ++i) {
        for (int j = y - 2; j <= y + 2; ++j) {
            if (i >= 0 && i < n && j >= 0 && j < n) {
                matrix[i][j] = true;
            }
        }
    }
}

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n{0}, m{0}, k{0};
    cin >> n >> m >> k;
    vector<vector<bool>> matrix(n, vector<bool>(n, false));
    for (auto i = 0; i < m; ++i) {
        int x{0}, y{0};
        cin >> x >> y;
        makeTorchLight(matrix, x - 1, y - 1);
    }

    for (auto j = 0; j < k; ++j) {
        int x{0}, y{0};
        cin >> x >> y;
        makeFluriteLight(matrix, x - 1, y - 1);
    }

    int count{0};
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            if (!matrix[i][j]) {
                count++;
            }
        }
    }
    cout << count << endl;

    return 0;
}
