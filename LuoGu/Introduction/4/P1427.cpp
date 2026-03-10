#include <iostream>
#include <vector>

using namespace std;

int main(void)
{
    vector<int> numbers;
    int x;
    
    while (cin >> x && x != 0) {
        numbers.push_back(x);
    }
    
    for (int i = numbers.size() - 1; i >= 0; i--) {
        if (i < (int)numbers.size() - 1) cout << " ";
        cout << numbers[i];
    }
    cout << endl;
    
    return 0;
}