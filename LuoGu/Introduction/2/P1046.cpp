#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int apples[10];
    for (int i = 0; i < 10; i++) {
        cin >> apples[i];
    }
    
    int reach;
    cin >> reach;
    
    int count = 0;
    int reach_with_stool = reach + 30;
    
    for (int i = 0; i < 10; i++) {
        if (apples[i] <= reach_with_stool) {
            count++;
        }
    }
    
    cout << count << endl;
    
    return 0;
}