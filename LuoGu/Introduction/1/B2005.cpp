#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    char c;
    cin >> c;
    
    cout << "  " << c << endl;
    cout << " " << c << c << c << endl;
    cout << c << c << c << c << c << endl;
    
    return 0;
}