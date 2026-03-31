#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

int main(void) {
    int s1{0}, s2{0}, s3{0};
    cin >> s1 >> s2 >> s3;
    vector<int> sum(s1 + s2 + s3 + 1, 0);
    for (auto i = 1; i <= s1; ++i) {
        for (auto j = 1; j <= s2; ++j) {
            for (auto k = 1; k <= s3; ++k) {
                sum[i + j + k]++;
            }
        }
    }

    int maxCount = 0;
    int result = 0;
    for (auto i = 0; i <= s1 + s2 + s3; ++i) {
        if (sum[i] > maxCount) {
            maxCount = sum[i];
            result = i;
        }
    }

    cout << result << endl;

    return 0;
}
