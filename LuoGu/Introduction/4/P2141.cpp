#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

int main(void)
{
    int n{0};
    cin >> n;
    vector<int> num(n, 0);

    for (int i = 0; i < n; i++) {
        cin >> num[i];
    }

    int count = 0;
    for (int i = 0; i < n; i++) {
        bool found = false;
        for (int j = 0; j < n; j++) {
            for (int k = 0; k < n; k++) {
                if (i != j && i != k && j != k && num[j] + num[k] == num[i]) {
                    count++;
                    found = true;
                    break;
                }
            }

            if (found) {
                break;
            }
        }
    }

    cout << count << endl;

    
    return 0;
}