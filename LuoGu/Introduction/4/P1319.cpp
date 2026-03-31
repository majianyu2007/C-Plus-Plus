#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N{0};
    cin >> N;

    vector<char> matrix;
    bool isZero = true;
    int count;
    int totalNeeded = N * N;

    while (cin >> count && (int)matrix.size() < totalNeeded) {
        char digit = isZero ? '0' : '1';
        for (int i = 0; i < count; ++i) {
            matrix.push_back(digit);
            if ((int)matrix.size() == totalNeeded)
                break;
        }
        isZero = !isZero;
    }

    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            cout << matrix[i * N + j];
        }
        cout << endl;
    }

    return 0;
}
