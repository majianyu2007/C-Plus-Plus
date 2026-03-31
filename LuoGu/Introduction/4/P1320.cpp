#include <iostream>
#include <string>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::getline;
using std::string;
using std::vector;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<char> matrix;
    string line;
    int N = 0;
    while (getline(cin, line)) {
        if (line.empty()) {
            continue;
        }
        if (N == 0) {
            N = (int)line.size();
        }
        for (char c : line) {
            if (c == '0' || c == '1') {
                matrix.push_back(c);
            }
        }
    }

    vector<int> compressed;
    compressed.push_back(N);

    if (!matrix.empty()) {
        char expected = '0';
        int count = 0;

        for (char bit : matrix) {
            if (bit == expected) {
                count++;
            } else {
                compressed.push_back(count);
                expected = (expected == '0' ? '1' : '0');
                count = 1;
            }
        }
        compressed.push_back(count);
    }

    for (int i = 0; i < (int)compressed.size(); ++i) {
        if (i > 0)
            cout << " ";
        cout << compressed[i];
    }
    cout << endl;

    return 0;
}
