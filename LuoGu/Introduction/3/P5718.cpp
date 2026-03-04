#include <iostream>
#include <climits>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::min;

int main(void)
{
    int n;
    cin >> n;
    
    int minVal = INT_MAX;
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        minVal = min(minVal, a);
    }
    
    cout << minVal << endl;
    
    return 0;
}