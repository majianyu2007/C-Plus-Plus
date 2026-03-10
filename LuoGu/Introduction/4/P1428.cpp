#include <iostream>

using namespace std;

int main(void) 
{
    int n;
    cin >> n;
    
    int a[n];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    
    for (int i = 0; i < n; i++) {
        int count = 0;
        for (int j = 0; j < i; j++) {
            if (a[j] < a[i]) {
                count++;
            }
        }
        if (i > 0) cout << " ";
        cout << count;
    }
    cout << endl;
    
    return 0;
}