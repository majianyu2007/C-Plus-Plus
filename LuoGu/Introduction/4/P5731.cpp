#include <iomanip>
#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::setw;
using std::vector;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n{0};
    cin >> n;

    vector<vector<int>> matrix(n, vector<int>(n, 0));
    int num = 1;
    int top = 0, bottom = n - 1, left = 0, right = n - 1;

    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) {
            matrix[top][j] = num++;
        }
        top++;

        for (int i = top; i <= bottom; i++) {
            matrix[i][right] = num++;
        }
        right--;

        if (top <= bottom) {
            for (int j = right; j >= left; j--) {
                matrix[bottom][j] = num++;
            }
            bottom--;
        }

        if (left <= right) {
            for (int i = bottom; i >= top; i--) {
                matrix[i][left] = num++;
            }
            left++;
        }
    }

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << setw(3) << matrix[i][j];
        }
        cout << endl;
    }

    return 0;
}
