#include <iostream>
#include <vector>

using namespace std;

int main(void)
{
    int n;
    cin >> n;
    
    vector<int> sequence;
    
    while (n != 1) {
        sequence.push_back(n);
        if (n % 2 == 1) {
            n = n * 3 + 1;
        } else {
            n = n / 2;
        }
    }
    sequence.push_back(1);
    
    for (int i = sequence.size() - 1; i >= 0; i--) {
        if (i < sequence.size() - 1) cout << " ";
        cout << sequence[i];
    }
    cout << endl;
    
    return 0;
}