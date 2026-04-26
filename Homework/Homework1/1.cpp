/*
1.  编写程序，显示如下表格：  
a &emsp; a^2 &emsp; a^3  
1 &emsp; 1 &emsp; 1  
2 &emsp; 4 &emsp; 8  
3 &emsp; 9 &emsp; 27  
4 &emsp; 16 &emsp; 64  
*/
#include <iostream>

using std::cout;
using std::endl;

int main(void)
{
    cout << "a\ta^2\ta^3" << endl;
    for (int a = 1; a <= 4; a++) {
        cout << a << "\t" << a*a << "\t" << a*a*a << endl;
    }
    return 0;
}